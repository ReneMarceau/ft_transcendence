from django.contrib.auth import authenticate

from rest_framework import status, views, permissions
from rest_framework.response import Response

from user_management.serializers import UserSerializer
from .serializers import LoginSerializer
from .jwt.utils import generate_tokens_and_login
from utils.utils import sanitize_input


# Create your views here.
class SignupView(views.APIView):
    """
    View for creating a new user.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        sanitized_data = {
            "username": sanitize_input(request.data.get("username", "")),
            "email": sanitize_input(request.data.get("email", "")),
            "password": request.data.get("password", ""),
            "is_2fa_enabled": request.data.get("is_2fa_enabled", False),
        }

        serializer = UserSerializer(data=sanitized_data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = generate_tokens_and_login(request, user)
            tokens["detail"] = "User created successfully."
            return Response(tokens, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    """
    View for logging in a user.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        sanitized_data = {
            "username": sanitize_input(request.data.get("username", "")),
            "password": request.data.get("password", ""),
        }

        serializer = LoginSerializer(data=sanitized_data)
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            password = serializer.validated_data["password"]
            user = authenticate(request, username=username, password=password)
            if user is not None:
                is_2fa_enabled = user.is_2fa_enabled
                tokens = generate_tokens_and_login(request, user)
                tokens["detail"] = "User logged in successfully."
                return Response(
                    {"is_2fa_enabled": is_2fa_enabled, **tokens},
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
