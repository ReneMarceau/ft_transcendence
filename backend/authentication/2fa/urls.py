from django.urls import path, include
from .views import GenerateQRCodeView, VerifyTokenView, Enable2FAView, Disable2FAView

urlpatterns = [
    path('generate-qr/', GenerateQRCodeView.as_view(), name='generate_qr'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify_token'),
    path('enable-2fa/', Enable2FAView.as_view(), name='enable_2fa'),
    path('disable-2fa/', Disable2FAView.as_view(), name='disable_2fa'),
]