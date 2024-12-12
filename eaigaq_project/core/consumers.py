# eaigaq_project/core/consumers.py

import subprocess
import av
import os

from aiortc import RTCSessionDescription, RTCPeerConnection, RTCIceCandidate, MediaStreamTrack
from aiortc.contrib.media import MediaPlayer, MediaRelay
from channels.db import database_sync_to_async
from django.conf import settings
import uuid

import json
import logging
import time
import asyncio
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.db import DatabaseError

from .models import FaceEncoding, Camera
import cv2
import threading

logger = logging.getLogger(__name__)

User = get_user_model()

import os



class BiometricConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.temp_user_id = self.scope['session'].get('temp_user_id')
        if self.user.is_authenticated:
            # Пользователь уже аутентифицирован
            await self.accept()
        elif self.temp_user_id:
            # Пользователь не аутентифицирован, но есть temp_user_id в сессии
            self.user = await self.get_user(self.temp_user_id)
            if self.user:
                await self.accept()
            else:
                await self.close()
        else:
            await self.close()

        self.recognized = False
        self.stopped = False
        self.start_time = None
        self.max_duration = 40  # Максимальная длительность попытки распознавания (секунды)

        self.stage = None  # 'registration' or 'authentication'

        # Определяем, требуется ли регистрация или аутентификация
        if self.user and not self.user.biometric_registered:
            self.stage = 'registration'
        else:
            self.stage = 'authentication'

        # Для регистрации
        self.encoding_count = 0

        # Для аутентификации
        self.known_face_encodings_bytes = []

        if self.stage == 'authentication':
            # Загрузка известных лиц из базы данных при подключении
            self.known_face_encodings_bytes = await self.load_known_faces()

        logger.info(f"Connection accepted for {self.stage}.")

        # Запускаем таймер для ограничения времени
        self.start_time = time.time()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # Вызов сигнала user_logged_out
            await sync_to_async(user_logged_out.send)(
                sender=self.user.__class__, request=None, user=self.user
            )
        self.stopped = True
        logger.info(f"Connection closed for {self.stage}.")

    async def receive(self, text_data=None, bytes_data=None):
        if self.stopped:
            return

        # Проверяем, не истекло ли максимальное время
        elapsed_time = time.time() - self.start_time
        if elapsed_time > self.max_duration:
            await self.safe_send(json.dumps({'message': 'Время истекло'}))
            self.stopped = True
            await self.close()
            return

        if bytes_data:
            # Обработка полученного изображения
            frame_bytes = bytes_data

            # Асинхронная обработка изображения
            if self.stage == 'registration':
                asyncio.create_task(self.handle_biometric_registration(frame_bytes))
            elif self.stage == 'authentication':
                asyncio.create_task(self.handle_biometric_authentication(frame_bytes))

    async def handle_biometric_registration(self, frame_bytes):
        if self.stopped:
            return
        try:
            user_id = self.user.id

            # Кодируем бинарные данные в base64
            frame_b64 = base64.b64encode(frame_bytes).decode('utf-8')

            from .tasks import create_face_encoding_task

            # Запуск задачи Celery
            task = create_face_encoding_task.delay(user_id, frame_b64)

            # Ожидание результата задачи асинхронно
            result = await asyncio.to_thread(task.get, timeout=30)

            if result['status'] == 'success':
                self.encoding_count += 1
                if self.encoding_count >= 10:
                    # Достаточно кодировок, завершаем регистрацию
                    await self.set_biometric_registered(True)
                    # Аутентифицируем пользователя после успешной регистрации
                    await self.set_biometric_authenticated()
                    await self.safe_send(json.dumps({'detail': 'Биометрические данные успешно зарегистрированы'}))
                    self.stopped = True
                    await self.close()
                else:
                    await self.safe_send(
                        json.dumps({'message': f'Кодировка лица сохранена ({self.encoding_count}/10)'}))
            elif result['status'] == 'no_face':
                await self.safe_send(json.dumps({'warning': 'Лицо не обнаружено на текущем кадре.'}))
            else:
                await self.safe_send(json.dumps({'warning': 'Ошибка при создании кодировки лица'}))
                logger.warning("Ошибка при создании кодировки лица.")
        except Exception as e:
            await self.safe_send(json.dumps({'warning': f'Ошибка при обработке кадра: {str(e)}'}))
            logger.error(f"Ошибка при обработке кадра: {str(e)}")

    async def handle_biometric_authentication(self, frame_bytes):
        if self.stopped:
            return
        try:
            # Кодируем frame_bytes в base64
            frame_b64 = base64.b64encode(frame_bytes).decode('utf-8')

            # Подготовка известных кодировок
            known_encodings_serializable = []
            for encoding_bytes in self.known_face_encodings_bytes:
                encoding_b64 = base64.b64encode(encoding_bytes).decode('utf-8')
                known_encodings_serializable.append(encoding_b64)

            from .tasks import verify_face_task

            # Запуск задачи Celery
            task = verify_face_task.delay(frame_b64, known_encodings_serializable)

            # Ожидание результата задачи асинхронно
            result = await asyncio.to_thread(task.get, timeout=30)

            if result['status'] == 'success':
                if result['recognized']:
                    # Аутентификация успешна
                    await self.set_biometric_authenticated()
                    await self.safe_send(json.dumps({'detail': 'Аутентификация успешна'}))
                    self.stopped = True
                    await self.close()
                else:
                    await self.safe_send(json.dumps({'warning': 'Не удалось распознать лицо'}))
            else:
                await self.safe_send(json.dumps({'warning': 'Ошибка при распознавании лица'}))
                logger.warning("Ошибка распознавания лица.")
        except Exception as e:
            await self.safe_send(json.dumps({'warning': f'Ошибка при распознавании лица: {str(e)}'}))
            logger.error(f"Ошибка распознавания лица: {str(e)}")

    async def get_user(self, user_id):
        try:
            return await sync_to_async(User.objects.get)(id=user_id)
        except User.DoesNotExist:
            return None

    async def set_biometric_registered(self, status):
        self.user.biometric_registered = status
        await sync_to_async(self.user.save)()

    async def set_biometric_authenticated(self):
        # Логиним пользователя через сессию
        session = self.scope['session']
        session['_auth_user_id'] = str(self.user.pk)
        session['_auth_user_backend'] = 'django.contrib.auth.backends.ModelBackend'
        session['_auth_user_hash'] = self.user.get_session_auth_hash()
        session.pop('temp_user_id', None)
        await sync_to_async(session.save)()
        await sync_to_async(user_logged_in.send)(
            sender=self.user.__class__, request=None, user=self.user
        )

    async def load_known_faces(self):
        encodings = await sync_to_async(list)(
            FaceEncoding.objects.filter(user=self.user).values_list('encoding', flat=True)
        )
        return encodings

    async def safe_send(self, message):
        if not self.stopped:
            try:
                await self.send(message)
            except Exception as e:
                logger.warning(f"Попытка отправить сообщение по закрытому соединению: {e}")

# ----------------------------------------------------------------------------

import json
import signal
#
# class CameraStreamConsumer(AsyncWebsocketConsumer):
#     """
#     Consumer для преобразования RTSP в HLS с помощью ffmpeg, с указанием параметров потока,
#     и отправки клиенту ссылки на m3u8 плейлист, записывая файлы в MEDIA_ROOT.
#     """
#
#     ffmpeg_process = None
#     camera_id = None
#     session_id = None
#     hls_dir = None
#     playlist_path = None
#
#     async def connect(self):
#         try:
#             camera_id = self.scope["url_route"]["kwargs"]["camera_id"]
#             self.camera_id = camera_id
#             logger.info(f"New WebSocket connection for camera_id={camera_id}")
#
#             if not await self.user_can_view_camera(camera_id):
#                 logger.warning(f"User not authorized to view camera_id={camera_id}")
#                 await self.close(code=4003)
#                 return
#
#             await self.accept()
#             logger.info(f"Accepted WebSocket connection for camera_id={camera_id}")
#
#             # Генерируем уникальный каталог для HLS
#             self.session_id = str(uuid.uuid4())
#             self.hls_dir = os.path.join(settings.MEDIA_ROOT, f"hls_{self.session_id}")
#             os.makedirs(self.hls_dir, exist_ok=True)
#
#             self.playlist_path = os.path.join(self.hls_dir, "index.m3u8")
#
#             # Получаем RTSP URL
#             rtsp_url = await self.get_rtsp_url(camera_id)
#             logger.info(f"RTSP URL for camera_id={camera_id}: {rtsp_url}")
#
#
#             ffmpeg_cmd = [
#                 "ffmpeg",
#                 # Настройки подключения и стабильности
#                 # "-reconnect", "1",
#                 # "-reconnect_streamed", "1",
#                 # "-reconnect_delay_max", "5",
#                 # "-timeout", "5000000",
#
#                 # Настройки захвата
#                 "-probesize", "5000000",
#                 "-analyzeduration", "10000000",
#                 "-fflags", "nobuffer",
#                 "-rtsp_transport", "tcp",
#
#                 # Аппаратное декодирование (CUDA)
#                 "-hwaccel", "cuda",
#                 "-c:v", "h264_cuvid",
#
#                 # Входной поток
#                 "-i", rtsp_url,
#
#                 # Отключение аудио
#                 "-an",
#
#                 # Изменение разрешения и FPS
#                 "-s", "640x480",
#                 "-r", "30",
#
#                 # Аппаратное кодирование (NVIDIA NVENC)
#                 "-c:v", "h264_nvenc",
#                 "-preset", "fast",
#                 "-g", "60",
#                 "-bf", "0",
#                 "-flags", "-global_header",
#
#                 # Настройки HLS
#                 "-f", "hls",
#                 "-hls_time", "4",
#                 "-hls_list_size", "10",
#                 "-hls_playlist_type", "event",
#                 "-hls_flags", "append_list+omit_endlist+independent_segments", # удален delete_segments+
#
#                 "-use_wallclock_as_timestamps", "1",
#                 "-avoid_negative_ts", "make_zero",
#                 # Путь к плейлисту
#                 self.playlist_path
#             ]
#             logger.info(f"Starting ffmpeg for camera_id={camera_id} with cmd: {' '.join(ffmpeg_cmd)}")
#
#             self.ffmpeg_process = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#
#             # Запускаем чтение stderr ffmpeg
#             asyncio.create_task(self.read_ffmpeg_stderr())
#
#             # Ожидаем появления m3u8 (уменьшим общее ожидание, допустим до 20 попыток по 0.5 с = 10 секунд)
#             for i in range(40):
#                 if os.path.exists(self.playlist_path):
#                     # Формируем URL для клиента
#                     playlist_url = f"{settings.MEDIA_URL}hls_{self.session_id}/index.m3u8"
#                     logger.info(f"M3U8 found for camera_id={camera_id}, sending playlist URL: {playlist_url}")
#                     await self.send(json.dumps({"type": "playlist", "url": playlist_url}))
#                     break
#                 else:
#                     logger.debug(f"M3U8 not found yet for camera_id={camera_id}, attempt {i+1}/20")
#                 await asyncio.sleep(0.5)
#             else:
#                 # Не дождались плейлиста
#                 logger.error(f"Timed out waiting for HLS playlist for camera_id={camera_id}")
#                 await self.send(json.dumps({"type": "error", "message": "Не удалось получить поток"}))
#                 await self.close()
#
#         except Exception as e:
#             logger.error(f"Error in connect method for camera_id={getattr(self, 'camera_id', None)}: {e}", exc_info=True)
#             await self.close()
#
#     async def disconnect(self, close_code):
#         camera_id = getattr(self, 'camera_id', None)
#         logger.info(f"Disconnecting WebSocket for camera_id={camera_id}, close_code={close_code}")
#         try:
#             if self.ffmpeg_process and self.ffmpeg_process.poll() is None:
#                 logger.info(f"Stopping ffmpeg process for camera_id={camera_id}")
#                 self.ffmpeg_process.send_signal(signal.SIGTERM)
#                 try:
#                     self.ffmpeg_process.wait(timeout=5)
#                 except subprocess.TimeoutExpired:
#                     logger.warning(f"ffmpeg did not stop gracefully for camera_id={camera_id}, killing process")
#                     self.ffmpeg_process.kill()
#             self.ffmpeg_process = None
#         except Exception as e:
#             logger.error(f"Error during disconnect for camera_id={camera_id}: {e}", exc_info=True)
#
#     async def receive(self, text_data=None, bytes_data=None):
#         camera_id = getattr(self, 'camera_id', None)
#         logger.debug(f"Received message on WebSocket for camera_id={camera_id}. text_data={text_data} bytes_data={bytes_data}")
#         try:
#             if text_data:
#                 data = json.loads(text_data)
#                 logger.debug(f"Parsed message: {data}")
#         except Exception as e:
#             logger.error(f"Error parsing incoming message for camera_id={camera_id}: {e}", exc_info=True)
#
#     @sync_to_async
#     def user_can_view_camera(self, camera_id):
#         try:
#             user = self.scope["user"]
#             if not user.is_authenticated:
#                 logger.debug(f"Unauthenticated user tried to view camera_id={camera_id}")
#                 return False
#             camera = Camera.objects.get(id=camera_id, active=True)
#             if user.role == "REGION_HEAD":
#                 return camera.region == user.region
#             elif user.role == "DEPARTMENT_HEAD":
#                 return camera.department == user.department
#             else:
#                 return False
#         except Camera.DoesNotExist:
#             logger.warning(f"Camera with id={camera_id} does not exist or not active")
#             return False
#         except Exception as e:
#             logger.error(f"Error checking user_can_view_camera for camera_id={camera_id}: {e}", exc_info=True)
#             return False
#
#     @sync_to_async
#     def get_rtsp_url(self, camera_id):
#         try:
#             camera = Camera.objects.get(id=camera_id, active=True)
#             url = f"rtsp://{camera.login}:{camera.password}@{camera.ip_address}:554/live1.sdp"
#             return url
#         except Camera.DoesNotExist:
#             logger.error(f"Camera with id={camera_id} does not exist or not active for get_rtsp_url")
#             raise
#         except Exception as e:
#             logger.error(f"Error getting RTSP URL for camera_id={camera_id}: {e}", exc_info=True)
#             raise
#
#     async def read_ffmpeg_stderr(self):
#         """Асинхронное чтение stderr ffmpeg и вывод в логи."""
#         if self.ffmpeg_process is None:
#             return
#
#         loop = asyncio.get_running_loop()
#         stderr = self.ffmpeg_process.stderr
#         try:
#             while True:
#                 line = await loop.run_in_executor(None, stderr.readline)
#                 if not line:
#                     break
#                 decoded_line = line.decode('utf-8', errors='replace').strip()
#                 logger.error(f"ffmpeg stderr (camera_id={self.camera_id}): {decoded_line}")
#         except Exception as e:
#             logger.error(f"Error reading ffmpeg stderr for camera_id={self.camera_id}: {e}", exc_info=True)

# Relay для мультиплексирования потоков
relay = MediaRelay()
class CameraStreamConsumer(AsyncWebsocketConsumer):
    """
    Consumer для преобразования RTSP в WebRTC с помощью aiortc и отправки видеопотока клиенту.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pc = None  # RTCPeerConnection
        self.camera_id = None
        self.session_id = None
        self.player = None
        self.media_track = None

    async def connect(self):
        try:
            self.camera_id = self.scope["url_route"]["kwargs"]["camera_id"]
            logger.info(f"New WebSocket connection for camera_id={self.camera_id}")

            if not await self.user_can_view_camera(self.camera_id):
                logger.warning(f"User not authorized to view camera_id={self.camera_id}")
                await self.close(code=4003)
                return

            await self.accept()
            logger.info(f"Accepted WebSocket connection for camera_id={self.camera_id}")

            # Генерируем уникальный session_id (можно использовать для отслеживания)
            self.session_id = str(uuid.uuid4())

            # Получаем RTSP URL
            rtsp_url = await self.get_rtsp_url(self.camera_id)
            logger.info(f"RTSP URL for camera_id={self.camera_id}: {rtsp_url}")

            # Запускаем MediaPlayer для захвата RTSP-потока
            self.player = MediaPlayer(rtsp_url, format="rtsp", options={
                "rtsp_transport": "tcp",
                "stimeout": "5000000",
            })

            # Проверяем, успешно ли MediaPlayer захватил видеотрек
            if self.player and self.player.video:
                self.media_track = relay.subscribe(self.player.video)
                logger.info(f"MediaPlayer initialized and video track subscribed for camera_id={self.camera_id}")
            else:
                logger.error(f"Failed to initialize MediaPlayer or capture video track for camera_id={self.camera_id}")
                await self.send(json.dumps({"type": "error", "message": "Не удалось захватить видеопоток."}))
                await self.close()
                return

        except Exception as e:
            logger.error(f"Error in connect method for camera_id={self.camera_id}: {e}", exc_info=True)
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Disconnecting WebSocket for camera_id={self.camera_id}, close_code={close_code}")
        try:
            if self.pc:
                await self.pc.close()
                logger.debug("PeerConnection closed.")
            if self.player:
                if hasattr(self.player, 'stop'):
                    self.player.stop()
                    logger.debug("MediaPlayer stopped.")
                elif hasattr(self.player, 'process') and self.player.process:
                    self.player.process.terminate()
                    logger.debug("MediaPlayer process terminated.")
                else:
                    logger.warning("MediaPlayer does not have a 'stop' method or 'process' attribute.")
            self.media_track = None
        except Exception as e:
            logger.error(f"Error during disconnect for camera_id={self.camera_id}: {e}", exc_info=True)



    async def receive(self, text_data=None, bytes_data=None):
        """
        Обработка сообщений WebSocket для сигнального обмена WebRTC.
        Ожидается, что клиент будет отправлять SDP Offer и ICE кандидаты.
        """
        camera_id = self.camera_id
        logger.debug(f"Received message on WebSocket for camera_id={camera_id}. text_data={text_data} bytes_data={bytes_data}")
        try:
            if text_data:
                data = json.loads(text_data)
                logger.debug(f"Parsed message: {data}")

                if data.get("type") == "offer":
                    await self.handle_offer(data)
                elif data.get("type") == "ice-candidate":
                    await self.handle_ice_candidate(data)
        except Exception as e:
            logger.error(f"Error parsing incoming message for camera_id={camera_id}: {e}", exc_info=True)
            await self.send(json.dumps({"type": "error", "message": "Ошибка обработки сообщения."}))

    async def handle_offer(self, data):
        """
        Обработка SDP Offer от клиента и отправка SDP Answer.
        """
        offer_sdp = data.get("sdp")
        offer_type = data.get("type")
        if not offer_sdp or not offer_type:
            logger.error(f"Invalid SDP Offer received: {data}")
            await self.send(json.dumps({"type": "error", "message": "Неверный SDP Offer."}))
            return

        offer = RTCSessionDescription(sdp=offer_sdp, type=offer_type)
        logger.debug(f"Handling offer for camera_id={self.camera_id}")
        logger.debug(f"Received SDP Offer: {offer.sdp}, Type: {offer.type}")

        self.pc = RTCPeerConnection()
        # Исправленный обработчик с принятием аргумента и игнорированием его
        self.pc.on("iceconnectionstatechange", lambda *args: logger.info(f"ICE connection state: {self.pc.iceConnectionState}"))

        # Добавляем видеотрек как отправляющий (sendonly)
        if self.media_track:
            try:
                if self.media_track and isinstance(self.media_track, MediaStreamTrack):
                    try:
                        transceiver = self.pc.addTransceiver(self.media_track, direction="sendonly")
                        logger.debug(f"Added media_track as sendonly transceiver to PeerConnection for camera_id={self.camera_id}")
                    except Exception as e:
                        logger.error(f"Error adding transceiver: {e}", exc_info=True)
                        await self.send(json.dumps({"type": "error", "message": "Ошибка при добавлении трансивера."}))
                        await self.close()
                        return
                else:
                    logger.error(f"No valid media_track available to add for camera_id={self.camera_id}")
                    await self.send(json.dumps({"type": "error", "message": "Нет доступного видеотрека."}))
                    await self.close()
                    return
                logger.debug(f"Added media_track as sendonly transceiver to PeerConnection for camera_id={self.camera_id}")
            except Exception as e:
                logger.error(f"Error adding transceiver: {e}", exc_info=True)
                await self.send(json.dumps({"type": "error", "message": "Ошибка при добавлении трансивера."}))
                await self.close()
                return
        else:
            logger.error(f"No media_track available to add for camera_id={self.camera_id}")
            await self.send(json.dumps({"type": "error", "message": "Нет доступного видеотрека."}))
            await self.close()
            return

        # Обработка полученных ICE кандидатов
        @self.pc.on("icecandidate")
        async def on_icecandidate(event):
            if event.candidate:
                try:
                    await self.send(json.dumps({
                        "type": "ice-candidate",
                        "candidate": event.candidate.to_json(),
                    }))
                    logger.debug(f"Sent ICE candidate to client for camera_id={self.camera_id}")
                except Exception as e:
                    logger.error(f"Error sending ICE candidate to client: {e}", exc_info=True)

        try:
            # Установка дескриптора предложения
            await self.pc.setRemoteDescription(offer)
            logger.debug(f"Set remote description for camera_id={self.camera_id}")

            # Создание SDP ответа
            answer = await self.pc.createAnswer()
            await self.pc.setLocalDescription(answer)
            logger.debug(f"Created and set local description for camera_id={self.camera_id}")
            logger.debug(f"Created SDP Answer: {self.pc.localDescription.sdp}, Type: {self.pc.localDescription.type}")

            # Отправка SDP ответа клиенту
            await self.send(json.dumps({
                "type": "answer",
                "sdp": self.pc.localDescription.sdp,
                "type_description": self.pc.localDescription.type,
            }))
            logger.info(f"Sent SDP answer to client for camera_id={self.camera_id}")

        except Exception as e:
            logger.error(f"Error handling offer for camera_id={self.camera_id}: {e}", exc_info=True)
            await self.send(json.dumps({"type": "error", "message": "Ошибка обработки SDP Offer."}))
            await self.close()

    async def handle_ice_candidate(self, data):
        candidate_data = data.get("candidate")
        if candidate_data and self.pc:
            try:
                # Создание объекта RTCIceCandidate с учетом ожидаемых параметров
                candidate = RTCIceCandidate(
                    component=int(candidate_data.get("component", 1)),  # Значение по умолчанию - 1
                    foundation=candidate_data.get("foundation", "unknown"),
                    ip=candidate_data.get("ip"),
                    port=int(candidate_data.get("port")),
                    priority=int(candidate_data.get("priority", 0)),
                    protocol=candidate_data.get("protocol", "tcp"),
                    type=candidate_data.get("type", "host"),
                    relatedAddress=candidate_data.get("relatedAddress"),
                    relatedPort=candidate_data.get("relatedPort"),
                    sdpMid=candidate_data.get("sdpMid"),
                    sdpMLineIndex=candidate_data.get("sdpMLineIndex"),
                    tcpType=candidate_data.get("tcpType"),
                )
                # Добавление кандидата в PeerConnection
                await self.pc.addIceCandidate(candidate)
                logger.debug(f"Added ICE candidate to PeerConnection for camera_id={self.camera_id}")
            except Exception as e:
                logger.error(f"Error adding ICE candidate for camera_id={self.camera_id}: {e}", exc_info=True)
        else:
            logger.warning(f"Received invalid ICE candidate for camera_id={self.camera_id}")




    @database_sync_to_async
    def user_can_view_camera(self, camera_id):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                logger.debug(f"Unauthenticated user tried to view camera_id={camera_id}")
                return False
            camera = Camera.objects.get(id=camera_id, active=True)
            if user.role == "REGION_HEAD":
                return camera.region == user.region
            elif user.role == "DEPARTMENT_HEAD":
                return camera.department == user.department
            else:
                return False
        except Camera.DoesNotExist:
            logger.warning(f"Camera with id={camera_id} does not exist or not active")
            return False
        except Exception as e:
            logger.error(f"Error checking user_can_view_camera for camera_id={camera_id}: {e}", exc_info=True)
            return False

    @database_sync_to_async
    def get_rtsp_url(self, camera_id):
        try:
            camera = Camera.objects.get(id=camera_id, active=True)
            url = f"rtsp://{camera.login}:{camera.password}@{camera.ip_address}:554/live1.sdp"
            return url
        except Camera.DoesNotExist:
            logger.error(f"Camera with id={camera_id} does not exist or not active for get_rtsp_url")
            raise
        except Exception as e:
            logger.error(f"Error getting RTSP URL for camera_id={camera_id}: {e}", exc_info=True)
            raise

    async def read_ffmpeg_stderr(self):
        """Асинхронное чтение stderr ffmpeg и вывод в логи."""
        if self.player is None or self.player.process is None:
            return

        loop = asyncio.get_running_loop()
        stderr = self.player.process.stderr
        try:
            while True:
                line = await loop.run_in_executor(None, stderr.readline)
                if not line:
                    break
                decoded_line = line.decode('utf-8', errors='replace').strip()
                logger.error(f"ffmpeg stderr (camera_id={self.camera_id}): {decoded_line}")
        except Exception as e:
            logger.error(f"Error reading ffmpeg stderr for camera_id={self.camera_id}: {e}", exc_info=True)