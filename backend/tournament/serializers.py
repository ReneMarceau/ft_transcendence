from rest_framework import serializers

from user_management.models import Profile
from .models import Tournament

class TournamentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Tournament model.
    """
    players = serializers.PrimaryKeyRelatedField(many=True, queryset=Profile.objects.all())
    winner = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all())
    game_history = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['id', 'players', 'max_players', 'winner', 'status', 'game_history', 'created_at', 'finished_at']
        
