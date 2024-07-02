import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

export class Renderer {
	constructor() {
		this.boardWidth = 5
		this.boardHeight = 3
		this.boardStartX = (this.boardWidth / 2) * -1
		this.boardStartY = (this.boardHeight / 2)
		this.paddleMarging_x = this.boardWidth / 12

		this.windowWidth = window.innerWidth
		this.windowHeight = window.innerHeight

	}

	init() {
		this.initRenderer()
		this.initMaterials()
		this.initGameBoard()
		this.initStars()
		this.initPaddles()
		this.initBall()
		this.initCameraPos()
		this.initLighting()
		this.initPostProcessing()
		this.initShadows();

		this.renderer.setAnimationLoop(this.render.bind(this))
	}

	initPostProcessing() {
		// Create an EffectComposer and add a RenderPass
		this.composer = new EffectComposer(this.renderer);
		const renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(renderPass);

		// const glitchPass = new GlitchPass();
		// this.composer.addPass(glitchPass);

		const outputPass = new OutputPass();
		this.composer.addPass(outputPass);
	}

	initStars() {
		var stars = new Array(0);
		for (var i = 0; i < 40000; i++) {
			let x = THREE.MathUtils.randFloatSpread(3000);
			let y = THREE.MathUtils.randFloatSpread(3000);
			let z = THREE.MathUtils.randFloatSpread(3000);
			if (!(x > -100 && x < 100 && y < 100 && y > -100 && z > -100 && z < 100))
				stars.push(x, y, z);
		}
		var starsGeometry = new THREE.BufferGeometry();
		starsGeometry.setAttribute(
			"position", new THREE.Float32BufferAttribute(stars, 3)
		);
		var starsMaterial = new THREE.PointsMaterial({ color: 0x888888 });
		this.starField = new THREE.Points(starsGeometry, starsMaterial);
		this.scene.add(this.starField);
	}

	initLighting() {
		this.pointLight = new THREE.PointLight(0xebfde7, 10);
		this.pointLight.position.set(2, 2, 2);
		this.pointLight.intensity = 1;
		this.scene.add(this.pointLight)


		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light
		const spotLight = new THREE.SpotLight(0xffffff, 5);

		spotLight.position.set(0, 0, 2);
		spotLight.castShadow = true;

		spotLight.shadow.mapSize.width = this.windowWidth
		spotLight.shadow.mapSize.height = this.windowHeight

		this.scene.add(ambientLight, spotLight);
	}

	initShadows() {

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;


		this.paddle1.castShadow = true;
		this.paddle2.castShadow = true;
		this.ball.castShadow = true;

		this.gameboard.receiveShadow = true;
	}

	initRenderer() {
		this.canva = document.getElementById('background');
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(70, this.windowWidth / this.windowHeight, 1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canva, antialias: true })
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.windowWidth, this.windowHeight);
	}

	initGameBoard() {

		const boardGeometry = new THREE.BoxGeometry(this.boardWidth, this.boardHeight, 0.01)
		this.gameboard = new THREE.Mesh(boardGeometry, this.backgroundMat)
		this.gameboard.position.set(0, 0, 0)


		const VertGeometry = new THREE.BoxGeometry(0.025, this.boardHeight - 0.025, 0.1);
		this.leftVert = new THREE.Mesh(VertGeometry, this.backgroundMat);
		this.rightVert = new THREE.Mesh(VertGeometry, this.backgroundMat);

		this.rightVert.position.set(this.boardWidth / 2, 0, 0.025)
		this.leftVert.position.set(-this.boardWidth / 2, 0, 0.025)

		const HoriGeometry = new THREE.BoxGeometry(this.boardWidth + 0.025, 0.025, 0.1);
		this.topHori = new THREE.Mesh(HoriGeometry, this.backgroundMat);
		this.bottomHori = new THREE.Mesh(HoriGeometry, this.backgroundMat);

		this.topHori.position.set(0, this.boardHeight / 2, 0.025)
		this.bottomHori.position.set(0, -this.boardHeight / 2, 0.025)

		this.gameboard.layers.disable(20)

		// const middleLineGeometry = new THREE.BoxGeometry(0.025, this.boardHeight, 0.01);

		// this.middleLine = new THREE.Mesh(middleLineGeometry, this.whiteMat);

		// this.middleLine.position.set(0, 0, 0.025);

		//this.showBoard()
	}

	showBoard() {
		this.canva.classList.remove("d-none")
		this.scene.add(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.paddle1, this.paddle2, this.ball)
	}
	hideBoard() {
		this.canva.classList.add("d-none")
		this.scene.remove(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.paddle1, this.paddle2, this.ball)
	}

	initMaterials() {
		this.backgroundMat = new THREE.MeshPhongMaterial({
			color: 0x2E2E2E,
			side: THREE.DoubleSide,
		});

		this.paddlesMat = new THREE.MeshPhongMaterial({
			color: 0xD3D3D3,
			side: THREE.DoubleSide,
		});

		this.ballMat = new THREE.MeshPhysicalMaterial({
			color: 0xFFFFFF,      // White tint
			side: THREE.DoubleSide,
		});

		this.wireframeMat = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,
			wireframe: true,
			transparent: true,
			opacity: 0.5,
		});
	}

	initPaddles() {
		this.hlf_pdl_height = 1 / 16

		let paddleGeometry = new THREE.CapsuleGeometry(0.05, this.boardHeight / 8, 4);
		//let paddleGeometry = new THREE.BoxGeometry(0.05, this.boardHeight / 8, 0.1)

		this.paddle1 = new THREE.Mesh(paddleGeometry, this.paddlesMat);
		this.paddle1.position.set(this.boardStartX + this.paddleMarging_x, 0, 0.05)

		this.paddle2 = new THREE.Mesh(paddleGeometry, this.paddlesMat);
		this.paddle2.position.set(this.boardStartX + this.boardWidth - this.paddleMarging_x, 0, 0.05)

		//this.scene.add(this.paddle1, this.paddle2)
	}

	initBall() {
		let ballGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.01, 32)
		//let ballGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1)
		//let ballGeometry = new THREE.SphereGeometry(0.05, 32, 16);
		this.ball = new THREE.Mesh(ballGeometry, this.ballMat);
		this.ball.rotateX(Math.PI / 2)
		this.ball.position.set(0, 0, 0.1)

		//this.scene.add(this.ball)
	}

	initCameraPos() {
		this.camera.position.set(0, 0, 5);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
	}

	render() {
		this.controls.update()
		this.composer.render()
	}
}

export const renderer = new Renderer()


export class graphicEngine {
	constructor() {
		this.board = document.getElementById("board")
		this.ctx = this.board.getContext("2d")

		let dpi = window.devicePixelRatio;
		let style_height = +getComputedStyle(this.board).getPropertyValue("height").slice(0, -2);
		let style_width = +getComputedStyle(this.board).getPropertyValue("width").slice(0, -2);
		this.board.setAttribute('height', style_height * dpi);
		this.board.setAttribute('width', style_width * dpi);
		// this.generalTopMargin = this.height / 10;
		this.board.style.top = 'calc(30% + 5em)'
		this.width = this.board.width
		this.height = this.board.height
		this.mid = this.board.width / 2
		this.textColor = "#888888"

		this.scoreScale = this.height / 5
		this.scoreMarginRight = this.mid + (this.width / 4) - (this.scoreScale * 0.2);
		this.scoreMarginLeft = this.mid - (this.width / 4) - (this.scoreScale * 0.2);
		this.scoreMarginTop = this.board.height / 2.3

		this.messageCenter = this.mid - this.width / 7
		this.messageMargin = this.height / 2 + this.height / 4
		this.messageScale = this.width / 25

		this.startTimerMargin = this.height / 2 + this.height / 4
		this.startTimerScale = this.height / 3
		this.startTimerCenter = this.mid - (this.startTimerScale * 0.2)

		this.marginNames = this.board.height / 5

		this.Renderer = renderer
		this.Renderer.showBoard()
	}

	display(model) {

		if (model != "none" && model != undefined) {
			this.clearFrame()
			this.displayStartTimer(model.startTimer)
			this.displayBall(model.ball.x, model.ball.y)
			this.displayPaddle1(model.paddle1.x, model.paddle1.y)
			this.displayPaddle2(model.paddle2.x, model.paddle2.y)
			this.displayScore(model.player1Score, model.player2Score)
			this.displayMessage(model.message)
			this.displayNames(model.player1, model.player2)
		}
		// render()
		this.ctx.stroke()
	}

	clearFrame() {
		this.ctx.clearRect(0, 0, this.board.width, this.board.height)
	}

	displayBall(ball_x, ball_y) {
		this.Renderer.ball.position.set(this.Renderer.boardStartX + ball_x * this.Renderer.boardWidth, this.Renderer.boardStartY - (ball_y * this.Renderer.boardHeight), 0.1)
		this.Renderer.pointLight.position.set(this.Renderer.boardStartX + ball_x * this.Renderer.boardWidth, this.Renderer.boardStartY - (ball_y * this.Renderer.boardHeight), 0.2)
	}

	displayPaddle1(paddle_x, paddle_y) {
		this.Renderer.paddle1.position.set(this.Renderer.boardStartX + (paddle_x) * this.Renderer.boardWidth, this.Renderer.boardStartY - ((paddle_y + this.Renderer.hlf_pdl_height) * this.Renderer.boardHeight), 0.1)
	}
	displayPaddle2(paddle_x, paddle_y) {
		this.Renderer.paddle2.position.set(this.Renderer.boardStartX + (paddle_x) * this.Renderer.boardWidth, this.Renderer.boardStartY - ((paddle_y + this.Renderer.hlf_pdl_height) * this.Renderer.boardHeight), 0.1)
	}

	displayScore(player1Score, player2Score) {
		if (player1Score == undefined || player2Score == undefined)
			return
		this.ctx.font = "".concat(`${this.scoreScale}`, "px 'Press Start 2P', cursive")
		this.ctx.fillStyle = this.textColor;

		this.ctx.fillText(`${player1Score}`, this.scoreMarginLeft, this.scoreMarginTop)

		this.ctx.fillText(`${player2Score}`, this.scoreMarginRight, this.scoreMarginTop)
	}

	displayMessage(message) {
		if (message == "" || message == undefined)
			return
		const len = message.length
		this.ctx.font = "".concat(`${this.messageScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor
		this.ctx.fillText(message, this.mid - len * this.messageScale * 0.2, this.messageMargin)
	}

	displayNames(player1, player2) {
		if (player1 == undefined)
			player1 = "Player 1"
		if (player2 == undefined)
			player2 = "Player 2"
		const len1 = player1.length
		const len2 = player2.length
		this.ctx.font = "".concat(`${this.messageScale}`, "px 'Press Start 2P', cursive")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(player1, (this.mid - this.width / 4) - (this.messageScale * 0.2 * len1), this.marginNames)
		this.ctx.fillText(player2, (this.mid + this.width / 4) - (this.messageScale * 0.2 * len2), this.marginNames)
	}

	displayStartTimer(timeToWait) {
		if (timeToWait <= 0)
			return
		let display = `${timeToWait}`
		this.ctx.font = "".concat(`${this.startTimerScale}`, "px 'Press Start 2P', cursive")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(display, this.startTimerCenter, this.startTimerMargin)
	}

}