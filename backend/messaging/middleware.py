from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import AnonymousUser
        from rest_framework.authtoken.models import Token

        User = get_user_model()
        token = Token.objects.get(key=token_key)
        return token.user
    except:
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Récupérer le token depuis les paramètres de query
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        
        token_key = None
        if 'token' in query_params:
            token_key = query_params['token'][0]
        
        if token_key:
            scope['user'] = await get_user_from_token(token_key)
        else:
            from django.contrib.auth.models import AnonymousUser
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
