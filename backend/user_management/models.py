from django.db import models
from django.contrib.auth.models import AbstractUser

DEFAULT_AVATAR = 'avatars/default.png'

# Create your models here.
class User(AbstractUser):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(max_length=150)
    is_2fa_enabled = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    @classmethod
    def create_user(cls, username, email, password):
        user = cls(username=username, email=email)
        user.set_password(password)
        user.save()
        return user

    def __str__(self):
        return self.username
    
class Profile(models.Model):
    class StatusChoices(models.TextChoices):
        ONLINE = 'online', 'Online'
        OFFLINE = 'offline', 'Offline'
        IN_GAME = 'in_game', 'In Game'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    alias = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to='avatars/', default=DEFAULT_AVATAR)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.OFFLINE)

    def __str__(self):
        return self.user.username