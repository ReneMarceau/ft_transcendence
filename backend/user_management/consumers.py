import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.accept()
            await self.channel_layer.group_add(
                f"user_{self.user.username}", self.channel_name
            )
            await self.update_status("online")

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                f"user_{self.user.username}", self.channel_name
            )
            await self.update_status("offline")

    async def receive(self, text_data):
        pass

    async def update_status(self, status):
        # Update status in the database
        profile = await self.get_profile()
        await self.set_profile_status(profile, status)

        # Notify friends
        friends = await self.get_friends(profile)
        for friend in friends:
            await self.channel_layer.group_send(
                f"user_{friend.user.username}",
                {
                    "type": "status_update",
                    "username": self.user.username,
                    "status": status,
                },
            )

    @database_sync_to_async
    def get_profile(self):
        from user_management.models import Profile

        return Profile.objects.get(user=self.user)

    @database_sync_to_async
    def set_profile_status(self, profile, status):
        profile.status = status
        profile.save()

    @database_sync_to_async
    def get_friends(self, profile):
        return list(profile.friends.all())

    async def status_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "username": event["username"],
                    "status": event["status"],
                }
            )
        )
