from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.db.models.functions import TruncDate
from .models import Bug
from .serializers import BugSerializer

# Create your views here.

class BugList(APIView):
    def get(self, request):
        bugs = Bug.objects.all()
        serializer = BugSerializer(bugs, many=True)
        return Response(serializer.data)

class BugDetail(APIView):
    def get(self, request, pk):
        try:
            bug = Bug.objects.get(bug_id=pk)
        except Bug.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = BugSerializer(bug)
        return Response(serializer.data)
    
    def put(self, request, pk):
        try:
            bug = Bug.objects.get(bug_id=pk)
        except Bug.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        # If only updating the status, we can handle it separately
        if 'status' in request.data and len(request.data) == 1:
            bug.status = request.data['status']
            # Don't increment modified_count when just changing status
            bug.save()
            serializer = BugSerializer(bug)
            return Response(serializer.data)
        
        # For full updates
        serializer = BugSerializer(bug, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(modified_count=bug.modified_count + 1)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BugModificationList(APIView):
    def get(self, request):
        # For simplicity, using the updated_at field to track modifications
        # In a real application, we might want to create a separate model for tracking modifications
        modifications = Bug.objects.annotate(
            date=TruncDate('updated_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Format the data for the frontend
        result = [
            {'date': item['date'].strftime('%Y-%m-%d'), 'count': item['count']}
            for item in modifications
        ]
        
        return Response(result)
