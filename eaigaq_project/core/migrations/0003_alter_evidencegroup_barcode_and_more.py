# Generated by Django 5.1.2 on 2024-10-12 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_evidencegroup_barcode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='evidencegroup',
            name='barcode',
            field=models.CharField(blank=True, max_length=13, null=True, unique=True, verbose_name='Штрихкод'),
        ),
        migrations.AlterField(
            model_name='materialevidence',
            name='barcode',
            field=models.CharField(blank=True, max_length=13, null=True, unique=True, verbose_name='Штрихкод'),
        ),
    ]
