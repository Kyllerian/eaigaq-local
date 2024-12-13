# Generated by Django 5.1.3 on 2024-12-11 16:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_alter_user_options_alter_session_active_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='camera',
            name='type',
        ),
        migrations.AddField(
            model_name='camera',
            name='department',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='cameras', to='core.department', verbose_name='Отделение'),
        ),
        migrations.AddField(
            model_name='camera',
            name='ip_address',
            field=models.GenericIPAddressField(default='127.0.0.1', protocol='ipv4', verbose_name='IP адрес'),
        ),
        migrations.AddField(
            model_name='camera',
            name='login',
            field=models.CharField(default='admin', max_length=100, verbose_name='Логин'),
        ),
        migrations.AddField(
            model_name='camera',
            name='password',
            field=models.CharField(default='admin', max_length=100, verbose_name='Пароль'),
        ),
        migrations.AddField(
            model_name='camera',
            name='region',
            field=models.CharField(choices=[('AKMOLA', 'Акмолинская область'), ('AKTOBE', 'Актюбинская область'), ('ALMATY_REGION', 'Алматинская область'), ('ATYRAU', 'Атырауская область'), ('EAST_KAZAKHSTAN', 'Восточно-Казахстанская область'), ('ZHAMBYL', 'Жамбылская область'), ('WEST_KAZAKHSTAN', 'Западно-Казахстанская область'), ('KARAGANDA', 'Карагандинская область'), ('KOSTANAY', 'Костанайская область'), ('KYZYLORDA', 'Кызылординская область'), ('MANGYSTAU', 'Мангистауская область'), ('PAVLODAR', 'Павлодарская область'), ('NORTH_KAZAKHSTAN', 'Северо-Казахстанская область'), ('TURKESTAN', 'Туркестанская область'), ('ASTANA', 'город Астана'), ('ALMATY_CITY', 'город Алматы'), ('SHYMKENT', 'город Шымкент')], default='ASTANA', max_length=50, verbose_name='Регион'),
        ),
        migrations.AlterField(
            model_name='camera',
            name='name',
            field=models.CharField(default='camera', max_length=255, verbose_name='Название камеры'),
        ),
    ]