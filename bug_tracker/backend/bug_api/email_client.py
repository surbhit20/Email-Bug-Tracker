import imaplib
import email
from .email_processor import process_email
import logging

logger = logging.getLogger(__name__)

class EmailClient:
    def __init__(self, email_address, password, server='imap.gmail.com', use_ssl=True):
        self.email_address = email_address
        self.password = password
        self.server = server
        self.use_ssl = use_ssl
        self.mail = None
    
    def connect(self):
        logger.info(f"Connecting to {self.server} as {self.email_address}")
        if self.use_ssl:
            self.mail = imaplib.IMAP4_SSL(self.server)
        else:
            self.mail = imaplib.IMAP4(self.server)
        self.mail.login(self.email_address, self.password)
        logger.info("Connected successfully")
        return True
    
    def disconnect(self):
        if self.mail:
            try:
                self.mail.close()
                self.mail.logout()
                logger.info("Disconnected from mail server")
            except Exception as e:
                logger.error(f"Error disconnecting: {str(e)}")
    
    def process_inbox(self, folder='INBOX', mark_as_read=True, process_all=False):
        if not self.mail:
            logger.error("Not connected to email server")
            raise Exception('Not connected to email server')
        
        logger.info(f"Selecting folder: {folder}")
        self.mail.select(folder)
        
        # Search for emails
        if process_all:
            logger.info("Searching for all emails")
            status, messages = self.mail.search(None, 'ALL')
        else:
            logger.info("Searching for unread emails")
            status, messages = self.mail.search(None, 'UNSEEN')
            
        if status != 'OK':
            logger.error(f"Failed to search for messages: {status}")
            raise Exception('Failed to search for messages')
        
        email_ids = messages[0].split()
        if process_all:
            logger.info(f"Found {len(email_ids)} messages")
        else:
            logger.info(f"Found {len(email_ids)} unread messages")
        
        if not email_ids:
            return []
        
        processed_bugs = []
        
        for email_id in email_ids:
            logger.info(f"Processing email ID: {email_id}")
            status, data = self.mail.fetch(email_id, '(RFC822)')
            if status != 'OK':
                logger.warning(f"Failed to fetch email ID {email_id}")
                continue
            
            raw_email = data[0][1]
            email_message = email.message_from_bytes(raw_email)
            
            # Process the email
            bug = process_email(email_message)
            if bug:
                logger.info(f"Created/updated bug: {bug.bug_id} - {bug.subject}")
                processed_bugs.append(bug)
            else:
                logger.info("Email did not match bug format")
            
            # Mark as read if requested
            if mark_as_read:
                logger.info(f"Marking email {email_id} as read")
                self.mail.store(email_id, '+FLAGS', '\\Seen')
        
        return processed_bugs