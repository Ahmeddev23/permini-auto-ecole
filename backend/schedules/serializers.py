from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from .models import Schedule
from students.serializers import StudentListSerializer
from instructors.serializers import InstructorListSerializer
from vehicles.serializers import VehicleListSerializer
# from notifications.utils import notify_session_assigned, notify_lesson_confirmed  # Import circulaire


class ScheduleSerializer(serializers.ModelSerializer):
    """Serializer pour les emplois du temps"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    vehicle_info = serializers.CharField(source='vehicle.__str__', read_only=True)
    duration_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = Schedule
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class ScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un emploi du temps"""

    class Meta:
        model = Schedule
        fields = ('id', 'date', 'start_time', 'end_time', 'session_type', 'student',
                 'instructor', 'vehicle', 'notes')
        read_only_fields = ('id',)
    
    def validate(self, attrs):
        # Validation des heures
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError(_("L'heure de fin doit être après l'heure de début"))
        
        # Validation de la date
        if attrs['date'] < timezone.now().date():
            raise serializers.ValidationError(_("Impossible de programmer une séance dans le passé"))
        
        # Validation de la disponibilité du moniteur
        instructor = attrs.get('instructor')
        if instructor:
            conflicting_schedules = Schedule.objects.filter(
                instructor=instructor,
                date=attrs['date'],
                start_time__lt=attrs['end_time'],
                end_time__gt=attrs['start_time'],
                status__in=['scheduled', 'in_progress']
            )
            if conflicting_schedules.exists():
                raise serializers.ValidationError(_("Le moniteur n'est pas disponible à cette heure"))
        
        # Validation de la disponibilité du véhicule
        vehicle = attrs.get('vehicle')
        if vehicle:
            conflicting_schedules = Schedule.objects.filter(
                vehicle=vehicle,
                date=attrs['date'],
                start_time__lt=attrs['end_time'],
                end_time__gt=attrs['start_time'],
                status__in=['scheduled', 'in_progress']
            )
            if conflicting_schedules.exists():
                raise serializers.ValidationError(_("Le véhicule n'est pas disponible à cette heure"))

        # Validation de la disponibilité de l'étudiant
        student = attrs.get('student')
        if student:
            conflicting_schedules = Schedule.objects.filter(
                student=student,
                date=attrs['date'],
                start_time__lt=attrs['end_time'],
                end_time__gt=attrs['start_time'],
                status__in=['scheduled', 'in_progress']
            )
            if conflicting_schedules.exists():
                raise serializers.ValidationError(_("L'étudiant n'est pas disponible à cette heure"))

        return attrs
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Si c'est un moniteur, utiliser l'auto-école du moniteur
            validated_data['driving_school'] = user.instructor_profile.driving_school
        else:
            raise serializers.ValidationError(_("Auto-école non trouvée"))

        # Créer la séance
        schedule = super().create(validated_data)
        print(f"🔔 Séance créée dans le serializer: {schedule.id}")

        # Envoyer les notifications
        self._send_notifications(schedule)

        return schedule

    def _send_notifications(self, schedule):
        """Envoyer les notifications appropriées après création d'une séance"""
        print(f"🔔 _send_notifications appelée pour la séance {schedule.id}")
        try:
            print(f"🔍 Séance: ID={schedule.id}, Moniteur={schedule.instructor}, Étudiant={schedule.student}")

            # Import local pour éviter les imports circulaires
            from notifications.models import Notification
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            # Notification au moniteur (si assigné)
            if schedule.instructor:
                print(f"🔍 Moniteur trouvé: {schedule.instructor}")
                if hasattr(schedule.instructor, 'user'):
                    instructor_user = schedule.instructor.user
                    student_name = f"{schedule.student.user.first_name} {schedule.student.user.last_name}"

                    print(f"🔔 Envoi notification au moniteur {instructor_user.username}")

                    # Créer la notification directement
                    notification = Notification.objects.create(
                        recipient=instructor_user,
                        notification_type='session_assigned',
                        title='Nouvelle séance assignée',
                        message=f'Une nouvelle séance avec {student_name} vous a été assignée.',
                        priority='medium',
                        related_session_id=schedule.id
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
                else:
                    print(f"❌ Le moniteur n'a pas d'attribut 'user'")
            else:
                print(f"❌ Aucun moniteur assigné à cette séance")

            # Notification à l'étudiant
            if schedule.student:
                print(f"🔍 Étudiant trouvé: {schedule.student}")
                if hasattr(schedule.student, 'user'):
                    student_user = schedule.student.user
                    session_type = "théorique" if schedule.session_type == 'theory' else "pratique"
                    lesson_details = f"{schedule.date.strftime('%d/%m/%Y')} à {schedule.start_time.strftime('%H:%M')} ({session_type})"

                    print(f"🔔 Envoi notification à l'étudiant {student_user.username}")

                    # Créer la notification directement
                    notification = Notification.objects.create(
                        recipient=student_user,
                        notification_type='lesson_confirmed',
                        title='Leçon confirmée',
                        message=f'Votre leçon du {lesson_details} est confirmée.',
                        priority='medium',
                        related_session_id=schedule.id
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
                else:
                    print(f"❌ L'étudiant n'a pas d'attribut 'user'")
            else:
                print(f"❌ Aucun étudiant assigné à cette séance")

        except Exception as e:
            print(f"❌ Erreur lors de l'envoi des notifications: {e}")
            import traceback
            traceback.print_exc()


class ScheduleUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un emploi du temps"""

    class Meta:
        model = Schedule
        fields = ('date', 'start_time', 'end_time', 'instructor', 'vehicle',
                 'notes', 'status')

    def validate(self, attrs):
        # Même validation que pour la création
        if 'start_time' in attrs and 'end_time' in attrs:
            if attrs['start_time'] >= attrs['end_time']:
                raise serializers.ValidationError(_("L'heure de fin doit être après l'heure de début"))

        return attrs

    def update(self, instance, validated_data):
        # Sauvegarder l'ancien statut pour comparaison
        old_status = instance.status
        old_date = instance.date
        old_start_time = instance.start_time

        # Mettre à jour l'instance
        updated_instance = super().update(instance, validated_data)

        # Envoyer des notifications selon les changements
        self._send_update_notifications(updated_instance, old_status, old_date, old_start_time)

        return updated_instance

    def _send_update_notifications(self, schedule, old_status, old_date, old_start_time):
        """Envoyer les notifications appropriées après mise à jour d'une séance"""
        print(f"🔔 _send_update_notifications appelée pour la séance {schedule.id}")
        try:
            # Import local pour éviter les imports circulaires
            from notifications.models import Notification
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            user = self.context['request'].user

            # Déterminer qui a fait la modification
            modifier_type = "auto-école"
            if user.user_type == 'instructor':
                modifier_type = "moniteur"

            # Changement de statut
            if schedule.status != old_status:
                status_messages = {
                    'cancelled': 'annulée',
                    'completed': 'marquée comme terminée',
                    'scheduled': 'reprogrammée',
                    'no_show': 'marquée comme absence'
                }

                status_text = status_messages.get(schedule.status, f'mise à jour (statut: {schedule.status})')

                # Notification au moniteur (si ce n'est pas lui qui a fait le changement)
                if schedule.instructor and user.user_type != 'instructor':
                    instructor_user = schedule.instructor.user
                    student_name = f"{schedule.student.user.first_name} {schedule.student.user.last_name}"

                    notification = Notification.objects.create(
                        recipient=instructor_user,
                        notification_type='schedule_change',
                        title='Séance modifiée',
                        message=f'Votre séance avec {student_name} a été {status_text} par l\'auto-école.',
                        priority='high',
                        related_session_id=schedule.id
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

                    notification = Notification.objects.create(
                        recipient=student_user,
                        notification_type='schedule_change',
                        title='Séance modifiée',
                        message=f'Votre séance {session_type} du {schedule.date.strftime("%d/%m/%Y")} a été {status_text}.',
                        priority='high',
                        related_session_id=schedule.id
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

                # Notification à l'auto-école (si c'est le moniteur qui a fait le changement)
                if user.user_type == 'instructor' and schedule.driving_school:
                    driving_school_user = schedule.driving_school.owner
                    instructor_name = f"{schedule.instructor.first_name} {schedule.instructor.last_name}"
                    student_name = f"{schedule.student.user.first_name} {schedule.student.user.last_name}"

                    notification = Notification.objects.create(
                        recipient=driving_school_user,
                        notification_type='schedule_change',
                        title='Séance modifiée par moniteur',
                        message=f'{instructor_name} a {status_text} la séance avec {student_name}.',
                        priority='medium',
                        related_session_id=schedule.id
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

            # Changement de date/heure
            elif schedule.date != old_date or schedule.start_time != old_start_time:
                new_datetime = f"{schedule.date.strftime('%d/%m/%Y')} à {schedule.start_time.strftime('%H:%M')}"

                # Notification au moniteur (si ce n'est pas lui qui a fait le changement)
                if schedule.instructor and user.user_type != 'instructor':
                    instructor_user = schedule.instructor.user
                    student_name = f"{schedule.student.user.first_name} {schedule.student.user.last_name}"

                    notification = Notification.objects.create(
                        recipient=instructor_user,
                        notification_type='schedule_change',
                        title='Horaire modifié',
                        message=f'Votre séance avec {student_name} a été reprogrammée au {new_datetime}.',
                        priority='high',
                        related_session_id=schedule.id
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

                    notification = Notification.objects.create(
                        recipient=student_user,
                        notification_type='schedule_change',
                        title='Horaire modifié',
                        message=f'Votre séance a été reprogrammée au {new_datetime}.',
                        priority='high',
                        related_session_id=schedule.id
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

        except Exception as e:
            print(f"❌ Erreur lors de l'envoi des notifications de mise à jour: {e}")
            import traceback
            traceback.print_exc()


class ScheduleListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des emplois du temps"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    instructor_id = serializers.IntegerField(source='instructor.id', read_only=True)
    duration_hours = serializers.ReadOnlyField()

    class Meta:
        model = Schedule
        fields = ('id', 'date', 'start_time', 'end_time', 'session_type',
                 'student_name', 'instructor_name', 'instructor_id', 'status', 'duration_hours')


class CalendarEventSerializer(serializers.Serializer):
    """Serializer pour les événements du calendrier"""
    id = serializers.IntegerField()
    title = serializers.CharField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    color = serializers.CharField()
    extendedProps = serializers.DictField()


class AvailabilitySerializer(serializers.Serializer):
    """Serializer pour vérifier la disponibilité"""
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    student_id = serializers.IntegerField(required=False)
    instructor_id = serializers.IntegerField(required=False)
    vehicle_id = serializers.IntegerField(required=False)
    
    def validate(self, attrs):
        if attrs['start_time'] >= attrs['end_time']:
            raise serializers.ValidationError(_("L'heure de fin doit être après l'heure de début"))
        return attrs
