# urls.py

from django.urls import path

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import SignupView, LoginView
from .oauth.views import OAuth2CallbackView, redirect_to_42

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('oauth2/redirect/', redirect_to_42, name='oauth2_redirect'),
    path('oauth2/callback/', OAuth2CallbackView.as_view(), name='oauth2_callback'),
]
