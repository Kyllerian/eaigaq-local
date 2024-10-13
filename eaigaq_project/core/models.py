# core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid
import random


class Region(models.TextChoices):
    AKMOLA = 'AKMOLA', _('Акмолинская область')
    AKTOBE = 'AKTOBE', _('Актюбинская область')
    ALMATY_REGION = 'ALMATY_REGION', _('Алматинская область')
    ATYRAU = 'ATYRAU', _('Атырауская область')
    EAST_KAZAKHSTAN = 'EAST_KAZAKHSTAN', _('Восточно-Казахстанская область')
    ZHAMBYL = 'ZHAMBYL', _('Жамбылская область')
    WEST_KAZAKHSTAN = 'WEST_KAZAKHSTAN', _('Западно-Казахстанская область')
    KARAGANDA = 'KARAGANDA', _('Карагандинская область')
    KOSTANAY = 'KOSTANAY', _('Костанайская область')
    KYZYLORDA = 'KYZYLORDA', _('Кызылординская область')
    MANGYSTAU = 'MANGYSTAU', _('Мангистауская область')
    PAVLODAR = 'PAVLODAR', _('Павлодарская область')
    NORTH_KAZAKHSTAN = 'NORTH_KAZAKHSTAN', _('Северо-Казахстанская область')
    TURKESTAN = 'TURKESTAN', _('Туркестанская область')
    ASTANA = 'ASTANA', _('город Астана')
    ALMATY_CITY = 'ALMATY_CITY', _('город Алматы')
    SHYMKENT = 'SHYMKENT', _('город Шымкент')


class Department(models.Model):
    name = models.CharField(_('Название отделения'), max_length=255)
    region = models.CharField(
        _('Регион'),
        max_length=50,
        choices=Region.choices,
        default=Region.ASTANA
    )

    def __str__(self):
        return f"{self.name} ({self.get_region_display()})"


class User(AbstractUser):
    phone_number = models.CharField(_('Номер телефона'), max_length=20, blank=True)
    rank = models.CharField(_('Звание'), max_length=50, blank=True)
    face_data = models.BinaryField(_('Данные лица'), blank=True, null=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name=_('Отделение')
    )
    region = models.CharField(
        _('Регион'),
        max_length=50,
        choices=Region.choices,
        null=True,
        blank=True,
    )
    ROLE_CHOICES = [
        ('REGION_HEAD', _('Главный пользователь региона')),
        ('DEPARTMENT_HEAD', _('Главный по отделению')),
        ('USER', _('Обычный пользователь')),
    ]
    role = models.CharField(
        _('Роль'),
        max_length=20,
        choices=ROLE_CHOICES,
        default='USER',
    )

    def __str__(self):
        return f"{self.get_full_name()} - ({self.rank})"

    # Заглушки для методов распознавания лица
    def set_face_data(self, image):
        # TODO: Реализовать сохранение данных лица
        pass

    def verify_face(self, image):
        # TODO: Реализовать проверку лица
        return False

    # Добавляем метод save для автоматического установления региона
    def save(self, *args, **kwargs):
        if not self.region:
            if self.department and self.department.region:
                self.region = self.department.region
        super(User, self).save(*args, **kwargs)


class Case(models.Model):
    name = models.CharField(_('Название дела'), max_length=255)
    description = models.TextField(_('Описание дела'))
    investigator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='cases', verbose_name=_('Следователь')
    )
    creator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cases_created', verbose_name=_('Создатель')
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases',
        verbose_name=_('Отделение')
    )
    active = models.BooleanField(_('Активно'), default=True)
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)

    def __str__(self):
        return self.name


class MaterialEvidenceStatus(models.TextChoices):
    IN_STORAGE = 'IN_STORAGE', _('На хранении')
    DESTROYED = 'DESTROYED', _('Уничтожен')
    TAKEN = 'TAKEN', _('Взят')
    ON_EXAMINATION = 'ON_EXAMINATION', _('На экспертизе')
    ARCHIVED = 'ARCHIVED', _('В архиве')


class EvidenceGroup(models.Model):
    name = models.CharField(_('Название группы'), max_length=255)
    case = models.ForeignKey(
        Case, on_delete=models.CASCADE, related_name='evidence_groups', verbose_name=_('Дело')
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='evidence_groups_created', verbose_name=_('Создано пользователем')
    )
    barcode = models.CharField(_('Штрихкод'), max_length=13, unique=True, blank=True, null=True)
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)
    active = models.BooleanField(_('Активна'), default=True)

    def save(self, *args, **kwargs):
        if not self.barcode:
            self.barcode = self.generate_unique_barcode()
        super(EvidenceGroup, self).save(*args, **kwargs)

    def generate_unique_barcode(self):
        while True:
            # Генерируем случайное 12-значное число
            number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
            # Вычисляем контрольную цифру (EAN-13)
            total = 0
            for idx, digit in enumerate(number):
                if idx % 2 == 0:
                    total += int(digit)
                else:
                    total += int(digit) * 3
            checksum = (10 - (total % 10)) % 10
            barcode = number + str(checksum)
            # Проверяем уникальность
            if not EvidenceGroup.objects.filter(barcode=barcode).exists():
                return barcode

    def __str__(self):
        return self.name


class MaterialEvidence(models.Model):
    name = models.CharField(_('Название ВД'), max_length=255)
    description = models.TextField(_('Описание ВД'))
    case = models.ForeignKey(
        Case, on_delete=models.SET_NULL, null=True, related_name='material_evidences', verbose_name=_('Дело')
    )
    group = models.ForeignKey(
        EvidenceGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='material_evidences',
        verbose_name=_('Группа')
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='material_evidences_created', verbose_name=_('Создано пользователем')
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=MaterialEvidenceStatus.choices,
        default=MaterialEvidenceStatus.IN_STORAGE,
    )
    barcode = models.CharField(_('Штрихкод'), max_length=13, unique=True, blank=True, null=True)
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)
    active = models.BooleanField(_('Активно'), default=True)

    def save(self, *args, **kwargs):
        if not self.barcode:
            self.barcode = self.generate_unique_barcode()
        super(MaterialEvidence, self).save(*args, **kwargs)

    def generate_unique_barcode(self):
        while True:
            # Генерируем случайное 12-значное число
            number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
            # Вычисляем контрольную цифру (EAN-13)
            total = 0
            for idx, digit in enumerate(number):
                if idx % 2 == 0:
                    total += int(digit)
                else:
                    total += int(digit) * 3
            checksum = (10 - (total % 10)) % 10
            barcode = number + str(checksum)
            # Проверяем уникальность
            if not MaterialEvidence.objects.filter(barcode=barcode).exists():
                return barcode

    def __str__(self):
        return self.name


class MaterialEvidenceEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Пользователь'))
    material_evidence = models.ForeignKey(
        MaterialEvidence, on_delete=models.CASCADE, related_name='events', verbose_name=_('Вещественное доказательство')
    )
    action = models.CharField(
        _('Действие'),
        max_length=20,
        choices=MaterialEvidenceStatus.choices,
    )
    created = models.DateTimeField(_('Создано'), default=timezone.now)

    def __str__(self):
        return f"{self.action} - {self.user} - {self.created.strftime('%Y-%m-%d %H:%M:%S')}"


class Session(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', verbose_name=_('Пользователь'))
    login = models.DateTimeField(_('Вход'), default=timezone.now)
    logout = models.DateTimeField(_('Выход'), null=True, blank=True)
    active = models.BooleanField(_('Активна'), default=True)

    def __str__(self):
        return f"Сессия пользователя {self.user} от {self.login.strftime('%Y-%m-%d %H:%M:%S')}"


class CameraType(models.TextChoices):
    FACE_ID = 'FACE_ID', _('Аутентификация по лицу')
    REC = 'REC', _('Запись видео')
    DEFAULT = 'DEFAULT', _('Обычная камера')


class Camera(models.Model):
    device_id = models.IntegerField(_('ID устройства'), unique=True)
    name = models.CharField(_('Название камеры'), max_length=255)
    type = models.CharField(
        _('Тип камеры'),
        max_length=20,
        choices=CameraType.choices,
        default=CameraType.DEFAULT,
    )
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)
    active = models.BooleanField(_('Активна'), default=True)

    def __str__(self):
        return self.name


class AuditEntry(models.Model):
    object_id = models.IntegerField(_('ID объекта'))
    table_name = models.CharField(_('Имя таблицы'), max_length=255)
    class_name = models.CharField(_('Имя класса'), max_length=255)
    action = models.CharField(_('Действие'), max_length=10)
    fields = models.TextField(_('Поля'))
    data = models.TextField(_('Данные'))
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Пользователь'))

    def __str__(self):
        return f"Аудит {self.action} на {self.class_name} пользователем {self.user}"
