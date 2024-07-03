from django.urls import path
from .views import OAuth2CallbackView, redirect_to_42

urlpatterns = [
    path('redirect/', redirect_to_42, name='oauth2_redirect'),
    path('callback/', OAuth2CallbackView.as_view(), name='oauth2_callback'),
]