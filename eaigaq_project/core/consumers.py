# eaigaq_project/core/consumers.py

import json
import logging
import time
import asyncio
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.signals import user_logged_out

from .models import FaceEncoding

logger = logging.getLogger(__name__)

User = get_user_model()

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

            # Импортируем задачу внутри метода, чтобы избежать циклического импорта
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
                    await self.safe_send(json.dumps({'message': f'Кодировка лица сохранена ({self.encoding_count}/10)'}))
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

            # Импортируем задачу внутри метода, чтобы избежать циклического импорта
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
        # Сохраняем сессию асинхронно
        await sync_to_async(session.save)()
        # Вызов сигнала user_logged_in
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



