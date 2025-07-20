import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import DirectMessage

User = get_user_model()

def get_user_photo_url(user, profile=None):
    """Helper function to get user photo URL"""
    # First check if user has a photo
    if user.photo:
        return user.photo.url

    # Then check profile-specific photos
    if profile and hasattr(profile, 'photo') and profile.photo:
        return profile.photo.url

    return None

class MessagingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accepter TOUTES les connexions sans condition
        await self.accept()
        print("✅ WebSocket connecté - en attente d'authentification")

        # Initialiser les variables
        self.user = None
        self.user_group_name = None
        self.authenticated = False

        # Envoyer un message de bienvenue
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'WebSocket connecté, veuillez vous authentifier'
        }))

    async def disconnect(self, close_code):
        # Quitter le groupe de l'utilisateur seulement s'il était authentifié
        if hasattr(self, 'user_group_name') and self.user_group_name:
            print(f"🔍 Tentative de déconnexion du groupe: '{self.user_group_name}' (type: {type(self.user_group_name)})")

            # S'assurer que c'est une string
            if not isinstance(self.user_group_name, str):
                print(f"❌ Le nom du groupe n'est pas une string: {type(self.user_group_name)}")
                return

            # Vérifier que le nom du groupe est valide
            if self.is_valid_group_name(self.user_group_name):
                try:
                    await self.channel_layer.group_discard(
                        self.user_group_name,
                        self.channel_name
                    )
                    print(f"✅ Déconnecté du groupe: {self.user_group_name}")
                except Exception as e:
                    print(f"⚠️ Erreur lors de la déconnexion du groupe: {e}")
            else:
                print(f"❌ Nom de groupe invalide: '{self.user_group_name}' (longueur: {len(self.user_group_name)})")
        else:
            print("🔍 Pas de groupe à quitter (utilisateur non authentifié)")

        username = getattr(self, 'user', None)
        if username:
            username = getattr(username, 'username', 'Anonyme')
        else:
            username = 'Anonyme'
        print(f"❌ WebSocket déconnecté pour l'utilisateur {username}")

    def is_valid_group_name(self, name):
        """Vérifier si le nom du groupe est valide selon les règles de Channels"""
        import re
        if not name or len(name) >= 100:
            return False
        # Seuls les caractères ASCII alphanumériques, tirets, underscores et points sont autorisés
        return re.match(r'^[a-zA-Z0-9._-]+$', name) is not None

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'authenticate':
                await self.handle_authenticate(data)
            elif message_type == 'send_message':
                if not self.authenticated:
                    await self.send_error('Non authentifié')
                    return
                await self.handle_send_message(data)
            elif message_type == 'mark_read':
                if not self.authenticated:
                    await self.send_error('Non authentifié')
                    return
                await self.handle_mark_read(data)

        except Exception as e:
            print(f"❌ Erreur dans receive: {e}")
            await self.send_error('Erreur serveur')

    async def handle_authenticate(self, data):
        try:
            token = data.get('token')
            if not token:
                await self.send_error('Token requis')
                return

            user = await self.authenticate_user(token)
            if not user:
                await self.send_error('Token invalide')
                return

            self.user = user
            self.authenticated = True
            self.user_group_name = f"user_{self.user.id}"

            print(f"🔍 Création du groupe: '{self.user_group_name}' pour l'utilisateur {self.user.username}")

            # Vérifier que le nom du groupe est valide
            if not self.is_valid_group_name(self.user_group_name):
                print(f"❌ Nom de groupe invalide: '{self.user_group_name}'")
                await self.send_error('Erreur de configuration du groupe')
                return

            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )

            await self.send(text_data=json.dumps({
                'type': 'authenticated',
                'user': {
                    'id': self.user.id,
                    'username': self.user.username,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                    'user_type': self.user.user_type
                }
            }))

            print(f"✅ WebSocket authentifié pour {self.user.username}")

        except Exception as e:
            print(f"❌ Erreur authentification: {e}")
            await self.send_error('Erreur d\'authentification')

    async def send_error(self, message):
        """Envoyer un message d'erreur"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    async def handle_send_message(self, data):
        """Gérer l'envoi d'un message"""
        try:
            recipient_id = data.get('recipient_id')
            content = data.get('content', '').strip()
            
            if not recipient_id or not content:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Destinataire et contenu requis'
                }))
                return
            
            # Créer le message dans la base de données
            message = await self.create_message(self.user.id, recipient_id, content)
            
            if message:
                # Get sender and recipient profiles for photos
                sender_profile = await self.get_user_profile(message.sender)
                recipient_profile = await self.get_user_profile(message.recipient)

                # Envoyer le message au destinataire
                await self.channel_layer.group_send(
                    f"user_{recipient_id}",
                    {
                        'type': 'new_message',
                        'message': {
                            'id': message.id,
                            'content': message.content,
                            'sender': {
                                'id': message.sender.id,
                                'first_name': message.sender.first_name,
                                'last_name': message.sender.last_name,
                                'photo': get_user_photo_url(message.sender, sender_profile)
                            },
                            'recipient': {
                                'id': message.recipient.id,
                                'first_name': message.recipient.first_name,
                                'last_name': message.recipient.last_name,
                                'photo': get_user_photo_url(message.recipient, recipient_profile)
                            },
                            'created_at': message.created_at.isoformat(),
                            'is_read': message.is_read
                        }
                    }
                )

                # Confirmer l'envoi à l'expéditeur
                await self.send(text_data=json.dumps({
                    'type': 'message_sent',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'sender': {
                            'id': message.sender.id,
                            'first_name': message.sender.first_name,
                            'last_name': message.sender.last_name,
                            'photo': get_user_photo_url(message.sender, sender_profile)
                        },
                        'recipient': {
                            'id': message.recipient.id,
                            'first_name': message.recipient.first_name,
                            'last_name': message.recipient.last_name,
                            'photo': get_user_photo_url(message.recipient, recipient_profile)
                        },
                        'created_at': message.created_at.isoformat(),
                        'is_read': message.is_read
                    }
                }))
                
        except Exception as e:
            print(f"Erreur lors de l'envoi du message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Erreur lors de l\'envoi du message'
            }))

    async def handle_mark_read(self, data):
        """Marquer les messages comme lus"""
        try:
            sender_id = data.get('sender_id')
            if sender_id:
                await self.mark_messages_read(sender_id, self.user.id)

                # Notifier l'expéditeur que ses messages ont été lus
                await self.channel_layer.group_send(
                    f"user_{sender_id}",
                    {
                        'type': 'messages_read',
                        'reader_id': self.user.id
                    }
                )

                # Notifier aussi le lecteur pour mettre à jour ses compteurs
                await self.send(text_data=json.dumps({
                    'type': 'messages_read',
                    'sender_id': sender_id
                }))

                print(f"✅ Messages marqués comme lus: {sender_id} -> {self.user.id}")

        except Exception as e:
            print(f"Erreur lors du marquage comme lu: {e}")

    async def new_message(self, event):
        """Recevoir un nouveau message et l'envoyer au client"""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message']
        }))

    async def messages_read(self, event):
        """Notifier que des messages ont été lus"""
        await self.send(text_data=json.dumps({
            'type': 'messages_read',
            'reader_id': event['reader_id']
        }))

    @database_sync_to_async
    def get_user_profile(self, user):
        """Get user profile for photo"""
        try:
            if user.user_type == 'student' and hasattr(user, 'student'):
                return user.student
            elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
                return user.instructor_profile
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du profil: {e}")
            return None

    @database_sync_to_async
    def create_message(self, sender_id, recipient_id, content):
        """Créer un message dans la base de données"""
        try:
            sender = User.objects.get(id=sender_id)
            recipient = User.objects.get(id=recipient_id)

            # Vérifier que les utilisateurs appartiennent à la même auto-école
            # (même logique que dans les vues REST)

            message = DirectMessage.objects.create(
                sender=sender,
                recipient=recipient,
                content=content
            )
            return message
        except Exception as e:
            print(f"Erreur lors de la création du message: {e}")
            return None

    @database_sync_to_async
    def authenticate_user(self, token):
        """Authentifier un utilisateur par token"""
        try:
            from rest_framework.authtoken.models import Token
            token_obj = Token.objects.get(key=token)
            return token_obj.user
        except Token.DoesNotExist:
            return None
        except Exception as e:
            print(f"Erreur lors de l'authentification: {e}")
            return None

    @database_sync_to_async
    def mark_messages_read(self, sender_id, recipient_id):
        """Marquer les messages comme lus"""
        try:
            DirectMessage.objects.filter(
                sender_id=sender_id,
                recipient_id=recipient_id,
                is_read=False
            ).update(is_read=True)
        except Exception as e:
            print(f"Erreur lors du marquage comme lu: {e}")

    async def notification_created(self, event):
        """Envoyer une nouvelle notification"""
        await self.send(text_data=json.dumps({
            'type': 'notification_created',
            'notification': event['notification']
        }))




