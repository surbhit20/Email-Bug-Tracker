from celery import shared_task
from django.core.management import call_command
import os
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_emails_task():
    """
    Celery task to process emails for bug reports.
    This task will be run periodically to check for new bug reports in the email inbox.
    """
    try:
        logger.info("Starting email processing task")
        
        # Get credentials from environment variables
        email = os.getenv('EMAIL_USER') or os.getenv('EMAIL_ADDRESS')
        password = os.getenv('EMAIL_PASSWORD')
        server = os.getenv('EMAIL_HOST') or os.getenv('EMAIL_SERVER', 'imap.gmail.com')
        
        if not email or not password:
            logger.error("Email credentials not found in environment variables")
            return "Error: Email credentials not found"
            
        logger.info(f"Processing emails for {email} on server {server}")
        
        call_command(
            'process_emails',
            email=email,
            password=password,
            server=server,
            process_all=False  # Only process unread emails
        )
        
        logger.info("Email processing completed successfully")
        return "Successfully processed emails"
    except Exception as e:
        logger.error(f"Error processing emails: {str(e)}")
        return f"Error processing emails: {str(e)}" 