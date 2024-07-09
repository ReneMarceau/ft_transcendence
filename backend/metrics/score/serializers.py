from rest_framework import serializers

from .models import Score
from user_management.models import Profile

class ScoreSerializer(serializers.ModelSerializer):
    """
    Serializer for the Score model.
    """
    player = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all())

    class Meta:
        model = Score
        fields = ['id', 'player', 'points']
