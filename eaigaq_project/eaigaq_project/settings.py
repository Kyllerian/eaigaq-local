# eaigaq_project/eaigaq_project/settings.py

import os
from pathlib import Path
from dotenv import load_dotenv

# Определяем базовую директорию
BASE_DIR = Path(__file__).resolve().parent.parent

# Определяем, находимся ли мы в Docker-контейнере
DOCKER = os.environ.get('DOCKER') == '1'

if DOCKER:
    # В Docker-контейнере путь к файлу окружения
    dotenv_path = '/app/.env'
else:
    # В локальной среде путь к файлу env/.env.backend
    dotenv_path = os.path.join(BASE_DIR.parent, 'env', '.env.backend')

# Загрузка переменных окружения из файла .env
load_dotenv(dotenv_path=dotenv_path)

# Получаем SECRET_KEY из переменных окружения
SECRET_KEY = os.environ.get('SECRET_KEY')

# Проверяем, что SECRET_KEY загружен
if not SECRET_KEY:
    raise ValueError("Необходимо установить SECRET_KEY в переменных окружения")

# Устанавливаем DEBUG на основе переменной окружения
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Получаем ALLOWED_HOSTS из переменных окружения
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Настройки CORS
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')

CORS_ALLOW_ALL_ORIGINS = False

os.environ['CUDA_VISIBLE_DEVICES'] = "0"

# Определение приложений
INSTALLED_APPS = [
    # Приложения Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    # Ваше основное приложение
    'core',
    # Для обработки CORS
    'corsheaders',
    # Django REST Framework
    'rest_framework',
    # Django Channels
    'channels',
    'aiortc',
    # Если используете django-celery-beat, раскомментируйте:
    # 'django_celery_beat',
]

# Настройки REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
}

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',           # Должен быть первым
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',       # Убедитесь, что этот middleware не дублируется
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL конфигурация
ROOT_URLCONF = 'eaigaq_project.urls'

# Настройки шаблонов
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Добавьте пути к вашим шаблонам, если необходимо
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',  # Требуется для аутентификации
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ASGI приложение для поддержки WebSocket и Channels
ASGI_APPLICATION = 'eaigaq_project.routing.application'

CERTIFICATE_FILE_PATH = '/app/server.crt'

# WSGI приложение
WSGI_APPLICATION = 'eaigaq_project.wsgi.application'

# Настройки Channels (используем Redis как бэкенд)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
        },
    },
}

# Настройки базы данных
if DOCKER:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'eaigaq_db'),
            'USER': os.environ.get('DB_USER'),
            'PASSWORD': os.environ.get('DB_PASSWORD'),
            'HOST': os.environ.get('DB_HOST', 'db'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Если используется PostgreSQL, проверяем, что параметры базы данных загружены
if DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    if not DATABASES['default']['USER']:
        raise ValueError("Необходимо установить DB_USER в переменных окружения")
    if not DATABASES['default']['PASSWORD']:
        raise ValueError("Необходимо установить DB_PASSWORD в переменных окружения")

# Валидация паролей
AUTH_USER_MODEL = 'core.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,  # Рекомендуется установить минимальную длину пароля
        },
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Интернационализация
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Asia/Almaty'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/backend_static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Настройки логирования
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s',
            'datefmt': "%Y-%m-%d %H:%M:%S",
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'core.services': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# Рекомендуется указать ту же таймзону, что и в Django
CELERY_TIMEZONE = TIME_ZONE
CELERY_ENABLE_UTC = False  # если вы строго хотите использовать Asia/Almaty без UTC

# Пример периодического расписания для celery beat:
# Задача cleanup_stale_viewings будет запускаться каждые 10 секунд в очередь 'ping'.
CELERY_BEAT_SCHEDULE = {
    'cleanup-stale-viewings-every-5-seconds': {
        'task': 'core.tasks.cleanup_stale_viewings',
        'schedule': 5.0,
        'options': {
            'queue': 'ping'
        }
    },
}
# Если вы используете django-celery-beat и DatabaseScheduler:
# CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'


# Настройки безопасности
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True

FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600
FILE_UPLOAD_PERMISSIONS = 0o755



# # eaigaq_project/eaigaq_project/settings.py
#
# import os
# from pathlib import Path
# from dotenv import load_dotenv
#
# # Определяем базовую директорию
# BASE_DIR = Path(__file__).resolve().parent.parent
#
# # Определяем, находимся ли мы в Docker-контейнере
# DOCKER = os.environ.get('DOCKER') == '1'
#
# if DOCKER:
#     # В Docker-контейнере путь к файлу окружения
#     dotenv_path = '/app/.env'
# else:
#     # В локальной среде путь к файлу env/.env.backend
#     dotenv_path = os.path.join(BASE_DIR.parent, 'env', '.env.backend')
#
# # Загрузка переменных окружения из файла .env
# load_dotenv(dotenv_path=dotenv_path)
#
# # Получаем SECRET_KEY из переменных окружения
# SECRET_KEY = os.environ.get('SECRET_KEY')
#
# # Проверяем, что SECRET_KEY загружен
# if not SECRET_KEY:
#     raise ValueError("Необходимо установить SECRET_KEY в переменных окружения")
#
# # Устанавливаем DEBUG на основе переменной окружения
# DEBUG = os.environ.get('DEBUG', 'False') == 'True'
#
# # Получаем ALLOWED_HOSTS из переменных окружения
# ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
#
# # Настройки CORS
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
# CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')
#
# CORS_ALLOW_ALL_ORIGINS = False
#
# os.environ['CUDA_VISIBLE_DEVICES'] = "0"
#
# # Определение приложений
# INSTALLED_APPS = [
#     # Приложения Django
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'django_filters',
#     # Ваше основное приложение
#     'core',
#     # Для обработки CORS
#     'corsheaders',
#     # Django REST Framework
#     'rest_framework',
#     # Django Channels
#     'channels',
#     'aiortc',
# ]
#
# # Настройки REST Framework
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'rest_framework.authentication.SessionAuthentication',
#     ],
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_FILTER_BACKENDS': (
#         'django_filters.rest_framework.DjangoFilterBackend',
#         'rest_framework.filters.SearchFilter',
#         'rest_framework.filters.OrderingFilter',
#     ),
# }
#
# # Middleware
# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',           # Должен быть первым
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',       # Убедитесь, что этот middleware не дублируется
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]
#
# # URL конфигурация
# ROOT_URLCONF = 'eaigaq_project.urls'
#
# # Настройки шаблонов
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [],  # Добавьте пути к вашим шаблонам, если необходимо
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',  # Требуется для аутентификации
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]
#
# # ASGI приложение для поддержки WebSocket и Channels
# ASGI_APPLICATION = 'eaigaq_project.routing.application'
#
# CERTIFICATE_FILE_PATH = '/app/server.crt'
#
# # WSGI приложение
# WSGI_APPLICATION = 'eaigaq_project.wsgi.application'
#
# # Настройки Channels (используем Redis как бэкенд)
# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             'hosts': [('redis', 6379)],
#         },
#     },
# }
#
# # Настройки базы данных
# if DOCKER:
#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.postgresql',
#             'NAME': os.environ.get('DB_NAME', 'eaigaq_db'),
#             'USER': os.environ.get('DB_USER'),
#             'PASSWORD': os.environ.get('DB_PASSWORD'),
#             'HOST': os.environ.get('DB_HOST', 'db'),
#             'PORT': os.environ.get('DB_PORT', '5432'),
#         }
#     }
# else:
#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.sqlite3',
#             'NAME': BASE_DIR / 'db.sqlite3',
#         }
#     }
#
# # Если используется PostgreSQL, проверяем, что параметры базы данных загружены
# if DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
#     if not DATABASES['default']['USER']:
#         raise ValueError("Необходимо установить DB_USER в переменных окружения")
#     if not DATABASES['default']['PASSWORD']:
#         raise ValueError("Необходимо установить DB_PASSWORD в переменных окружения")
#
# # Валидация паролей
# AUTH_USER_MODEL = 'core.User'
#
# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#         'OPTIONS': {
#             'min_length': 8,  # Рекомендуется установить минимальную длину пароля
#         },
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]
#
# # Интернационализация
# LANGUAGE_CODE = 'ru-ru'
#
# TIME_ZONE = 'Asia/Almaty'
#
# USE_I18N = True
# USE_L10N = True
# USE_TZ = True
#
# STATIC_URL = '/backend_static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
#
# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
#
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
#
# # Настройки логирования
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s',
#             'datefmt': "%Y-%m-%d %H:%M:%S",
#         },
#         'simple': {
#             'format': '%(levelname)s %(message)s'
#         },
#     },
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#             'formatter': 'verbose',
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console'],
#             'level': 'INFO',
#         },
#         'core.services': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#             'propagate': True,
#         },
#         # Если нужно, можно добавить другие логгеры
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'INFO',
#     },
# }
#
# CELERY_BROKER_URL = 'redis://redis:6379/0'
# CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'
#
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS = 3600
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True
# SECURE_SSL_REDIRECT = True
#
# FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600
# DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600
# FILE_UPLOAD_PERMISSIONS = 0o755
