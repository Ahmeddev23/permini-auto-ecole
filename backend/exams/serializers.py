from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Exam, ExamSession
from students.serializers import StudentListSerializer


class ExamSerializer(serializers.ModelSerializer):
    """Serializer pour les examens"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    
    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ('created_at',)


class ExamCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un examen"""
    
    class Meta:
        model = Exam
        fields = ('id', 'exam_type', 'exam_date', 'student', 'exam_location', 'examiner_notes')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school
        return super().create(validated_data)


class ExamUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un examen"""

    class Meta:
        model = Exam
        fields = ('exam_date', 'exam_location', 'examiner_notes', 'result', 'score', 'max_score', 'attempt_number')


class ExamListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des examens"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    
    class Meta:
        model = Exam
        fields = ('id', 'exam_type', 'exam_date', 'student_name', 'result', 'score')


class ExamSessionSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions d'examen"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    registered_students = serializers.SerializerMethodField()
    available_spots = serializers.ReadOnlyField()
    
    class Meta:
        model = ExamSession
        fields = '__all__'
        read_only_fields = ('created_at',)
    
    def get_registered_students(self, obj):
        return obj.exams.count()


class ExamSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une session d'examen"""
    
    class Meta:
        model = ExamSession
        fields = ('exam_type', 'session_date', 'start_time', 'end_time', 
                 'location', 'max_candidates', 'registration_deadline', 'notes')
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school
        return super().create(validated_data)


class ExamSessionUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour une session d'examen"""
    
    class Meta:
        model = ExamSession
        fields = ('session_date', 'start_time', 'end_time', 'location', 
                 'max_candidates', 'registration_deadline', 'notes', 'is_active')


class ExamRegistrationSerializer(serializers.Serializer):
    """Serializer pour l'inscription à un examen"""
    student_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_student_id(self, value):
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            try:
                student = user.driving_school.students.get(id=value)
                return value
            except:
                raise serializers.ValidationError(_("Candidat non trouvé"))
        raise serializers.ValidationError(_("Auto-école non trouvée"))


class ExamStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques d'examens"""
    total_exams = serializers.IntegerField()
    passed_exams = serializers.IntegerField()
    failed_exams = serializers.IntegerField()
    pending_exams = serializers.IntegerField()
    success_rate = serializers.FloatField()
    average_score = serializers.FloatField()
    exams_this_month = serializers.IntegerField()
    upcoming_exams = serializers.IntegerField()
