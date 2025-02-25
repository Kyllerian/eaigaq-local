# # janus_utils.py
#
# import os
# import uuid
# import logging
# import requests
# import subprocess
#
# from celery import shared_task
# from django.conf import settings
#
# from .models import Camera
#
# logger = logging.getLogger(__name__)
#
# # -------------------------------
# # Константы (Janus + ffmpeg)
# # -------------------------------
# JANUS_API_URL = "http://janus:8088/janus"  # URL основного Janus API
# ADMIN_KEY = "apshubersh"     # admin_key для создания/удаления mountpoint-ов
# API_SECRET = "apshubersh"    # apisecret, указанный в janus.jcfg
#
# # Переключаемся на VP8
# VIDEO_PT = 100               # Payload Type для VP8 (часто используют 100)
# VIDEO_CODEC = "vp8"
# FFMPEG_BIN = "ffmpeg"
#
#
# # -------------------------------
# # Основные функции
# # -------------------------------
# def start_camera_stream(camera: Camera) -> str:
#     """
#     Создаёт mountpoint на Janus (если ещё нет) и запускает ffmpeg-процесс
#     через Celery, чтобы ретранслировать RTSP -> RTP -> Janus (WebRTC).
#     Возвращает mountpoint_id.
#     """
#     logger.info(
#         f"Starting camera stream for Camera ID={camera.id}, "
#         f"IP={camera.ip_address}, Login={camera.login}, Password={camera.password}"
#     )
#
#     # Если уже есть mountpoint_id, значит стрим уже поднят
#     if camera.mountpoint_id:
#         logger.info(
#             f"Camera {camera.id} already has mountpoint {camera.mountpoint_id}, "
#             "no need to create a new one."
#         )
#         return camera.mountpoint_id
#
#     # Формируем URL для RTSP
#     rtsp_url = f"rtsp://{camera.login}:{camera.password}@{camera.ip_address}:554/live1.sdp"
#     logger.info(f"RTSP URL for camera {camera.id}: {rtsp_url}")
#
#     # Создаём mountpoint в Janus (type=rtp)
#     mp_id = create_janus_mountpoint(
#         video_port=0,
#         video_pt=VIDEO_PT,
#         video_codec=VIDEO_CODEC,
#         secret=ADMIN_KEY,
#         permanent=True
#     )
#     logger.info(f"Created mountpoint {mp_id} for camera {camera.id}")
#
#     # Узнаём, какой порт Janus назначил под видео
#     assigned_port = get_mountpoint_port(mp_id)
#     logger.info(f"Assigned port for camera {camera.id}, mountpoint {mp_id}: {assigned_port}")
#
#     if assigned_port is None:
#         logger.error("Assigned port is None, destroying mountpoint.")
#         destroy_janus_mountpoint(mp_id)
#         raise Exception("Не удалось определить назначенный Janus порт для mountpoint")
#
#     # Сохраняем mountpoint и порт в модели
#     camera.mountpoint_id = mp_id
#     camera.video_port = assigned_port
#     camera.save(update_fields=['mountpoint_id', 'video_port'])
#     logger.info(f"Camera {camera.id} assigned video port {assigned_port} by Janus")
#
#     # Формируем команду ffmpeg с кодированием в VP8 (libvpx)
#     #
#     # Пример (можно настроить битрейт, crf, keyint и т.д.):
#     ffmpeg_cmd = [
#         FFMPEG_BIN,
#         "-loglevel", "debug",
#         "-rtsp_transport", "tcp",
#         "-fflags", "+genpts",
#         "-analyzeduration", "100M",
#         "-probesize", "100M",
#         "-i", rtsp_url,
#
#         # Используем libvpx для VP8
#         "-c:v", "libvpx",
#         "-b:v", "1500k",            # Указать желаемый битрейт
#         "-crf", "10",               # Качество (0-63 для VP8, где меньше=лучше)
#         "-g", "30",                 # Максимальный интервал между ключевыми кадрами
#         "-keyint_min", "30",        # Минимальный интервал ключевых кадров
#         "-deadline", "realtime",    # Для режима реального времени (уменьшает нагрузку)
#         # По желанию: "-cpu-used", "4"  # Для ускорения кодирования
#
#         # Можно оставить фильтр кадров:
#         "-filter:v", "fps=30",      # Ограничиваемся 30 кадрами/с
#
#         "-an",  # без аудио
#         "-f", "rtp",
#         f"rtp://janus:{assigned_port}"
#     ]
#
#     logger.info(f"Starting ffmpeg for camera {camera.id} with command: {' '.join(ffmpeg_cmd)}")
#
#     # Запускаем ffmpeg в Celery-процессе
#     start_ffmpeg_process_task.delay(ffmpeg_cmd, camera.id, mp_id)
#
#     return mp_id
#
#
# def stop_camera_stream(camera: Camera):
#     """
#     Останавливает ffmpeg (если запущен) и удаляет mountpoint с Janus.
#     Обнуляет mountpoint_id, video_port и ffmpeg_pid в модели Camera.
#     """
#     logger.info(f"Stopping camera stream for camera {camera.id}")
#
#     # Останавливаем ffmpeg
#     if camera.ffmpeg_pid:
#         try:
#             logger.info(f"Killing ffmpeg PID={camera.ffmpeg_pid} for camera {camera.id}")
#             os.kill(camera.ffmpeg_pid, 15)  # SIGTERM
#             logger.info(f"Killed ffmpeg PID={camera.ffmpeg_pid} for camera {camera.id}")
#         except OSError as e:
#             logger.warning(f"Failed to kill ffmpeg PID={camera.ffmpeg_pid} for camera {camera.id}: {e}")
#
#     # Уничтожаем mountpoint в Janus
#     if camera.mountpoint_id:
#         logger.info(f"Destroying mountpoint {camera.mountpoint_id} for camera {camera.id}")
#         try:
#             destroy_janus_mountpoint(camera.mountpoint_id)
#             logger.info(f"Mountpoint {camera.mountpoint_id} destroyed for camera {camera.id}")
#         except Exception as e:
#             logger.error(f"Failed to destroy mountpoint {camera.mountpoint_id}: {e}")
#
#     # Сбрасываем поля в модели
#     camera.mountpoint_id = None
#     camera.ffmpeg_pid = None
#     camera.video_port = None
#     camera.save(update_fields=["mountpoint_id", "ffmpeg_pid", "video_port"])
#     logger.info(f"Camera {camera.id} stream stopped")
#
#
# # -------------------------------
# # Вспомогательные функции Janus
# # -------------------------------
# def create_janus_mountpoint(video_port: int, video_pt: int, video_codec: str,
#                             secret: str, permanent: bool = True) -> str:
#     """
#     Создаёт новый mountpoint (type=rtp) в Janus.
#     Возвращает ID mountpoint'а.
#     Теперь для VP8 мы не указываем videofmtp.
#     """
#     logger.info(f"Creating Janus mountpoint: video_port={video_port}, video_pt={video_pt}, "
#                 f"video_codec={video_codec}, permanent={permanent}")
#     session_id, handle_id = create_janus_session_and_attach()
#
#     body = {
#         "request": "create",
#         "type": "rtp",
#         "id": 0,
#         "name": f"cam-{uuid.uuid4().hex[:8]}",
#         "description": "Camera RTP Stream",
#         "audio": False,
#         "video": True,
#         "videopt": video_pt,
#         "videocodec": video_codec,
#         "videoport": video_port,
#
#         # Для VP8 достаточно указать codec=vp8 + pt=100,
#         # без videofmtp. Убираем "videofmtp".
#
#         "secret": secret,
#         "admin_key": ADMIN_KEY,
#         "permanent": permanent
#     }
#     create_req = {
#         "janus": "message",
#         "transaction": f"create-mp-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET,
#         "body": body
#     }
#
#     logger.info(f"Sending create mountpoint request: {create_req}")
#     r = requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=create_req)
#     r.raise_for_status()
#     rj = r.json()
#     logger.info(f"Create mountpoint response: {rj}")
#
#     plugindata = rj.get("plugindata", {}).get("data", {})
#     if plugindata.get("streaming") == "created":
#         mp_id = plugindata["stream"]["id"]
#         logger.info(f"Mountpoint created with ID={mp_id}")
#     else:
#         logger.error(f"Failed to create mountpoint: {rj}")
#         cleanup_janus(session_id, handle_id)
#         raise Exception("Не удалось создать mountpoint на Janus")
#
#     # Детачимся от плагина (но не убиваем mountpoint)
#     detach_req = {
#         "janus": "detach",
#         "transaction": f"detach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     logger.info(f"Detaching handle {handle_id} from session {session_id}")
#     requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=detach_req)
#
#     return str(mp_id)
#
#
# def destroy_janus_mountpoint(mp_id: str):
#     """
#     Уничтожает mountpoint с указанным ID.
#     """
#     logger.info(f"Destroying mountpoint {mp_id}")
#     session_id, handle_id = create_janus_session_and_attach()
#
#     body = {
#         "request": "destroy",
#         "id": int(mp_id),
#         "secret": ADMIN_KEY,
#         "admin_key": ADMIN_KEY
#     }
#     destroy_req = {
#         "janus": "message",
#         "transaction": f"destroy-mp-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET,
#         "body": body
#     }
#     logger.info(f"Sending destroy request for MP_ID={mp_id}: {destroy_req}")
#     r = requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=destroy_req)
#     r.raise_for_status()
#     rj = r.json()
#     logger.info(f"Destroy response: {rj}")
#
#     plugindata = rj.get("plugindata", {}).get("data", {})
#     if plugindata.get("streaming") == "destroyed":
#         logger.info(f"Mountpoint {mp_id} destroyed in Janus")
#
#     cleanup_janus(session_id, handle_id)
#
#
# def get_mountpoint_port(mp_id: str) -> int:
#     """
#     Запрашивает port для видео (videoport).
#     """
#     logger.info(f"Getting mountpoint port for MP_ID={mp_id}")
#     info_data = get_mountpoint_info(mp_id)
#     logger.info(f"Mountpoint info for {mp_id}: {info_data}")
#
#     streams = info_data.get("media", [])
#     for s in streams:
#         if s.get("type") == "video":
#             port = s.get("port")
#             return port
#     return None
#
#
# def get_mountpoint_info(mp_id: str) -> dict:
#     """
#     Запрашивает у Janus подробную информацию о mountpoint.
#     """
#     logger.info(f"Requesting info for mountpoint {mp_id}")
#     session_id, handle_id = create_janus_session_and_attach()
#
#     body = {
#         "request": "info",
#         "id": int(mp_id),
#         "secret": ADMIN_KEY
#     }
#     info_req = {
#         "janus": "message",
#         "transaction": f"info-mp-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET,
#         "body": body
#     }
#     logger.info(f"Sending info request for MP_ID={mp_id}: {info_req}")
#     r = requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=info_req)
#     r.raise_for_status()
#     rj = r.json()
#     logger.info(f"Info response: {rj}")
#
#     plugindata = rj.get("plugindata", {}).get("data", {})
#     info = plugindata.get("info", {})
#
#     # Детачимся, не уничтожая mountpoint
#     detach_req = {
#         "janus": "detach",
#         "transaction": f"detach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=detach_req)
#
#     return info
#
#
# def create_janus_session_and_attach() -> (int, int):
#     """
#     Создаёт новую Janus-сессию, attach к streaming.
#     """
#     logger.info("Creating Janus session and attaching streaming plugin")
#
#     create_req = {
#         "janus": "create",
#         "transaction": "init",
#         "apisecret": API_SECRET
#     }
#     r = requests.post(JANUS_API_URL, json=create_req)
#     r.raise_for_status()
#     rj = r.json()
#     session_id = rj["data"]["id"]
#     logger.info(f"Session created: {session_id}")
#
#     attach_req = {
#         "janus": "attach",
#         "plugin": "janus.plugin.streaming",
#         "transaction": f"attach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     r = requests.post(f"{JANUS_API_URL}/{session_id}", json=attach_req)
#     r.raise_for_status()
#     rj = r.json()
#     handle_id = rj["data"]["id"]
#     logger.info(f"Handle created: {handle_id} for session {session_id}")
#
#     return session_id, handle_id
#
#
# def cleanup_janus(session_id, handle_id):
#     """
#     Для complete cleanup (вызываем при destroy, чтобы освободить handle и session).
#     """
#     logger.info(f"Cleaning up Janus session {session_id}, handle {handle_id}")
#
#     detach_req = {
#         "janus": "detach",
#         "transaction": f"detach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     logger.info(f"Detaching handle {handle_id} from session {session_id}")
#     requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=detach_req)
#
#     destroy_req = {
#         "janus": "destroy",
#         "transaction": f"destroy-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     logger.info(f"Destroying session {session_id}")
#     requests.post(f"{JANUS_API_URL}/{session_id}", json=destroy_req)
#
#
# # -------------------------------
# # Celery-задача для ffmpeg
# # -------------------------------
# @shared_task(queue='streaming')
# def start_ffmpeg_process_task(ffmpeg_cmd, camera_id, mp_id):
#     """
#     Запускает ffmpeg-процесс в фоне. Сохраняет PID в модель Camera.
#     Если что-то пошло не так, уничтожает mountpoint.
#     """
#     logger.info(f"[start_ffmpeg_process_task] Starting FFmpeg for camera {camera_id}, mountpoint {mp_id}")
#     logger.info(f"FFmpeg command: {' '.join(ffmpeg_cmd)}")
#
#     try:
#         proc = subprocess.Popen(ffmpeg_cmd, stderr=subprocess.STDOUT)
#         Camera.objects.filter(id=camera_id).update(ffmpeg_pid=proc.pid)
#         logger.info(f"FFmpeg started for camera {camera_id}, PID={proc.pid}, mountpoint={mp_id}")
#     except Exception as e:
#         logger.error(f"Error starting ffmpeg for camera {camera_id}: {e}")
#         destroy_janus_mountpoint(mp_id)
#         Camera.objects.filter(id=camera_id).update(
#             mountpoint_id=None,
#             video_port=None,
#             ffmpeg_pid=None
#         )
#
#
# # -------------------------------
# # Учёт (increment/decrement) зрителей
# # -------------------------------
# def increment_viewer(camera: Camera):
#     old_value = camera.viewers_count
#     camera.viewers_count += 1
#     camera.save(update_fields=['viewers_count'])
#     logger.info(
#         f"Incremented viewers_count for camera {camera.id}: {old_value} -> {camera.viewers_count}"
#     )
#     # Если был 0, значит нужно запустить стрим
#     if old_value == 0:
#         start_camera_stream(camera)
#
#
# def decrement_viewer(camera: Camera):
#     if camera.viewers_count > 0:
#         camera.viewers_count -= 1
#         camera.save(update_fields=['viewers_count'])
#         logger.info(
#             f"Decremented viewers_count for camera {camera.id}, now {camera.viewers_count}"
#         )
#         if camera.viewers_count == 0:
#             stop_camera_stream(camera)
#     else:
#         logger.warning(
#             f"Attempted to decrement viewers for camera {camera.id} but count was 0"
#         )

# janus_utils.py
#
# import os
# import uuid
# import logging
# import requests
# import subprocess
#
# from celery import shared_task
# from django.conf import settings
#
# from .models import Camera
#
# logger = logging.getLogger(__name__)
#
# # -------------------------------
# # Константы (Janus + ffmpeg)
# # -------------------------------
# JANUS_API_URL = "http://janus:8088/janus"  # URL основного Janus API
# ADMIN_KEY = "apshubersh"     # admin_key для создания/удаления mountpoint-ов
# API_SECRET = "apshubersh"    # apisecret, указанный в janus.jcfg
# VIDEO_PT = 96                # Payload Type для h264
# VIDEO_CODEC = "h264"
# FFMPEG_BIN = "ffmpeg"
#
#
# # -------------------------------
# # Основные функции
# # -------------------------------
# def start_camera_stream(camera: Camera) -> str:
#     """
#     Создаёт mountpoint на Janus (если ещё нет) и запускает ffmpeg-процесс
#     через Celery, чтобы ретранслировать RTSP -> RTP -> Janus (WebRTC).
#     Возвращает mountpoint_id.
#     """
#     logger.info(
#         f"Starting camera stream for Camera ID={camera.id}, "
#         f"IP={camera.ip_address}, Login={camera.login}, Password={camera.password}"
#     )
#
#     # Если уже есть mountpoint_id, значит стрим уже поднят
#     if camera.mountpoint_id:
#         logger.info(
#             f"Camera {camera.id} already has mountpoint {camera.mountpoint_id}, "
#             "no need to create a new one."
#         )
#         return camera.mountpoint_id
#
#     # Формируем URL для RTSP
#     rtsp_url = f"rtsp://{camera.ip_address}:554/live1.sdp"
#     logger.info(f"RTSP URL for camera {camera.id}: {rtsp_url}")
#
#     # Создаём mountpoint в Janus
#     mp_id = create_janus_mountpoint(
#         video_port=0,
#         video_pt=VIDEO_PT,
#         video_codec=VIDEO_CODEC,
#         secret=ADMIN_KEY,
#         permanent=True
#     )
#     logger.info(f"Created mountpoint {mp_id} for camera {camera.id}")
#
#     # Узнаём, какой порт Janus назначил под видео
#     assigned_port = get_mountpoint_port(mp_id)
#     logger.info(f"Assigned port for camera {camera.id}, mountpoint {mp_id}: {assigned_port}")
#
#     if assigned_port is None:
#         logger.error("Assigned port is None, destroying mountpoint.")
#         destroy_janus_mountpoint(mp_id)
#         raise Exception("Не удалось определить назначенный Janus порт для mountpoint")
#
#     # Сохраняем mountpoint и порт в модели
#     camera.mountpoint_id = mp_id
#     camera.video_port = assigned_port
#     camera.save(update_fields=['mountpoint_id', 'video_port'])
#     logger.info(f"Camera {camera.id} assigned video port {assigned_port} by Janus")
#
#     # Формируем команду ffmpeg с транскодированием в H.264 baseline
#     ffmpeg_cmd = [
#         FFMPEG_BIN,
#         "-loglevel", "debug",
#         "-rtsp_transport", "tcp",
#         "-fflags", "+genpts",
#         "-analyzeduration", "100M",
#         "-probesize", "100M",
#         "-i", rtsp_url,
#
#         "-c:v", "libx264",
#         "-profile:v", "baseline",
#         "-level:v", "4.0",
#         "-preset", "veryfast",
#         "-tune", "zerolatency",
#         # Применяем фильтр для ограничения fps и формирования yuv420p
#         "-filter:v", "fps=30,format=yuv420p",
#
#         "-x264-params", "keyint=30:scenecut=0",
#         "-force_key_frames", "expr:gte(t,n_forced*2)",
#
#         "-an",  # без аудио
#         "-f", "rtp",
#         f"rtp://janus:{assigned_port}"
#     ]
#
#     logger.info(f"Starting ffmpeg for camera {camera.id} with command: {' '.join(ffmpeg_cmd)}")
#
#     # Запускаем ffmpeg в Celery-процессе
#     start_ffmpeg_process_task.delay(ffmpeg_cmd, camera.id, mp_id)
#
#     return mp_id
#
#
# def stop_camera_stream(camera: Camera):
#     """
#     Останавливает ffmpeg (если запущен) и удаляет mountpoint с Janus.
#     Обнуляет mountpoint_id, video_port и ffmpeg_pid в модели Camera.
#     """
#     logger.info(f"Stopping camera stream for camera {camera.id}")
#
#     # Останавливаем ffmpeg
#     if camera.ffmpeg_pid:
#         try:
#             logger.info(f"Killing ffmpeg PID={camera.ffmpeg_pid} for camera {camera.id}")
#             os.kill(camera.ffmpeg_pid, 15)  # SIGTERM
#             logger.info(f"Killed ffmpeg PID={camera.ffmpeg_pid} for camera {camera.id}")
#         except OSError as e:
#             logger.warning(f"Failed to kill ffmpeg PID={camera.ffmpeg_pid} for camera {camera.id}: {e}")
#
#     # Уничтожаем mountpoint в Janus
#     if camera.mountpoint_id:
#         logger.info(f"Destroying mountpoint {camera.mountpoint_id} for camera {camera.id}")
#         try:
#             destroy_janus_mountpoint(camera.mountpoint_id)
#             logger.info(f"Mountpoint {camera.mountpoint_id} destroyed for camera {camera.id}")
#         except Exception as e:
#             logger.error(f"Failed to destroy mountpoint {camera.mountpoint_id}: {e}")
#
#     # Сбрасываем поля в модели
#     camera.mountpoint_id = None
#     camera.ffmpeg_pid = None
#     camera.video_port = None
#     camera.save(update_fields=["mountpoint_id", "ffmpeg_pid", "video_port"])
#     logger.info(f"Camera {camera.id} stream stopped")
#
#
# # -------------------------------
# # Вспомогательные функции Janus
# # -------------------------------
# def create_janus_mountpoint(video_port: int, video_pt: int, video_codec: str,
#                             secret: str, permanent: bool = True) -> str:
#     """
#     Создаёт новый mountpoint (type=rtp) в Janus.
#     Возвращает ID mountpoint'а.
#     ВАЖНО: видеопоток будет иметь packetization-mode=1.
#     """
#     logger.info(f"Creating Janus mountpoint: video_port={video_port}, video_pt={video_pt}, "
#                 f"video_codec={video_codec}, permanent={permanent}")
#     session_id, handle_id = create_janus_session_and_attach()
#
#     body = {
#         "request": "create",
#         "type": "rtp",
#         "id": 0,
#         "name": f"cam-{uuid.uuid4().hex[:8]}",
#         "description": "Camera RTP Stream",
#         "audio": False,
#         "video": True,
#         "videopt": video_pt,
#         "videocodec": video_codec,
#         "videoport": video_port,
#         # Вот главный момент: принудительно указываем packetization-mode=1
#         "videofmtp": "profile-level-id=42e01f;packetization-mode=1;level-asymmetry-allowed=1",
#
#         "secret": secret,
#         "admin_key": ADMIN_KEY,
#         "permanent": permanent
#     }
#     create_req = {
#         "janus": "message",
#         "transaction": f"create-mp-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET,
#         "body": body
#     }
#
#     logger.info(f"Sending create mountpoint request: {create_req}")
#     r = requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=create_req)
#     r.raise_for_status()
#     rj = r.json()
#     logger.info(f"Create mountpoint response: {rj}")
#
#     plugindata = rj.get("plugindata", {}).get("data", {})
#     if plugindata.get("streaming") == "created":
#         mp_id = plugindata["stream"]["id"]
#         logger.info(f"Mountpoint created with ID={mp_id}")
#     else:
#         logger.error(f"Failed to create mountpoint: {rj}")
#         cleanup_janus(session_id, handle_id)
#         raise Exception("Не удалось создать mountpoint на Janus")
#
#     # Детачимся от плагина (но не убиваем mountpoint)
#     detach_req = {
#         "janus": "detach",
#         "transaction": f"detach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     logger.info(f"Detaching handle {handle_id} from session {session_id}")
#     requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=detach_req)
#
#     return str(mp_id)
#
#
# def destroy_janus_mountpoint(mp_id: str):
#     """
#     Уничтожает mountpoint с указанным ID.
#     """
#     logger.info(f"Destroying mountpoint {mp_id}")
#     session_id, handle_id = create_janus_session_and_attach()
#
#     body = {
#         "request": "destroy",
#         "id": int(mp_id),
#         "secret": ADMIN_KEY,
#         "admin_key": ADMIN_KEY
#     }
#     destroy_req = {
#         "janus": "message",
#         "transaction": f"destroy-mp-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET,
#         "body": body
#     }
#     logger.info(f"Sending destroy request for MP_ID={mp_id}: {destroy_req}")
#     r = requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=destroy_req)
#     r.raise_for_status()
#     rj = r.json()
#     logger.info(f"Destroy response: {rj}")
#
#     plugindata = rj.get("plugindata", {}).get("data", {})
#     if plugindata.get("streaming") == "destroyed":
#         logger.info(f"Mountpoint {mp_id} destroyed in Janus")
#
#     cleanup_janus(session_id, handle_id)
#
#
# def get_mountpoint_port(mp_id: str) -> int:
#     """
#     Запрашивает port для видео (videoport).
#     """
#     logger.info(f"Getting mountpoint port for MP_ID={mp_id}")
#     info_data = get_mountpoint_info(mp_id)
#     logger.info(f"Mountpoint info for {mp_id}: {info_data}")
#
#     streams = info_data.get("media", [])
#     for s in streams:
#         if s.get("type") == "video":
#             port = s.get("port")
#             return port
#     return None
#
#
# def get_mountpoint_info(mp_id: str) -> dict:
#     """
#     Запрашивает у Janus подробную информацию о mountpoint.
#     """
#     logger.info(f"Requesting info for mountpoint {mp_id}")
#     session_id, handle_id = create_janus_session_and_attach()
#
#     body = {
#         "request": "info",
#         "id": int(mp_id),
#         "secret": ADMIN_KEY
#     }
#     info_req = {
#         "janus": "message",
#         "transaction": f"info-mp-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET,
#         "body": body
#     }
#     logger.info(f"Sending info request for MP_ID={mp_id}: {info_req}")
#     r = requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=info_req)
#     r.raise_for_status()
#     rj = r.json()
#     logger.info(f"Info response: {rj}")
#
#     plugindata = rj.get("plugindata", {}).get("data", {})
#     info = plugindata.get("info", {})
#
#     # Детачимся, не уничтожая mountpoint
#     detach_req = {
#         "janus": "detach",
#         "transaction": f"detach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=detach_req)
#
#     return info
#
#
# def create_janus_session_and_attach() -> (int, int):
#     """
#     Создаёт новую Janus-сессию, attach к streaming.
#     """
#     logger.info("Creating Janus session and attaching streaming plugin")
#
#     create_req = {
#         "janus": "create",
#         "transaction": "init",
#         "apisecret": API_SECRET
#     }
#     r = requests.post(JANUS_API_URL, json=create_req)
#     r.raise_for_status()
#     rj = r.json()
#     session_id = rj["data"]["id"]
#     logger.info(f"Session created: {session_id}")
#
#     attach_req = {
#         "janus": "attach",
#         "plugin": "janus.plugin.streaming",
#         "transaction": f"attach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     r = requests.post(f"{JANUS_API_URL}/{session_id}", json=attach_req)
#     r.raise_for_status()
#     rj = r.json()
#     handle_id = rj["data"]["id"]
#     logger.info(f"Handle created: {handle_id} for session {session_id}")
#
#     return session_id, handle_id
#
#
# def cleanup_janus(session_id, handle_id):
#     """
#     Для complete cleanup (вызываем при destroy, чтобы освободить handle и session).
#     """
#     logger.info(f"Cleaning up Janus session {session_id}, handle {handle_id}")
#
#     detach_req = {
#         "janus": "detach",
#         "transaction": f"detach-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     logger.info(f"Detaching handle {handle_id} from session {session_id}")
#     requests.post(f"{JANUS_API_URL}/{session_id}/{handle_id}", json=detach_req)
#
#     destroy_req = {
#         "janus": "destroy",
#         "transaction": f"destroy-{uuid.uuid4().hex}",
#         "apisecret": API_SECRET
#     }
#     logger.info(f"Destroying session {session_id}")
#     requests.post(f"{JANUS_API_URL}/{session_id}", json=destroy_req)
#
#
# # -------------------------------
# # Celery-задача для ffmpeg
# # -------------------------------
# @shared_task(queue='streaming')
# def start_ffmpeg_process_task(ffmpeg_cmd, camera_id, mp_id):
#     """
#     Запускает ffmpeg-процесс в фоне. Сохраняет PID в модель Camera.
#     Если что-то пошло не так, уничтожает mountpoint.
#     """
#     logger.info(f"[start_ffmpeg_process_task] Starting FFmpeg for camera {camera_id}, mountpoint {mp_id}")
#     logger.info(f"FFmpeg command: {' '.join(ffmpeg_cmd)}")
#
#     try:
#         proc = subprocess.Popen(ffmpeg_cmd, stderr=subprocess.STDOUT)
#         Camera.objects.filter(id=camera_id).update(ffmpeg_pid=proc.pid)
#         logger.info(f"FFmpeg started for camera {camera_id}, PID={proc.pid}, mountpoint={mp_id}")
#     except Exception as e:
#         logger.error(f"Error starting ffmpeg for camera {camera_id}: {e}")
#         destroy_janus_mountpoint(mp_id)
#         Camera.objects.filter(id=camera_id).update(
#             mountpoint_id=None,
#             video_port=None,
#             ffmpeg_pid=None
#         )
#
#
# # -------------------------------
# # Учёт (increment/decrement) зрителей
# # -------------------------------
# def increment_viewer(camera: Camera):
#     old_value = camera.viewers_count
#     camera.viewers_count += 1
#     camera.save(update_fields=['viewers_count'])
#     logger.info(
#         f"Incremented viewers_count for camera {camera.id}: {old_value} -> {camera.viewers_count}"
#     )
#     # Если был 0, значит нужно запустить стрим
#     if old_value == 0:
#         start_camera_stream(camera)
#
#
# def decrement_viewer(camera: Camera):
#     if camera.viewers_count > 0:
#         camera.viewers_count -= 1
#         camera.save(update_fields=['viewers_count'])
#         logger.info(
#             f"Decremented viewers_count for camera {camera.id}, now {camera.viewers_count}"
#         )
#         if camera.viewers_count == 0:
#             stop_camera_stream(camera)
#     else:
#         logger.warning(
#             f"Attempted to decrement viewers for camera {camera.id} but count was 0"
#         )
