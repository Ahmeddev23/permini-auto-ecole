from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from .models import (
    AdminSession, AdminActionLog,
    SystemSettings, ContactFormSubmission, SystemAnnouncement, Coupon, AdminNotification
)
from driving_schools.models import DrivingSchool
from accounts.models import User
from instructors.models import Instructor
from students.models import Student


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs admin (basé sur User)"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'is_active', 'user_type', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'user_type']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class UserAdminSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs (vue admin)"""
    full_name = serializers.SerializerMethodField()
    driving_school_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'is_active', 'date_joined', 'last_login', 'driving_school_name'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_driving_school_name(self, obj):
        if hasattr(obj, 'driving_school') and obj.driving_school:
            return obj.driving_school.name
        return None


class AdminLoginSerializer(serializers.Serializer):
    """Serializer pour la connexion admin"""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        try:
            # Chercher un utilisateur avec le rôle admin ou administrateur
            admin_user = User.objects.get(
                username=username,
                is_active=True,
                user_type__in=['admin', 'administrateur']
            )
        except User.DoesNotExist:
            raise serializers.ValidationError("Identifiants invalides ou accès non autorisé")

        # Vérifier le mot de passe avec Django authenticate
        from django.contrib.auth import authenticate
        authenticated_user = authenticate(username=username, password=password)

        if not authenticated_user or authenticated_user != admin_user:
            raise serializers.ValidationError("Identifiants invalides")

        attrs['admin_user'] = admin_user
        return attrs


class AdminActionLogSerializer(serializers.ModelSerializer):
    """Serializer pour les logs d'actions admin"""
    admin_user_name = serializers.CharField(source='admin_user.username', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = AdminActionLog
        fields = [
            'id', 'admin_user', 'admin_user_name', 'action_type', 
            'action_type_display', 'target_model', 'target_id', 
            'description', 'ip_address', 'user_agent', 'created_at', 'metadata'
        ]
        read_only_fields = ['id', 'created_at']


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer pour les paramètres système"""
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = [
            'key', 'value', 'description', 'is_public', 
            'created_at', 'updated_at', 'updated_by', 'updated_by_name'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ContactFormSubmissionSerializer(serializers.ModelSerializer):
    """Serializer pour les soumissions de contact"""
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    responded_by_name = serializers.CharField(source='responded_by.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = ContactFormSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'status', 'status_display', 'priority', 'priority_display',
            'assigned_to', 'assigned_to_name', 'admin_response',
            'responded_at', 'responded_by', 'responded_by_name',
            'ip_address', 'user_agent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SystemAnnouncementSerializer(serializers.ModelSerializer):
    """Serializer pour les annonces système"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    target_audience_display = serializers.CharField(source='get_target_audience_display', read_only=True)
    announcement_type_display = serializers.CharField(source='get_announcement_type_display', read_only=True)
    
    class Meta:
        model = SystemAnnouncement
        fields = [
            'id', 'title', 'content', 'announcement_type', 'announcement_type_display',
            'target_audience', 'target_audience_display', 'is_active', 'start_date',
            'end_date', 'is_popup', 'is_dismissible', 'priority', 'created_by',
            'created_by_name', 'created_at', 'updated_at', 'view_count', 'click_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'view_count', 'click_count']


# Serializers pour la gestion des entités existantes
class DrivingSchoolAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour les auto-écoles"""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    current_accounts = serializers.IntegerField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = DrivingSchool
        fields = [
            'id', 'name', 'owner', 'owner_name', 'owner_email', 'address',
            'phone', 'email', 'status', 'current_plan', 'plan_start_date',
            'plan_end_date', 'max_accounts', 'current_accounts', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour les utilisateurs"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'is_active', 'is_verified', 'driving_school',
            'driving_school_name', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class InstructorAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour les moniteurs"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    
    class Meta:
        model = Instructor
        fields = [
            'id', 'user', 'user_email', 'driving_school', 'driving_school_name',
            'first_name', 'last_name', 'cin', 'phone', 'address',
            'license_number', 'hire_date', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StudentAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour les étudiants"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'user', 'user_email', 'driving_school', 'driving_school_name',
            'first_name', 'last_name', 'cin', 'phone', 'address',
            'date_of_birth', 'registration_date', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SystemStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques système"""
    total_driving_schools = serializers.IntegerField()
    active_driving_schools = serializers.IntegerField()
    pending_driving_schools = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_instructors = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_vehicles = serializers.IntegerField()
    upcoming_exams = serializers.IntegerField()
    new_registrations_today = serializers.IntegerField()
    new_registrations_week = serializers.IntegerField()
    pending_contact_forms = serializers.IntegerField()
    pending_payments = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    standard_schools = serializers.IntegerField()
    premium_schools = serializers.IntegerField()
    recent_logins = serializers.IntegerField()
    system_uptime = serializers.CharField()
    database_size = serializers.CharField()
    storage_used = serializers.CharField()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer pour les stats du dashboard admin"""
    users_online = serializers.IntegerField()
    messages_today = serializers.IntegerField()
    new_driving_schools_week = serializers.IntegerField()
    total_revenue_month = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_subscriptions = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    system_alerts = serializers.IntegerField()
    recent_activities = serializers.ListField()


class CouponSerializer(serializers.ModelSerializer):
    """Serializer pour les coupons"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    remaining_uses = serializers.ReadOnlyField()
    is_valid = serializers.ReadOnlyField()
    can_be_used = serializers.ReadOnlyField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'description', 'discount_percentage',
            'valid_from', 'valid_until', 'max_uses', 'current_uses',
            'remaining_uses', 'status', 'is_valid', 'can_be_used',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_uses', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'remaining_uses', 'is_valid', 'can_be_used']

    def validate_code(self, value):
        """Valider le code du coupon"""
        # Convertir en majuscules et supprimer les espaces
        value = value.upper().strip()

        # Vérifier l'unicité (sauf pour l'instance actuelle en cas de modification)
        queryset = Coupon.objects.filter(code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("Ce code de coupon existe déjà.")

        return value

    def validate_discount_percentage(self, value):
        """Valider le pourcentage de réduction"""
        if value <= 0 or value > 100:
            raise serializers.ValidationError("Le pourcentage doit être entre 0.01 et 100.")
        return value

    def validate(self, data):
        """Validation globale"""
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')

        if valid_from and valid_until and valid_from >= valid_until:
            raise serializers.ValidationError({
                'valid_until': 'La date de fin doit être postérieure à la date de début.'
            })

        max_uses = data.get('max_uses', 1)
        if max_uses < 1:
            raise serializers.ValidationError({
                'max_uses': 'Le nombre maximum d\'utilisations doit être au moins 1.'
            })

        return data




class CouponValidationSerializer(serializers.Serializer):
    """Serializer pour valider un coupon"""
    code = serializers.CharField(max_length=50)

    def validate_code(self, value):
        """Valider que le coupon existe et est utilisable"""
        try:
            coupon = Coupon.objects.get(code=value.upper().strip())
            if not coupon.can_be_used():
                if coupon.status == 'expired':
                    raise serializers.ValidationError("Ce coupon a expiré.")
                elif coupon.status == 'used_up':
                    raise serializers.ValidationError("Ce coupon a atteint sa limite d'utilisation.")
                elif coupon.status == 'inactive':
                    raise serializers.ValidationError("Ce coupon n'est pas actif.")
                else:
                    raise serializers.ValidationError("Ce coupon n'est pas valide.")
            return value
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Ce code de coupon n'existe pas.")


class AdminNotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications admin"""
    icon = serializers.CharField(source='get_icon', read_only=True)
    color_class = serializers.CharField(source='get_color_class', read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = AdminNotification
        fields = [
            'id', 'notification_type', 'title', 'message', 'priority',
            'related_driving_school_id', 'related_payment_id', 'related_user_id',
            'is_read', 'is_dismissed', 'created_at', 'read_at',
            'icon', 'color_class', 'time_ago'
        ]
        read_only_fields = ['created_at', 'read_at']

    def get_time_ago(self, obj):
        """Calculer le temps écoulé depuis la création"""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff.days > 0:
            return f"Il y a {diff.days} jour{'s' if diff.days > 1 else ''}"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"Il y a {hours} heure{'s' if hours > 1 else ''}"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
        else:
            return "À l'instant"
