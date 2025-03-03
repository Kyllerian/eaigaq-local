# eaigaq_project/core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import random
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver


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
    evidence_group_count = models.IntegerField(_('Количество групп вещдоков'), default=0)

    def __str__(self):
        return f"{self.name} ({self.get_region_display()})"


class User(AbstractUser):
    phone_number = models.CharField(_('Номер телефона'), max_length=20, blank=True)
    rank = models.CharField(_('Звание'), max_length=50, blank=True)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name=_('Отделение'),
        db_index=True
    )
    region = models.CharField(
        _('Регион'),
        max_length=50,
        choices=Region.choices,
        null=True,
        blank=True,
        db_index=True
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
        db_index=True
    )
    biometric_registered = models.BooleanField(_('Биометрия зарегистрирована'), default=False, db_index=True)
    is_active = models.BooleanField(_('Активен'), default=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['first_name']),
            models.Index(fields=['last_name']),
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['rank']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} - ({self.rank})"

    def save(self, *args, **kwargs):
        biometric_registered = self.biometric_registered

        if self.role == 'REGION_HEAD':
            pass  # регион пусть задаётся вручную
        else:
            if self.department and self.department.region:
                self.region = self.department.region
            else:
                self.region = None

        # восстанавливаем значение
        self.biometric_registered = biometric_registered
        super(User, self).save(*args, **kwargs)


class FaceEncoding(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='face_encodings',
        verbose_name=_('Пользователь')
    )
    encoding = models.BinaryField(_('Кодировка лица'))
    stage = models.CharField(_('Этап регистрации'), max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)

    def __str__(self):
        return f"Кодировка лица для {self.user.username} от {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"


class CaseStatus(models.TextChoices):
    REGISTERED = 'REGISTERED', _('Зарегистрировано')
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', _('На стадии досудебного расследования')
    SUSPENDED = 'SUSPENDED', _('Приостановлено')
    DISMISSED = 'DISMISSED', _('Прекращено')
    REFERRED_TO_COURT = 'REFERRED_TO_COURT', _('Передано в суд')
    RETURNED_BY_PROSECUTOR = 'RETURNED_BY_PROSECUTOR', _('Возвращено прокурором')
    CLOSED = 'CLOSED', _('Закрыто (завершено)')
    COURT_PROCEEDING_COMPLETED = 'COURT_PROCEEDING_COMPLETED', _('Судебное разбирательство завершено')


class Case(models.Model):
    name = models.CharField(_('Название дела'), max_length=255)
    description = models.TextField(_('Описание дела'))
    investigator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='cases', verbose_name=_('Следователь')
    )
    creator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cases_created',
        verbose_name=_('Создатель')
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases',
        verbose_name=_('Отделение')
    )
    status = models.CharField(
        _('Статус'),
        max_length=32,
        choices=CaseStatus.choices,
        default=CaseStatus.REGISTERED,
        db_index=True
    )
    active = models.BooleanField(_('Активно'), default=True, db_index=True)
    created = models.DateTimeField(_('Создано'), default=timezone.now, db_index=True)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['description']),
            models.Index(fields=['status']),
        ]

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
    storage_place = models.CharField(_('Место хранения'), max_length=64, blank=True, null=True)
    case = models.ForeignKey(
        Case, on_delete=models.CASCADE, related_name='evidence_groups', verbose_name=_('Дело')
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='evidence_groups_created',
        verbose_name=_('Создано пользователем')
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
            number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
            total = 0
            for idx, digit in enumerate(number):
                if idx % 2 == 0:
                    total += int(digit)
                else:
                    total += int(digit) * 3
            checksum = (10 - (total % 10)) % 10
            barcode = number + str(checksum)
            if not EvidenceGroup.objects.filter(barcode=barcode).exists():
                return barcode

    def __str__(self):
        return self.name


class MaterialEvidenceType(models.TextChoices):
    FIREARM = 'FIREARM', _('Огнестрельное оружие')
    COLD_WEAPON = 'COLD_WEAPON', _('Холодное оружие')
    DRUGS = 'DRUGS', _('Наркотики')
    OTHER = 'OTHER', _('Другое')


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
        User, on_delete=models.SET_NULL, null=True, related_name='material_evidences_created',
        verbose_name=_('Создано пользователем')
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=MaterialEvidenceStatus.choices,
        default=MaterialEvidenceStatus.IN_STORAGE,
        db_index=True
    )
    barcode = models.CharField(_('Штрихкод'), max_length=13, unique=True, blank=True, null=True)
    created = models.DateTimeField(_('Создано'), default=timezone.now, db_index=True)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)
    active = models.BooleanField(_('Активно'), default=True, db_index=True)

    type = models.CharField(
        _('Тип ВД'),
        max_length=20,
        choices=MaterialEvidenceType.choices,
        default=MaterialEvidenceType.OTHER,
        db_index=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['description']),
        ]

    def save(self, *args, **kwargs):
        if not self.barcode:
            self.barcode = self.generate_unique_barcode()
        super(MaterialEvidence, self).save(*args, **kwargs)

    def generate_unique_barcode(self):
        while True:
            number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
            total = 0
            for idx, digit in enumerate(number):
                if idx % 2 == 0:
                    total += int(digit)
                else:
                    total += int(digit) * 3
            checksum = (10 - (total % 10)) % 10
            barcode = number + str(checksum)
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
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name=_('Пользователь'),
        db_index=True
    )
    login = models.DateTimeField(_('Вход'), default=timezone.now, db_index=True)
    logout = models.DateTimeField(_('Выход'), null=True, blank=True, db_index=True)
    active = models.BooleanField(_('Активна'), default=True, db_index=True)

    # NEW: поле для отслеживания последнего пинга пользователя (если нужно глобальный heartbeat)
    last_ping = models.DateTimeField(_('Последний пинг'), null=True, blank=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['login']),
            models.Index(fields=['logout']),
            models.Index(fields=['active']),
        ]

    def __str__(self):
        return f"Сессия пользователя {self.user} от {self.login.strftime('%Y-%m-%d %H:%M:%S')}"


class Camera(models.Model):
    device_id = models.IntegerField(_('ID устройства'), unique=True)
    name = models.CharField(_('Название камеры'), max_length=255, default='camera')
    ip_address = models.GenericIPAddressField(_('IP адрес'), protocol='ipv4', default='127.0.0.1')
    login = models.CharField(_('Логин'), max_length=100, default='admin')
    password = models.CharField(_('Пароль'), max_length=100, default='admin')
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='cameras',
        verbose_name=_('Отделение'),
        default=1,
    )
    region = models.CharField(
        _('Регион'),
        max_length=50,
        choices=Region.choices,
        default=Region.ASTANA
    )
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    updated = models.DateTimeField(_('Обновлено'), auto_now=True)
    active = models.BooleanField(_('Активна'), default=True)

    mountpoint_id = models.CharField(_('Mountpoint ID'), max_length=255, null=True, blank=True, default=None)
    viewers_count = models.PositiveIntegerField(_('Количество зрителей'), default=0)
    video_port = models.PositiveIntegerField(_('Видео-порт'), null=True, blank=True, default=None)
    ffmpeg_pid = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


# NEW: Сессия просмотра камеры.
class CameraViewingSession(models.Model):
    """
    Сессия просмотра конкретной камеры одним пользователем (через модель Session).
    Пока запись существует, значит пользователь смотрит камеру.
    last_ping обновляется периодически, чтобы знать, что "смотрит"
    """
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='camera_viewing_sessions',
        verbose_name=_('Сессия пользователя')
    )
    camera = models.ForeignKey(
        Camera,
        on_delete=models.CASCADE,
        related_name='viewing_sessions',
        verbose_name=_('Камера')
    )
    last_ping = models.DateTimeField(_('Последний пинг'), default=timezone.now)
    created_at = models.DateTimeField(_('Время создания'), auto_now_add=True)

    class Meta:
        verbose_name = _('Сессия просмотра камеры')
        verbose_name_plural = _('Сессии просмотра камер')

    def __str__(self):
        return f"Просмотр камеры {self.camera.name} (session id={self.session.id})"


class AuditEntry(models.Model):
    object_id = models.IntegerField(_('ID объекта'))
    object_name = models.CharField(_('Название объекта'), max_length=255, blank=True, null=True)
    table_name = models.CharField(_('Имя таблицы'), max_length=255)
    class_name = models.CharField(_('Имя класса'), max_length=255)
    action = models.CharField(_('Действие'), max_length=10)
    fields = models.TextField(_('Поля'))
    data = models.TextField(_('Данные'))
    created = models.DateTimeField(_('Создано'), default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Пользователь'))
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='audit_entries',
        verbose_name=_('Дело')
    )

    def __str__(self):
        return f"Аудит {self.action} на {self.class_name} пользователем {self.user}"


class Document(models.Model):
    file = models.FileField(_('Файл'), upload_to='documents/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(_('Дата загрузки'), auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_documents',
        verbose_name=_('Загружено пользователем')
    )
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True,
        verbose_name=_('Дело')
    )
    material_evidence = models.ForeignKey(
        'MaterialEvidence',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True,
        verbose_name=_('Вещественное доказательство')
    )
    description = models.TextField(_('Описание'), blank=True)

    def __str__(self):
        return f"Документ {self.id} загружен {self.uploaded_by}"

    def save(self, *args, **kwargs):
        if not self.case and not self.material_evidence:
            raise ValueError('Документ должен быть связан либо с делом, либо с вещественным доказательством.')
        super(Document, self).save(*args, **kwargs)

# # eaigaq_project/core/models.py
#
# from django.contrib.auth.models import AbstractUser
# from django.db import models
# from django.utils import timezone
# from django.utils.translation import gettext_lazy as _
# from django.forms.models import model_to_dict
# from django.conf import settings
# import uuid
# import random
# import json
# from django.db.models.signals import pre_save, post_save, post_delete
# from django.dispatch import receiver
#
#
# class Region(models.TextChoices):
#     AKMOLA = 'AKMOLA', _('Акмолинская область')
#     AKTOBE = 'AKTOBE', _('Актюбинская область')
#     ALMATY_REGION = 'ALMATY_REGION', _('Алматинская область')
#     ATYRAU = 'ATYRAU', _('Атырауская область')
#     EAST_KAZAKHSTAN = 'EAST_KAZAKHSTAN', _('Восточно-Казахстанская область')
#     ZHAMBYL = 'ZHAMBYL', _('Жамбылская область')
#     WEST_KAZAKHSTAN = 'WEST_KAZAKHSTAN', _('Западно-Казахстанская область')
#     KARAGANDA = 'KARAGANDA', _('Карагандинская область')
#     KOSTANAY = 'KOSTANAY', _('Костанайская область')
#     KYZYLORDA = 'KYZYLORDA', _('Кызылординская область')
#     MANGYSTAU = 'MANGYSTAU', _('Мангистауская область')
#     PAVLODAR = 'PAVLODAR', _('Павлодарская область')
#     NORTH_KAZAKHSTAN = 'NORTH_KAZAKHSTAN', _('Северо-Казахстанская область')
#     TURKESTAN = 'TURKESTAN', _('Туркестанская область')
#     ASTANA = 'ASTANA', _('город Астана')
#     ALMATY_CITY = 'ALMATY_CITY', _('город Алматы')
#     SHYMKENT = 'SHYMKENT', _('город Шымкент')
#
#
# class Department(models.Model):
#     name = models.CharField(_('Название отделения'), max_length=255)
#     region = models.CharField(
#         _('Регион'),
#         max_length=50,
#         choices=Region.choices,
#         default=Region.ASTANA
#     )
#     evidence_group_count = models.IntegerField(_('Количество групп вещдоков'), default=0)
#
#     def __str__(self):
#         return f"{self.name} ({self.get_region_display()})"
#
# class User(AbstractUser):
#     phone_number = models.CharField(_('Номер телефона'), max_length=20, blank=True)
#     rank = models.CharField(_('Звание'), max_length=50, blank=True)
#     department = models.ForeignKey(
#         Department,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='users',
#         verbose_name=_('Отделение'),
#         db_index=True  # Добавляем индекс на поле department
#     )
#     region = models.CharField(
#         _('Регион'),
#         max_length=50,
#         choices=Region.choices,
#         null=True,
#         blank=True,
#         db_index=True  # Добавляем индекс на поле region
#     )
#     ROLE_CHOICES = [
#         ('REGION_HEAD', _('Главный пользователь региона')),
#         ('DEPARTMENT_HEAD', _('Главный по отделению')),
#         ('USER', _('Обычный пользователь')),
#     ]
#     role = models.CharField(
#         _('Роль'),
#         max_length=20,
#         choices=ROLE_CHOICES,
#         default='USER',
#         db_index=True  # Добавляем индекс на поле role
#     )
#     biometric_registered = models.BooleanField(_('Биометрия зарегистрирована'), default=False, db_index=True)  # Индекс
#     is_active = models.BooleanField(_('Активен'), default=True, db_index=True)  # Индекс
#
#     class Meta:
#         indexes = [
#             models.Index(fields=['username']),
#             models.Index(fields=['first_name']),
#             models.Index(fields=['last_name']),
#             models.Index(fields=['email']),
#             models.Index(fields=['phone_number']),
#             models.Index(fields=['rank']),
#         ]
#
#     def __str__(self):
#         return f"{self.get_full_name()} - ({self.rank})"
#
#     # Автоматическое установление региона при сохранении
#     def save(self, *args, **kwargs):
#         # Сохраняем текущее значение biometric_registered
#         biometric_registered = self.biometric_registered
#
#         if self.role == 'REGION_HEAD':
#             # Для главы региона позволяем установить регион вручную
#             pass  # Не меняем self.region
#         else:
#             # Для остальных устанавливаем регион на основе отделения
#             if self.department and self.department.region:
#                 self.region = self.department.region
#             else:
#                 self.region = None  # Если отделение не указано, регион тоже не установлен
#
#         # Восстанавливаем значение biometric_registered
#         self.biometric_registered = biometric_registered
#
#         super(User, self).save(*args, **kwargs)
#
#
#
# class FaceEncoding(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='face_encodings',
#         verbose_name=_('Пользователь')
#     )
#     encoding = models.BinaryField(_('Кодировка лица'))
#     stage = models.CharField(_('Этап регистрации'), max_length=50, null=True, blank=True)
#     created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
#
#     def __str__(self):
#         return f"Кодировка лица для {self.user.username} от {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
#
# class CaseStatus(models.TextChoices):
#     REGISTERED = 'REGISTERED', _('Зарегистрировано')
#     UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', _('На стадии досудебного расследования')
#     SUSPENDED = 'SUSPENDED', _('Приостановлено')
#     DISMISSED = 'DISMISSED', _('Прекращено')
#     REFERRED_TO_COURT = 'REFERRED_TO_COURT', _('Передано в суд')
#     RETURNED_BY_PROSECUTOR = 'RETURNED_BY_PROSECUTOR', _('Возвращено прокурором')
#     CLOSED = 'CLOSED', _('Закрыто (завершено)')
#     COURT_PROCEEDING_COMPLETED = 'COURT_PROCEEDING_COMPLETED', _('Судебное разбирательство завершено')
#
# class Case(models.Model):
#     name = models.CharField(_('Название дела'), max_length=255)
#     description = models.TextField(_('Описание дела'))
#     investigator = models.ForeignKey(
#         User, on_delete=models.CASCADE, related_name='cases', verbose_name=_('Следователь')
#     )
#     creator = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cases_created',
#         verbose_name=_('Создатель')
#     )
#     department = models.ForeignKey(
#         Department,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='cases',
#         verbose_name=_('Отделение')
#     )
#     status = models.CharField(
#         _('Статус'),
#         max_length=32,
#         choices=CaseStatus.choices,
#         default=CaseStatus.REGISTERED,
#         db_index=True
#     )
#     active = models.BooleanField(_('Активно'), default=True, db_index=True)
#     created = models.DateTimeField(_('Создано'), default=timezone.now, db_index=True)
#     updated = models.DateTimeField(_('Обновлено'), auto_now=True)
#
#     class Meta:
#         indexes = [
#             models.Index(fields=['name']),
#             models.Index(fields=['description']),
#             models.Index(fields=['status']),
#         ]
#
#     def __str__(self):
#         return self.name
#
#
#
#
# class MaterialEvidenceStatus(models.TextChoices):
#     IN_STORAGE = 'IN_STORAGE', _('На хранении')
#     DESTROYED = 'DESTROYED', _('Уничтожен')
#     TAKEN = 'TAKEN', _('Взят')
#     ON_EXAMINATION = 'ON_EXAMINATION', _('На экспертизе')
#     ARCHIVED = 'ARCHIVED', _('В архиве')
#
#
# class EvidenceGroup(models.Model):
#     name = models.CharField(_('Название группы'), max_length=255)
#     storage_place = models.CharField(_('Место хранения'), max_length=64, blank=True, null=True)
#     case = models.ForeignKey(
#         Case, on_delete=models.CASCADE, related_name='evidence_groups', verbose_name=_('Дело')
#     )
#     created_by = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, related_name='evidence_groups_created',
#         verbose_name=_('Создано пользователем')
#     )
#     barcode = models.CharField(_('Штрихкод'), max_length=13, unique=True, blank=True, null=True)
#     created = models.DateTimeField(_('Создано'), default=timezone.now)
#     updated = models.DateTimeField(_('Обновлено'), auto_now=True)
#     active = models.BooleanField(_('Активна'), default=True)
#
#     def save(self, *args, **kwargs):
#         if not self.barcode:
#             self.barcode = self.generate_unique_barcode()
#         super(EvidenceGroup, self).save(*args, **kwargs)
#
#     def generate_unique_barcode(self):
#         while True:
#             # Генерируем случайное 12-значное число
#             number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
#             # Вычисляем контрольную цифру (EAN-13)
#             total = 0
#             for idx, digit in enumerate(number):
#                 if idx % 2 == 0:
#                     total += int(digit)
#                 else:
#                     total += int(digit) * 3
#             checksum = (10 - (total % 10)) % 10
#             barcode = number + str(checksum)
#             # Проверяем уникальность
#             if not EvidenceGroup.objects.filter(barcode=barcode).exists():
#                 return barcode
#
#     def __str__(self):
#         return self.name
#
#
# class MaterialEvidenceType(models.TextChoices):
#     FIREARM = 'FIREARM', _('Огнестрельное оружие')
#     COLD_WEAPON = 'COLD_WEAPON', _('Холодное оружие')
#     DRUGS = 'DRUGS', _('Наркотики')
#     OTHER = 'OTHER', _('Другое')
#
#
# class MaterialEvidence(models.Model):
#     name = models.CharField(_('Название ВД'), max_length=255)
#     description = models.TextField(_('Описание ВД'))
#     case = models.ForeignKey(
#         Case, on_delete=models.SET_NULL, null=True, related_name='material_evidences', verbose_name=_('Дело')
#     )
#     group = models.ForeignKey(
#         EvidenceGroup,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='material_evidences',
#         verbose_name=_('Группа')
#     )
#     created_by = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, related_name='material_evidences_created',
#         verbose_name=_('Создано пользователем')
#     )
#     status = models.CharField(
#         _('Статус'),
#         max_length=20,
#         choices=MaterialEvidenceStatus.choices,
#         default=MaterialEvidenceStatus.IN_STORAGE,
#         db_index=True,  # Добавляем индекс
#     )
#     barcode = models.CharField(_('Штрихкод'), max_length=13, unique=True, blank=True, null=True)
#     created = models.DateTimeField(_('Создано'), default=timezone.now, db_index=True)  # Добавляем индекс
#     updated = models.DateTimeField(_('Обновлено'), auto_now=True)
#     active = models.BooleanField(_('Активно'), default=True, db_index=True)  # Добавляем индекс
#
#     type = models.CharField(
#         _('Тип ВД'),
#         max_length=20,
#         choices=MaterialEvidenceType.choices,
#         default=MaterialEvidenceType.OTHER,
#         db_index=True,  # Добавляем индекс
#     )
#
#     class Meta:
#         indexes = [
#             models.Index(fields=['name']),
#             models.Index(fields=['description']),
#         ]
#
#     def save(self, *args, **kwargs):
#         if not self.barcode:
#             self.barcode = self.generate_unique_barcode()
#         super(MaterialEvidence, self).save(*args, **kwargs)
#
#     def generate_unique_barcode(self):
#         # Здесь можно улучшить генерацию штрихкода для избежания потенциальных коллизий
#         # Например, использовать UUID или другую стратегию
#         while True:
#             number = ''.join([str(random.randint(0, 9)) for _ in range(12)])
#             total = 0
#             for idx, digit in enumerate(number):
#                 if idx % 2 == 0:
#                     total += int(digit)
#                 else:
#                     total += int(digit) * 3
#             checksum = (10 - (total % 10)) % 10
#             barcode = number + str(checksum)
#             if not MaterialEvidence.objects.filter(barcode=barcode).exists():
#                 return barcode
#
#     def __str__(self):
#         return self.name
#
#
# class MaterialEvidenceEvent(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Пользователь'))
#     material_evidence = models.ForeignKey(
#         MaterialEvidence, on_delete=models.CASCADE, related_name='events', verbose_name=_('Вещественное доказательство')
#     )
#     action = models.CharField(
#         _('Действие'),
#         max_length=20,
#         choices=MaterialEvidenceStatus.choices,
#     )
#     created = models.DateTimeField(_('Создано'), default=timezone.now)
#
#     def __str__(self):
#         return f"{self.action} - {self.user} - {self.created.strftime('%Y-%m-%d %H:%M:%S')}"
#
#
# class Session(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', verbose_name=_('Пользователь'), db_index=True)
#     login = models.DateTimeField(_('Вход'), default=timezone.now, db_index=True)
#     logout = models.DateTimeField(_('Выход'), null=True, blank=True, db_index=True)
#     active = models.BooleanField(_('Активна'), default=True, db_index=True)
#
#     class Meta:
#         indexes = [
#             models.Index(fields=['login']),
#             models.Index(fields=['logout']),
#             models.Index(fields=['active']),
#         ]
#
#     def __str__(self):
#         return f"Сессия пользователя {self.user} от {self.login.strftime('%Y-%m-%d %H:%M:%S')}"
#
#
#
# class Camera(models.Model):
#     device_id = models.IntegerField(_('ID устройства'), unique=True)
#     name = models.CharField(_('Название камеры'), max_length=255, default='camera')
#     ip_address = models.GenericIPAddressField(_('IP адрес'), protocol='ipv4', default='127.0.0.1')
#     login = models.CharField(_('Логин'), max_length=100, default='admin')
#     password = models.CharField(_('Пароль'), max_length=100, default='admin')
#     department = models.ForeignKey(
#         Department,
#         on_delete=models.CASCADE,
#         related_name='cameras',
#         verbose_name=_('Отделение'),
#         default=1,
#     )
#     region = models.CharField(
#         _('Регион'),
#         max_length=50,
#         choices=Region.choices,
#         default=Region.ASTANA
#     )
#     created = models.DateTimeField(_('Создано'), default=timezone.now)
#     updated = models.DateTimeField(_('Обновлено'), auto_now=True)
#     active = models.BooleanField(_('Активна'), default=True)
#
#     mountpoint_id = models.CharField(_('Mountpoint ID'), max_length=255, null=True, blank=True, default=None)
#     viewers_count = models.PositiveIntegerField(_('Количество зрителей'), default=0)
#     video_port = models.PositiveIntegerField(_('Видео-порт'), null=True, blank=True, default=None)
#     ffmpeg_pid = models.IntegerField(null=True, blank=True)  # PID процесса ffmpeg
#
#     def __str__(self):
#         return self.name
#
#
#
#
#
#
#
# class AuditEntry(models.Model):
#     object_id = models.IntegerField(_('ID объекта'))
#     object_name = models.CharField(_('Название объекта'), max_length=255, blank=True, null=True)
#     table_name = models.CharField(_('Имя таблицы'), max_length=255)
#     class_name = models.CharField(_('Имя класса'), max_length=255)
#     action = models.CharField(_('Действие'), max_length=10)
#     fields = models.TextField(_('Поля'))
#     data = models.TextField(_('Данные'))
#     created = models.DateTimeField(_('Создано'), default=timezone.now)
#     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Пользователь'))
#     case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True, related_name='audit_entries',
#                              verbose_name=_('Дело'))
#
#     def __str__(self):
#         return f"Аудит {self.action} на {self.class_name} пользователем {self.user}"
#
#
# # Добавляем новую модель для документов
# class Document(models.Model):
#     file = models.FileField(_('Файл'), upload_to='documents/%Y/%m/%d/')
#     uploaded_at = models.DateTimeField(_('Дата загрузки'), auto_now_add=True)
#     uploaded_by = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='uploaded_documents',
#         verbose_name=_('Загружено пользователем')
#     )
#     case = models.ForeignKey(
#         Case,
#         on_delete=models.CASCADE,
#         related_name='documents',
#         null=True,
#         blank=True,
#         verbose_name=_('Дело')
#     )
#     material_evidence = models.ForeignKey(
#         MaterialEvidence,
#         on_delete=models.CASCADE,
#         related_name='documents',
#         null=True,
#         blank=True,
#         verbose_name=_('Вещественное доказательство')
#     )
#     description = models.TextField(_('Описание'), blank=True)
#
#     def __str__(self):
#         return f"Документ {self.id} загружен {self.uploaded_by}"
#
#     def save(self, *args, **kwargs):
#         if not self.case and not self.material_evidence:
#             raise ValueError('Документ должен быть связан либо с делом, либо с вещественным доказательством.')
#         super(Document, self).save(*args, **kwargs)
