from rest_framework import viewsets

from .models import Statistic
from .serializers import StatisticSerializer

# Create your views here.
class StatisticViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Statistic model.
    """
    queryset = Statistic.objects.all()
    serializer_class = StatisticSerializer
