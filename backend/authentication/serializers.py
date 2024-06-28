from rest_framework import serializers
from user_management.models import User


class LoginSerializer(serializers.Serializer):
    """
    Serializer for handling user login.
    """
    username = serializers.CharField()
    password = serializers.CharField()

    class Meta:
        model = User
        fields = ['username', 'password']