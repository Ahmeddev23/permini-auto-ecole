"""
ASGI config for permini_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'permini_project.settings')

# Initialiser Django avant d'importer les autres modules
django.setup()
django_asgi_app = get_asgi_application()

# Maintenant on peut importer les modules qui dépendent de Django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from messaging.routing import websocket_urlpatterns as messaging_websocket_urlpatterns
from admin_dashboard.routing import websocket_urlpatterns as admin_websocket_urlpatterns

# Combiner toutes les routes WebSocket
all_websocket_urlpatterns = messaging_websocket_urlpatterns + admin_websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            all_websocket_urlpatterns
        )
    ),
})
