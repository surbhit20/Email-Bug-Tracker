import imaplib
import email
import re
from bug_api.email_processor import get_email_content, extract_priority

def check_email():
    # Connect to Gmail
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login('samsungtest20012001@gmail.com', 'qjeoimvpevfczswm')
    mail.select('INBOX')
    
    # Search for emails with Bug ID 778
    print("Searching for emails with Bug ID 778...")
    status, messages = mail.search(None, 'SUBJECT', 'BUG-778')
    email_ids = messages[0].split()
    print(f'Found {len(email_ids)} emails for Bug 778')
    
    if email_ids:
        # Get the latest email
        latest_id = email_ids[-1]
        status, data = mail.fetch(latest_id, '(RFC822)')
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)
        
        # Print email details
        print(f'Latest subject: {msg.get("Subject")}')
        print(f'From: {msg.get("From")}')
        print(f'Date: {msg.get("Date")}')
        
        # Extract content and check for priority
        content = get_email_content(msg)
        print(f'Extracted content: {content[:150]}...')
        
        # Look for priority in content
        priority = extract_priority(content)
        print(f'Extracted priority: {priority}')
        
        # Check using regex directly
        priority_pattern = r'(?:Priority|Severity):\s*(high|medium|low)'
        match = re.search(priority_pattern, content, re.IGNORECASE)
        if match:
            print(f'Regex found priority: {match.group(1).lower()}')
        else:
            print('Regex did not find priority')
    
    # Disconnect
    mail.close()
    mail.logout()
    print("Disconnected from mail server")

if __name__ == "__main__":
    check_email() 