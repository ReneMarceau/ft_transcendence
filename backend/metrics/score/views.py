from rest_framework import viewsets

from .models import Score
from .serializers import ScoreSerializer

# Create your views here.
class ScoreViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Score model.
    """
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
