from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Conversation, Message
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_type = serializers.CharField(source='sender.user_type', read_only=True)
    is_read = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('created_at', 'sender')


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un message"""

    class Meta:
        model = Message
        fields = ('message_type', 'content', 'file_attachment')

    def create(self, validated_data):
        # Associer l'expéditeur
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer pour les conversations"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    participants_names = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_participants_names(self, obj):
        return [participant.get_full_name() for participant in obj.participants.all()]
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'content': last_message.content,
                'sender_name': last_message.sender.get_full_name(),
                'created_at': last_message.created_at,
            }
        return None
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(
            read_by__isnull=True
        ).exclude(sender=user).count()


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une conversation"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    
    class Meta:
        model = Conversation
        fields = ('id', 'title', 'participant_ids')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids')
        user = self.context['request'].user

        # Déterminer l'auto-école selon le type d'utilisateur
        driving_school = None
        if hasattr(user, 'driving_school'):
            # Auto-école
            driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Moniteur
            driving_school = user.instructor_profile.driving_school
        elif user.user_type == 'student' and hasattr(user, 'student'):
            # Candidat
            driving_school = user.student.driving_school

        if not driving_school:
            raise serializers.ValidationError(_("Auto-école non trouvée"))

        validated_data['driving_school'] = driving_school
        conversation = super().create(validated_data)
        
        # Ajouter les participants
        conversation.participants.add(user)  # Ajouter le créateur
        
        # Ajouter les autres participants (vérifier qu'ils appartiennent à l'auto-école)
        for participant_id in participant_ids:
            try:
                # Vérifier si c'est un candidat
                participant = driving_school.students.get(user_id=participant_id).user
                conversation.participants.add(participant)
            except:
                try:
                    # Vérifier si c'est un moniteur
                    participant = driving_school.instructors.get(user_id=participant_id).user
                    conversation.participants.add(participant)
                except:
                    try:
                        # Vérifier si c'est l'auto-école
                        if driving_school.owner and driving_school.owner.id == participant_id:
                            conversation.participants.add(driving_school.owner)
                    except:
                        pass  # Ignorer les participants non valides
        
        return conversation


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des conversations"""
    participants_names = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ('id', 'title', 'participants_names',
                 'last_message_preview', 'unread_count', 'updated_at')
    
    def get_participants_names(self, obj):
        user = self.context['request'].user
        other_participants = obj.participants.exclude(id=user.id)
        return [participant.get_full_name() for participant in other_participants]
    
    def get_last_message_preview(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            content = last_message.content
            return content[:50] + '...' if len(content) > 50 else content
        return None
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(
            is_read=False
        ).exclude(sender=user).count()


class MessageListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des messages"""
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'message_type', 'content', 'file_attachment', 'sender', 'is_read', 'created_at', 'updated_at')

    def get_sender(self, obj):
        """Retourner les informations du sender"""
        if obj.sender:
            return {
                'id': obj.sender.id,
                'username': obj.sender.username,
                'first_name': obj.sender.first_name,
                'last_name': obj.sender.last_name,
                'user_type': obj.sender.user_type,
                'photo': None  # Pour l'instant, on peut ajouter la photo plus tard
            }
        return None
