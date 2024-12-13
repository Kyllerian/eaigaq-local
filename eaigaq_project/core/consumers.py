# eaigaq_project/core/consumers.py

import json
import logging
import time
import asyncio
import base64
import uuid
from fractions import Fraction

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.db import DatabaseError

from aiortc import RTCSessionDescription, RTCPeerConnection, RTCIceCandidate, MediaStreamTrack
from aiortc.mediastreams import VideoFrame

import cv2
import numpy as np
import redis.asyncio as redis  # Используем redis.asyncio вместо aioredis
import av  # PyAV для декодирования H.264
from av.packet import Packet
import subprocess
from .models import FaceEncoding, Camera
from django.conf import settings

logger = logging.getLogger(__name__)
User = get_user_model()

from asgiref.sync import sync_to_async

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



class RedisVideoTrack(MediaStreamTrack):
    kind = "video"
    WIDTH = 640
    HEIGHT = 480
    PIX_FMT = 'bgr24'
    FRAME_SIZE = WIDTH * HEIGHT * 3

    def __init__(self, camera_id):
        super().__init__()
        self.camera_id = camera_id
        self.redis = None
        self.pubsub = None
        self.queue = asyncio.Queue()
        self._ffmpeg_process = None
        self._task_reader = None
        self._task_writer = None
        self.frame_count = 0
        self.time_base = Fraction(1, 30)  # Предполагаем 30 fps

    async def start_listening(self):
        redis_host, redis_port = settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0]
        self.redis = redis.from_url(
            f"redis://{redis_host}:{redis_port}",
            encoding='utf-8',
            decode_responses=True
        )
        self.pubsub = self.redis.pubsub()
        channel_name = f"camera_frames_{self.camera_id}"
        await self.pubsub.subscribe(channel_name)

        ffmpeg_cmd = [
            "ffmpeg",
            "-f", "h264",
            "-i", "pipe:0",
            "-f", "rawvideo",
            "-pix_fmt", self.PIX_FMT,
            "-s", f"{self.WIDTH}x{self.HEIGHT}",
            "-"
        ]
        logger.info(f"Starting ffmpeg decoder for camera_id={self.camera_id}: {' '.join(ffmpeg_cmd)}")
        self._ffmpeg_process = await asyncio.create_subprocess_exec(
            *ffmpeg_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        async def reader_frames():
            while True:
                frame_data = await self._ffmpeg_process.stdout.readexactly(self.FRAME_SIZE)
                frame_np = np.frombuffer(frame_data, dtype=np.uint8).reshape((self.HEIGHT, self.WIDTH, 3))
                video_frame = VideoFrame.from_ndarray(frame_np, format='bgr24')

                # Устанавливаем временные метки для устранения ошибки кодека
                video_frame.pts = self.frame_count
                video_frame.time_base = self.time_base
                self.frame_count += 1

                await self.queue.put(video_frame)

        async def writer_data():
            async for message in self.pubsub.listen():
                if message['type'] == 'message':
                    frame_b64 = message['data']
                    frame_data = base64.b64decode(frame_b64)
                    self._ffmpeg_process.stdin.write(frame_data)
                    await self._ffmpeg_process.stdin.drain()

        self._task_reader = asyncio.create_task(reader_frames())
        self._task_writer = asyncio.create_task(writer_data())

    async def recv(self):
        frame = await self.queue.get()
        return frame

    async def stop(self):
        if self._task_writer and not self._task_writer.done():
            self._task_writer.cancel()
        if self._task_reader and not self._task_reader.done():
            self._task_reader.cancel()

        if self._ffmpeg_process:
            if self._ffmpeg_process.stdin:
                self._ffmpeg_process.stdin.close()
            if self._ffmpeg_process.stderr:
                self._ffmpeg_process.stderr.close()
            if self._ffmpeg_process.stdout:
                self._ffmpeg_process.stdout.close()
            await self._ffmpeg_process.wait()

        if self.pubsub:
            await self.pubsub.close()
        if self.redis:
            await self.redis.close()
        await super().stop()


class CameraStreamConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pc = None
        self.camera_id = None
        self.video_track = None

    async def connect(self):
        self.camera_id = self.scope["url_route"]["kwargs"]["camera_id"]
        logger.info(f"New WebSocket connection for camera_id={self.camera_id}")

        if not await self.user_can_view_camera(self.camera_id):
            logger.warning(f"User not authorized to view camera_id={self.camera_id}")
            await self.close(code=4003)
            return

        camera = await sync_to_async(Camera.objects.get)(id=self.camera_id, active=True)
        rtsp_url = f"rtsp://{camera.login}:{camera.password}@{camera.ip_address}:554/live1.sdp"

        from .tasks import stream_camera_task
        stream_camera_task.delay(self.camera_id, rtsp_url)

        await self.accept()
        logger.info(f"Accepted WebSocket for camera_id={self.camera_id}")

        self.pc = RTCPeerConnection()

        self.video_track = RedisVideoTrack(camera_id=self.camera_id)
        await self.video_track.start_listening()

        self.pc.addTransceiver(self.video_track, direction="sendonly")

        @self.pc.on("icecandidate")
        async def on_icecandidate(event):
            if event.candidate:
                await self.send(json.dumps({
                    "type": "ice-candidate",
                    "candidate": event.candidate.to_json(),
                }))

    async def disconnect(self, close_code):
        logger.info(f"Disconnect for camera_id={self.camera_id}, code={close_code}")
        if self.pc:
            await self.pc.close()
        if self.video_track:
            await self.video_track.stop()

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            if data.get("type") == "offer":
                await self.handle_offer(data)
            elif data.get("type") == "ice-candidate":
                await self.handle_ice_candidate(data)

    async def handle_offer(self, data):
        offer_sdp = data.get("sdp")
        offer_type = data.get("type")
        if not offer_sdp or not offer_type:
            await self.send(json.dumps({"type": "error", "message": "Неверный SDP Offer."}))
            return

        offer = RTCSessionDescription(sdp=offer_sdp, type=offer_type)
        await self.pc.setRemoteDescription(offer)
        answer = await self.pc.createAnswer()
        await self.pc.setLocalDescription(answer)

        await self.send(json.dumps({
            "type": "answer",
            "sdp": self.pc.localDescription.sdp,
            "type_description": self.pc.localDescription.type,
        }))

    async def handle_ice_candidate(self, data):
        candidate_data = data.get("candidate")
        if candidate_data and self.pc:
            candidate = RTCIceCandidate(
                component=int(candidate_data.get("component", 1)),
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
            await self.pc.addIceCandidate(candidate)
        else:
            logger.warning(f"Received invalid ICE candidate for camera_id={self.camera_id}")

    @sync_to_async
    def user_can_view_camera(self, camera_id):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
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