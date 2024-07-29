from django.urls import re_path
from . import consumers
from .FriendRequest.consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r"ws/status/", consumers.StatusConsumer.as_asgi()),
    re_path(r"ws/notifications/", NotificationConsumer.as_asgi()),
]
