import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

export class Renderer {
	constructor() {
		this.boardWidth = 4
		this.boardHeight = 3
		this.boardStartX = (this.boardWidth / 2) * -1
		this.boardStartY = (this.boardHeight / 2)
		this.paddleMarging_x = this.boardWidth / 12

		this.windowWidth = 1200
		this.windowHeight = 800

	}

	init() {
		this.initRenderer()
		this.initMaterials()
		this.initGameBoard()
		this.initPaddles()
		this.initBall()
		this.initCameraPos()
		this.initLighting()
		this.initPostProcessing()
		//this.initShadows();

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

	nonGlitch(obj) {
		if (obj.isMesh && this.glitchLayer.test(obj.layers) === false) {
			this.materials[obj.uuid] = obj.material
			obj.material = this.darkMat
		}
	}

	initLighting() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light
		const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // Directional light

		directionalLight.position.set(0, 0, 1); // Example position for directional light
		//directionalLight.castShadow = true;

		this.scene.add(ambientLight, directionalLight);
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
		this.camera = new THREE.PerspectiveCamera(60, this.windowWidth / this.windowHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canva, antialias: true })

		this.renderer.setSize(this.windowWidth, this.windowHeight);
		this.renderer.setClearColor(0x0d1117, 1);
		document.body.appendChild(this.renderer.domElement);
		this.renderer.toneMapping = THREE.CineonToneMapping;

	}

	initGameBoard() {
		const boardGeometry = new THREE.BoxGeometry(this.boardWidth, this.boardHeight, 0.05)
		const HoriGeometry = new THREE.BoxGeometry(this.boardWidth + 0.025, 0.025, 0.5);
		const VertGeometry = new THREE.BoxGeometry(0.025, this.boardHeight - 0.025, 0.5);

		this.leftVert = new THREE.Mesh(VertGeometry, this.darkMat);
		this.rightVert = new THREE.Mesh(VertGeometry, this.darkMat);
		this.topHori = new THREE.Mesh(HoriGeometry, this.darkMat);
		this.bottomHori = new THREE.Mesh(HoriGeometry, this.darkMat);

		this.gameboard = new THREE.Mesh(boardGeometry, this.darkMat)

		this.topHori.position.set(0, this.boardHeight / 2, 0.025)
		this.bottomHori.position.set(0, -this.boardHeight / 2, 0.025)
		this.rightVert.position.set(this.boardWidth / 2, 0, 0.025)
		this.leftVert.position.set(-this.boardWidth / 2, 0, 0.025)
		this.gameboard.position.set(0, 0, 0)

		this.gameboard.layers.disable(20)

		const middleLineGeometry = new THREE.BoxGeometry(0.025, this.boardHeight, 0.01);

		this.middleLine = new THREE.Mesh(middleLineGeometry, this.whiteMat);

		this.middleLine.position.set(0, 0, 0.025);

		//this.showBoard()
	}

	showBoard() {
		this.scene.add(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.middleLine, this.paddle1, this.paddle2, this.ball)
	}
	hideBoard() {
		this.scene.remove(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.middleLine, this.paddle1, this.paddle2, this.ball)
	}

	initMaterials() {
		this.whiteMat = new THREE.MeshStandardMaterial({
			color: 0xc6cdd5,
		});

		this.greyMat = new THREE.MeshToonMaterial({
			color: 0x89929b,
		});

		this.blackMat = new THREE.MeshToonMaterial({
			color: 0x0d1117,
		});

		this.darkerMat = new THREE.MeshToonMaterial({
			color: 0x161b22,
		});

		this.darkMat = new THREE.MeshToonMaterial({
			color: 0x21262d,
		});

		this.blueMat = new THREE.MeshToonMaterial({
			color: 0x335c7f,
		});

		this.orangeMat = new THREE.MeshToonMaterial({
			color: 0x7d572c,
		});

		this.wireframeMat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			wireframe: true,
			transparent: true,
			opacity: 0.5,
		});
	}

	initPaddles() {
		this.hlf_pdl_height = 1 / 16

		let paddleGeometry = new THREE.CapsuleGeometry(0.05, this.boardHeight / 8, 4);
		//let paddleGeometry = new THREE.BoxGeometry(0.05, this.boardHeight / 8, 0.1)

		this.paddle1 = new THREE.Mesh(paddleGeometry, this.whiteMat);
		this.paddle1.position.set(this.boardStartX + this.paddleMarging_x, 0, 0.05)

		this.paddle2 = new THREE.Mesh(paddleGeometry, this.whiteMat);
		this.paddle2.position.set(this.boardStartX + this.boardWidth - this.paddleMarging_x, 0, 0.05)

		//this.scene.add(this.paddle1, this.paddle2)
	}

	initBall() {
		//let ballGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32)
		//let ballGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1)
		let ballGeometry = new THREE.SphereGeometry(0.05, 32, 16);
		this.ball = new THREE.Mesh(ballGeometry, this.greyMat);
		//this.ball.rotateX(Math.PI / 2)
		this.ball.position.set(0, 0, 0.1)

		//this.scene.add(this.ball)
	}

	initCameraPos() {
		this.camera.position.set(0, 0, 4);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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


		// this.generalTopMargin = this.height / 10;
		this.board.style.top = '35%'
		this.width = this.board.width
		this.height = this.board.height
		this.mid = this.board.width / 2
		this.scoreScale = this.height / 4
		this.scoreMarginRight = this.mid + (this.width / 4) - (this.scoreScale * 0.2);
		this.scoreMarginLeft = this.mid - (this.width / 4) - (this.scoreScale * 0.2);
		this.scoreMarginTop = this.board.height / 3
		this.startTimerMargin = this.height / 2 + this.height / 4
		this.startTimerScale = this.height / 3
		this.startTimerCenter = this.mid - (this.startTimerScale * 0.2)
		this.textColor = "#c6cdd5"

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
		}
		// render()
		this.ctx.stroke()
	}

	clearFrame() {
		this.ctx.clearRect(0, 0, this.board.width, this.board.height)
	}

	displayBall(ball_x, ball_y) {
		this.Renderer.ball.position.set(this.Renderer.boardStartX + ball_x * this.Renderer.boardWidth, this.Renderer.boardStartY - (ball_y * this.Renderer.boardHeight), 0.1)
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

	displayStartTimer(timeToWait) {
		if (timeToWait <= 0)
			return
		let display = `${timeToWait}`
		this.ctx.font = "".concat(`${this.startTimerScale}`, "px 'Press Start 2P', cursive")
		this.ctx.fillStyle = this.textColor;
		this.ctx.fillText(display, this.startTimerCenter, this.startTimerMargin)
	}

}