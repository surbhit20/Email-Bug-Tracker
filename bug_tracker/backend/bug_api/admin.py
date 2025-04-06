from django.contrib import admin
from .models import Bug

@admin.register(Bug)
class BugAdmin(admin.ModelAdmin):
    list_display = ('bug_id', 'subject', 'status', 'priority', 'created_at', 'updated_at', 'modified_count')
    list_filter = ('status', 'priority')
    search_fields = ('bug_id', 'subject', 'description')
