from django.core.management.base import BaseCommand
import imaplib
import email
import re
from bug_api.email_processor import get_email_content, extract_priority

class Command(BaseCommand):
    help = 'Check emails for Bug 999 and analyze priority extraction'

    def handle(self, *args, **options):
        self.stdout.write('Checking emails for Bug 999...')
        self.check_email()

    def check_email(self):
        # Connect to Gmail
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login('samsungtest20012001@gmail.com', 'qjeoimvpevfczswm')
        mail.select('INBOX')
        
        # Search for emails with Bug ID 999
        self.stdout.write("Searching for emails with Bug ID 999...")
        status, messages = mail.search(None, 'SUBJECT', 'BUG-999')
        email_ids = messages[0].split()
        self.stdout.write(self.style.SUCCESS(f'Found {len(email_ids)} emails for Bug 999'))
        
        if email_ids:
            # Get the latest email
            latest_id = email_ids[-1]
            status, data = mail.fetch(latest_id, '(RFC822)')
            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)
            
            # Print email details
            self.stdout.write(f'Latest subject: {msg.get("Subject")}')
            self.stdout.write(f'From: {msg.get("From")}')
            self.stdout.write(f'Date: {msg.get("Date")}')
            
            # Extract content and check for priority
            content = get_email_content(msg)
            self.stdout.write(f'Extracted content: {content[:150]}...')
            
            # Look for priority in content
            priority = extract_priority(content)
            self.stdout.write(self.style.SUCCESS(f'Extracted priority: {priority}'))
            
            # Check using regex directly
            priority_pattern = r'(?:Priority|Severity):\s*(high|medium|low)'
            match = re.search(priority_pattern, content, re.IGNORECASE)
            if match:
                self.stdout.write(self.style.SUCCESS(f'Regex found priority: {match.group(1).lower()}'))
            else:
                self.stdout.write(self.style.ERROR('Regex did not find priority'))
        
        # Disconnect
        mail.close()
        mail.logout()
        self.stdout.write('Disconnected from mail server') 