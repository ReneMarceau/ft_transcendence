from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SignupView, LoginView

router = DefaultRouter()
router.register(r'signup', SignupView, basename='signup')
router.register(r'login', LoginView, basename='login')

urlpatterns = [
    path('', include(router.urls)),
]