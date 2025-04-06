import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bug_tracker.settings')

# Create the Celery app
app = Celery('bug_tracker')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'process-emails-every-5-seconds': {
        'task': 'bug_api.tasks.process_emails_task',
        'schedule': 5.0,  # Run every 5 seconds
    },
} 