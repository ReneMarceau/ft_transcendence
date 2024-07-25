"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def api_root(request, format=None):
    return Response(
        {
            "users": reverse("user-list", request=request, format=format),
            "profiles": reverse("profile-list", request=request, format=format),
            "signup": reverse("signup", request=request, format=format),
            "login": reverse("login", request=request, format=format),
            "token": reverse("token_obtain_pair", request=request, format=format),
            "token_refresh": reverse("token_refresh", request=request, format=format),
            "oauth2_redirect": reverse(
                "oauth2_redirect", request=request, format=format
            ),
            "oauth2_callback": reverse(
                "oauth2_callback", request=request, format=format
            ),
            "generate_qr": reverse("generate_qr", request=request, format=format),
            "verify_token": reverse("verify_token", request=request, format=format),
            "enable_2fa": reverse("enable_2fa", request=request, format=format),
            "disable_2fa": reverse("disable_2fa", request=request, format=format),
            "games": reverse("game-list", request=request, format=format),
            "statistics": reverse("statistic-list", request=request, format=format),
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
    path("api/", include("user_management.urls")),
    path("api/", include("game.urls")),
    path("api/", include("metrics.urls")),
    path("", api_root),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
