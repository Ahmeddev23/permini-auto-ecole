from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer
# from accounts.models import DrivingSchool, Instructor, Student  # Not needed for now

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(
            recipient=user,
            is_dismissed=False
        ).order_by('-created_at')
        
        # Filter by read status if specified
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Limit to recent notifications (last 30 days)
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        queryset = queryset.filter(created_at__gte=thirty_days_ago)
        
        return queryset[:50]  # Limit to 50 most recent

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    """Get count of unread notifications for current user"""
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False,
        is_dismissed=False
    ).count()
    
    return Response({'count': count})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.mark_as_read()
        return Response({'success': True})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for current user"""
    Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dismiss_notification(request, notification_id):
    """Dismiss a specific notification"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.is_dismissed = True
        notification.save()
        return Response({'success': True})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# Import the utility function
from .utils import create_notification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_test_notification(request):
    """Create a test notification for the current user"""
    user = request.user

    # Sample notifications based on user type
    if user.user_type == 'driving_school':
        notifications_data = [
            {
                'type': 'new_student',
                'title': 'Nouveau candidat inscrit',
                'message': 'Jean Dupont s\'est inscrit à votre auto-école.',
                'priority': 'medium'
            },
            {
                'type': 'payment_received',
                'title': 'Paiement reçu',
                'message': 'Paiement de 350€ reçu de Marie Martin.',
                'priority': 'low'
            },
            {
                'type': 'vehicle_issue',
                'title': 'Problème véhicule',
                'message': 'Problème signalé sur le véhicule Renault Clio.',
                'priority': 'urgent'
            }
        ]
    elif user.user_type == 'instructor':
        notifications_data = [
            {
                'type': 'session_assigned',
                'title': 'Nouvelle séance assignée',
                'message': 'Une nouvelle séance avec Pierre Durand vous a été assignée.',
                'priority': 'medium'
            },
            {
                'type': 'schedule_change',
                'title': 'Changement d\'horaire',
                'message': 'Votre séance de 14h a été déplacée à 15h.',
                'priority': 'high'
            }
        ]
    else:  # student
        notifications_data = [
            {
                'type': 'lesson_confirmed',
                'title': 'Leçon confirmée',
                'message': 'Votre leçon du 15/07/2025 à 14h est confirmée.',
                'priority': 'medium'
            },
            {
                'type': 'payment_reminder',
                'title': 'Rappel de paiement',
                'message': 'Votre paiement de 200€ est dû le 20/07/2025.',
                'priority': 'high'
            },
            {
                'type': 'exam_result',
                'title': 'Résultat d\'examen',
                'message': 'Félicitations ! Vous avez réussi votre examen théorique.',
                'priority': 'high'
            }
        ]

    # Create a random notification
    import random
    notif_data = random.choice(notifications_data)

    notification = create_notification(
        recipient=user,
        notification_type=notif_data['type'],
        title=notif_data['title'],
        message=notif_data['message'],
        priority=notif_data['priority']
    )

    return Response({
        'success': True,
        'notification': {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.notification_type,
            'priority': notification.priority
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_session_notification(request):
    """Test de création de notification de séance"""
    user = request.user

    # Créer une notification de test pour une séance
    notification = create_notification(
        recipient=user,
        notification_type='session_assigned',
        title='Test - Nouvelle séance assignée',
        message='Ceci est un test de notification de séance.',
        priority='medium',
        related_session_id=999
    )

    print(f"📨 Notification de test créée pour {user.username}: {notification.title}")

    return Response({
        'success': True,
        'message': 'Notification de test créée',
        'notification_id': notification.id
    })
