# eaigaq_project/eaigaq_project/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings
import logging.config

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eaigaq_project.settings')

app = Celery('eaigaq_project')

# Загрузка конфигурации Celery из Django настроек
app.config_from_object('django.conf:settings', namespace='CELERY')

# Настройка логирования для Celery Worker
logging.config.dictConfig(settings.LOGGING)

# Явно указываем, где искать задачи (модули с @shared_task)
# app.conf.update(
#     include=['core.tasks', 'core.services']
# )

# Автоматическое обнаружение задач в tasks.py приложений
app.autodiscover_tasks()

os.environ['CUDA_VISIBLE_DEVICES'] = "0"