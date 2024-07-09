from django.contrib import admin

# Register your models here.
from .score.models import Score
from .statistics.models import Statistic

admin.site.register(Score)
admin.site.register(Statistic)
