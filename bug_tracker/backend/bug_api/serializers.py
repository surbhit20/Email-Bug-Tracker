from rest_framework import serializers
from .models import Bug

class BugSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bug
        fields = ['bug_id', 'subject', 'description', 'status', 'priority', 'created_at', 'updated_at', 'modified_count']
        read_only_fields = ['created_at', 'updated_at', 'modified_count'] 