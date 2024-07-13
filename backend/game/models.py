from django.db import models
from django.utils import timezone

# Create your models here.
from user_management.models import Profile


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
    type = models.CharField(max_length=20, choices=GameType.choices)
    status = models.CharField(max_length=20, choices=GameStatus.choices, default=GameStatus.CREATED)
    winner = models.ForeignKey(Profile, on_delete=models.SET_NULL, related_name='won_games', null=True, blank=True)
    player1 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='games_as_player2')
    score_player1 = models.PositiveIntegerField(default=0)
    score_player2 = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Game {self.id} - {self.type}"
    
    def save(self, *args, **kwargs):
        if self.status == GameStatus.FINISHED and not self.finished_at:
            self.finished_at = timezone.now()
            if self.score_player1 > self.score_player2:
                self.winner = self.player1
            elif self.score_player1 < self.score_player2:
                self.winner = self.player2
            else:
                self.winner = None
            
            # Update player statistics
            self.update_player_statistics()

        super(Game, self).save(*args, **kwargs)

    def update_player_statistics(self):
        from metrics.statistics.models import Statistic
        stats_player1 = Statistic.objects.get(profile=self.player1)
        stats_player2 = Statistic.objects.get(profile=self.player2)

        stats_player1.games_history.add(self)
        stats_player2.games_history.add(self)

        if self.winner == self.player1:
            stats_player1.games_won += 1
            stats_player2.games_lost += 1
        elif self.winner == self.player2:
            stats_player2.games_won += 1
            stats_player1.games_lost += 1

        stats_player1.save()
        stats_player2.save()