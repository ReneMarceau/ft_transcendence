from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed

from .models import User, Profile
from user_management.serializers import UserSerializer, ProfileSerializer
from authentication.permissions import IsOwnerOrReadOnly, IsAdminUserOrReadOnly
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

class BaseViewSet(viewsets.ModelViewSet):
    """
    A base view set to provide common functionality for update, partial update, and destroy actions.
    """
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({'detail': f'{self.get_serializer().Meta.model.__name__} updated successfully.'}, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            updated_fields = {field: serializer.validated_data[field] for field in serializer.validated_data}
            return Response({
                'detail': f'{self.get_serializer().Meta.model.__name__} updated successfully.',
                'updated_fields': updated_fields
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({'detail': f'{self.get_serializer().Meta.model.__name__} deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class UserViewSet(BaseViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAdminUserOrReadOnly]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed("POST", detail="User creation is not allowed via this endpoint. Please use the auth/signup endpoint.")

class ProfileViewSet(BaseViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed("POST", detail="Profile creation is not allowed via this endpoint. Profiles are created automatically when a user is created.")
