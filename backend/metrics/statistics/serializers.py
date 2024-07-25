from rest_framework import serializers

from .models import Statistic
from game.serializers import GameSerializer


class StatisticSerializer(serializers.ModelSerializer):
    game_history = serializers.SerializerMethodField()

    class Meta:
        model = Statistic
        fields = ["profile", "games_won", "games_lost", "game_history"]

    def get_game_history(self, obj):
        games = obj.games_history.all()
        return GameSerializer(games, many=True).data
