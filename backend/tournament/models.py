from django.db import models

from user_management.models import Profile
from game.models import Game
# Create your models here.

class TournamentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ONGOING = 'ongoing', 'Ongoing'
    FINISHED = 'finished', 'Finished'

class Tournament(models.Model):
    players = models.ManyToManyField(Profile, related_name='tournaments', blank=True)
    max_players = models.PositiveIntegerField(default=4)
    winner = models.ForeignKey(Profile, on_delete=models.SET_NULL, related_name='won_tournaments', null=True, blank=True)
    status = models.CharField(max_length=20, choices=TournamentStatus.choices, default=TournamentStatus.PENDING)
    game_history = models.ManyToManyField(Game, related_name='tournament', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Tournament {self.id}"
    
    def is_full(self):
        return self.players.count() >= self.max_players
