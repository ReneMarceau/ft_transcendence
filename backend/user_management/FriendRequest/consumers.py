from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # Handle any incoming WebSocket messages if necessary

    async def friend_request(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'friend_request',
            'message': message,
            'sender': event['sender'],
            'sender_id': event['sender_id'],
        }))

    async def friendship_accepted(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'friendship_accepted',
            'message': message,
        }))