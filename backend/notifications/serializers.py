from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    icon = serializers.CharField(source='get_icon', read_only=True)
    color_class = serializers.CharField(source='get_color_class', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'priority',
            'related_student_id', 'related_instructor_id', 'related_session_id',
            'related_vehicle_id', 'related_payment_id',
            'is_read', 'is_dismissed', 'created_at', 'read_at',
            'icon', 'color_class', 'time_ago'
        ]
        read_only_fields = ['created_at', 'read_at']
    
    def get_time_ago(self, obj):
        """Return human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "À l'instant"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"Il y a {minutes} min"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"Il y a {hours}h"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"Il y a {days}j"
        else:
            return obj.created_at.strftime("%d/%m/%Y")

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'recipient', 'notification_type', 'title', 'message', 'priority',
            'related_student_id', 'related_instructor_id', 'related_session_id',
            'related_vehicle_id', 'related_payment_id'
        ]
