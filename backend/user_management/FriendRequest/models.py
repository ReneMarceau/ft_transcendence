from django.db import models
from user_management.models import Profile

class FriendRequest(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['sender', 'receiver']
        verbose_name = 'Friend Request'
        verbose_name_plural = 'Friend Requests'

    def accept(self):
        if self.sender.friends.filter(id=self.receiver.id).exists():
            raise ValueError("Users are already friends.")
        self.sender.friends.add(self.receiver)
        self.receiver.friends.add(self.sender)
        self.delete()

    def __str__(self):
        return f"Friend request from {self.sender} to {self.receiver}"
    