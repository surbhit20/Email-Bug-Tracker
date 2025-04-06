from django.urls import path
from . import views

urlpatterns = [
    path('bugs/', views.BugList.as_view(), name='bug-list'),
    path('bugs/<int:pk>/', views.BugDetail.as_view(), name='bug-detail'),
    path('bug_modifications/', views.BugModificationList.as_view(), name='bug-modifications'),
] 