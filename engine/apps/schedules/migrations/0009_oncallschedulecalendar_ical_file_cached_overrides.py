# Generated by Django 3.2.16 on 2023-01-25 20:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedules', '0008_auto_20221201_0809'),
    ]

    operations = [
        migrations.AddField(
            model_name='oncallschedulecalendar',
            name='ical_file_cached_overrides',
            field=models.TextField(default=None, null=True),
        ),
    ]
