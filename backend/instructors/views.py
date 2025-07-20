from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.http import Http404

from .models import Instructor
from .serializers import (
    InstructorSerializer, InstructorCreateSerializer, InstructorUpdateSerializer,
    InstructorListSerializer, InstructorScheduleSerializer, InstructorStatsSerializer
)
from accounts.models import User
from driving_schools.models import DrivingSchool
from notifications.utils import notify_instructor_update


class InstructorListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les moniteurs"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InstructorCreateSerializer
        return InstructorListSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.instructors.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Un moniteur ne peut voir que son propre profil
            return Instructor.objects.filter(id=user.instructor_profile.id)
        return Instructor.objects.none()

    def perform_create(self, serializer):
        """Créer le moniteur avec un compte utilisateur et envoyer le mot de passe par email"""
        from django.utils.crypto import get_random_string
        from django.core.mail import send_mail
        from django.conf import settings

        # Générer un mot de passe aléatoire
        password = get_random_string(8)

        # Créer l'utilisateur
        user_data = {
            'username': serializer.validated_data['email'],
            'email': serializer.validated_data['email'],
            'first_name': serializer.validated_data['first_name'],
            'last_name': serializer.validated_data['last_name'],
            'password': password
        }

        user = User.objects.create_user(**user_data)
        user.user_type = 'instructor'
        user.is_verified = True  # Les moniteurs créés par l'auto-école sont automatiquement vérifiés
        user.save()

        # Associer l'auto-école
        driving_school = self.request.user.driving_school

        # Sauvegarder le moniteur
        instructor = serializer.save(user=user, driving_school=driving_school)

        # Envoyer le mot de passe par email
        self.send_password_email(instructor, password)

        # Envoyer une notification à l'auto-école
        try:
            driving_school_user = driving_school.owner
            instructor_name = f"{instructor.first_name} {instructor.last_name}"
            notify_instructor_update(driving_school_user, instructor_name, "nouveau moniteur ajouté")
            print(f"📨 Notification envoyée à l'auto-école {driving_school_user.username}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de la notification: {e}")

    def send_password_email(self, instructor, password):
        """Envoyer le mot de passe par email au moniteur"""
        from django.core.mail import send_mail
        from django.conf import settings

        subject = f'Bienvenue chez {instructor.driving_school.name} - Vos identifiants de connexion'
        message = f"""
Bonjour {instructor.first_name} {instructor.last_name},

Bienvenue dans l'équipe de {instructor.driving_school.name} !

Votre compte moniteur a été créé avec succès. Voici vos identifiants de connexion :

Email : {instructor.email}
Mot de passe : {password}

Vous pouvez vous connecter à votre espace moniteur pour gérer vos cours, consulter votre planning et suivre vos candidats.

Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.

Bonne formation !

L'équipe {instructor.driving_school.name}
        """

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [instructor.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log l'erreur mais ne pas faire échouer la création
            print(f"Erreur envoi email: {e}")


class InstructorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un moniteur"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return InstructorUpdateSerializer
        return InstructorSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.instructors.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            return Instructor.objects.filter(id=user.instructor_profile.id)
        return Instructor.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def instructor_schedule_view(request, pk):
    """Vue pour l'emploi du temps d'un moniteur"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            instructor = user.driving_school.instructors.get(pk=pk)
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            if user.instructor_profile.id != pk:
                return Response({'error': _('Accès non autorisé')},
                               status=status.HTTP_403_FORBIDDEN)
            instructor = user.instructor_profile
        else:
            return Response({'error': _('Moniteur non trouvé')},
                           status=status.HTTP_404_NOT_FOUND)
    except Instructor.DoesNotExist:
        return Response({'error': _('Moniteur non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Récupérer les séances des 7 prochains jours
    start_date = timezone.now().date()
    end_date = start_date + timedelta(days=7)

    schedules = instructor.schedules.filter(
        date__gte=start_date,
        date__lte=end_date
    ).order_by('date', 'start_time')

    # Organiser par date
    schedule_by_date = {}
    for schedule in schedules:
        date_str = schedule.date.isoformat()
        if date_str not in schedule_by_date:
            schedule_by_date[date_str] = []

        schedule_by_date[date_str].append({
            'id': schedule.id,
            'start_time': schedule.start_time,
            'end_time': schedule.end_time,
            'session_type': schedule.session_type,
            'student_name': schedule.student.full_name if schedule.student else None,
            'vehicle': str(schedule.vehicle) if schedule.vehicle else None,
            'status': schedule.status,
        })

    # Créer la réponse
    response_data = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        response_data.append({
            'date': current_date,
            'sessions': schedule_by_date.get(date_str, [])
        })
        current_date += timedelta(days=1)

    serializer = InstructorScheduleSerializer(response_data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def instructor_stats_view(request, pk):
    """Vue pour les statistiques d'un moniteur"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            instructor = user.driving_school.instructors.get(pk=pk)
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            if user.instructor_profile.id != pk:
                return Response({'error': _('Accès non autorisé')},
                               status=status.HTTP_403_FORBIDDEN)
            instructor = user.instructor_profile
        else:
            return Response({'error': _('Moniteur non trouvé')},
                           status=status.HTTP_404_NOT_FOUND)
    except Instructor.DoesNotExist:
        return Response({'error': _('Moniteur non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Calculer les statistiques du mois en cours
    current_month = timezone.now().replace(day=1)
    next_month = (current_month + timedelta(days=32)).replace(day=1)

    # Candidats assignés
    total_students = instructor.students.count()
    active_students = instructor.students.filter(is_active=True).count()

    # Séances du mois
    monthly_sessions = instructor.schedules.filter(
        date__gte=current_month.date(),
        date__lt=next_month.date(),
        status='completed'
    )

    total_sessions_this_month = monthly_sessions.count()
    total_hours_this_month = sum([
        (session.end_time.hour - session.start_time.hour)
        for session in monthly_sessions
    ])

    # Gains du mois (basé sur le tarif horaire)
    earnings_this_month = total_hours_this_month * instructor.hourly_rate

    # Séances à venir (7 prochains jours)
    next_week = timezone.now() + timedelta(days=7)
    upcoming_sessions = instructor.schedules.filter(
        date__gte=timezone.now().date(),
        date__lte=next_week.date(),
        status='scheduled'
    ).count()

    # Taux de réussite (examens des candidats)
    total_exams = 0
    passed_exams = 0
    for student in instructor.students.all():
        student_exams = student.exams.all()
        total_exams += student_exams.count()
        passed_exams += student_exams.filter(result='passed').count()

    success_rate = (passed_exams / total_exams * 100) if total_exams > 0 else 0

    # Note moyenne (si système de notation implémenté)
    average_rating = 4.5  # Valeur par défaut, à implémenter

    stats = {
        'total_students': total_students,
        'active_students': active_students,
        'total_hours_this_month': total_hours_this_month,
        'total_sessions_this_month': total_sessions_this_month,
        'earnings_this_month': earnings_this_month,
        'upcoming_sessions': upcoming_sessions,
        'success_rate': success_rate,
        'average_rating': average_rating,
    }

    serializer = InstructorStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_instructor_email(request):
    """Valider l'unicité de l'email pour un moniteur"""
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({'exists': False})

    # Vérifier dans les utilisateurs
    user_exists = User.objects.filter(email=email).exists()

    # Vérifier dans les moniteurs
    instructor_exists = Instructor.objects.filter(email=email).exists()

    exists = user_exists or instructor_exists

    return Response({'exists': exists})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_instructor_cin(request):
    """Valider l'unicité du CIN pour un moniteur"""
    cin = request.data.get('cin', '').strip()

    if not cin:
        return Response({'exists': False})

    # Vérifier dans les utilisateurs
    user_exists = User.objects.filter(cin=cin).exists()

    # Vérifier dans les moniteurs
    instructor_exists = Instructor.objects.filter(cin=cin).exists()

    exists = user_exists or instructor_exists

    return Response({'exists': exists})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def instructors_with_driving_school_view(request):
    """Vue pour récupérer les moniteurs + l'auto-école comme moniteur"""
    user = request.user

    # Déterminer l'auto-école selon le type d'utilisateur
    driving_school = None
    if hasattr(user, 'driving_school'):
        driving_school = user.driving_school
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        driving_school = user.instructor_profile.driving_school

    if not driving_school:
        return Response({'error': _('Accès non autorisé')},
                       status=status.HTTP_403_FORBIDDEN)

    # Récupérer les moniteurs normaux
    instructors = driving_school.instructors.filter(is_active=True)
    instructors_data = InstructorListSerializer(instructors, many=True).data

    # Ajouter l'auto-école comme "moniteur"
    driving_school_as_instructor = {
        'id': -1,  # ID négatif pour différencier de vrais moniteurs
        'full_name': f'{driving_school.name} (Auto-école)',
        'email': driving_school.email,
        'phone': driving_school.phone,
        'cin': 'AUTO-ECOLE',  # Pas de CIN pour l'auto-école
        'license_types': ['A', 'B', 'C', 'D'],  # L'auto-école peut tout enseigner
        'is_driving_school': True,
        'is_active': True,
        'photo': None,
        'driving_school_name': driving_school.name,
        'hire_date': None,
        'salary': None
    }

    # Mettre l'auto-école en premier dans la liste
    result = [driving_school_as_instructor] + list(instructors_data)

    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def instructor_subscription_info_view(request):
    """Vue pour récupérer les informations d'abonnement de l'auto-école pour un moniteur"""
    user = request.user

    # Accepter les moniteurs et les étudiants
    try:
        if user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            driving_school = user.instructor_profile.driving_school
        elif user.user_type == 'student' and hasattr(user, 'student'):
            driving_school = user.student.driving_school
        else:
            return Response({'error': _('Accès non autorisé')},
                           status=status.HTTP_403_FORBIDDEN)

        # Calculer les jours restants
        days_remaining = 0
        if driving_school.plan_end_date:
            days_remaining = max(0, (driving_school.plan_end_date.date() - timezone.now().date()).days)

        # Vérifier si le plan a expiré
        is_plan_expired = False
        if driving_school.plan_end_date and driving_school.plan_end_date < timezone.now():
            is_plan_expired = True

        # Déterminer si l'upgrade est possible (les moniteurs ne peuvent pas upgrader)
        can_upgrade = False

        # Utiliser le nouveau système de plans avec fallback
        current_plan_obj = driving_school.get_current_plan()
        current_plan_name = current_plan_obj.name if hasattr(current_plan_obj, 'name') else driving_school.current_plan

        subscription_info = {
            'current_plan': current_plan_name,  # Maintenir compatibilité
            'plan_start_date': driving_school.plan_start_date.isoformat() if driving_school.plan_start_date else None,
            'plan_end_date': driving_school.plan_end_date.isoformat() if driving_school.plan_end_date else None,
            'days_remaining': days_remaining,
            'is_plan_expired': is_plan_expired,
            'max_accounts': driving_school.get_max_accounts(),  # Utilise la nouvelle méthode avec renewals
            'current_accounts': driving_school.current_accounts,
            'can_upgrade': can_upgrade,  # Les moniteurs ne peuvent pas upgrader
            'driving_school_name': driving_school.name,
            'is_instructor': True,  # Indicateur que c'est un moniteur
            # Nouvelles informations du plan
            'plan_details': {
                'display_name': current_plan_obj.display_name if hasattr(current_plan_obj, 'display_name') else current_plan_name.title(),
                'price': float(current_plan_obj.price) if hasattr(current_plan_obj, 'price') else (49.0 if current_plan_name == 'standard' else 99.0),
                'features': current_plan_obj.features if hasattr(current_plan_obj, 'features') else {}
            }
        }

        return Response(subscription_info)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Permettre l'accès sans authentification
def validate_instructor_email(request):
    """Valider l'unicité de l'email en temps réel pour les moniteurs"""
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({'valid': False, 'message': 'Email requis'}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier si l'email existe déjà
    if User.objects.filter(email=email).exists():
        return Response({'valid': False, 'message': 'Cet email est déjà utilisé'})

    return Response({'valid': True, 'message': 'Email disponible'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Permettre l'accès sans authentification
def validate_instructor_cin(request):
    """Valider l'unicité du CIN en temps réel pour les moniteurs"""
    cin = request.data.get('cin', '').strip()

    if not cin:
        return Response({'valid': False, 'message': 'CIN requis'}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier si le CIN existe déjà dans la table User (auto-écoles, admin, etc.)
    if User.objects.filter(cin=cin).exists():
        return Response({'valid': False, 'message': 'Ce CIN est déjà utilisé'})

    # Vérifier si le CIN existe déjà dans la table Instructor
    if Instructor.objects.filter(cin=cin).exists():
        return Response({'valid': False, 'message': 'Ce CIN est déjà enregistré'})

    return Response({'valid': True, 'message': 'CIN disponible'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_instructor_stats_view(request):
    """Vue pour récupérer les statistiques du moniteur connecté"""
    user = request.user

    if user.user_type != 'instructor' or not hasattr(user, 'instructor_profile'):
        return Response({'error': _('Accès non autorisé')},
                       status=status.HTTP_403_FORBIDDEN)

    instructor = user.instructor_profile

    try:
        from django.db.models import Count, Q
        from datetime import datetime, timedelta
        from django.utils import timezone

        # Période actuelle
        now = timezone.now()
        current_month = now.replace(day=1)
        last_month = (current_month - timedelta(days=1)).replace(day=1)
        today = now.date()

        # Statistiques des étudiants assignés
        total_students = instructor.driving_school.students.filter(is_active=True).count()

        # Séances du moniteur
        instructor_schedules = instructor.schedules.all()

        # Séances ce mois
        sessions_this_month = instructor_schedules.filter(
            date__gte=current_month.date()
        ).count()

        # Séances le mois dernier
        sessions_last_month = instructor_schedules.filter(
            date__gte=last_month.date(),
            date__lt=current_month.date()
        ).count()

        # Séances aujourd'hui
        sessions_today = instructor_schedules.filter(date=today).count()

        # Heures ce mois (en supposant 1.5h par séance en moyenne)
        hours_this_month = sessions_this_month * 1.5
        hours_last_month = sessions_last_month * 1.5

        # Taux de réussite (séances terminées vs annulées)
        completed_sessions = instructor_schedules.filter(status='completed').count()
        cancelled_sessions = instructor_schedules.filter(status='cancelled').count()
        total_finished_sessions = completed_sessions + cancelled_sessions

        success_rate = 0
        if total_finished_sessions > 0:
            success_rate = round((completed_sessions / total_finished_sessions) * 100, 1)

        # Calcul des changements
        sessions_change = sessions_this_month - sessions_last_month
        hours_change = hours_this_month - hours_last_month

        stats = {
            'total_students': total_students,
            'sessions_today': sessions_today,
            'hours_this_month': hours_this_month,
            'hours_change': hours_change,
            'success_rate': success_rate,
            'sessions_change': sessions_change,
            'completed_sessions': completed_sessions,
            'total_sessions': instructor_schedules.count()
        }

        return Response(stats)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_today_schedule_view(request):
    """Vue pour récupérer les séances récentes du moniteur connecté (6 plus récentes)"""
    user = request.user

    if user.user_type != 'instructor' or not hasattr(user, 'instructor_profile'):
        return Response({'error': _('Accès non autorisé')},
                       status=status.HTTP_403_FORBIDDEN)

    instructor = user.instructor_profile

    try:
        from datetime import datetime
        from django.utils import timezone
        from django.db.models import Q

        now = timezone.now()
        today = now.date()
        current_time = now.time()

        # Récupérer les séances futures et d'aujourd'hui
        future_schedules = instructor.schedules.filter(
            Q(date__gt=today) |  # Séances futures
            Q(date=today, start_time__gte=current_time)  # Séances d'aujourd'hui à venir
        ).select_related('student', 'vehicle').order_by('date', 'start_time')[:6]

        # Si on n'a pas assez de séances futures, compléter avec les séances passées récentes
        if future_schedules.count() < 6:
            remaining_slots = 6 - future_schedules.count()
            past_schedules = instructor.schedules.filter(
                Q(date__lt=today) |  # Séances passées
                Q(date=today, start_time__lt=current_time)  # Séances d'aujourd'hui passées
            ).select_related('student', 'vehicle').order_by('-date', '-start_time')[:remaining_slots]

            # Combiner les deux listes
            recent_schedules = list(future_schedules) + list(past_schedules)
        else:
            recent_schedules = list(future_schedules)

        # Sérialiser les données
        from schedules.serializers import ScheduleListSerializer
        serializer = ScheduleListSerializer(recent_schedules, many=True)

        return Response(serializer.data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def instructor_driving_school_info_view(request):
    """Vue pour récupérer les informations de l'auto-école du moniteur connecté"""
    user = request.user

    if user.user_type != 'instructor' or not hasattr(user, 'instructor_profile'):
        return Response({'error': _('Accès non autorisé')},
                       status=status.HTTP_403_FORBIDDEN)

    instructor = user.instructor_profile
    driving_school = instructor.driving_school

    try:
        driving_school_info = {
            'name': driving_school.name,
            'logo': request.build_absolute_uri(driving_school.logo.url) if driving_school.logo else None,
            'email': driving_school.email,
            'phone': driving_school.phone,
            'address': driving_school.address,
        }

        return Response(driving_school_info)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
