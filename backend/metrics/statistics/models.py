from django.db import models
from user_management.models import Profile
from game.models import Game


class Statistic(models.Model):
    profile = models.OneToOneField(
        Profile, on_delete=models.CASCADE, related_name="statistics"
    )
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    games_history = models.ManyToManyField(Game, related_name="history")

    def __str__(self):
        return f"{self.profile.alias} - {self.games_won} - {self.games_lost}"
