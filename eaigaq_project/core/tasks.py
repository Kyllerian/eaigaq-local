# eaigaq_project/core/tasks.py

from celery import shared_task
import numpy as np
import cv2
import face_recognition
import logging
import base64
import os
import subprocess
import redis

from django.conf import settings

logger = logging.getLogger(__name__)

# Используем настройки из CHANNEL_LAYERS
redis_host, redis_port = settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0]
REDIS_URL = f"redis://{redis_host}:{redis_port}"
redis_client = redis.Redis.from_url(REDIS_URL)

@shared_task
def create_face_encoding_task(user_id, frame_b64):
    from .models import User, FaceEncoding
    try:
        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

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
        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, model='large')

        if not face_encodings:
            return {'status': 'no_face'}

        face_encoding = face_encodings[0]

        known_encodings = []
        for encoding_b64 in known_encodings_b64:
            encoding_bytes = base64.b64decode(encoding_b64)
            known_encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
            known_encodings.append(known_encoding)

        face_distances = face_recognition.face_distance(known_encodings, face_encoding)
        threshold = 0.4
        recognized = any(distance < threshold for distance in face_distances)

        return {'status': 'success', 'recognized': recognized}
    except Exception as e:
        logger.error(f"Error in verify_face_task: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def stream_camera_task(camera_id, rtsp_url):
    ffmpeg_cmd = [
        "ffmpeg",
        "-probesize", "5000000",
        "-analyzeduration", "10000000",
        "-fflags", "nobuffer",
        "-rtsp_transport", "tcp",
        "-hwaccel", "cuda",
        "-c:v", "h264_cuvid",
        "-i", rtsp_url,
        "-an",
        "-s", "640x480",
        "-r", "30",
        "-c:v", "h264_nvenc",
        "-preset", "fast",
        "-g", "60",
        "-bf", "0",
        "-flags", "-global_header",
        "-f", "h264",
        "-"
    ]

    logger.info(f"Starting stream for camera_id={camera_id}, cmd={' '.join(ffmpeg_cmd)}")
    process = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def log_stderr(proc):
        for line in proc.stderr:
            line_decoded = line.decode("utf-8", errors="replace").strip()
            if line_decoded:
                logger.debug(f"[ffmpeg stderr] camera_id={camera_id}: {line_decoded}")

    import threading
    stderr_thread = threading.Thread(target=log_stderr, args=(process,), daemon=True)
    stderr_thread.start()

    channel_name = f"camera_frames_{camera_id}"
    logger.info(f"Publishing frames to Redis channel: {channel_name}")

    try:
        chunk_size = 4096
        while True:
            chunk = process.stdout.read(chunk_size)
            if not chunk:
                break
            frame_b64 = base64.b64encode(chunk).decode('utf-8')
            redis_client.publish(channel_name, frame_b64)

    except Exception as e:
        logger.error(f"Error streaming camera_id={camera_id}: {e}", exc_info=True)
    finally:
        process.terminate()
        process.wait()
        logger.info(f"Streaming stopped for camera_id={camera_id}")


# # eaigaq_project/core/tasks.py
#
# from celery import shared_task
# import numpy as np
# import cv2
# import face_recognition
# import logging
# import base64
# from aiortc.contrib.media import MediaPlayer
#
# logger = logging.getLogger(__name__)
#
# @shared_task
# def create_face_encoding_task(user_id, frame_b64):
#     from .models import User, FaceEncoding
#
#     try:
#         # Декодируем frame_b64 обратно в байты
#         frame_bytes = base64.b64decode(frame_b64)
#         np_arr = np.frombuffer(frame_bytes, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#
#         # Преобразуем изображение в RGB
#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#
#         # Поиск лиц и получение кодировок (используем model='large' для согласованности)
#         face_locations = face_recognition.face_locations(rgb_frame)
#         face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, model='large')
#
#         if face_encodings:
#             encoding = face_encodings[0]
#             encoding_bytes = encoding.tobytes()
#
#             user = User.objects.get(id=user_id)
#             face_encoding = FaceEncoding(user=user, encoding=encoding_bytes)
#             face_encoding.save()
#             return {'status': 'success'}
#         else:
#             return {'status': 'no_face'}
#     except Exception as e:
#         logger.error(f"Error in create_face_encoding_task: {str(e)}")
#         return {'status': 'error', 'message': str(e)}
#
#
# @shared_task
# def verify_face_task(frame_b64, known_encodings_b64):
#     try:
#         # Декодируем frame_b64 обратно в байты
#         frame_bytes = base64.b64decode(frame_b64)
#         np_arr = np.frombuffer(frame_bytes, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#
#         # Преобразуем изображение в RGB
#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#
#         # Поиск лиц и получение кодировок (используем ту же модель 'large')
#         face_locations = face_recognition.face_locations(rgb_frame)
#         face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, model='large')
#
#         if not face_encodings:
#             return {'status': 'no_face'}
#
#         face_encoding = face_encodings[0]
#
#         # Подготовка известных кодировок
#         known_encodings = []
#         for encoding_b64 in known_encodings_b64:
#             encoding_bytes = base64.b64decode(encoding_b64)
#             known_encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
#             known_encodings.append(known_encoding)
#
#         # Используем face_distance для вычисления расстояний и применяем строгий порог
#         face_distances = face_recognition.face_distance(known_encodings, face_encoding)
#         threshold = 0.4  # Более строгий порог: чем меньше, тем меньше ложных срабатываний.
#         recognized = any(distance < threshold for distance in face_distances)
#
#         return {'status': 'success', 'recognized': recognized}
#     except Exception as e:
#         logger.error(f"Error in verify_face_task: {str(e)}")
#         return {'status': 'error', 'message': str(e)}







































# # eaigaq_project/core/tasks.py
#
# from celery import shared_task
# import numpy as np
# import cv2
# import face_recognition
# import logging
# import base64
#
# logger = logging.getLogger(__name__)
#
# @shared_task
# def create_face_encoding_task(user_id, frame_b64):
#     from .models import User, FaceEncoding
#
#     try:
#         # Декодируем frame_b64 обратно в байты
#         frame_bytes = base64.b64decode(frame_b64)
#         np_arr = np.frombuffer(frame_bytes, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#
#
#         # Преобразуем изображение в RGB
#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#
#         # Поиск лиц и получение их кодировок
#         face_locations = face_recognition.face_locations(rgb_frame)
#         face_encodings = face_recognition.face_encodings(rgb_frame, face_locations, model='large')
#
#         if face_encodings:
#             encoding = face_encodings[0]
#             encoding_bytes = encoding.tobytes()
#
#             user = User.objects.get(id=user_id)
#
#             face_encoding = FaceEncoding(user=user, encoding=encoding_bytes)
#             face_encoding.save()
#             return {'status': 'success'}
#         else:
#             return {'status': 'no_face'}
#     except Exception as e:
#         logger.error(f"Error in create_face_encoding_task: {str(e)}")
#         return {'status': 'error', 'message': str(e)}
#
#
# @shared_task
# def verify_face_task(frame_b64, known_encodings_b64):
#     try:
#         # Декодируем frame_b64 обратно в байты
#         frame_bytes = base64.b64decode(frame_b64)
#         np_arr = np.frombuffer(frame_bytes, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#
#         # Преобразуем изображение в RGB
#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#
#         # Поиск лиц и получение их кодировок
#         face_locations = face_recognition.face_locations(rgb_frame)
#         face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
#
#         if not face_encodings:
#             return {'status': 'no_face'}
#
#         face_encoding = face_encodings[0]
#
#         # Подготовка известных кодировок
#         known_encodings = []
#         for encoding_b64 in known_encodings_b64:
#             encoding_bytes = base64.b64decode(encoding_b64)
#             known_encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
#             known_encodings.append(known_encoding)
#
#         matches = face_recognition.compare_faces(known_encodings, face_encoding)
#         recognized = True in matches
#
#         return {'status': 'success', 'recognized': recognized}
#     except Exception as e:
#         logger.error(f"Error in verify_face_task: {str(e)}")
#         return {'status': 'error', 'message': str(e)}
