from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from .models import AdminSession
from accounts.models import User


class AdminAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware pour gérer l'authentification des admins
    """
    
    def process_request(self, request):
        # Vérifier si c'est une requête admin
        if request.path.startswith('/api/admin/'):
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if auth_header.startswith('AdminSession '):
                session_key = auth_header.replace('AdminSession ', '')
                
                try:
                    # Récupérer la session admin
                    admin_session = AdminSession.objects.select_related('admin_user__user').get(
                        session_key=session_key,
                        is_active=True
                    )
                    
                    # Vérifier si la session n'a pas expiré
                    from django.utils import timezone
                    if admin_session.expires_at > timezone.now():
                        # Attacher la session admin à la requête
                        request.admin_session = admin_session
                        # Attacher l'utilisateur admin à la requête
                        request.user = admin_session.admin_user.user
                        return None
                    else:
                        # Session expirée
                        admin_session.is_active = False
                        admin_session.save()
                        
                except AdminSession.DoesNotExist:
                    pass
            
            # Si pas d'authentification valide pour une route admin
            return JsonResponse({
                'error': 'Authentication required',
                'message': 'Session admin invalide ou expirée'
            }, status=401)
        
        return None
