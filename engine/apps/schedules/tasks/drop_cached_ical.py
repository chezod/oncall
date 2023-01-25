from celery.utils.log import get_task_logger
from django.apps import apps

from common.custom_celery_tasks import shared_dedicated_queue_retry_task

task_logger = get_task_logger(__name__)


@shared_dedicated_queue_retry_task(autoretry_for=(Exception,), retry_backoff=True, max_retries=1)
def drop_cached_ical_task(schedule_pk, source=None):
    OnCallSchedule = apps.get_model("schedules", "OnCallSchedule")

    task_logger.info(f"Start drop_cached_ical_task for schedule {schedule_pk}")
    try:
        schedule = OnCallSchedule.objects.get(pk=schedule_pk)
        schedule.drop_cached_ical(source=source)
    except OnCallSchedule.DoesNotExist:
        task_logger.info(f"Tried to drop_cached_ical_task for non-existing schedule {schedule_pk}")
    task_logger.info(f"Finish drop_cached_ical_task for schedule {schedule_pk}")


@shared_dedicated_queue_retry_task(autoretry_for=(Exception,), retry_backoff=True, max_retries=1)
def drop_cached_ical_for_custom_events_for_organization(organization_id):
    OnCallScheduleCalendar = apps.get_model("schedules", "OnCallScheduleCalendar")

    for schedule in OnCallScheduleCalendar.objects.filter(organization_id=organization_id):
        drop_cached_ical_task.apply_async(
            (schedule.pk,),
        )
    task_logger.info(f"drop cached ica for org_id {organization_id}")
