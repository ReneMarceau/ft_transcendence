from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed

from .models import User, Profile
from .FriendRequest.models import FriendRequest
from user_management.serializers import UserSerializer, ProfileSerializer
from authentication.permissions import IsOwnerOrReadOnly, IsAdminUserOrReadOnly
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly


class BaseViewSet(viewsets.ModelViewSet):
    """
    A base view set to provide common functionality for update, partial update, and destroy actions.
    """

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(
            {
                "detail": f"{self.get_serializer().Meta.model.__name__} updated successfully."
            },
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "detail": f"{self.get_serializer().Meta.model.__name__} updated successfully."
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response(
            {
                "detail": f"{self.get_serializer().Meta.model.__name__} deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT,
        )


class UserViewSet(BaseViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUserOrReadOnly]
        elif self.action in ["retrieve", "update", "partial_update", "destroy"]:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            "POST",
            detail="User creation is not allowed via this endpoint. Please use the auth/signup endpoint.",
        )


class ProfileViewSet(BaseViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAdminUserOrReadOnly]
        elif self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed(
            "POST",
            detail="Profile creation is not allowed via this endpoint. Profiles are created automatically when a user is created.",
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def send_friend_request(self, request, pk=None):
        receiver = self.get_object()
        sender = request.user.profile

        if sender == receiver:
            return Response(
                {"detail": "You cannot send a friend request to yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if FriendRequest.objects.filter(sender=sender, receiver=receiver).exists():
            return Response(
                {"detail": "Friend request already sent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if FriendRequest.objects.filter(sender=receiver, receiver=sender).exists():
            return Response(
                {"detail": "Friend request already received."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sender.send_friend_request(receiver)
        return Response(
            {"detail": "Friend request sent successfully."},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def accept_friend_request(self, request, pk=None):
        sender = self.get_object()
        receiver = request.user.profile

        try:
            friend_request = FriendRequest.objects.get(sender=sender, receiver=receiver)
            friend_request.accept()
            return Response(
                {"detail": "Friend request accepted successfully."},
                status=status.HTTP_200_OK,
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def decline_friend_request(self, request, pk=None):
        sender = self.get_object()
        receiver = request.user.profile

        try:
            friend_request = FriendRequest.objects.get(sender=sender, receiver=receiver)
            friend_request.delete()
            return Response(
                {"detail": "Friend request declined successfully."},
                status=status.HTTP_200_OK,
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def cancel_friend_request(self, request, pk=None):
        receiver = self.get_object()
        sender = request.user.profile

        try:
            friend_request = FriendRequest.objects.get(sender=sender, receiver=receiver)
            friend_request.delete()
            return Response(
                {"detail": "Friend request cancelled successfully."},
                status=status.HTTP_200_OK,
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def remove_friend(self, request, pk=None):
        friend = self.get_object()
        user = request.user.profile

        if not user.friends.filter(pk=friend.pk).exists():
            return Response(
                {"detail": "User is not your friend."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.friends.remove(friend)
        friend.friends.remove(user)
        return Response(
            {"detail": "Friend removed successfully."}, status=status.HTTP_200_OK
        )
