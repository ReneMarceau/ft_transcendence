import requests
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import get_user_model, login

from rest_framework.response import Response
from rest_framework import status, views, permissions
from authentication.jwt.utils import generate_tokens_and_login


User = get_user_model()


class OAuth2CallbackView(views.APIView):
    """
    Handles the OAuth2 callback from 42 and returns a JWT token.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response(
                {"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            access_token = self.exchange_code_for_token(code)
            user_data = self.get_user_info(access_token)
            user, created = self.create_or_update_user(user_data)
            tokens = generate_tokens_and_login(request, user)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Redirect to frontend with tokens
        url = f'{settings.FRONTEND_URL}?refresh={tokens["refresh"]}&access={tokens["access"]}&expiration={tokens["expires"]}&detail={tokens["detail"]}'
        return redirect(url)

    def exchange_code_for_token(self, code):
        token_response = requests.post(
            "https://api.intra.42.fr/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.AUTH42_CLIENT_ID,
                "client_secret": settings.AUTH42_SECRET,
                "code": code,
                "redirect_uri": settings.AUTH42_REDIRECT_URI,
            },
        )
        token_response.raise_for_status()  # Raise an error for bad status codes
        token_data = token_response.json()

        if "access_token" not in token_data:
            raise ValueError("No access token found in response")

        return token_data["access_token"]

    def get_user_info(self, access_token):
        user_response = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_response.raise_for_status()  # Raise an error for bad status codes
        return user_response.json()

    def create_or_update_user(self, user_data):
        try:
            user = User.objects.get(email=user_data["email"])
            user.save()
            created = False
        except User.DoesNotExist:
            user, created = User.objects.update_or_create(
                username=user_data["login"],
                defaults={
                    "email": user_data["email"],
                },
            )
        return user, created


def redirect_to_42(request):
    return redirect(
        f"https://api.intra.42.fr/oauth/authorize?client_id={settings.AUTH42_CLIENT_ID}&redirect_uri={settings.AUTH42_REDIRECT_URI}&response_type=code"
    )
