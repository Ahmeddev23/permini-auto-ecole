from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Student
from accounts.serializers import UserSerializer


class StudentSerializer(serializers.ModelSerializer):
    """Serializer pour les candidats"""
    user = UserSerializer(read_only=True)
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ('registration_date', 'created_at', 'updated_at')


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un candidat"""
    
    class Meta:
        model = Student
        fields = ('id', 'user_id', 'first_name', 'last_name', 'cin', 'date_of_birth', 'phone',
                 'email', 'address', 'photo', 'license_type', 'payment_type',
                 'fixed_price', 'hourly_rate')
        read_only_fields = ('id', 'user_id')
    
    def validate(self, attrs):
        # Validation du type de paiement
        if attrs.get('payment_type') == 'fixed' and not attrs.get('fixed_price'):
            raise serializers.ValidationError(_("Prix fixe requis pour le paiement fixe"))
        
        if attrs.get('payment_type') == 'hourly' and not attrs.get('hourly_rate'):
            raise serializers.ValidationError(_("Tarif horaire requis pour le paiement à l'heure"))
        
        return attrs
    
    def create(self, validated_data):
        # La création de l'utilisateur est gérée dans la vue (perform_create)
        # Ici on crée seulement le profil étudiant
        return super().create(validated_data)


class StudentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un candidat"""

    class Meta:
        model = Student
        fields = (
            # Informations personnelles (sauf CIN et email)
            'first_name', 'last_name', 'phone', 'address', 'photo', 'date_of_birth',

            # Informations de formation
            'license_type', 'formation_status',

            # Informations de paiement
            'payment_type', 'fixed_price', 'hourly_rate',

            # Progression (modifiable par l'auto-école)
            'theory_hours_completed', 'practical_hours_completed',
            'theory_exam_attempts', 'practical_exam_attempts',

            # Statut
            'is_active'
        )

        # CIN et email ne sont pas modifiables
        read_only_fields = ('cin', 'email', 'user', 'driving_school',
                           'registration_date', 'created_at', 'updated_at')


class StudentProgressSerializer(serializers.ModelSerializer):
    """Serializer pour la progression du candidat"""
    
    class Meta:
        model = Student
        fields = ('theory_hours_completed', 'practical_hours_completed', 
                 'theory_exam_attempts', 'practical_exam_attempts', 'formation_status')
        read_only_fields = ('theory_exam_attempts', 'practical_exam_attempts')


class StudentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des candidats"""
    full_name = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = ('id', 'full_name', 'license_type', 'formation_status',
                 'registration_date', 'is_active', 'progress_percentage', 'photo',
                 'payment_type', 'total_amount', 'total_sessions', 'paid_amount', 'paid_sessions')


class StudentStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques d'un candidat"""
    total_theory_hours = serializers.IntegerField()
    total_practical_hours = serializers.IntegerField()
    completed_theory_hours = serializers.IntegerField()
    completed_practical_hours = serializers.IntegerField()
    theory_progress = serializers.FloatField()
    practical_progress = serializers.FloatField()
    total_payments = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_payments = serializers.DecimalField(max_digits=10, decimal_places=2)
    next_exam_date = serializers.DateTimeField(allow_null=True)
    last_lesson_date = serializers.DateField(allow_null=True)
