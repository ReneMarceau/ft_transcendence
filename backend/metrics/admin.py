from django.contrib import admin

# Register your models here.
from .statistics.models import Statistic

admin.site.register(Statistic)
