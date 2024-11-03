# eaigaq_project/core/signals.py
from django.contrib.auth.signals import user_logged_in, user_logged_out
from .models import Session
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.utils import timezone
import json
from .models import Case, MaterialEvidence, AuditEntry, User


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


# ---------------------------
# Signals for logging changes
# ---------------------------

# # Create a cache to store old instance data
# from threading import local
# _thread_locals = local()

@receiver(pre_save, sender=Case)
def store_old_case_instance(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._old_instance = None
    else:
        instance._old_instance = None


@receiver(post_save, sender=Case)
def log_case_changes(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    user = instance.creator if instance.creator else None

    if not created:
        old_instance = getattr(instance, '_old_instance', None)
        if not old_instance:
            return

        changes = {}
        for field in instance._meta.fields:
            field_name = field.name
            old_value = getattr(old_instance, field_name)
            new_value = getattr(instance, field_name)
            if old_value != new_value:
                changes[field_name] = {'old': str(old_value), 'new': str(new_value)}
        if not changes:
            return
    else:
        # Для создания записи сохраняем все поля
        changes = model_to_dict(instance)
        changes = {k: str(v) for k, v in changes.items()}

    AuditEntry.objects.create(
        object_id=instance.id,
        object_name=instance.name,
        table_name='case',
        class_name='Case',
        action=action,
        fields=', '.join(changes.keys()),
        data=json.dumps(changes, ensure_ascii=False, default=str),
        user=user,
        case=instance
    )


@receiver(pre_save, sender=MaterialEvidence)
def store_old_material_evidence_instance(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._old_instance = None
    else:
        instance._old_instance = None


@receiver(post_save, sender=MaterialEvidence)
def log_material_evidence_changes(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    user = instance.created_by if instance.created_by else None

    if not created:
        old_instance = getattr(instance, '_old_instance', None)
        if not old_instance:
            return

        changes = {}
        for field in instance._meta.fields:
            field_name = field.name
            old_value = getattr(old_instance, field_name)
            new_value = getattr(instance, field_name)
            if old_value != new_value:
                changes[field_name] = {'old': str(old_value), 'new': str(new_value)}
        if not changes:
            return
    else:
        # Для создания записи сохраняем все поля
        changes = model_to_dict(instance)
        changes = {k: str(v) for k, v in changes.items()}

    AuditEntry.objects.create(
        object_id=instance.id,
        object_name=instance.name,
        table_name='materialevidence',
        class_name='MaterialEvidence',
        action=action,
        fields=', '.join(changes.keys()),
        data=json.dumps(changes, ensure_ascii=False, default=str),
        user=user,
        case=instance.case
    )


@receiver(post_delete, sender=MaterialEvidence)
def log_material_evidence_deletion(sender, instance, **kwargs):
    AuditEntry.objects.create(
        object_id=instance.id,
        object_name=instance.name,
        table_name='materialevidence',
        class_name='MaterialEvidence',
        action='delete',
        fields='',
        data='',
        user=instance.created_by,
        case=instance.case
    )
