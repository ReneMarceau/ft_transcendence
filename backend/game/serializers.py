from rest_framework import serializers

from user_management.models import Profile
from user_management.serializers import ProfileSerializer
from .models import Game


class GameSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "id",
            "profile",
            "type",
            "status",
            "player1",
            "player2",
            "score_player1",
            "score_player2",
            "winner",
            "created_at",
            "finished_at",
        ]

    def get_profile(self, obj):
        return ProfileSerializer(obj.profile).data

    def create(self, validated_data):
        user = self.context["request"].user
        profile = Profile.objects.get(user=user)
        return Game.objects.create(profile=profile, **validated_data)

    def update(self, instance, validated_data):
        instance.type = validated_data.get("type", instance.type)
        instance.status = validated_data.get("status", instance.status)
        instance.player1 = validated_data.get("player1", instance.player1)
        instance.player2 = validated_data.get("player2", instance.player2)
        instance.score_player1 = validated_data.get(
            "score_player1", instance.score_player1
        )
        instance.score_player2 = validated_data.get(
            "score_player2", instance.score_player2
        )
        instance.winner = validated_data.get("winner", instance.winner)
        instance.created_at = validated_data.get("created_at", instance.created_at)
        instance.finished_at = validated_data.get("finished_at", instance.finished_at)
        instance.save()
        return instance
