from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.http import Http404

from .models import Exam, ExamSession
from .serializers import (
    ExamSerializer, ExamCreateSerializer, ExamUpdateSerializer, ExamListSerializer,
    ExamSessionSerializer, ExamSessionCreateSerializer, ExamSessionUpdateSerializer,
    ExamRegistrationSerializer, ExamStatsSerializer
)


class ExamListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les examens"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExamCreateSerializer
        return ExamListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Exam.objects.none()

        if hasattr(user, 'driving_school'):
            queryset = user.driving_school.exams.all()
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            queryset = user.student_profile.exams.all()

        # Filtres par paramètres GET
        exam_type = self.request.query_params.get('type')
        result = self.request.query_params.get('result')
        student_id = self.request.query_params.get('student')

        if exam_type:
            queryset = queryset.filter(exam_type=exam_type)
        if result:
            queryset = queryset.filter(result=result)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        return queryset.order_by('-exam_date')


class ExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un examen"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExamUpdateSerializer
        return ExamSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.exams.all()
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            return user.student_profile.exams.all()
        return Exam.objects.none()


class ExamSessionListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les sessions d'examen"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExamSessionCreateSerializer
        return ExamSessionSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'owned_driving_school'):
            return user.owned_driving_school.exam_sessions.all()
        return ExamSession.objects.none()


class ExamSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une session d'examen"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExamSessionUpdateSerializer
        return ExamSessionSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.exam_sessions.all()
        return ExamSession.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_for_exam_view(request, session_id):
    """Vue pour inscrire un candidat à une session d'examen"""
    user = request.user

    if not hasattr(user, 'owned_driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    try:
        exam_session = user.owned_driving_school.exam_sessions.get(id=session_id)
    except ExamSession.DoesNotExist:
        return Response({'error': _('Session d\'examen non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    serializer = ExamRegistrationSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    student_id = serializer.validated_data['student_id']
    notes = serializer.validated_data.get('notes', '')

    try:
        student = user.owned_driving_school.students.get(id=student_id)
    except:
        return Response({'error': _('Candidat non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Vérifier si le candidat n'est pas déjà inscrit
    existing_exam = Exam.objects.filter(
        student=student,
        exam_type=exam_session.exam_type,
        exam_date=exam_session.session_date,
        result='pending'
    ).first()

    if existing_exam:
        return Response({'error': _('Le candidat est déjà inscrit à cette session')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Vérifier la disponibilité
    if exam_session.available_spots <= 0:
        return Response({'error': _('Plus de places disponibles')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Créer l'examen
    exam = Exam.objects.create(
        driving_school=user.owned_driving_school,
        student=student,
        exam_type=exam_session.exam_type,
        exam_date=exam_session.session_date,
        location=exam_session.location,
        notes=notes
    )

    serializer = ExamSerializer(exam)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def exam_stats_view(request):
    """Vue pour les statistiques d'examens"""
    user = request.user

    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Statistiques générales
    total_exams = driving_school.exams.count()
    passed_exams = driving_school.exams.filter(result='passed').count()
    failed_exams = driving_school.exams.filter(result='failed').count()
    pending_exams = driving_school.exams.filter(result='pending').count()

    success_rate = (passed_exams / total_exams * 100) if total_exams > 0 else 0

    # Score moyen
    average_score = driving_school.exams.filter(
        score__isnull=False
    ).aggregate(avg_score=Avg('score'))['avg_score'] or 0

    # Examens du mois en cours
    current_month = timezone.now().replace(day=1)
    next_month = (current_month + timedelta(days=32)).replace(day=1)

    exams_this_month = driving_school.exams.filter(
        exam_date__gte=current_month.date(),
        exam_date__lt=next_month.date()
    ).count()

    # Examens à venir (7 prochains jours)
    next_week = timezone.now() + timedelta(days=7)
    upcoming_exams = driving_school.exams.filter(
        exam_date__gte=timezone.now().date(),
        exam_date__lte=next_week.date(),
        result='pending'
    ).count()

    stats = {
        'total_exams': total_exams,
        'passed_exams': passed_exams,
        'failed_exams': failed_exams,
        'pending_exams': pending_exams,
        'success_rate': success_rate,
        'average_score': average_score,
        'exams_this_month': exams_this_month,
        'upcoming_exams': upcoming_exams,
    }

    serializer = ExamStatsSerializer(stats)
    return Response(serializer.data)
