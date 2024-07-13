from rest_framework import serializers

from user_management.models import Profile
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    player1 = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all())
    player2 = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), required=False, allow_null=True)
    winner = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Game
        fields = ['id', 'type', 'status', 'player1', 'player2', 'score_player1', 'score_player2', 'winner', 'created_at', 'finished_at']

    def create(self, validated_data):
        return Game.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.type = validated_data.get('type', instance.type)
        instance.status = validated_data.get('status', instance.status)
        instance.player1 = validated_data.get('player1', instance.player1)
        instance.player2 = validated_data.get('player2', instance.player2)
        instance.score_player1 = validated_data.get('score_player1', instance.score_player1)
        instance.score_player2 = validated_data.get('score_player2', instance.score_player2)
        instance.winner = validated_data.get('winner', instance.winner)
        instance.created_at = validated_data.get('created_at', instance.created_at)
        instance.finished_at = validated_data.get('finished_at', instance.finished_at)
        instance.save()
        return instance

