from django.test import TestCase
from email.message import EmailMessage
from .models import Bug
from .email_processor import process_email

class EmailProcessingTestCase(TestCase):
    """Test the email processing functionality according to requirements."""
    
    def test_email_bug_creation_and_update(self):
        """
        Test that:
        1. A new Bug record is created from an email
        2. An existing Bug record is updated with a new description when a new email is received
        3. The modified_count is incremented for updates
        """
        # Create a mock email message
        initial_email = EmailMessage()
        initial_email['From'] = 'test@example.com'
        initial_email['To'] = 'samsungtest20012001@gmail.com'
        initial_email['Subject'] = 'Bug ID: BUG-1234 - Initial Bug Report'
        initial_email.set_content('This is the initial bug report description')
        
        # Process the initial email
        bug = process_email(initial_email)
        
        # Assert that a new Bug record is created with the correct data
        self.assertIsNotNone(bug)
        self.assertEqual(bug.bug_id, '1234')
        self.assertEqual(bug.subject, 'Bug ID: BUG-1234 - Initial Bug Report')
        self.assertIn('This is the initial bug report description', bug.description)
        self.assertEqual(bug.modified_count, 0)  # Should be 0 for new bugs
        
        # Create a second mock email with the same bug_id but updated description
        update_email = EmailMessage()
        update_email['From'] = 'test@example.com'
        update_email['To'] = 'samsungtest20012001@gmail.com'
        update_email['Subject'] = 'Bug ID: BUG-1234 - Updated Bug Report'
        update_email.set_content('This is an updated description with more details')
        
        # Process the update email
        updated_bug = process_email(update_email)
        
        # Assert that the existing Bug record is updated with the new description
        self.assertIsNotNone(updated_bug)
        self.assertEqual(updated_bug.bug_id, '1234')
        self.assertEqual(updated_bug.subject, 'Bug ID: BUG-1234 - Updated Bug Report')  # Subject should be updated
        
        # The original description should still be there
        self.assertIn('This is the initial bug report description', updated_bug.description)
        
        # The new description should be appended
        self.assertIn('This is an updated description with more details', updated_bug.description)
        
        # The modified_count should be incremented
        self.assertEqual(updated_bug.modified_count, 1)
        
        # Verify that it's the same bug (not a new one)
        self.assertEqual(Bug.objects.count(), 1)
        
        # Make another update to verify modified_count increases again
        third_email = EmailMessage()
        third_email['From'] = 'another@example.com'
        third_email['To'] = 'samsungtest20012001@gmail.com'
        third_email['Subject'] = 'Bug ID: BUG-1234 - Third Update'
        third_email.set_content('This is a third update to the bug report')
        
        # Process the third email
        third_bug = process_email(third_email)
        
        # Assert that modified_count is now 2
        self.assertEqual(third_bug.modified_count, 2)
        
        # Verify description contains all three updates
        self.assertIn('This is the initial bug report description', third_bug.description)
        self.assertIn('This is an updated description with more details', third_bug.description)
        self.assertIn('This is a third update to the bug report', third_bug.description)
        
    def test_priority_extraction(self):
        """
        Test that:
        1. Priority is correctly extracted from email content
        2. Bug is created with the right priority
        3. Bug priority is updated when a new email specifies a different priority
        """
        # Test high priority extraction on creation
        high_priority_email = EmailMessage()
        high_priority_email['From'] = 'test@example.com'
        high_priority_email['To'] = 'samsungtest20012001@gmail.com'
        high_priority_email['Subject'] = 'Bug ID: BUG-5000 - High Priority Bug'
        high_priority_email.set_content('This bug is critical.\n\nPriority: High\n\nPlease fix ASAP.')
        
        # Process the high priority email
        high_bug = process_email(high_priority_email)
        
        # Assert that the bug was created with high priority
        self.assertIsNotNone(high_bug)
        self.assertEqual(high_bug.priority, 'high')
        
        # Test low priority extraction on creation
        low_priority_email = EmailMessage()
        low_priority_email['From'] = 'test@example.com'
        low_priority_email['To'] = 'samsungtest20012001@gmail.com'
        low_priority_email['Subject'] = 'Bug ID: BUG-5001 - Low Priority Bug'
        low_priority_email.set_content('Minor issue.\n\nSeverity: low\n\nCan be fixed later.')
        
        # Process the low priority email
        low_bug = process_email(low_priority_email)
        
        # Assert that the bug was created with low priority
        self.assertIsNotNone(low_bug)
        self.assertEqual(low_bug.priority, 'low')
        
        # Test updating priority in an existing bug
        update_email = EmailMessage()
        update_email['From'] = 'test@example.com'
        update_email['To'] = 'samsungtest20012001@gmail.com'
        update_email['Subject'] = 'Bug ID: BUG-5000 - Bug Priority Update'
        update_email.set_content('This issue is less critical than initially reported.\n\nPriority: Low\n\nCan be scheduled for next release.')
        
        # Process the update email
        updated_bug = process_email(update_email)
        
        # Assert that the priority was updated from high to low
        self.assertIsNotNone(updated_bug)
        self.assertEqual(updated_bug.priority, 'low')
        
        # Verify bug count
        self.assertEqual(Bug.objects.count(), 2)  # We created two distinct bugs
