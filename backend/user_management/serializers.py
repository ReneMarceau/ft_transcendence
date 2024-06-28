from rest_framework import serializers
from .models import User, Profile

class UserMeta:
    """
    Reusable Meta class for User-related serializers.
    """
    model = User
    fields = ['id', 'username', 'email', 'password', 'date_joined', 'last_login']
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
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Profile model.
    """
    class Meta:
        model = Profile
        fields = ['user', 'alias', 'avatar', 'friends', 'blocked_users', 'status']