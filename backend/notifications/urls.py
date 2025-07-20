from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # List notifications
    path('', views.NotificationListView.as_view(), name='notification_list'),
    
    # Unread count
    path('unread-count/', views.unread_notifications_count, name='unread_count'),
    
    # Mark as read
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark_read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark_all_read'),
    
    # Dismiss
    path('<int:notification_id>/dismiss/', views.dismiss_notification, name='dismiss'),

    # Test endpoints
    path('test/', views.create_test_notification, name='create_test'),
    path('test-session/', views.test_session_notification, name='test_session'),
]
