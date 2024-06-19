from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoItemViewSet

router = DefaultRouter()
router.register(r'todo', TodoItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]