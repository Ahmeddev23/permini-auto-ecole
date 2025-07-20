from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.http import Http404
from decimal import Decimal
from django.contrib.auth import get_user_model
User = get_user_model()
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string

from .models import Student
from .serializers import (
    StudentSerializer, StudentCreateSerializer, StudentUpdateSerializer,
    StudentProgressSerializer, StudentListSerializer, StudentStatsSerializer
)
from payments.models import PaymentLog
from notifications.utils import notify_new_student_registration


class StudentListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les candidats"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudentCreateSerializer
        return StudentListSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.students.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Un moniteur peut voir tous les candidats de son auto-école
            return user.instructor_profile.driving_school.students.all()
        elif user.user_type == 'student' and hasattr(user, 'student'):
            # Un candidat ne peut voir que son propre profil
            return Student.objects.filter(id=user.student.id)
        return Student.objects.none()

    def perform_create(self, serializer):
        """Créer le candidat avec un compte utilisateur et envoyer le mot de passe par email"""
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
        user.user_type = 'student'
        user.is_verified = True  # Les candidats créés par l'auto-école sont automatiquement vérifiés
        user.save()

        # Associer l'auto-école
        driving_school = self.request.user.driving_school

        # Sauvegarder le candidat
        student = serializer.save(user=user, driving_school=driving_school)

        # Envoyer le mot de passe par email
        self.send_password_email(student, password)

        # Envoyer une notification à l'auto-école
        try:
            driving_school_user = driving_school.owner
            notify_new_student_registration(driving_school_user, user)
            print(f"📨 Notification envoyée à l'auto-école {driving_school_user.username}")
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de la notification: {e}")

    def send_password_email(self, student, password):
        """Envoyer le mot de passe par email au candidat"""
        subject = f'Bienvenue chez {student.driving_school.name} - Vos identifiants de connexion'
        message = f"""
Bonjour {student.first_name} {student.last_name},

Bienvenue chez {student.driving_school.name} !

Votre compte candidat a été créé avec succès. Voici vos identifiants de connexion :

Email : {student.email}
Mot de passe : {password}

Vous pouvez vous connecter à votre espace candidat pour suivre votre progression, consulter vos cours et examens.

Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.

Bonne formation !

L'équipe {student.driving_school.name}
        """

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [student.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log l'erreur mais ne pas faire échouer la création
            print(f"Erreur envoi email: {e}")


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un candidat"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentUpdateSerializer
        return StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.students.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Un moniteur peut voir tous les candidats de son auto-école
            return user.instructor_profile.driving_school.students.all()
        elif user.user_type == 'student' and hasattr(user, 'student'):
            return Student.objects.filter(id=user.student.id)
        return Student.objects.none()


class StudentProgressView(generics.RetrieveUpdateAPIView):
    """Vue pour la progression du candidat"""
    serializer_class = StudentProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.students.all()
        return Student.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_stats_view(request, pk):
    """Vue pour les statistiques d'un candidat"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            student = user.driving_school.students.get(pk=pk)
        elif user.user_type == 'student' and hasattr(user, 'student'):
            if user.student.id != pk:
                return Response({'error': _('Accès non autorisé')},
                               status=status.HTTP_403_FORBIDDEN)
            student = user.student
        else:
            return Response({'error': _('Candidat non trouvé')},
                           status=status.HTTP_404_NOT_FOUND)
    except Student.DoesNotExist:
        return Response({'error': _('Candidat non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Calculer les statistiques
    total_payments = student.payments.filter(status='paid').aggregate(
        total=Sum('amount'))['total'] or 0

    pending_payments = student.payments.filter(status='pending').aggregate(
        total=Sum('amount'))['total'] or 0

    # Prochain examen
    next_exam = student.exams.filter(
        exam_date__gte=timezone.now(),
        result='pending'
    ).order_by('exam_date').first()

    # Dernière séance
    last_lesson = student.schedules.filter(
        status='completed'
    ).order_by('-date').first()

    stats = {
        'total_theory_hours': 30,  # Valeur par défaut, peut être configurée
        'total_practical_hours': 20,  # Valeur par défaut, peut être configurée
        'completed_theory_hours': student.theory_hours_completed,
        'completed_practical_hours': student.practical_hours_completed,
        'theory_progress': (student.theory_hours_completed / 30) * 100,
        'practical_progress': (student.practical_hours_completed / 20) * 100,
        'total_payments': total_payments,
        'pending_payments': pending_payments,
        'next_exam_date': next_exam.exam_date if next_exam else None,
        'last_lesson_date': last_lesson.date if last_lesson else None,
    }

    serializer = StudentStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Permettre l'accès sans authentification
def validate_email(request):
    """Valider l'unicité de l'email en temps réel"""
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({'valid': False, 'message': 'Email requis'}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier si l'email existe déjà
    if User.objects.filter(email=email).exists():
        return Response({'valid': False, 'message': 'Cet email est déjà utilisé'})

    return Response({'valid': True, 'message': 'Email disponible'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])  # Permettre l'accès sans authentification
def validate_cin(request):
    """Valider l'unicité du CIN en temps réel"""
    cin = request.data.get('cin', '').strip()

    if not cin:
        return Response({'valid': False, 'message': 'CIN requis'}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier si le CIN existe déjà dans la table User (auto-écoles, admin, etc.)
    if User.objects.filter(cin=cin).exists():
        return Response({'valid': False, 'message': 'Ce CIN est déjà utilisé'})

    # Vérifier si le CIN existe déjà dans la table Student
    if Student.objects.filter(cin=cin).exists():
        return Response({'valid': False, 'message': 'Ce CIN est déjà enregistré'})

    return Response({'valid': True, 'message': 'CIN disponible'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_payments_view(request, pk):
    """Vue pour récupérer l'historique des paiements d'un candidat"""
    try:
        user = request.user
        if hasattr(user, 'driving_school'):
            # Auto-école peut voir les paiements de ses étudiants
            student = user.driving_school.students.get(pk=pk)
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Moniteur peut voir les paiements des étudiants de son auto-école
            instructor = user.instructor_profile
            student = instructor.driving_school.students.get(pk=pk)
        elif user.user_type == 'student' and hasattr(user, 'student'):
            # Étudiant peut voir seulement ses propres paiements
            student = Student.objects.get(pk=pk, user=user)
        else:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        # Pour l'instant, retourner des données simulées
        # TODO: Implémenter le système de paiements réel
        payments = [
            {
                'id': 1,
                'amount': 1500,
                'date': '2024-01-15',
                'status': 'completed',
                'type': 'inscription'
            },
            {
                'id': 2,
                'amount': 500,
                'date': '2024-02-15',
                'status': 'completed',
                'type': 'seance'
            }
        ]

        return Response(payments)
    except Student.DoesNotExist:
        return Response({'error': 'Candidat non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_exams_view(request, pk):
    """Vue pour récupérer l'historique des examens d'un candidat"""
    try:
        user = request.user
        if hasattr(user, 'driving_school'):
            student = user.driving_school.students.get(pk=pk)
        else:
            return Response({'error': 'Candidat non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Récupérer les examens du candidat
        from exams.models import Exam
        exams = Exam.objects.filter(student=student).order_by('-exam_date')

        exams_data = []
        for exam in exams:
            exams_data.append({
                'id': exam.id,
                'exam_type': exam.exam_type,
                'date': exam.exam_date,
                'status': exam.result,  # Le champ s'appelle 'result' pas 'status'
                'attempt_number': exam.attempt_number,
                'score': getattr(exam, 'score', None)
            })

        return Response(exams_data)
    except Student.DoesNotExist:
        return Response({'error': 'Candidat non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_sessions_view(request, pk):
    """Vue pour récupérer l'historique des séances d'un candidat"""
    try:
        user = request.user
        if hasattr(user, 'driving_school'):
            # Auto-école peut voir les séances de ses étudiants
            student = user.driving_school.students.get(pk=pk)
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Moniteur peut voir les séances des étudiants de son auto-école
            instructor = user.instructor_profile
            student = instructor.driving_school.students.get(pk=pk)
        elif user.user_type == 'student' and hasattr(user, 'student'):
            # Étudiant peut voir seulement ses propres séances
            student = Student.objects.get(pk=pk, user=user)
        else:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        # Récupérer les séances du candidat
        from schedules.models import Schedule
        sessions = Schedule.objects.filter(student=student).order_by('-date', '-start_time')

        sessions_data = []
        for session in sessions:
            sessions_data.append({
                'id': session.id,
                'date': session.date,
                'start_time': session.start_time,
                'end_time': session.end_time,
                'session_type': session.session_type,
                'status': session.status,
                'instructor_name': session.instructor.full_name if session.instructor else 'Auto-école',
                'vehicle': f"{session.vehicle.brand} {session.vehicle.model}" if session.vehicle else None,
                'notes': session.notes
            })

        return Response(sessions_data)
    except Student.DoesNotExist:
        return Response({'error': 'Candidat non trouvé'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_schedule_with_exams_view(request, student_id):
    """Vue pour récupérer le planning d'un étudiant incluant les examens"""
    user = request.user

    # Vérifier que l'utilisateur a accès à cet étudiant
    if hasattr(user, 'driving_school'):
        try:
            student = user.driving_school.students.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': _('Candidat non trouvé')}, status=status.HTTP_404_NOT_FOUND)
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        try:
            student = user.instructor_profile.driving_school.students.get(id=student_id)
        except Student.DoesNotExist:
            return Response({'error': _('Candidat non trouvé')}, status=status.HTTP_404_NOT_FOUND)
    elif user.user_type == 'student' and hasattr(user, 'student'):
        # Étudiant peut voir seulement ses propres données
        try:
            student = Student.objects.get(id=student_id, user=user)
        except Student.DoesNotExist:
            return Response({'error': _('Candidat non trouvé')}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': _('Accès non autorisé')}, status=status.HTTP_403_FORBIDDEN)

    # Récupérer les paramètres de date
    start_date = request.query_params.get('start')
    end_date = request.query_params.get('end')

    if not start_date or not end_date:
        return Response({'error': _('Paramètres de date requis')}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from datetime import datetime
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')).date()
        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')).date()
    except ValueError:
        return Response({'error': _('Format de date invalide')}, status=status.HTTP_400_BAD_REQUEST)

    events = []

    # 1. Récupérer les séances de formation
    schedules = student.schedules.filter(
        date__gte=start_date,
        date__lte=end_date
    )

    for schedule in schedules:
        start_datetime = datetime.combine(schedule.date, schedule.start_time)
        end_datetime = datetime.combine(schedule.date, schedule.end_time)

        # Couleur selon le statut pour les séances de formation
        status_colors = {
            'scheduled': '#3498db',  # Bleu
            'completed': '#2ecc71',  # Vert
            'cancelled': '#e74c3c',  # Rouge
            'no_show': '#95a5a6'     # Gris
        }

        events.append({
            'id': f"schedule_{schedule.id}",
            'title': f"{schedule.get_session_type_display()} - {schedule.instructor.full_name if schedule.instructor else 'Sans moniteur'}",
            'start': start_datetime.isoformat(),
            'end': end_datetime.isoformat(),
            'backgroundColor': status_colors.get(schedule.status, '#95a5a6'),
            'borderColor': status_colors.get(schedule.status, '#95a5a6'),
            'textColor': '#FFFFFF',
            'extendedProps': {
                'type': 'schedule',
                'session_type': schedule.session_type,
                'student_name': schedule.student.full_name,
                'instructor_name': schedule.instructor.full_name if schedule.instructor else None,
                'vehicle': str(schedule.vehicle) if schedule.vehicle else None,
                'status': schedule.status,
                'notes': schedule.notes,
            }
        })

    # 2. Récupérer les examens
    exams = student.exams.filter(
        exam_date__date__gte=start_date,
        exam_date__date__lte=end_date
    )

    for exam in exams:
        # Couleur unique pour tous les examens (orange)
        exam_color = '#f39c12'

        # Durée estimée de l'examen (2h par défaut)
        from datetime import timedelta
        end_datetime = exam.exam_date + timedelta(hours=2)

        events.append({
            'id': f"exam_{exam.id}",
            'title': f"EXAMEN - {exam.get_exam_type_display()}",
            'start': exam.exam_date.isoformat(),
            'end': end_datetime.isoformat(),
            'backgroundColor': exam_color,
            'borderColor': exam_color,
            'textColor': '#FFFFFF',
            'extendedProps': {
                'type': 'exam',
                'exam_type': exam.exam_type,
                'student_name': exam.student.full_name,
                'instructor_name': exam.instructor.full_name if exam.instructor else None,
                'result': exam.result,
                'score': str(exam.score) if exam.score else None,
                'attempt_number': exam.attempt_number,
                'exam_location': exam.exam_location,
            }
        })

    return Response(events)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def setup_student_pricing(request, pk):
    """Configurer la tarification d'un candidat"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            student = user.driving_school.students.get(pk=pk)
        else:
            return Response({'error': _('Auto-école non trouvée')},
                           status=status.HTTP_404_NOT_FOUND)
    except Student.DoesNotExist:
        return Response({'error': _('Candidat non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Vérifier si la tarification est déjà configurée
    if student.total_amount is not None or student.total_sessions is not None:
        return Response({'error': _('La tarification est déjà configurée pour ce candidat')},
                       status=status.HTTP_400_BAD_REQUEST)

    payment_type = request.data.get('payment_type')
    total_amount = request.data.get('total_amount')
    total_sessions = request.data.get('total_sessions')

    if payment_type == 'fixed':
        if not total_amount:
            return Response({'error': _('Le montant total est requis pour le tarif fixe')},
                           status=status.HTTP_400_BAD_REQUEST)
        student.payment_type = 'fixed'
        student.total_amount = Decimal(str(total_amount))
        student.total_sessions = None
    elif payment_type == 'hourly':
        student.payment_type = 'hourly'
        student.total_sessions = None  # Pas de limite pour les séances
        student.total_amount = None
    else:
        return Response({'error': _('Type de paiement invalide')},
                       status=status.HTTP_400_BAD_REQUEST)

    student.save()

    serializer = StudentSerializer(student)
    return Response({
        'message': _('Tarification configurée avec succès'),
        'student': serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_payment(request, pk):
    """Ajouter un paiement pour un candidat"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            student = user.driving_school.students.get(pk=pk)
        else:
            return Response({'error': _('Auto-école non trouvée')},
                           status=status.HTTP_404_NOT_FOUND)
    except Student.DoesNotExist:
        return Response({'error': _('Candidat non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Vérifier que la tarification est configurée
    if not student.payment_type or (student.payment_type == 'fixed' and student.total_amount is None):
        return Response({'error': _('La tarification doit être configurée avant d\'ajouter des paiements')},
                       status=status.HTTP_400_BAD_REQUEST)

    amount = request.data.get('amount')
    sessions_count = request.data.get('sessions_count', 0)
    description = request.data.get('description', '')

    if not amount or Decimal(str(amount)) <= 0:
        return Response({'error': _('Le montant doit être supérieur à 0')},
                       status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        # Mettre à jour les totaux payés
        student.paid_amount += Decimal(str(amount))
        if sessions_count > 0:
            student.paid_sessions += int(sessions_count)
        student.save()

        # Créer l'entrée dans l'historique
        PaymentLog.objects.create(
            student=student,
            amount=Decimal(str(amount)),
            sessions_count=sessions_count,
            description=description,
            created_by=user
        )

    serializer = StudentSerializer(student)
    return Response({
        'message': _('Paiement ajouté avec succès'),
        'student': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_payment_logs(request, pk):
    """Récupérer l'historique des paiements d'un candidat"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            # Auto-école peut voir les logs de ses étudiants
            student = user.driving_school.students.get(pk=pk)
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Moniteur peut voir les logs des étudiants de son auto-école
            instructor = user.instructor_profile
            student = instructor.driving_school.students.get(pk=pk)
        elif user.user_type == 'student' and hasattr(user, 'student'):
            # Étudiant peut voir seulement ses propres logs
            student = Student.objects.get(pk=pk, user=user)
        else:
            return Response({'error': _('Accès non autorisé')},
                           status=status.HTTP_403_FORBIDDEN)
    except Student.DoesNotExist:
        return Response({'error': _('Candidat non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    logs = student.payment_logs.all()

    logs_data = []
    for log in logs:
        logs_data.append({
            'id': log.id,
            'amount': str(log.amount),
            'sessions_count': log.sessions_count,
            'description': log.description,
            'created_at': log.created_at,
            'created_by': log.created_by.get_full_name() if log.created_by else None
        })

    return Response(logs_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_driving_school_info_view(request):
    """Vue pour récupérer les informations de l'auto-école de l'étudiant connecté"""
    user = request.user

    if user.user_type != 'student' or not hasattr(user, 'student'):
        return Response({'error': _('Accès non autorisé')},
                       status=status.HTTP_403_FORBIDDEN)

    student = user.student
    driving_school = student.driving_school

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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_subscription_info_view(request):
    """Vue pour récupérer les informations d'abonnement de l'auto-école de l'étudiant connecté"""
    user = request.user

    if user.user_type != 'student' or not hasattr(user, 'student'):
        return Response({'error': _('Accès non autorisé')},
                       status=status.HTTP_403_FORBIDDEN)

    student = user.student
    driving_school = student.driving_school

    try:
        # Utiliser exactement la même logique que les moniteurs
        from django.utils import timezone
        from datetime import timedelta

        # Calculer les jours restants
        days_remaining = None
        if driving_school.plan_end_date:
            days_remaining = (driving_school.plan_end_date - timezone.now().date()).days
            if days_remaining < 0:
                days_remaining = 0

        # Vérifier si le plan a expiré
        is_plan_expired = False
        if driving_school.plan_end_date and driving_school.plan_end_date < timezone.now().date():
            is_plan_expired = True

        # Utiliser le nouveau système de plans avec fallback
        current_plan_obj = driving_school.get_current_plan()
        current_plan_name = current_plan_obj.name if hasattr(current_plan_obj, 'name') else driving_school.current_plan

        # Permissions basées sur le plan (utiliser les nouvelles méthodes)
        can_manage_vehicles = driving_school.can_manage_vehicles()
        can_access_advanced_stats = driving_school.can_access_advanced_stats()
        can_manage_finances = driving_school.can_manage_finances()
        can_access_priority_support = driving_school.can_access_priority_support()

        # Retourner exactement les mêmes données que les moniteurs
        response_data = {
            'current_plan': current_plan_name,  # Maintenir compatibilité
            'plan_start_date': driving_school.plan_start_date.isoformat() if driving_school.plan_start_date else None,
            'plan_end_date': driving_school.plan_end_date.isoformat() if driving_school.plan_end_date else None,
            'days_remaining': days_remaining,
            'is_plan_expired': is_plan_expired,
            'max_accounts': driving_school.get_max_accounts(),  # Utilise la nouvelle méthode avec renewals
            'current_accounts': driving_school.current_accounts,
            'can_upgrade': False,  # Les étudiants ne peuvent pas upgrader
            'can_manage_vehicles': can_manage_vehicles,
            'can_access_advanced_stats': can_access_advanced_stats,
            'can_manage_finances': can_manage_finances,
            'can_access_priority_support': can_access_priority_support,
            'max_students': driving_school.get_max_accounts(),  # Utilise la même logique que max_accounts
            # Nouvelles informations du plan
            'plan_details': {
                'display_name': current_plan_obj.display_name if hasattr(current_plan_obj, 'display_name') else current_plan_name.title(),
                'price': float(current_plan_obj.price) if hasattr(current_plan_obj, 'price') else (49.0 if current_plan_name == 'standard' else 99.0),
                'features': current_plan_obj.features if hasattr(current_plan_obj, 'features') else {}
            }
        }

        print(f"🎓 Données d'abonnement pour étudiant: {response_data}")
        return Response(response_data)

    except Exception as e:
        print(f"❌ Erreur dans student_subscription_info_view: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_schedule_view(request, student_id):
    """Vue pour récupérer les séances d'un étudiant (version simple sans examens)"""
    user = request.user

    try:
        from django.shortcuts import get_object_or_404
        from schedules.models import Schedule

        # Vérifier les permissions
        if user.user_type == 'driving_school':
            # Auto-école peut voir les séances de ses étudiants
            student = get_object_or_404(Student, id=student_id, driving_school=user.driving_school)
        elif user.user_type == 'instructor':
            # Moniteur peut voir les séances des étudiants de son auto-école
            instructor = user.instructor_profile
            student = get_object_or_404(Student, id=student_id, driving_school=instructor.driving_school)
        elif user.user_type == 'student':
            # Étudiant peut voir seulement ses propres séances
            student = get_object_or_404(Student, id=student_id, user=user)
        else:
            return Response({'error': _('Accès non autorisé')},
                           status=status.HTTP_403_FORBIDDEN)

        # Récupérer les séances de l'étudiant
        schedules = Schedule.objects.filter(
            student=student
        ).select_related('instructor', 'vehicle').order_by('date', 'start_time')

        # Sérialiser les données
        from schedules.serializers import ScheduleListSerializer
        serializer = ScheduleListSerializer(schedules, many=True)

        return Response(serializer.data)

    except Student.DoesNotExist:
        return Response({'error': _('Étudiant non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_exams_view(request, student_id):
    """Vue pour récupérer les examens d'un étudiant (nouvelle version avec student_id)"""
    user = request.user

    try:
        from django.shortcuts import get_object_or_404
        from exams.models import Exam

        # Vérifier les permissions
        if user.user_type == 'driving_school':
            # Auto-école peut voir les examens de ses étudiants
            student = get_object_or_404(Student, id=student_id, driving_school=user.driving_school)
        elif user.user_type == 'instructor':
            # Moniteur peut voir les examens des étudiants de son auto-école
            instructor = user.instructor_profile
            student = get_object_or_404(Student, id=student_id, driving_school=instructor.driving_school)
        elif user.user_type == 'student':
            # Étudiant peut voir seulement ses propres examens
            student = get_object_or_404(Student, id=student_id, user=user)
        else:
            return Response({'error': _('Accès non autorisé')},
                           status=status.HTTP_403_FORBIDDEN)

        # Récupérer les examens de l'étudiant
        exams = Exam.objects.filter(
            student=student
        ).select_related('instructor').order_by('-exam_date')

        # Sérialiser les données
        exams_data = []
        for exam in exams:
            exams_data.append({
                'id': exam.id,
                'exam_type': exam.exam_type,
                'exam_date': exam.exam_date.isoformat(),
                'result': exam.result,
                'score': exam.score,
                'attempt_number': exam.attempt_number,
                'exam_location': exam.exam_location,
                'instructor_name': exam.instructor.full_name if exam.instructor else None,
                'notes': getattr(exam, 'notes', None),
            })

        return Response(exams_data)

    except Student.DoesNotExist:
        return Response({'error': _('Étudiant non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



