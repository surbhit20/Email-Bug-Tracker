from django.core.management.base import BaseCommand
from django.conf import settings
from ...email_client import EmailClient
import os

class Command(BaseCommand):
    help = 'Process unread emails from the configured email account'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to connect to',
            default=os.getenv('EMAIL_ADDRESS')
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Email password or app password',
            default=os.getenv('EMAIL_PASSWORD')
        )
        parser.add_argument(
            '--server',
            type=str,
            help='IMAP server address',
            default=os.getenv('EMAIL_SERVER', 'imap.gmail.com')
        )
        parser.add_argument(
            '--no-ssl',
            action='store_true',
            help='Disable SSL connection',
            default=False
        )
        parser.add_argument(
            '--folder',
            type=str,
            help='Email folder to process',
            default='INBOX'
        )
        parser.add_argument(
            '--process-all',
            action='store_true',
            help='Process all emails, not just unread ones',
            default=False
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        server = options['server']
        use_ssl = not options['no_ssl']
        folder = options['folder']
        process_all = options['process_all']

        if not email or not password:
            self.stderr.write(
                self.style.ERROR('Email address and password must be provided either through '
                               'command line arguments or environment variables')
            )
            return

        try:
            # Initialize email client
            client = EmailClient(email, password, server, use_ssl)
            
            # Connect to email server
            self.stdout.write('Connecting to email server...')
            client.connect()
            
            # Process emails
            self.stdout.write(f'Processing emails in {folder}...')
            processed_bugs = client.process_inbox(folder, process_all=process_all)
            
            # Disconnect
            client.disconnect()
            
            # Report results
            if processed_bugs:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully processed {len(processed_bugs)} emails')
                )
            else:
                self.stdout.write('No new emails to process')
                
        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f'Error processing emails: {str(e)}')
            ) 