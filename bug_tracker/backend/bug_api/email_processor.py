import re
from email.header import decode_header
from .models import Bug
import datetime

def extract_bug_id(subject):
    # Try both formats: [BUG-123] and Bug ID: BUG-123
    patterns = [
        r'\[?BUG-(\d+)\]?',
        r'Bug ID:\s*BUG-(\d+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, subject, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def extract_priority(content):
    # Extract priority from content if specified
    priority_pattern = r'(?:Priority|Severity):\s*(high|medium|low)'
    match = re.search(priority_pattern, content, re.IGNORECASE)
    if match:
        return match.group(1).lower()
    return 'medium'  # Default priority

def get_email_content(message):
    content = ''
    if message.is_multipart():
        for part in message.walk():
            if part.get_content_type() == 'text/plain':
                content += part.get_payload(decode=True).decode()
    else:
        content = message.get_payload(decode=True).decode()
    return content

def process_email(message):
    # Extract subject and sender information
    subject = decode_header(message['subject'])[0][0]
    if isinstance(subject, bytes):
        subject = subject.decode()
    
    from_addr = message.get('From', 'Unknown Sender')
    date = message.get('Date', datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z"))
    
    # Extract bug ID from subject
    bug_id = extract_bug_id(subject)
    if not bug_id:
        return None
    
    # Get email content
    content = get_email_content(message)
    
    # Extract priority from content
    priority = extract_priority(content)
    
    # Format the update with metadata
    update_header = f"\n\n--- Update from {from_addr} on {date} ---\n"
    formatted_update = f"{update_header}{content}"
    
    # Get or create the bug
    bug, created = Bug.objects.get_or_create(
        bug_id=bug_id,
        defaults={
            'subject': subject,
            'description': content,
            'status': 'open',
            'priority': priority
        }
    )
    
    # If bug already exists, append the new content to the existing description
    if not created:
        bug.subject = subject  # Update subject to the latest one
        bug.description += formatted_update  # Append new content to existing description
        
        # Always update the priority based on the current email
        # This ensures the priority reflects the most recent communication
        bug.priority = priority
            
        bug.modified_count += 1
        bug.save()
    
    return bug