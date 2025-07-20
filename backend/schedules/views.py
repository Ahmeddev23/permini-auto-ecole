from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.http import Http404
from django.core.exceptions import ValidationError

from .models import Schedule
from .serializers import (
    ScheduleSerializer, ScheduleCreateSerializer, ScheduleUpdateSerializer,
    ScheduleListSerializer, CalendarEventSerializer, AvailabilitySerializer
)
# from notifications.utils import notify_session_assigned, notify_lesson_confirmed  # Déplacé vers serializer


def recalculate_student_hours(student):
    """Recalcule les heures d'un candidat basé sur ses séances terminées"""
    # Calculer les heures de code terminées
    theory_schedules = Schedule.objects.filter(
        student=student,
        session_type='theory',
        status='completed'
    )

    theory_hours = 0
    for schedule in theory_schedules:
        duration_hours = round(schedule.duration_minutes / 60 * 2) / 2
        theory_hours += duration_hours

    # Calculer les heures de conduite terminées
    practical_schedules = Schedule.objects.filter(
        student=student,
        session_type='practical',
        status='completed'
    )

    practical_hours = 0
    for schedule in practical_schedules:
        duration_hours = round(schedule.duration_minutes / 60 * 2) / 2
        practical_hours += duration_hours

    # Mettre à jour le candidat
    student.theory_hours_completed = theory_hours
    student.practical_hours_completed = practical_hours
    student.save()

    return theory_hours, practical_hours


class ScheduleListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les emplois du temps"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ScheduleCreateSerializer
        return ScheduleListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Schedule.objects.none()

        if hasattr(user, 'driving_school'):
            queryset = user.driving_school.schedules.all()
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            queryset = user.student_profile.schedules.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Les moniteurs peuvent voir toutes les séances de leur auto-école
            queryset = user.instructor_profile.driving_school.schedules.all()

        # Filtres par paramètres GET
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        status_filter = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student')
        instructor_id = self.request.query_params.get('instructor')

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if instructor_id:
            queryset = queryset.filter(instructor_id=instructor_id)

        return queryset.order_by('date', 'start_time')

    def perform_create(self, serializer):
        """Personnaliser la création pour gérer l'auto-école comme moniteur"""
        print(f"🔔 perform_create appelée par {self.request.user.username}")
        user = self.request.user

        # Déterminer l'auto-école selon le type d'utilisateur
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            driving_school = user.instructor_profile.driving_school

        if not driving_school:
            raise ValidationError(_("Auto-école non trouvée"))

        # Récupérer l'ID du moniteur depuis les données
        instructor_id = self.request.data.get('instructor')
        print(f"🔍 instructor_id reçu: {instructor_id}")

        # Si l'ID est négatif, c'est l'auto-école (convention frontend)
        if instructor_id and int(instructor_id) < 0:
            # Séance donnée par l'auto-école, pas de moniteur spécifique
            print(f"🔍 Séance auto-école (pas de moniteur)")
            schedule = serializer.save(
                driving_school=driving_school,
                instructor=None
            )
        else:
            # Séance normale avec un moniteur
            print(f"🔍 Séance avec moniteur")
            schedule = serializer.save(driving_school=driving_school)

            # Les notifications sont maintenant gérées dans le serializer
            print(f"✅ Séance créée avec succès: {schedule.id}")

    # La fonction _send_notifications a été déplacée vers le serializer pour éviter les doublons


class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un emploi du temps"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ScheduleUpdateSerializer
        return ScheduleSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.schedules.all()
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            return user.student_profile.schedules.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            return user.instructor_profile.schedules.all()
        return Schedule.objects.none()

    def perform_destroy(self, instance):
        """Recalculer les heures du candidat après suppression d'une séance"""
        student = instance.student

        # Envoyer les notifications avant suppression
        self._send_deletion_notifications(instance)

        super().perform_destroy(instance)
        if student:
            recalculate_student_hours(student)

    def _send_deletion_notifications(self, schedule):
        """Envoyer les notifications appropriées avant suppression d'une séance"""
        print(f"🔔 _send_deletion_notifications appelée pour la séance {schedule.id}")
        try:
            # Import local pour éviter les imports circulaires
            from notifications.models import Notification
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            user = self.request.user

            # Notification au moniteur (si ce n'est pas lui qui a fait la suppression)
            if schedule.instructor and user.user_type != 'instructor':
                instructor_user = schedule.instructor.user
                student_name = f"{schedule.student.user.first_name} {schedule.student.user.last_name}"
                session_date = schedule.date.strftime('%d/%m/%Y')

                notification = Notification.objects.create(
                    recipient=instructor_user,
                    notification_type='schedule_change',
                    title='Séance supprimée',
                    message=f'Votre séance avec {student_name} du {session_date} a été supprimée par l\'auto-école.',
                    priority='high'
                )

                # Envoyer via WebSocket
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{instructor_user.id}",
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

                print(f"📨 Notification envoyée au moniteur {instructor_user.username}")

            # Notification à l'étudiant
            if schedule.student:
                student_user = schedule.student.user
                session_type = "théorique" if schedule.session_type == 'theory' else "pratique"
                session_date = schedule.date.strftime('%d/%m/%Y')

                notification = Notification.objects.create(
                    recipient=student_user,
                    notification_type='schedule_change',
                    title='Séance supprimée',
                    message=f'Votre séance {session_type} du {session_date} a été supprimée.',
                    priority='high'
                )

                # Envoyer via WebSocket
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{student_user.id}",
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

                print(f"📨 Notification envoyée à l'étudiant {student_user.username}")

            # Notification à l'auto-école (si c'est le moniteur qui a fait la suppression)
            if user.user_type == 'instructor' and schedule.driving_school:
                driving_school_user = schedule.driving_school.owner
                instructor_name = f"{schedule.instructor.first_name} {schedule.instructor.last_name}"
                student_name = f"{schedule.student.user.first_name} {schedule.student.user.last_name}"
                session_date = schedule.date.strftime('%d/%m/%Y')

                notification = Notification.objects.create(
                    recipient=driving_school_user,
                    notification_type='schedule_change',
                    title='Séance supprimée par moniteur',
                    message=f'{instructor_name} a supprimé la séance avec {student_name} du {session_date}.',
                    priority='medium'
                )

                # Envoyer via WebSocket
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{driving_school_user.id}",
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

                print(f"📨 Notification envoyée à l'auto-école {driving_school_user.username}")

        except Exception as e:
            print(f"❌ Erreur lors de l'envoi des notifications de suppression: {e}")
            import traceback
            traceback.print_exc()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calendar_events_view(request):
    """Vue pour récupérer les événements du calendrier"""
    user = request.user

    # Récupérer les paramètres de date
    start_date = request.query_params.get('start')
    end_date = request.query_params.get('end')

    if not start_date or not end_date:
        return Response({'error': _('Paramètres de date requis')},
                       status=status.HTTP_400_BAD_REQUEST)

    try:
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
    except ValueError:
        return Response({'error': _('Format de date invalide')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Récupérer les emplois du temps
    queryset = Schedule.objects.none()
    if hasattr(user, 'driving_school'):
        queryset = user.driving_school.schedules.all()
    elif user.user_type == 'student' and hasattr(user, 'student_profile'):
        queryset = user.student_profile.schedules.all()
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        queryset = user.instructor_profile.schedules.all()

    schedules = queryset.filter(
        date__gte=start_date,
        date__lte=end_date
    )

    # Convertir en événements de calendrier
    events = []
    for schedule in schedules:
        # Couleur selon le type de séance
        color_map = {
            'theory': '#3498db',
            'practical': '#2ecc71',
            'exam_theory': '#e74c3c',
            'exam_practical_circuit': '#f39c12',
            'exam_practical_park': '#9b59b6',
        }

        start_datetime = timezone.datetime.combine(schedule.date, schedule.start_time)
        end_datetime = timezone.datetime.combine(schedule.date, schedule.end_time)

        events.append({
            'id': schedule.id,
            'title': f"{schedule.get_session_type_display()} - {schedule.student.full_name if schedule.student else 'Sans candidat'}",
            'start': start_datetime.isoformat(),
            'end': end_datetime.isoformat(),
            'color': color_map.get(schedule.session_type, '#95a5a6'),
            'extendedProps': {
                'session_type': schedule.session_type,
                'student_name': schedule.student.full_name if schedule.student else None,
                'instructor_name': schedule.instructor.full_name if schedule.instructor else None,
                'vehicle': str(schedule.vehicle) if schedule.vehicle else None,
                'status': schedule.status,
                'notes': schedule.notes,
            }
        })

    serializer = CalendarEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_availability_view(request):
    """Vue pour vérifier la disponibilité"""
    serializer = AvailabilitySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user

    # Déterminer l'auto-école selon le type d'utilisateur
    driving_school = None
    if hasattr(user, 'driving_school'):
        driving_school = user.driving_school
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        driving_school = user.instructor_profile.driving_school

    if not driving_school:
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    print(f"🔍 Vérification de disponibilité pour {user.user_type} - Auto-école: {driving_school.name}")
    print(f"📅 Données: {data}")

    conflicts = []

    # Vérifier la disponibilité du moniteur
    if 'instructor_id' in data:
        try:
            instructor = driving_school.instructors.get(id=data['instructor_id'])
            instructor_conflicts = Schedule.objects.filter(
                instructor=instructor,
                date=data['date'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time'],
                status__in=['scheduled', 'in_progress']
            )
            if instructor_conflicts.exists():
                conflicts.append({
                    'type': 'instructor',
                    'message': _('Le moniteur n\'est pas disponible à cette heure'),
                    'conflicting_sessions': [
                        {
                            'start_time': conflict.start_time,
                            'end_time': conflict.end_time,
                            'student': conflict.student.full_name if conflict.student else None
                        }
                        for conflict in instructor_conflicts
                    ]
                })
        except:
            pass

    # Vérifier la disponibilité du véhicule
    if 'vehicle_id' in data:
        try:
            vehicle = driving_school.vehicles.get(id=data['vehicle_id'])
            vehicle_conflicts = Schedule.objects.filter(
                vehicle=vehicle,
                date=data['date'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time'],
                status__in=['scheduled', 'in_progress']
            )
            if vehicle_conflicts.exists():
                conflicts.append({
                    'type': 'vehicle',
                    'message': _('Le véhicule n\'est pas disponible à cette heure'),
                    'conflicting_sessions': [
                        {
                            'start_time': conflict.start_time,
                            'end_time': conflict.end_time,
                            'instructor': conflict.instructor.full_name if conflict.instructor else None
                        }
                        for conflict in vehicle_conflicts
                    ]
                })
        except:
            pass

    # Vérifier la disponibilité de l'étudiant
    if 'student_id' in data:
        try:
            student = driving_school.students.get(id=data['student_id'])
            student_conflicts = Schedule.objects.filter(
                student=student,
                date=data['date'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time'],
                status__in=['scheduled', 'in_progress']
            )
            if student_conflicts.exists():
                conflicts.append({
                    'type': 'student',
                    'message': _('L\'étudiant n\'est pas disponible à cette heure'),
                    'conflicting_sessions': [
                        {
                            'start_time': conflict.start_time,
                            'end_time': conflict.end_time,
                            'instructor': conflict.instructor.full_name if conflict.instructor else None,
                            'session_type': conflict.get_session_type_display()
                        }
                        for conflict in student_conflicts
                    ]
                })
        except:
            pass

    return Response({
        'available': len(conflicts) == 0,
        'conflicts': conflicts
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_schedule_status_view(request, pk):
    """Vue pour mettre à jour le statut d'un emploi du temps"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            schedule = user.driving_school.schedules.get(pk=pk)
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            schedule = user.instructor_profile.schedules.get(pk=pk)
        else:
            return Response({'error': _('Emploi du temps non trouvé')},
                           status=status.HTTP_404_NOT_FOUND)
    except Schedule.DoesNotExist:
        return Response({'error': _('Emploi du temps non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']:
        return Response({'error': _('Statut invalide')},
                       status=status.HTTP_400_BAD_REQUEST)

    schedule.status = new_status
    schedule.save()

    # Recalculer les heures du candidat si le statut change
    if schedule.student:
        recalculate_student_hours(schedule.student)

    serializer = ScheduleSerializer(schedule)
    return Response(serializer.data)
