# Generated by Django 5.1.2 on 2024-11-25 14:38

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_materialevidence_active_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='case',
            name='active',
            field=models.BooleanField(db_index=True, default=True, verbose_name='Активно'),
        ),
        migrations.AlterField(
            model_name='case',
            name='created',
            field=models.DateTimeField(db_index=True, default=django.utils.timezone.now, verbose_name='Создано'),
        ),
        migrations.AddIndex(
            model_name='case',
            index=models.Index(fields=['name'], name='core_case_name_810197_idx'),
        ),
        migrations.AddIndex(
            model_name='case',
            index=models.Index(fields=['description'], name='core_case_descrip_eca8fb_idx'),
        ),
    ]