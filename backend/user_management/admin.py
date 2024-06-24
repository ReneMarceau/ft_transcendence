from django.contrib import admin

# Register your models here.
from .models import User, Profile

# This code registers the models with the Django admin site.
admin.site.register(User)
admin.site.register(Profile)