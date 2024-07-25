from django.urls import path, include

urlpatterns = [
    path("metrics/", include("metrics.statistics.urls")),
]
