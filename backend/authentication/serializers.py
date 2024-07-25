from rest_framework import serializers
from user_management.models import User
from utils.utils import sanitize_input


class LoginSerializer(serializers.Serializer):
    """
    Serializer for handling user login.
    """

    username = serializers.CharField()
    password = serializers.CharField()

    class Meta:
        model = User
        fields = ["username", "password"]

    def validate_username(self, value):
        return sanitize_input(value)
