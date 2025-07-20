from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def create_notification(recipient, notification_type, title, message, priority='medium', **kwargs):
    """
    Create a new notification

    Args:
        recipient: User object
        notification_type: Type of notification (from NOTIFICATION_TYPES)
        title: Notification title
        message: Notification message
        priority: Priority level (low, medium, high, urgent)
        **kwargs: Additional fields (related_student_id, etc.)
    """
    from .models import Notification

    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        **kwargs
    )

    # Send real-time notification via WebSocket
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"user_{recipient.id}",
            {
                'type': 'notification_created',
                'notification': {
                    'id': notification.id,
                    'type': notification.notification_type,
                    'title': notification.title,
                    'message': notification.message,
                    'priority': notification.priority,
                    'icon': notification.get_icon(),
                    'created_at': notification.created_at.isoformat(),
                }
            }
        )

    return notification

def notify_new_student_registration(driving_school_user, student_user):
    """Notify driving school when a new student registers"""
    create_notification(
        recipient=driving_school_user,
        notification_type='new_student',
        title='Nouveau candidat inscrit',
        message=f'{student_user.first_name} {student_user.last_name} s\'est inscrit à votre auto-école.',
        priority='medium',
        related_student_id=student_user.id
    )

def notify_session_assigned(instructor_user, session_id, student_name):
    """Notify instructor when a new session is assigned"""
    create_notification(
        recipient=instructor_user,
        notification_type='session_assigned',
        title='Nouvelle séance assignée',
        message=f'Une nouvelle séance avec {student_name} vous a été assignée.',
        priority='medium',
        related_session_id=session_id
    )

def notify_schedule_change(user, session_id, change_details):
    """Notify user about schedule changes"""
    create_notification(
        recipient=user,
        notification_type='schedule_change',
        title='Changement d\'horaire',
        message=f'Votre séance a été modifiée: {change_details}',
        priority='high',
        related_session_id=session_id
    )

def notify_lesson_confirmed(student_user, session_id, lesson_details):
    """Notify student when lesson is confirmed"""
    create_notification(
        recipient=student_user,
        notification_type='lesson_confirmed',
        title='Leçon confirmée',
        message=f'Votre leçon du {lesson_details} est confirmée.',
        priority='medium',
        related_session_id=session_id
    )

def notify_payment_received(driving_school_user, amount, student_name):
    """Notify driving school when payment is received"""
    create_notification(
        recipient=driving_school_user,
        notification_type='payment_received',
        title='Paiement reçu',
        message=f'Paiement de {amount}€ reçu de {student_name}.',
        priority='low'
    )

def notify_payment_reminder(student_user, amount, due_date):
    """Notify student about payment reminder"""
    create_notification(
        recipient=student_user,
        notification_type='payment_reminder',
        title='Rappel de paiement',
        message=f'Votre paiement de {amount}€ est dû le {due_date}.',
        priority='high'
    )

def notify_exam_result(student_user, exam_type, result):
    """Notify student about exam results"""
    status = 'réussi' if result == 'passed' else 'échoué'
    create_notification(
        recipient=student_user,
        notification_type='exam_result',
        title='Résultat d\'examen',
        message=f'Votre examen {exam_type} a été {status}.',
        priority='high'
    )

def notify_vehicle_issue(driving_school_user, vehicle_id, issue_description):
    """Notify driving school about vehicle issues"""
    create_notification(
        recipient=driving_school_user,
        notification_type='vehicle_issue',
        title='Problème véhicule',
        message=f'Problème signalé: {issue_description}',
        priority='urgent',
        related_vehicle_id=vehicle_id
    )

def notify_instructor_update(driving_school_user, instructor_name, update_type):
    """Notify driving school about instructor updates"""
    create_notification(
        recipient=driving_school_user,
        notification_type='instructor_update',
        title='Mise à jour moniteur',
        message=f'Mise à jour concernant {instructor_name}: {update_type}',
        priority='medium'
    )

def notify_student_progress(instructor_user, student_name, progress_details):
    """Notify instructor about student progress"""
    create_notification(
        recipient=instructor_user,
        notification_type='student_progress',
        title='Progrès étudiant',
        message=f'Progrès de {student_name}: {progress_details}',
        priority='low'
    )
