from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import Profile
from metrics.statistics.models import Statistic


@receiver(post_save, sender=get_user_model())
def create_profile(sender, instance, created, **kwargs):
    if created:
        profile = Profile.objects.create(user=instance, alias=instance.username)
        Statistic.objects.create(profile=profile)
    else:
        instance.profile.save()