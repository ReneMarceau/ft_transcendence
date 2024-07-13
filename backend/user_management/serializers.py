from rest_framework import serializers
from .models import User, Profile

class UserMeta:
    """
    Reusable Meta class for User-related serializers.
    """
    model = User
    fields = ['id', 'username', 'email', 'password', 'is_2fa_enabled', 'date_joined', 'last_login']
    read_only_fields = ['id', 'date_joined', 'last_login']
    extra_kwargs = {
        'password': {'write_only': True},
    }


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """
    class Meta(UserMeta):
        pass

    def create(self, validated_data):
        return User.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
    
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_2fa_enabled = validated_data.get('is_2fa_enabled', instance.is_2fa_enabled)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    from .FriendRequest.serializers import FriendRequestSerializer
    friend_requests_sent = serializers.SerializerMethodField()
    friend_requests_received = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user', 'alias', 'avatar', 'friends', 'blocked_users', 'status', 'friend_requests_sent', 'friend_requests_received']

    def get_friend_requests_sent(self, obj):
        from .FriendRequest.serializers import FriendRequestSerializer
        from .FriendRequest.models import FriendRequest
        friend_requests = FriendRequest.objects.filter(sender=obj)
        return FriendRequestSerializer(friend_requests, many=True).data
    
    def get_friend_requests_received(self, obj):
        from .FriendRequest.serializers import FriendRequestSerializer
        from .FriendRequest.models import FriendRequest
        friend_requests = FriendRequest.objects.filter(receiver=obj)
        return FriendRequestSerializer(friend_requests, many=True).data
