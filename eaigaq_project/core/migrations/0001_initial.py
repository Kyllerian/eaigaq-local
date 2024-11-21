# eaigaq_project/core/migrations/0001_initial.py

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Camera',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device_id', models.IntegerField(unique=True, verbose_name='ID устройства')),
                ('name', models.CharField(max_length=255, verbose_name='Название камеры')),
                ('type', models.CharField(choices=[('FACE_ID', 'Аутентификация по лицу'), ('REC', 'Запись видео'), ('DEFAULT', 'Обычная камера')], default='DEFAULT', max_length=20, verbose_name='Тип камеры')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Создано')),
                ('updated', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('active', models.BooleanField(default=True, verbose_name='Активна')),
            ],
        ),
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название отделения')),
                ('region', models.CharField(choices=[('AKMOLA', 'Акмолинская область'), ('AKTOBE', 'Актюбинская область'), ('ALMATY_REGION', 'Алматинская область'), ('ATYRAU', 'Атырауская область'), ('EAST_KAZAKHSTAN', 'Восточно-Казахстанская область'), ('ZHAMBYL', 'Жамбылская область'), ('WEST_KAZAKHSTAN', 'Западно-Казахстанская область'), ('KARAGANDA', 'Карагандинская область'), ('KOSTANAY', 'Костанайская область'), ('KYZYLORDA', 'Кызылординская область'), ('MANGYSTAU', 'Мангистауская область'), ('PAVLODAR', 'Павлодарская область'), ('NORTH_KAZAKHSTAN', 'Северо-Казахстанская область'), ('TURKESTAN', 'Туркестанская область'), ('ASTANA', 'город Астана'), ('ALMATY_CITY', 'город Алматы'), ('SHYMKENT', 'город Шымкент')], default='ASTANA', max_length=50, verbose_name='Регион')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('phone_number', models.CharField(blank=True, max_length=20, verbose_name='Номер телефона')),
                ('rank', models.CharField(blank=True, max_length=50, verbose_name='Звание')),
                ('region', models.CharField(blank=True, choices=[('AKMOLA', 'Акмолинская область'), ('AKTOBE', 'Актюбинская область'), ('ALMATY_REGION', 'Алматинская область'), ('ATYRAU', 'Атырауская область'), ('EAST_KAZAKHSTAN', 'Восточно-Казахстанская область'), ('ZHAMBYL', 'Жамбылская область'), ('WEST_KAZAKHSTAN', 'Западно-Казахстанская область'), ('KARAGANDA', 'Карагандинская область'), ('KOSTANAY', 'Костанайская область'), ('KYZYLORDA', 'Кызылординская область'), ('MANGYSTAU', 'Мангистауская область'), ('PAVLODAR', 'Павлодарская область'), ('NORTH_KAZAKHSTAN', 'Северо-Казахстанская область'), ('TURKESTAN', 'Туркестанская область'), ('ASTANA', 'город Астана'), ('ALMATY_CITY', 'город Алматы'), ('SHYMKENT', 'город Шымкент')], max_length=50, null=True, verbose_name='Регион')),
                ('role', models.CharField(choices=[('REGION_HEAD', 'Главный пользователь региона'), ('DEPARTMENT_HEAD', 'Главный по отделению'), ('USER', 'Обычный пользователь')], default='USER', max_length=20, verbose_name='Роль')),
                ('biometric_registered', models.BooleanField(default=False, verbose_name='Биометрия зарегистрирована')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='core.department', verbose_name='Отделение')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Case',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название дела')),
                ('description', models.TextField(verbose_name='Описание дела')),
                ('active', models.BooleanField(default=True, verbose_name='Активно')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Создано')),
                ('updated', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cases_created', to=settings.AUTH_USER_MODEL, verbose_name='Создатель')),
                ('investigator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cases', to=settings.AUTH_USER_MODEL, verbose_name='Следователь')),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cases', to='core.department', verbose_name='Отделение')),
            ],
        ),
        migrations.CreateModel(
            name='AuditEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('object_id', models.IntegerField(verbose_name='ID объекта')),
                ('object_name', models.CharField(blank=True, max_length=255, null=True, verbose_name='Название объекта')),
                ('table_name', models.CharField(max_length=255, verbose_name='Имя таблицы')),
                ('class_name', models.CharField(max_length=255, verbose_name='Имя класса')),
                ('action', models.CharField(max_length=10, verbose_name='Действие')),
                ('fields', models.TextField(verbose_name='Поля')),
                ('data', models.TextField(verbose_name='Данные')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Создано')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
                ('case', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='audit_entries', to='core.case', verbose_name='Дело')),
            ],
        ),
        migrations.CreateModel(
            name='EvidenceGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название группы')),
                ('barcode', models.CharField(blank=True, max_length=13, null=True, unique=True, verbose_name='Штрихкод')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Создано')),
                ('updated', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('active', models.BooleanField(default=True, verbose_name='Активна')),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evidence_groups', to='core.case', verbose_name='Дело')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='evidence_groups_created', to=settings.AUTH_USER_MODEL, verbose_name='Создано пользователем')),
            ],
        ),
        migrations.CreateModel(
            name='FaceEncoding',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('encoding', models.BinaryField(verbose_name='Кодировка лица')),
                ('stage', models.CharField(blank=True, max_length=50, null=True, verbose_name='Этап регистрации')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='face_encodings', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
        ),
        migrations.CreateModel(
            name='MaterialEvidence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Название ВД')),
                ('description', models.TextField(verbose_name='Описание ВД')),
                ('status', models.CharField(choices=[('IN_STORAGE', 'На хранении'), ('DESTROYED', 'Уничтожен'), ('TAKEN', 'Взят'), ('ON_EXAMINATION', 'На экспертизе'), ('ARCHIVED', 'В архиве')], default='IN_STORAGE', max_length=20, verbose_name='Статус')),
                ('barcode', models.CharField(blank=True, max_length=13, null=True, unique=True, verbose_name='Штрихкод')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Создано')),
                ('updated', models.DateTimeField(auto_now=True, verbose_name='Обновлено')),
                ('active', models.BooleanField(default=True, verbose_name='Активно')),
                ('type', models.CharField(choices=[('FIREARM', 'Огнестрельное оружие'), ('COLD_WEAPON', 'Холодное оружие'), ('DRUGS', 'Наркотики'), ('OTHER', 'Другое')], default='OTHER', max_length=20, verbose_name='Тип ВД')),
                ('case', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='material_evidences', to='core.case', verbose_name='Дело')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='material_evidences_created', to=settings.AUTH_USER_MODEL, verbose_name='Создано пользователем')),
                ('group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='material_evidences', to='core.evidencegroup', verbose_name='Группа')),
            ],
        ),
        migrations.CreateModel(
            name='MaterialEvidenceEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('IN_STORAGE', 'На хранении'), ('DESTROYED', 'Уничтожен'), ('TAKEN', 'Взят'), ('ON_EXAMINATION', 'На экспертизе'), ('ARCHIVED', 'В архиве')], max_length=20, verbose_name='Действие')),
                ('created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Создано')),
                ('material_evidence', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='core.materialevidence', verbose_name='Вещественное доказательство')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('login', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Вход')),
                ('logout', models.DateTimeField(blank=True, null=True, verbose_name='Выход')),
                ('active', models.BooleanField(default=True, verbose_name='Активна')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
        ),
    ]
