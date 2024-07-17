export class LocalController {
	constructor(player1 = "player1", player2 = "player2") {
		this.paddle1 = new Paddle(player1, "right")
		this.paddle2 = new Paddle(player2, "left")
		this.player1 = player1
		this.player2 = player2
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.start_timer_s = ""
		this.reset()
		this.running = true
		this.stop = true
		this.ball.in_play = false

		this.restart_time_ms = 0
		this.message = "press space to start the game"

	}

	cleanup() {
		console.log("cleanup controller")
		document.removeEventListener("keydown", this.handleKeyDown);
		document.removeEventListener("keyup", this.handleKeyUp);
	}

	init() {
		console.log("init controller")
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
	}

	getWinner(){
		if (this.player1Score === 3)
			return this.player1
		else if (this.player2Score === 3)
			return this.player2
	}

	handleKeyDown(e) {
		if(e.code === 'KeyS') this.paddle1.move_down = true;
		if (e.code === 'KeyW') this.paddle1.move_up = true;
		if (e.key === 'ArrowDown') this.paddle2.move_down = true;
		if (e.key === 'ArrowUp') this.paddle2.move_up = true;
	}

	handleKeyUp(e) {
		if (e.code === 'KeyS') this.paddle1.move_down = false;
		if (e.code === 'KeyW') this.paddle1.move_up = false;
		if (e.key === 'ArrowDown') this.paddle2.move_down = false;
		if (e.key === 'ArrowUp') this.paddle2.move_up = false;
		if (e.code === 'Space' && this.stop === true) {
			console.log("space pressed")
			this.stop = false;
			this.message = ""
			this.start_timer_s = 3
			this.countdown()
		}
	}

	countdown() {
		if (this.start_timer_s > 0) {
			setTimeout(() => {
				this.start_timer_s--
				this.countdown()
			}, 1000)
		}
		else
			this.ball.in_play = true
	}

	reset() {
		this.ball.in_play = false
		this.ball.reset()
	}


	update() {
		let retval = "none"
		if (this.ball.in_play) {
			this.paddle1.move()
			this.paddle2.move()
			if (Date.now() > this.restart_time_ms && this.running) {
				retval = this.ball.move(this.paddle1, this.paddle2)
				if (retval != "none") {
					if (retval === "right")
						this.player1Score++
					else
						this.player2Score++
					if (this.player1Score === 3) {
						// player 1 wins
						this.message = "The winner is " + this.paddle1.name
						this.running = false
					}
					else if (this.player2Score === 3) {
						// player 2 wins
						this.message = "The winner is " + this.paddle2.name
						this.running = false
					}
					this.ball.in_play = false
					this.restart_time_ms = Date.now() + 1000
					this.ball.reset()
				}
			}
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1: this.player1,
			player2: this.player2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.message,
			start_timer_s: this.start_timer_s,
		}
	}
}

export class AIController {
	constructor(player1 = "player1", player2 = "AI") {
		this.paddle1 = new Paddle(player1, "right")
		this.paddle2 = new Paddle(player2, "left")
		this.player1 = player1
		this.player2 = "AI"
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.start_timer_s = ""
		this.reset()
		this.running = true
		this.stop = true
		this.ball.in_play = false

		this.restart_time_ms = 0
		this.message = "press space to start the game"


		this.lastAIUpdateTime = Date.now();
        this.aiUpdateInterval = 1000; // 1 second in milliseconds

		this.predictedY = null;
	}

	cleanup() { }

	init() {
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
		document.addEventListener("keyup", (event) => {
			if (event.code === 'Space' && this.stop === true) {
				console.log("space pressed")
				this.stop = false;
				this.message = ""
				this.start_timer_s = 3
				this.countdown()
			}
		});
	}

	handleKeyDown(e) {
		if (e.code === 'KeyS') this.paddle1.move_down = true;
		if (e.code === 'KeyW') this.paddle1.move_up = true;
	}

	handleKeyUp(e) {
		if (e.code === 'KeyS') this.paddle1.move_down = false;
		if (e.code === 'KeyW') this.paddle1.move_up = false;
	}

	countdown() {
		if (this.start_timer_s > 0) {
			setTimeout(() => {
				this.start_timer_s--
				this.countdown()
			}, 1000)
		}
		else
			this.ball.in_play = true
	}

	reset() {
		this.ball.in_play = false
		this.ball.reset()
	}

	predictBallPosition() {
		const ballFutureX = this.ball.x + this.ball.dir.x * this.aiUpdateInterval / 1000 * this.ball.speed;
		const ballFutureY = this.ball.y + this.ball.dir.y * this.aiUpdateInterval / 1000 * this.ball.speed;

		if (ballFutureX > 1 - this.ball.radius || ballFutureX < this.ball.radius) {
			this.ball.dir.x *= -1;
			this.ball.dir.norm();
		}
		if (ballFutureY > 1 - this.ball.radius || ballFutureY < this.ball.radius) {
			this.ball.dir.y *= -1;
			this.ball.dir.norm();
		}
		return this.ball.y + this.ball.dir.y * (Math.abs(this.ball.x - this.paddle2.x) / Math.abs(this.ball.dir.x));
	}

	AImove(paddle) {
		if (this.predictedY === null) return;
		if (this.ball.x < 0.5) return;
		const paddleCenterY = paddle.y + paddle.paddleHeight / 2;
		if (Math.abs(this.predictedY - paddleCenterY) < 0.01) {
			paddle.move_up = false;
			paddle.move_down = false;
		}else if (this.predictedY > paddle.y + paddle.paddleHeight / 2) {
			paddle.move_up = false;
			paddle.move_down = true;
		} else if (this.predictedY < paddle.y + paddle.paddleHeight / 2) {
			paddle.move_up = true;
			paddle.move_down = false;
		} else {
			paddle.move_up = false;
			paddle.move_down = false;
		}
	}

	update() {

		let retval = "none"
		if (this.ball.in_play) {
			const currentTime = Date.now();
			if (currentTime - this.lastAIUpdateTime >= this.aiUpdateInterval) {
				this.predictedY = this.predictBallPosition();
				this.lastAIUpdateTime = currentTime;
			}
			this.AImove(this.paddle2);
			this.paddle1.move()
			this.paddle2.move()
			if (Date.now() > this.restart_time_ms && this.running) {
				retval = this.ball.move(this.paddle1, this.paddle2)
				if (retval != "none") {
					if (retval === "right")
						this.player1Score++
					else
						this.player2Score++
					if (this.player1Score === 3) {
						// player 1 wins
						this.message = "The winner is " + this.paddle1.name
						this.running = false
					}
					else if (this.player2Score === 3) {
						// player 2 wins
						this.message = "The winner is " + this.paddle2.name
						this.running = false
					}
					this.ball.in_play = false
					this.restart_time_ms = Date.now() + 1000
					this.ball.reset()
				}
			}
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1: this.player1,
			player2: this.player2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.message,
			start_timer_s: this.start_timer_s,
		}
	}
}

export class RemoteController {
	constructor() {
		this.paddle1 = new Paddle("player1", "right")
		this.paddle2 = new Paddle("player2", "left")
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.start_timer_s = 3
		this.running = true
		this.ball.in_play = false

		this.restart_time_ms = 0

		this.serverMsg = {}
		this.localMsg = ""
		this.stop = false
		this.eventRemover = new AbortController()
		this.localMsg = ""
	}

	cleanup() {
		try {
			this.websocket.close()
		}
		catch (e) { }
		this.eventRemover.abort()
		this.stop = true
	}

	update() {
		if (this.stop)
			return
		if (this.serverMsg.command === "data")
			return this.serverMsg
		if (this.serverMsg.player1Score === 3 || this.serverMsg.player2Score === 3) { // Game over
			this.running = false
			return this.serverMsg
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			message: this.localMsg,
			start_timer_s: this.start_timer_s
		}
	}


	async init() {
		await this.initSocket()
		this.initEventListener();
	}

	async initSocket() {
		this.websocket = new WebSocket(`wss://${window.location.host}/ws/game/`)
	}

	initEventListener() {
		if (this.websocket === undefined) {
			console.log("Websocket is undefined")
			return
		}

		this.websocket.onopen = (e) => {
			console.log("opening websocket")
		}
		this.websocket.error = (e) => {
			console.log("Error: ", e)
			this.websocket.send("disconnection")
		}

		this.websocket.onclose = (e) => {
			console.log(e)
			console.log("disconnection")
		}

		this.websocket.onmessage = (e) => {
			const msg = JSON.parse(e.data)
			console.log(msg)
			switch (msg.command) {
				case "serverfull":
					this.message = "Server full, retry later"
					break
				case "wait":
					this.websocket.send("wait")
					this.message = "Wait for another player"
					this.msg = msg
					this.running = false
					break;
				case "getready":
					if (this.state != "running") {
						this.websocket.send("getready")
						this.state = "getready"
					}
					this.message = "Press space \n to start the game"
					this.msg = msg
					break;
				case "data":
					this.msg = msg
					break;
				case "ending":
					this.running = false
					this.msg = msg
					break
			}
		}

		document.addEventListener("keydown", (e) => {
			if (!this.isSocketConnected())
				return
			if (this.state === "running") {
				if (e.key === 'ArrowDown')
					this.websocket.send("down")
				else if (e.key === 'ArrowUp')
					this.websocket.send("up")
			}
		})

		document.addEventListener("keyup", (e) => {
			if (!this.isSocketConnected())
				return
			console.log(this.state)
			if (this.state === "running" && this.state === "running")
				this.websocket.send("stop")
			if (e.code === 'Space' && this.state === "getready") {
				this.websocket.send("ready")
				console.log("sending ready")
				this.state = "running"
			}
		})
	}

	isSocketConnected() {
		if (this.websocket.readyState != 3) //3	CLOSED
			return true
		return false
	}
}


class Ball {
	constructor() {
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
		this.speed = 1 / 120
		this.in_play = false
		this.reset()
	}

	reset() {
		this.x = 1 / 2
		this.y = 1 / 2
		let dirX = Math.random() * 2 - 1
		this.dir = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1)
		if (this.dir.x < 0)
			this.dir.x = Math.min(-0.5)
		else
			this.dir.x = Math.max(0.5)
		this.dir.norm()
		this.in_play = true
		this.speed = 1 / 120
		this.speed_timer = this.getTimeNow() + 5;
	}

	getTimeNow() {
		const d = new Date()
		return d.getTime() / 1000;
	}

	move(paddle1, paddle2) {
		this.x += this.speed * this.dir.x
		this.y += this.speed * this.dir.y
		this.checkTopWallCollision()
		this.checkPaddleCollision(paddle1, paddle2)
		return this.checkSideWallCollision()
	}

	checkSideWallCollision() {
		if (this.x >= 1 - this.radius)
			return "right"
		else if (this.x <= 0 + this.radius)
			return "left"
		return "none"
	}

	checkTopWallCollision() {
		if ((this.y <= this.radius && this.dir.y <= 0) || (this.y >= 1 - this.radius && this.dir.y >= 0))
			this.dir.y *= -1
	}

	checkPaddleCollision(paddle1, paddle2) {
		if (this.isCollidingRightPaddle(paddle2)) {
			this.dir.x = -0.5
			let diff = this.y - (paddle2.y + paddle2.paddleHeight / 2)
			this.dir.y = diff * 0.866025403784439 / (paddle2.paddleHeight)
			this.dir.norm();
		}
		if (this.isCollidingLeftPaddle(paddle1)) {
			this.dir.x = 0.5
			let diff = this.y - (paddle1.y + paddle1.paddleHeight / 2)
			this.dir.y = diff * 0.866025403784439 / (paddle2.paddleHeight)
			this.dir.norm();
		}
	}

	isCollidingLeftPaddle(paddle) {
		return this.x - this.radius <= paddle.x && this.x - this.radius > paddle.paddle_margin_x / 2 && this.y + (this.radius / 2) >= paddle.y && this.y - (this.radius / 2) <= paddle.y + paddle.paddleHeight && this.dir.x < 0
	}

	isCollidingRightPaddle(paddle) {
		return this.x + this.radius >= paddle.x && this.x + this.radius < 1 - (paddle.paddle_margin_x / 2) && this.y + (this.radius / 2) >= paddle.y && this.y - (this.radius / 2) <= paddle.y + paddle.paddleHeight && this.dir.x > 0
	}
}

class Vector {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	norm() {
		let mag = Math.sqrt((this.x * this.x) + (this.y * this.y))

		if (mag != 0) {
			this.x /= mag
			this.y /= mag
		}
	}
}

class Paddle {
	constructor(playerName, side) {
		this.x = 0
		this.height = 0.1
		this.paddle_margin_x = 1 / 32
		this.paddle_margin_y = 1 / 48
		this.paddle_speed = 1 / 100
		this.name = playerName
		this.paddleHeight = 1 / 8
		this.y = (1 / 2) - (this.paddleHeight / 2)
		this.top = this.y
		this.bottom = this.y - this.paddleHeight
		this.move_up = false
		this.move_down = false
		if (side === "right")
			this.x = this.paddle_margin_x
		else
			this.x = 1 - this.paddle_margin_x
	}

	move() {
		if (this.y + this.paddleHeight >= 1 - this.paddle_margin_y)
			this.move_down = false
		else if (this.y <= this.paddle_margin_y)
			this.move_up = false

		if (this.move_up)
			this.y -= this.paddle_speed
		else if (this.move_down)
			this.y += this.paddle_speed

		this.top = this.y
		this.bottom = this.y - this.paddleHeight / 2
	}
}