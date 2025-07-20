from django.http import JsonResponse
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
import json


class DrivingSchoolApprovalMiddleware:
    """
    Middleware pour vérifier que les auto-écoles sont approuvées
    avant d'accéder aux ressources protégées
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # URLs qui ne nécessitent pas d'approbation
        self.exempt_urls = [
            '/api/auth/',
            '/api/admin/',
            '/administrateur_permini/',
            '/media/',
            '/static/',
            '/waiting',
            '/api/driving-schools/status/',  # Pour vérifier le statut
        ]
    
    def __call__(self, request):
        # Vérifier si l'URL est exemptée
        if any(request.path.startswith(url) for url in self.exempt_urls):
            return self.get_response(request)
        
        # Vérifier seulement pour les utilisateurs authentifiés de type driving_school
        if (hasattr(request, 'user') and 
            request.user.is_authenticated and 
            request.user.user_type == 'driving_school'):
            
            try:
                driving_school = request.user.driving_school
                
                # Si l'auto-école n'est pas approuvée, bloquer l'accès
                if driving_school.status != 'approved':
                    
                    # Pour les requêtes API, retourner JSON
                    if request.path.startswith('/api/'):
                        status_messages = {
                            'pending': _('Votre auto-école est en attente d\'approbation'),
                            'rejected': _('Votre auto-école a été rejetée'),
                            'suspended': _('Votre auto-école a été suspendue')
                        }
                        
                        return JsonResponse({
                            'error': status_messages.get(driving_school.status, _('Accès non autorisé')),
                            'status': driving_school.status,
                            'redirect': '/waiting'
                        }, status=403)
                    
                    # Pour les autres requêtes, rediriger vers la page d'attente
                    from django.shortcuts import redirect
                    return redirect('/waiting')
                    
            except Exception as e:
                # En cas d'erreur, permettre la requête de continuer
                # (l'utilisateur sera géré par les vues individuelles)
                pass
        
        return self.get_response(request)
