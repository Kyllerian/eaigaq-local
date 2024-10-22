# docker/entrypoint.sh
#!/bin/bash
set -e
# Выполняем миграции и собираем статические файлы
python3 manage.py migrate
python3 manage.py collectstatic --noinput

# Запускаем Gunicorn
exec gunicorn eaigaq_project.wsgi:application --bind 0.0.0.0:8000
