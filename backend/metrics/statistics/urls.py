from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StatisticViewSet

router = DefaultRouter()
router.register(r"statistics", StatisticViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
