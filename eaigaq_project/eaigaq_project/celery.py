# # eaigaq_project/eaigaq_project/celery.py
#
# from __future__ import absolute_import, unicode_literals
# import os
# from celery import Celery
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eaigaq_project.settings')
#
# app = Celery('eaigaq_project')
#
# app.config_from_object('django.conf:settings', namespace='CELERY')
#
# app.autodiscover_tasks()
#
#
# app.config_from_object('django.conf:settings', namespace='CELERY')
# app.autodiscover_tasks()

# eaigaq_project/eaigaq_project/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings  # Импортируем настройки Django
import logging.config  # Импортируем модуль для настройки логирования

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eaigaq_project.settings')

app = Celery('eaigaq_project')

app.config_from_object('django.conf:settings', namespace='CELERY')
# Настройка логирования для Celery Worker
logging.config.dictConfig(settings.LOGGING)

app.autodiscover_tasks()

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
