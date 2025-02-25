# eaigaq_project/core/tasks.py

import base64
import logging
import numpy as np
import cv2
import face_recognition
from django.utils import timezone
from datetime import timedelta

from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)

@shared_task(queue='biometric')
def create_face_encoding_task(user_id, frame_b64):
    """
    Создание кодировки лица для биометрической регистрации.
    """
    from .models import User, FaceEncoding
    try:
        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(
            rgb_frame, face_locations, model='large'
        )

        if face_encodings:
            encoding = face_encodings[0]
            encoding_bytes = encoding.tobytes()

            user = User.objects.get(id=user_id)
            face_encoding = FaceEncoding(user=user, encoding=encoding_bytes)
            face_encoding.save()
            return {'status': 'success'}
        else:
            return {'status': 'no_face'}
    except Exception as e:
        logger.error(f"Error in create_face_encoding_task: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task(queue='biometric')
def verify_face_task(frame_b64, known_encodings_b64):
    """
    Проверка соответствия лица (из текущего кадра) ранее зарегистрированным кодировкам.
    """
    try:
        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(
            rgb_frame, face_locations, model='large'
        )

        if not face_encodings:
            return {'status': 'no_face'}

        face_encoding = face_encodings[0]

        known_encodings = []
        for encoding_b64 in known_encodings_b64:
            encoding_bytes = base64.b64decode(encoding_b64)
            known_encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
            known_encodings.append(known_encoding)

        face_distances = face_recognition.face_distance(
            known_encodings, face_encoding
        )
        threshold = 0.5
        recognized = any(distance < threshold for distance in face_distances)

        return {'status': 'success', 'recognized': recognized}
    except Exception as e:
        logger.error(f"Error in verify_face_task: {str(e)}")
        return {'status': 'error', 'message': str(e)}


# ---------------------------
# задача для зачистки CameraViewingSession
# ---------------------------
@shared_task(queue='ping')  # или любая ваша очередь (можно 'default')
def cleanup_stale_viewings():
    """
    Удаляем "протухшие" записи CameraViewingSession,
    если last_ping слишком старый, и декрементируем viewers_count камеры,
    поскольку пользователь "пропал".
    """
    from .models import CameraViewingSession
    from .janus_utils import decrement_viewer

    timeout_seconds = 15  # или сколько нужно
    cutoff = timezone.now() - timedelta(seconds=timeout_seconds)

    stale_qs = CameraViewingSession.objects.filter(last_ping__lt=cutoff)
    for cvs in stale_qs:
        camera = cvs.camera
        logger.info(f"[cleanup_stale_viewings] Удаляем протухшую сессию {cvs.id}, camera_id={camera.id}")
        cvs.delete()
        # Декрементируем, т.к. пользователь не нажал 'stop_watching'
        decrement_viewer(camera)