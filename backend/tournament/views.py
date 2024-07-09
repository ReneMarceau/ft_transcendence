from rest_framework import viewsets

from .models import Tournament
from .serializers import TournamentSerializer

# Create your views here.
class TournamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Tournament model.
    """
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
