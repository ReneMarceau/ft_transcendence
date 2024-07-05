# views.py in oauth folder

import requests
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import get_user_model, login

from rest_framework.response import Response
from rest_framework import status, views
from rest_framework_simplejwt.tokens import RefreshToken

from utils.utils import timestamp_to_iso


User = get_user_model()

class OAuth2CallbackView(views.APIView):
    """
    Handles the OAuth2 callback from 42 and returns a JWT token.
    """
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            access_token = self.exchange_code_for_token(code)
            user_data = self.get_user_info(access_token)
            user = self.create_or_update_user(user_data)
            login(request, user)
            tokens = self.generate_tokens(user)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Redirect to frontend with tokens
        url = f'{settings.FRONTEND_URL}/oauth?refresh={tokens["refresh"]}&access={tokens["access"]}&expiration={tokens["expiration"]}&detail={tokens["detail"]}'
        return redirect(url)

    def exchange_code_for_token(self, code):
        token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
            'grant_type': 'authorization_code',
            'client_id': settings.AUTH42_CLIENT_ID,
            'client_secret': settings.AUTH42_SECRET,
            'code': code,
            'redirect_uri': settings.AUTH42_REDIRECT_URI,
        })
        token_response.raise_for_status()  # Raise an error for bad status codes
        token_data = token_response.json()

        if 'access_token' not in token_data:
            raise ValueError('No access token found in response')

        return token_data['access_token']

    def get_user_info(self, access_token):
        user_response = requests.get('https://api.intra.42.fr/v2/me', headers={
            'Authorization': f'Bearer {access_token}'
        })
        user_response.raise_for_status()  # Raise an error for bad status codes
        return user_response.json()

    def create_or_update_user(self, user_data):
        user, created = User.objects.update_or_create(
            username=user_data['login'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
            }
        )
        return user

    def generate_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        expiration = timestamp_to_iso(access_token['exp'])
        return {
            'refresh': str(refresh),
            'access': str(access_token),
            'expiration': expiration,
            'detail': 'User authenticated successfully with 42.'
        }

def redirect_to_42(request):
    return redirect(f'https://api.intra.42.fr/oauth/authorize?client_id={settings.AUTH42_CLIENT_ID}&redirect_uri={settings.AUTH42_REDIRECT_URI}&response_type=code')
