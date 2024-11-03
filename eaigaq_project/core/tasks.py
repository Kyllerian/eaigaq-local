# eaigaq_project/core/tasks.py

from celery import shared_task
import numpy as np
import cv2
import face_recognition
import logging
import base64

logger = logging.getLogger(__name__)

@shared_task
def create_face_encoding_task(user_id, frame_b64):
    from .models import User, FaceEncoding

    try:
        # Декодируем frame_b64 обратно в байты
        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Преобразуем изображение в RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Поиск лиц и получение их кодировок
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, model='large')

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


@shared_task
def verify_face_task(frame_b64, known_encodings_b64):
    try:
        # Декодируем frame_b64 обратно в байты
        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Преобразуем изображение в RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Поиск лиц и получение их кодировок
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        if not face_encodings:
            return {'status': 'no_face'}

        face_encoding = face_encodings[0]

        # Подготовка известных кодировок
        known_encodings = []
        for encoding_b64 in known_encodings_b64:
            encoding_bytes = base64.b64decode(encoding_b64)
            known_encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
            known_encodings.append(known_encoding)

        matches = face_recognition.compare_faces(known_encodings, face_encoding)
        recognized = True in matches

        return {'status': 'success', 'recognized': recognized}
    except Exception as e:
        logger.error(f"Error in verify_face_task: {str(e)}")
        return {'status': 'error', 'message': str(e)}
