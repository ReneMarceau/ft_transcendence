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
        message = event["message"]
        sender = event.get("sender", None)
        receiver = event.get("receiver", None)
        sender_id = event.get("sender_id", None)
        receiver_id = event.get("receiver_id", None)

        await self.send(text_data=json.dumps({
            "message": message,
            "sender": sender,
            "receiver": receiver,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
        }))
    