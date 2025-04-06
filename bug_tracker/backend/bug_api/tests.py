from django.test import TestCase
from .models import Bug
from .email_processor import process_email

# Create your tests here.

class EmailProcessingTest(TestCase):
    def test_new_bug_creation(self):
        # Test creating a new bug from email
        test_email = """
From: user@example.com
To: bugs@bugtracker.com
Subject: Bug ID: BUG-5678 - New Feature Not Working
Content-Type: text/plain

The new search feature is not working properly. When users enter a search term, the results are not filtered correctly.
"""
        
        # Process the test email
        bug = process_email(test_email)
        
        # Assertions
        self.assertIsNotNone(bug)
        self.assertEqual(bug.bug_id, "BUG-5678")
        self.assertEqual(bug.subject, "New Feature Not Working")
        self.assertEqual(bug.modified_count, 0)
    
    def test_existing_bug_update(self):
        # Create a bug first
        bug = Bug.objects.create(
            bug_id="BUG-9012",
            subject="Initial Bug",
            description="Initial description"
        )
        
        # Now update it with an email
        update_email = """
From: user@example.com
To: bugs@bugtracker.com
Subject: Bug ID: BUG-9012 - Updated Issue
Content-Type: text/plain

This is an updated description of the issue. The bug is more severe than initially reported.
"""
        
        # Process the update email
        updated_bug = process_email(update_email)
        
        # Assertions
        self.assertIsNotNone(updated_bug)
        self.assertEqual(updated_bug.bug_id, "BUG-9012")
        # Subject doesn't get updated, only the description
        self.assertEqual(updated_bug.subject, "Initial Bug")  
        self.assertEqual(updated_bug.description, "This is an updated description of the issue. The bug is more severe than initially reported.")
        self.assertEqual(updated_bug.modified_count, 1)
