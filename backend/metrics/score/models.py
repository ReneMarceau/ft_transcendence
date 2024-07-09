from django.db import models
from user_management.models import Profile

class Score(models.Model):
    player = models.ForeignKey(Profile, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.player.alias} - {self.points}"