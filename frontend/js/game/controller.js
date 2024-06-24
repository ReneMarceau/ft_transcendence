export class LocalController {
	constructor(player1 = "player1", player2 = "player2") {
		this.paddle1 = new Paddle(player1, "right")
		this.paddle2 = new Paddle(player2, "left")
		this.player1 = player1
		this.player2 = player2
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 3
		this.reset()
		this.running = true
		this.stop = false
		this.ball.in_play = false

		this.restartTimestamp = 0

		this.startTime = Date.now();
	}

	cleanup() { }

	init() {
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
	}

	handleKeyDown(e) {
		if (e.code === 'KeyS') this.paddle1.move_down = true;
		if (e.code === 'KeyW') this.paddle1.move_up = true;
		if (e.key === 'ArrowDown') this.paddle2.move_down = true;
		if (e.key === 'ArrowUp') this.paddle2.move_up = true;
	}

	handleKeyUp(e) {
		if (e.code === 'KeyS') this.paddle1.move_down = false;
		if (e.code === 'KeyW') this.paddle1.move_up = false;
		if (e.key === 'ArrowDown') this.paddle2.move_down = false;
		if (e.key === 'ArrowUp') this.paddle2.move_up = false;
	}

	countdown() {
		if (this.startTimer > 0) {
			setTimeout(() => {
				this.startTimer--
				this.countdown()
			}, 1000)
		}
		else
			this.ball.in_play = true
	}

	reset() {
		this.startTimer = 3
		this.ball.in_play = false
		this.ball.reset()
		this.countdown()
	}


	update() {
		let retval = "none"
		if (this.ball.in_play) {
			this.paddle1.move()
			this.paddle2.move()
			console.log(this.ball.speed)
			if (Date.now() > this.restartTimestamp && this.running) {
				this.ball.updateSpeed(); // Update speed after some delay
				retval = this.ball.move(this.paddle1, this.paddle2)
				if (retval != "none") {
					if (retval == "right")
						this.player1Score++
					else
						this.player2Score++
					if (this.player1Score == 3) {
						// player 1 wins
						this.running = false
					}
					else if (this.player2Score == 3) {
						// player 2 wins
						this.running = false
					}
					this.ball.in_play = false
					this.restartTimestamp = Date.now() + 1000
					this.ball.reset()
				}
			}
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			startTimer: this.startTimer,
		}
	}
}

export class AIController {
	constructor(player1 = "player1", player2 = "AI") {
		this.paddle1 = new Paddle(player1, "right")
		this.paddle2 = new Paddle(player2, "left")
		this.player1 = player1
		this.player2 = player2
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 3
		this.reset()
		this.running = true
		this.stop = false
		this.ball.in_play = false

		this.restartTimestamp = 0

		this.startTime = Date.now();
	}

	cleanup() { }

	init() {
		document.addEventListener("keydown", this.handleKeyDown.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
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
		if (this.startTimer > 0) {
			setTimeout(() => {
				this.startTimer--
				this.countdown()
			}, 1000)
		}
		else
			this.ball.in_play = true
	}

	reset() {
		this.startTimer = 3
		this.ball.in_play = false
		this.ball.reset()
		this.countdown()
	}

	AImove(paddle) {
		// paddle.paddle_speed = Math.random() / 250

		if (this.ball.x > 0.5) {
			if (this.ball.y > paddle.y + (paddle.paddleHeight / 2)) {
				paddle.move_up = true
				paddle.move_down = false
			}
			else {
				paddle.move_up = false
				paddle.move_down = true
			}
			if (this.ball.y < paddle.y + (paddle.paddleHeight / 2)) {
				paddle.move_up = true
				paddle.move_down = false
			}
			else {
				paddle.move_up = false
				paddle.move_down = true
			}
		}
		else {
			paddle.move_up = false
			paddle.move_down = false
		}
	}

	update() {

		let retval = "none"
		if (this.ball.in_play) {
			this.AImove(this.paddle2)
			this.paddle1.move()
			this.paddle2.move()
			if (Date.now() > this.restartTimestamp && this.running) {
				this.ball.updateSpeed(); // Update speed after some delay
				retval = this.ball.move(this.paddle1, this.paddle2)
				if (retval != "none") {
					if (retval == "right")
						this.player1Score++
					else
						this.player2Score++
					if (this.player1Score == 3) {
						// player 1 wins
						this.running = false
					}
					else if (this.player2Score == 3) {
						// player 2 wins
						this.running = false
					}
					this.ball.in_play = false
					this.restartTimestamp = Date.now() + 1000
					this.ball.reset()
				}
			}
		}
		return {
			ball: this.ball,
			paddle1: this.paddle1,
			paddle2: this.paddle2,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			startTimer: this.startTimer,
		}
	}
}

class RemoteController {
	constructor() {
		this.paddle1 = new Paddle("player1", "right")
		this.paddle2 = new Paddle("player2", "left")
		this.ball = new Ball()
		this.player1Score = 0
		this.player2Score = 0
		this.startTimer = 3
		this.reset()
		this.running = true
		this.ball.in_play = false
		
		this.restartTimestamp = 0
		
		this.startTime = Date.now();
		
		this.stop = false
		this.address = window.location.hostname
		this.eventRemover = new AbortController()
		this.localMsg = ""
	}

	cleanup () {
		try 
		{
			this.websocket.close()
		}
		catch (e) {}
		this.eventRemover.abort()
		this.stop = true
	}

	update() {
		if (this.stop)
			return
	}


	async init(){
		await this.initSocket()
		this.initEventListener();
	}

	async initSocket() {
		this.websocket = new WebSocket(`ws://${this.address}/game/`)
		await new Promise((resolve, reject) => {
			this.websocket.onopen = resolve
		})
	
	}

	initEventListener() {
		if (this.websocket == undefined) //assert
			return
		
		this.websocket.onclose = (e) => {
			if (this.timeout == false) {
				this.localMsg = "A player has left the game"
			}
			else
				this.localMsg = "You waited too long to press space"
		}
	}
}


class Ball {
	constructor() {
		this.radius = 1 / 50
		this.x = 0
		this.y = 0
		this.speed = 0.01
		this.speed_timer = 5
		this.reset()
	}

	updateSpeed() {
		if (this.speed_timer > 0) {
			setTimeout(() => {
				this.speed_timer--
				this.updateSpeed()
			}, 1000)
		}
		else {
			this.speed += this.speed / 5000;
			this.speed_timer = 5;
		}
		console.log(this.speed);
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
		this.speed = 0.01
		this.speed_timer = 5
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
		if (this.y <= this.radius || this.y >= 1 - this.radius)
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
		return this.x - this.radius <= paddle.x && this.y >= paddle.y && this.y <= paddle.y + paddle.paddleHeight && this.dir.x < 0
	}

	isCollidingRightPaddle(paddle) {
		return this.x + this.radius >= paddle.x && this.y >= paddle.y && this.y <= paddle.y + paddle.paddleHeight && this.dir.x > 0
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
		this.paddle_speed = 0.01
		this.name = playerName
		this.paddleHeight = 1 / 8
		this.y = (1 / 2) - (this.paddleHeight / 2)
		this.top = this.y
		this.bottom = this.y - this.paddleHeight
		this.move_up = false
		this.move_down = false
		if (side == "right")
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