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
        self.max_duration = 10  # Максимальная длительность попытки распознавания (секунды)

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
                if self.encoding_count >= 5:
                    # Достаточно кодировок, завершаем регистрацию
                    await self.set_biometric_registered(True)
                    # Аутентифицируем пользователя после успешной регистрации
                    await self.set_biometric_authenticated()
                    await self.safe_send(json.dumps({'detail': 'Биометрические данные успешно зарегистрированы'}))
                    self.stopped = True
                    await self.close()
                else:
                    await self.safe_send(json.dumps({'message': f'Кодировка лица сохранена ({self.encoding_count}/5)'}))
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


# # core/consumers.py

#
# import os
#
# os.environ["TF_USE_LEGACY_KERAS"] = "1"
#
# import logging
#
# logger = logging.getLogger(__name__)
#
#
# import json
# import logging
# import time
# import asyncio
# import cv2
# import numpy as np
# from channels.generic.websocket import AsyncWebsocketConsumer
#
# from .models import User, FaceEncoding
#
#
# class CreateEncodingConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#         self.username = None
#         self.user = None
#         self.stopped = False
#         self.stage_index = 0
#         self.stages = [
#             {"instruction": "Пожалуйста, смотрите прямо в камеру", "duration": 3, "name": "straight"},
#             {"instruction": "Медленно вращайте головой по часовой стрелке", "duration": 8, "name": "rotate_clockwise"},
#             {"instruction": "Медленно вращайте головой против часовой стрелке", "duration": 8, "name": "rotate_counterclockwise"}
#         ]
#         self.stage_start_time = None
#         self.encoding_count = 0
#         logger.info("Connection accepted for creating encoding.")
#
#     async def receive(self, text_data=None, bytes_data=None):
#         if self.stopped:
#             return
#
#         if text_data:
#             logger.debug(f"Received text data: {text_data}")
#             try:
#                 data = json.loads(text_data)
#             except json.JSONDecodeError as e:
#                 logger.error(f"JSON decode error: {e}")
#                 await self.send(json.dumps({'error': 'Некорректный формат JSON'}))
#                 return
#
#             if not isinstance(data, dict):
#                 logger.error("Received data is not a dictionary.")
#                 await self.send(json.dumps({'error': 'Получены некорректные данные'}))
#                 return
#
#             action = data.get('action')
#             if action == 'start':
#                 self.username = data.get('username')
#                 if not self.username:
#                     await self.send(json.dumps({'error': 'Имя пользователя не предоставлено'}))
#                     await self.close()
#                 else:
#                     # Проверяем или создаем пользователя
#                     self.user, _ = await asyncio.to_thread(User.objects.get_or_create, username=self.username)
#                     self.stage_index = 0
#                     self.stage_start_time = time.time()
#                     instruction = self.stages[self.stage_index]['instruction']
#                     duration = self.stages[self.stage_index]['duration']
#                     await self.send(json.dumps({'message': f'Начато создание кодировки для пользователя {self.username}'}))
#                     await self.send(json.dumps({'instruction': instruction, 'duration': duration}))
#                     logger.info(f"Started encoding creation for user {self.username}")
#             elif action == 'stop':
#                 self.stopped = True
#                 await self.send(json.dumps({'message': 'Процесс создания кодировки остановлен'}))
#                 await self.close()
#             else:
#                 logger.error(f"Unknown action received: {action}")
#                 await self.send(json.dumps({'error': 'Неизвестное действие'}))
#         elif bytes_data and not self.stopped:
#             if not self.username or not self.user:
#                 await self.send(json.dumps({'error': 'Имя пользователя не установлено'}))
#                 await self.close()
#                 return
#
#             # Проверяем, не истекло ли время текущего этапа
#             current_time = time.time()
#
#             if self.stage_index >= len(self.stages):
#                 # Все этапы завершены, игнорируем дальнейшую обработку
#                 return
#
#             stage = self.stages[self.stage_index]
#             if current_time - self.stage_start_time > stage['duration']:
#                 # Переходим к следующему этапу
#                 self.stage_index += 1
#                 if self.stage_index < len(self.stages):
#                     self.stage_start_time = current_time
#                     instruction = self.stages[self.stage_index]['instruction']
#                     duration = self.stages[self.stage_index]['duration']
#                     await self.send(json.dumps({'instruction': instruction, 'duration': duration}))
#                     logger.info(f"Moving to next stage: {instruction}")
#                 else:
#                     # Все этапы завершены
#                     await self.send(json.dumps({'message': 'Все этапы регистрации завершены'}))
#                     logger.info(f"Encoding creation completed for user {self.username}")
#                     self.stopped = True
#                     await self.close()
#                     return
#
#             # Обработка полученного изображения
#             frame_bytes = bytes_data
#
#             # Асинхронная обработка изображения
#             asyncio.create_task(self.process_frame(frame_bytes, stage))
#
#     async def process_frame(self, frame_bytes, stage):
#         try:
#             user_id = self.user.id
#             stage_name = stage['name']
#
#             # Импортируем задачу внутри метода, чтобы избежать циклического импорта
#             from .tasks import create_face_encoding_task
#
#             # Запуск задачи Celery
#             task = create_face_encoding_task.delay(user_id, frame_bytes, stage_name)
#
#             # Ожидание результата задачи асинхронно
#             result = await asyncio.to_thread(task.get, timeout=30)
#
#             if result['status'] == 'success':
#                 self.encoding_count += 1
#                 await self.send(json.dumps({'message': f'Кодировка лица сохранена ({self.encoding_count})'}))
#                 logger.info(f'Face encoding saved for user {self.username} at stage {stage_name}')
#             elif result['status'] == 'spoof':
#                 await self.send(json.dumps({'warning': 'Обнаружена попытка спуффинга. Пожалуйста, используйте реальное лицо.'}))
#                 logger.warning("Spoofing detected during encoding creation.")
#             else:
#                 await self.send(json.dumps({'warning': 'Не удалось получить эмбеддинг лица'}))
#                 logger.warning("Failed to obtain face embedding.")
#         except Exception as e:
#             await self.send(json.dumps({'warning': f'Ошибка при обработке кадра: {str(e)}'}))
#             logger.error(f"Error processing frame: {str(e)}")
#
#     async def disconnect(self, close_code):
#         self.stopped = True
#         logger.info("Connection closed for creating encoding.")
#
# class VerifyFaceConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#         self.recognized = False
#         self.stopped = False
#         self.start_time = None
#         self.authentication_duration = 4  # Длительность распознавания для успешной аутентификации (секунды)
#         self.frame_count = 0
#
#         # Загрузка известных лиц из базы данных при подключении
#         self.known_face_encodings_bytes = []
#         self.known_face_names = []
#         await self.load_known_faces()
#
#         logger.info("Connection accepted for face verification.")
#
#     async def receive(self, text_data=None, bytes_data=None):
#         if self.stopped:
#             return
#
#         if bytes_data:
#             # Обработка полученного изображения
#             frame_bytes = bytes_data
#             self.frame_count += 1
#
#             # Асинхронная обработка изображения
#             asyncio.create_task(self.process_frame(frame_bytes))
#
#     async def process_frame(self, frame_bytes):
#         try:
#             # Подготовка известных кодировок для передачи в задачу
#             known_encodings = list(zip(self.known_face_encodings_bytes, self.known_face_names))
#
#             # Импортируем задачу внутри метода, чтобы избежать циклического импорта
#             from .tasks import verify_face_task
#
#             # Запуск задачи Celery
#             task = verify_face_task.delay(frame_bytes, known_encodings)
#
#             # Ожидание результата задачи асинхронно
#             result = await asyncio.to_thread(task.get, timeout=30)
#
#             if result['status'] == 'success':
#                 recognized_name = result['recognized_name']
#                 if recognized_name == "Неизвестно":
#                     await self.safe_send(json.dumps({'message': 'Пользователь не распознан'}))
#                 else:
#                     if self.start_time is None:
#                         self.start_time = time.time()
#                         logger.info(f"Пользователь распознан: {recognized_name}")
#                         await self.safe_send(json.dumps({'message': f'Пользователь распознан: {recognized_name}'}))
#                     elif time.time() - self.start_time >= self.authentication_duration:
#                         logger.info(f"Аутентификация успешно пройдена: {recognized_name}")
#                         await self.safe_send(json.dumps({'message': f'Аутентификация успешно пройдена: {recognized_name}'}))
#                         self.recognized = True
#                         self.stopped = True
#                         await self.close()
#                         return
#             elif result['status'] == 'spoof':
#                 await self.safe_send(json.dumps({'warning': 'Обнаружена попытка спуффинга. Доступ запрещен.'}))
#                 logger.warning("Spoofing detected during verification.")
#                 self.stopped = True
#                 await self.close()
#             else:
#                 await self.safe_send(json.dumps({'warning': 'Не удалось получить эмбеддинг лица'}))
#                 logger.warning("Failed to obtain face embedding.")
#         except Exception as e:
#             await self.safe_send(json.dumps({'warning': f'Ошибка при распознавании лица: {str(e)}'}))
#             logger.error(f"Face recognition error: {str(e)}")
#
#     async def disconnect(self, close_code):
#         self.stopped = True
#         logger.info("Connection closed for face verification.")
#
#     async def safe_send(self, message):
#         if not self.stopped:
#             try:
#                 await self.send(message)
#             except Exception as e:
#                 logger.warning(f"Attempted to send on a closed connection: {e}")
#
#     async def load_known_faces(self):
#         known_face_encodings_bytes = []
#         known_face_names = []
#
#         users = await asyncio.to_thread(User.objects.all)
#         for user in users:
#             encodings = await asyncio.to_thread(
#                 lambda: list(FaceEncoding.objects.filter(user=user).values_list('encoding', flat=True))
#             )
#             for encoding_bytes in encodings:
#                 known_face_encodings_bytes.append(encoding_bytes)
#                 known_face_names.append(user.username)
#
#         self.known_face_encodings_bytes = known_face_encodings_bytes
#         self.known_face_names = known_face_names
