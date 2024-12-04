# Generated by Django 5.1.2 on 2024-11-24 22:44

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_initialize_evidence_group_count'),
    ]

    operations = [
        migrations.AlterField(
            model_name='materialevidence',
            name='active',
            field=models.BooleanField(db_index=True, default=True, verbose_name='Активно'),
        ),
        migrations.AlterField(
            model_name='materialevidence',
            name='created',
            field=models.DateTimeField(db_index=True, default=django.utils.timezone.now, verbose_name='Создано'),
        ),
        migrations.AlterField(
            model_name='materialevidence',
            name='status',
            field=models.CharField(choices=[('IN_STORAGE', 'На хранении'), ('DESTROYED', 'Уничтожен'), ('TAKEN', 'Взят'), ('ON_EXAMINATION', 'На экспертизе'), ('ARCHIVED', 'В архиве')], db_index=True, default='IN_STORAGE', max_length=20, verbose_name='Статус'),
        ),
        migrations.AlterField(
            model_name='materialevidence',
            name='type',
            field=models.CharField(choices=[('FIREARM', 'Огнестрельное оружие'), ('COLD_WEAPON', 'Холодное оружие'), ('DRUGS', 'Наркотики'), ('OTHER', 'Другое')], db_index=True, default='OTHER', max_length=20, verbose_name='Тип ВД'),
        ),
        migrations.AddIndex(
            model_name='materialevidence',
            index=models.Index(fields=['name'], name='core_materi_name_91cfa0_idx'),
        ),
        migrations.AddIndex(
            model_name='materialevidence',
            index=models.Index(fields=['description'], name='core_materi_descrip_050cd2_idx'),
        ),
    ]
