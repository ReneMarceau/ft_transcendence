import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class Paddle:
    def __init__(self, side):
        self.side = side
        self.height = 0.1
        self.paddle_margin_x = 1 / 32
        self.paddle_margin_y = 1 / 48
        self.paddle_speed = 0
        if side == 1:
            self.x = 0.5
        else:
            self.x = 0.95
        self.y = 0.5 - self.height / 2
        self.init()

    def init(self):
        self.paddle_speed = 0
        self.y = 0.5 - self.height / 2

    def update(self, direction):
        if direction == "up":
            self.paddle_speed = -0.01
        elif direction == "down":
            self.paddle_speed = 0.01
        elif direction == "stop":
            self.paddle_speed = 0

    def move(self):
        if (self.y + self.paddle_speed - self.paddle_margin_y <= 0) or (
            self.y + self.paddle_margin_y + self.height + self.paddle_speed >= 1
        ):
            return self.y
        self.y += self.paddle_speed

    def get_position(self):
        return {"x": self.x, "y": self.y, "height": self.height}


class Game:
    def __init__(self, type, player1, game_id):
        self.id = game_id
        self.paddle1 = Paddle(1)
        self.paddle2 = Paddle(2)
        self.player1 = player1
        self.player2 = None
        self.score = {
            "id": game_id,
            "type": type,
            "Status": 0,
            "player1": player1,
            "player2": None,
            "score_player1": 0,
            "score_player2": 0,
            "winner": None,
            "created_at": None,
            "finished_at": None,
        }
        self.state = "waiting"
        self.p1_ready = False
        self.p2_ready = False
        self.p1_disconnected = False
        self.p2_disconnected = True
        self.winner = None
        self.message = ""


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.accept()
            await self.channel_layer.group_add(
                f"user_{self.user.username}", self.channel_name
            )
            logger.info(f"User {self.user.username} connected.")
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                f"user_{self.user.username}", self.channel_name
            )
            logger.info(f"User {self.user.username} disconnected.")

    async def receive(self, text_data=None, bytes_data=None):
        if not self.user.is_authenticated:
            logger.warning("Unauthorized message received.")
            return

        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get("message", "")
            await self.send(
                text_data=json.dumps({"response": "Message received: " + message})
            )
            logger.info(f"Message from {self.user.username}: {message}")
        except json.JSONDecodeError:
            logger.error("Failed to decode JSON from message.")
            await self.send(text_data=json.dumps({"error": "Invalid JSON format"}))
