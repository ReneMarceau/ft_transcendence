from rest_framework import serializers
from django.core.exceptions import ValidationError

from .models import User, Profile
from utils.utils import sanitize_input


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "is_2fa_enabled",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        validated_data["username"] = sanitize_input(validated_data["username"])
        validated_data["email"] = sanitize_input(validated_data["email"])

        try:
            user = User.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
            )
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return user

    def update(self, instance, validated_data):
        if "username" in validated_data:
            instance.username = sanitize_input(
                validated_data.get("username", instance.username)
            )
        if "email" in validated_data:
            instance.email = sanitize_input(validated_data.get("email", instance.email))

        instance.is_2fa_enabled = validated_data.get(
            "is_2fa_enabled", instance.is_2fa_enabled
        )
        if "password" in validated_data:
            instance.set_password(validated_data["password"])
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    friend_requests_sent = serializers.SerializerMethodField()
    friend_requests_received = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "user",
            "alias",
            "avatar",
            "friends",
            "blocked_users",
            "status",
            "friend_requests_sent",
            "friend_requests_received",
        ]

    def validate_alias(self, value):
        return sanitize_input(value)

    def get_friend_requests_sent(self, obj):
        from user_management.FriendRequest.models import FriendRequest
        from user_management.FriendRequest.serializers import FriendRequestSerializer

        friend_requests = FriendRequest.objects.filter(sender=obj)
        return FriendRequestSerializer(friend_requests, many=True).data

    def get_friend_requests_received(self, obj):
        from user_management.FriendRequest.models import FriendRequest
        from user_management.FriendRequest.serializers import FriendRequestSerializer

        friend_requests = FriendRequest.objects.filter(receiver=obj)
        return FriendRequestSerializer(friend_requests, many=True).data
