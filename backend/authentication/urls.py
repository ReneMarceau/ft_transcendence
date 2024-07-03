from django.urls import path, include
from .views import SignupView, LoginView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', include('authentication.jwt.urls')),
    path('oauth2/', include('authentication.oauth.urls')),
    path('2fa/', include('authentication.2fa.urls')),
]
