from rest_framework import serializers

from user_management.models import Profile
from metrics.score.serializers import ScoreSerializer
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    """
    Serializer for the Game model.
    """
    players = serializers.PrimaryKeyRelatedField(many=True, queryset=Profile.objects.all())
    scores = ScoreSerializer(many=True)
    winner = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all())

    class Meta:
        model = Game
        fields = ['id', 'type', 'status', 'players', 'scores', 'winner', 'created_at', 'finished_at']
