# eaigaq_project/eaigaq_project/asgi.py

import os
import django
from channels.routing import get_default_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eaigaq_project.settings')
django.setup()
application = get_default_application()
