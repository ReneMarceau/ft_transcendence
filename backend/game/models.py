from django.db import models

# Create your models here.
from user_management.models import Profile
from metrics.score.models import Score

class GameType(models.TextChoices):
    """Choices for the type of game."""
    VS_AI = 'vs_ai', 'Versus AI'
    ONE_VS_ONE = '1vs1', '1 vs 1'
    TOURNAMENT = 'tournament', 'Tournament'

class GameStatus(models.TextChoices):
    """Choices for the status of a game."""
    CREATED = 'created', 'Created'
    STARTED = 'started', 'Started'
    FINISHED = 'finished', 'Finished'

class Game(models.Model):
    """Model for a game."""
    type = models.CharField(max_length=20, choices=GameType.choices)
    status = models.CharField(max_length=20, choices=GameStatus.choices, default=GameStatus.CREATED)
    players = models.ManyToManyField(Profile, related_name='games', blank=True)
    scores = models.ManyToManyField(Score, related_name='games')
    winner = models.ForeignKey(Profile, on_delete=models.SET_NULL, related_name='won_games', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Game {self.id} - {self.type}"