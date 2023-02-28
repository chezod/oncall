# Generated by Django 3.2.15 on 2022-10-10 12:06

from django.db import migrations, models
import django.db.models.deletion
import uuid
import django_migration_linter as linter


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user_management', '0003_user_hide_phone_number'),
        ('alerts', '0007_populate_web_title_cache'),
        ('base', '0003_delete_organizationlogrecord'),
    ]

    operations = [
        linter.IgnoreMigration(),
        migrations.CreateModel(
            name='EmailMessage',
            fields=[
                ('message_uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('exceeded_limit', models.BooleanField(default=None, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('notification_policy', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.usernotificationpolicy')),
                ('receiver', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.PROTECT, to='user_management.user')),
                ('represents_alert', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='alerts.alert')),
                ('represents_alert_group', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='alerts.alertgroup')),
            ],
        ),
    ]
