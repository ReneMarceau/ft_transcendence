from django.db import models
from django.core.exceptions import ValidationError
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
        ONLINE = 'online', 'online'
        OFFLINE = 'offline', 'offline'
        IN_GAME = 'in_game', 'in game'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    alias = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to='avatars/', default=DEFAULT_AVATAR)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by', blank=True)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.OFFLINE)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def send_friend_request(self, receiver):
        from user_management.FriendRequest.models import FriendRequest
        if self == receiver:
            raise ValidationError("You cannot send a friend request to yourself.")
        if not FriendRequest.objects.filter(sender=self, receiver=receiver).exists():
            FriendRequest.objects.create(sender=self, receiver=receiver)

    def accept_friend_request(self, request):
        from user_management.FriendRequest.models import FriendRequest
        try:
            friend_request = FriendRequest.objects.get(receiver=self, sender=request.sender)
            friend_request.accept()
        except FriendRequest.DoesNotExist:
            raise ValidationError("Friend request does not exist.")

    def __str__(self):
        return self.user.username