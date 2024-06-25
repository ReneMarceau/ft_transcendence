from django.db import models

from user_management.models import User

# Create your models here.

class Game():
    player1 = models.OneToOneField(User, on_delete=models.CASCADE)

    player2 = models.OneToOneField(User, on_delete=models.CASCADE)
    # score = 
    # winner = 
    status = models.CharField(max_length=10)
    time = models.DateTimeField(auto_now_add=True)