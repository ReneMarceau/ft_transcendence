from django.contrib import admin

# Register your models here.
from .models import TodoItem

# This code registers the TodoItem model with the Django admin site.
admin.site.register(TodoItem)
