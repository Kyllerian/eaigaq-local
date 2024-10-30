# eaigaq_project/core/signals.py
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.utils import timezone
from .models import Session

@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    # Создаем новую запись сессии при входе пользователя
    Session.objects.create(user=user)

@receiver(user_logged_out)
def on_user_logged_out(sender, request, user, **kwargs):
    # Находим последнюю активную сессию пользователя и обновляем время выхода
    try:
        active_session = Session.objects.filter(user=user, active=True).latest('login')
        active_session.logout = timezone.now()
        active_session.active = False
        active_session.save()
    except Session.DoesNotExist:
        # Если активная сессия не найдена, ничего не делаем
        pass
