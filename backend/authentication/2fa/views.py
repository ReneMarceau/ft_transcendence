import qrcode
from io import BytesIO
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class GenerateQRCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Retrieve the TOTP device
        device = get_object_or_404(TOTPDevice, user=user, name='default')
        
        # Generate QR code
        img = qrcode.make(device.config_url)
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)

        return HttpResponse(img_io, content_type='image/png')

@method_decorator(csrf_exempt, name='dispatch')
class VerifyTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        otp = request.data.get('otp')

        # Check if 2FA is enabled for the user
        if not user.is_2fa_enabled:
            return Response({'detail': '2FA is not enabled for this user.'}, status=400)
        
        # Check if the OTP token is provided
        if not otp:
            return Response({'detail': 'OTP token is required.'}, status=400)
        
        # Verify the OTP token
        device = get_object_or_404(TOTPDevice, user=user)
        if not device.verify_token(otp):
            return Response({'detail': 'Invalid OTP token.'}, status=400)
        
        device.confirmed = True
        device.save()
        return Response({'detail': 'OTP token verified successfully.'})

@method_decorator(csrf_exempt, name='dispatch')
class Enable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Check if 2FA is already enabled
        if hasattr(user, 'is_2fa_enabled') and user.is_2fa_enabled:
            return Response({'detail': '2FA is already enabled for this user.'}, status=400)
        
        # Check if a TOTP device already exists
        if TOTPDevice.objects.filter(user=user, name='default').exists():
            return Response({'detail': 'A TOTP device already exists for this user.'}, status=400)
        
        # Create a new TOTP device
        device = TOTPDevice.objects.create(user=user, name='default', confirmed=False)
        device.generate_challenge()
        device.save()

        # Enable 2FA for the user
        user.is_2fa_enabled = True
        user.save()
        return Response({'detail': '2FA enabled successfully.'}, status=200)
    
@method_decorator(csrf_exempt, name='dispatch')
class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Check if 2FA is already disabled
        if not hasattr(user, 'is_2fa_enabled') or not user.is_2fa_enabled:
            return Response({'detail': '2FA is not enabled for this user.'}, status=400)

        # Find and delete the TOTP device
        try:
            device = TOTPDevice.objects.get(user=user, name='default')
            device.delete()
        except TOTPDevice.DoesNotExist:
            return Response({'detail': 'No TOTP device found for this user.'}, status=400)

        # Disable 2FA for the user
        user.is_2fa_enabled = False
        user.save()

        return Response({'detail': '2FA disabled successfully.'}, status=200)