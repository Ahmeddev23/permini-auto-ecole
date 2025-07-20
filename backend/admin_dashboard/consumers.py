import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import AdminSession

class AdminNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Connexion WebSocket pour les notifications admin"""
        print("🔗 Tentative de connexion WebSocket admin notifications")
        
        # Accepter la connexion immédiatement
        await self.accept()
        
        # Ajouter au groupe des notifications admin
        await self.channel_layer.group_add(
            "admin_notifications",
            self.channel_name
        )
        
        print("✅ WebSocket admin notifications connecté et ajouté au groupe")
        
        # Envoyer un message de confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'WebSocket admin notifications connecté'
        }))

    async def disconnect(self, close_code):
        """Déconnexion WebSocket"""
        print(f"🔌 Déconnexion WebSocket admin notifications: {close_code}")
        
        # Retirer du groupe des notifications admin
        await self.channel_layer.group_discard(
            "admin_notifications",
            self.channel_name
        )

    async def receive(self, text_data):
        """Recevoir des messages du client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Répondre au ping pour maintenir la connexion
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except Exception as e:
            print(f"❌ Erreur dans receive admin notifications: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Erreur serveur'
            }))

    async def admin_notification(self, event):
        """Envoyer une notification admin au client"""
        try:
            print(f"📨 Envoi notification admin via WebSocket: {event['notification']['title']}")
            
            # Envoyer la notification au client
            await self.send(text_data=json.dumps({
                'type': 'admin_notification',
                'notification': event['notification']
            }))
            
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de la notification admin: {e}")

    @database_sync_to_async
    def verify_admin_session(self, session_key):
        """Vérifier si la session admin est valide"""
        try:
            session = AdminSession.objects.get(
                session_key=session_key,
                is_active=True,
                expires_at__gt=timezone.now()
            )
            return session.admin_user
        except AdminSession.DoesNotExist:
            return None
