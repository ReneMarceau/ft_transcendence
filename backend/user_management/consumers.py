# # user_management/consumers.py

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import sync_to_async
# from django.contrib.auth import get_user_model
# import redis

# User = get_user_model()
# r = redis.StrictRedis(host='localhost', port=6379, db=0)

# class StatusConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         if self.scope["user"].is_anonymous:
#             await self.close()
#         else:
#             self.user = self.scope["user"]
#             await self.set_user_status(self.user.id, "online")
#             await self.accept()

#     async def disconnect(self, close_code):
#         await self.set_user_status(self.user.id, "offline")

#     async def receive(self, text_data):
#         pass  # No need to handle incoming messages for status updates

#     @sync_to_async
#     def set_user_status(self, user_id, status):
#         r.set(f"user_{user_id}_status", status)
#         # You can also update the User model or a custom Profile model if needed.
