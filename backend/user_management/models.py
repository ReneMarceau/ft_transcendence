from django.db import models
from django.contrib.auth.models import AbstractUser

DEFAULT_AVATAR = 'avatars/default.png'

# Create your models here.
class User(AbstractUser):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(max_length=150)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    alias = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to='avatars/', default=DEFAULT_AVATAR)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True)
    ONLINE = 'online'
    OFFLINE = 'offline'
    IN_GAME = 'in_game'
    STATUS = (
        (ONLINE, 'Online'),
        (OFFLINE, 'Offline'),
        (IN_GAME, 'In Game')
    )
    status = models.CharField(max_length=10, choices=STATUS, default=OFFLINE)

    def __str__(self):
        return self.user.username