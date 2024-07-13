from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfileViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profiles/<int:pk>/send_friend_request/', ProfileViewSet.as_view({'post': 'send_friend_request'}), name='send_friend_request'),
    path('profiles/<int:pk>/accept_friend_request/', ProfileViewSet.as_view({'post': 'accept_friend_request'}), name='accept_friend_request'),
]