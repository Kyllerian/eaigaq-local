# eaigaq_project/core/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/biometric/$', consumers.BiometricConsumer.as_asgi()),
    re_path(r'^ws/camera/(?P<camera_id>\d+)/$', consumers.CameraStreamConsumer.as_asgi()),
]