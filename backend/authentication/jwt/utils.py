from rest_framework_simplejwt.tokens import RefreshToken
from utils.utils import timestamp_to_iso
from django.contrib.auth import login

def generate_tokens_and_login(request, user):
    login(request, user)
    refresh_token = RefreshToken.for_user(user)
    access_token = refresh_token.access_token
    expiration = timestamp_to_iso(access_token['exp'])
    return {
        'access': str(access_token),
        'expires': expiration,
        'refresh': str(refresh_token),
        'detail': 'Authentication successful.'
    }
