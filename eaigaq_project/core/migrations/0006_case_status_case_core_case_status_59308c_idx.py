# Generated by Django 5.1.3 on 2024-11-29 21:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_alter_case_active_alter_case_created_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='case',
            name='status',
            field=models.CharField(choices=[('REGISTERED', 'Зарегистрировано'), ('UNDER_INVESTIGATION', 'На стадии досудебного расследования'), ('SUSPENDED', 'Приостановлено'), ('DISMISSED', 'Прекращено'), ('REFERRED_TO_COURT', 'Передано в суд'), ('RETURNED_BY_PROSECUTOR', 'Возвращено прокурором'), ('CLOSED', 'Закрыто (завершено)'), ('COURT_PROCEEDING_COMPLETED', 'Судебное разбирательство завершено')], db_index=True, default='REGISTERED', max_length=32, verbose_name='Статус'),
        ),
        migrations.AddIndex(
            model_name='case',
            index=models.Index(fields=['status'], name='core_case_status_59308c_idx'),
        ),
    ]
