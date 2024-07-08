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
		this.initEarth();

		window.addEventListener('resize', this.handleWindowResize.bind(this));
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

	initEarth() {
		function getFresnelMat({rimHex = 0x0088ff, facingHex = 0x000000} = {}) {
			const uniforms = {
			  color1: { value: new THREE.Color(rimHex) },
			  color2: { value: new THREE.Color(facingHex) },
			  fresnelBias: { value: 0.1 },
			  fresnelScale: { value: 1.0 },
			  fresnelPower: { value: 4.0 },
			};
			const vs = `
			uniform float fresnelBias;
			uniform float fresnelScale;
			uniform float fresnelPower;
			
			varying float vReflectionFactor;
			
			void main() {
			  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			
			  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
			
			  vec3 I = worldPosition.xyz - cameraPosition;
			
			  vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
			
			  gl_Position = projectionMatrix * mvPosition;
			}
			`;
			const fs = `
			uniform vec3 color1;
			uniform vec3 color2;
			
			varying float vReflectionFactor;
			
			void main() {
			  float f = clamp( vReflectionFactor, 0.0, 1.0 );
			  gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
			}
			`;
			const fresnelMat = new THREE.ShaderMaterial({
			  uniforms: uniforms,
			  vertexShader: vs,
			  fragmentShader: fs,
			  transparent: true,
			  blending: THREE.AdditiveBlending,
			  // wireframe: true,
			});
			return fresnelMat;
		  }

		this.earthGroup = new THREE.Group();
		this.earthGroup.rotation.z = -23.4 * Math.PI / 180;
		this.scene.add(this.earthGroup);

		const detail = 20;
		const loader = new THREE.TextureLoader();
		const geometry = new THREE.IcosahedronGeometry(1, detail);
		const material = new THREE.MeshPhongMaterial({
			map: loader.load("./textures/earth/00_earthmap1k.jpg"),
			specularMap: loader.load("./textures/earth/02_earthspec1k.jpg"),
			bumpMap: loader.load("./textures/earth/01_earthbump1k.jpg"),
			side: THREE.DoubleSide,
			bumpScale: 0.5,
		});
		this.earthMesh = new THREE.Mesh(geometry, material);
		this.earthGroup.add(this.earthMesh);

		const lightsMat = new THREE.MeshBasicMaterial({
			map: loader.load("./textures/earth/03_earthlights1k.jpg"),
			blending: THREE.AdditiveBlending,
			transparent: true,
		});
		this.lightsMesh = new THREE.Mesh(geometry, lightsMat);
		this.earthGroup.add(this.lightsMesh);

		const cloudsMat = new THREE.MeshStandardMaterial({
			map: loader.load("./textures/earth/04_earthcloudmap.jpg"),
			transparent: true,
			opacity: 0.5,
			blending: THREE.AdditiveBlending,
			alphaMap: loader.load('./textures/earth/05_earthcloudmaptrans.jpg'),
			alphaTest: 0.3,
		});
		this.cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
		this.cloudsMesh.scale.setScalar(1.003);
		this.earthGroup.add(this.cloudsMesh);


		const fresnelMat = getFresnelMat();
		this.glowMesh = new THREE.Mesh(geometry, fresnelMat);
		this.glowMesh.scale.setScalar(1.01);
		this.earthGroup.add(this.glowMesh);

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
		var starsMaterial = new THREE.PointsMaterial({ 
			color: 0xFFFFFF,
			size: 2, // Adjust this value to make the stars bigger
			sizeAttenuation: true // This makes sure the stars do not get too big when close to the camera
		 });
		this.starField = new THREE.Points(starsGeometry, starsMaterial);
		this.scene.add(this.starField);
	}

	initLighting() {
		const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
		sunLight.position.set(-2, 0.5, 1.5);
		this.scene.add(sunLight);

		this.pointLight = new THREE.PointLight(0xebfde7, 10);
		this.pointLight.position.set(2, 2, 2);
		this.pointLight.intensity = 1;
		this.scene.add(this.pointLight)


		this.ambientLight = new THREE.AmbientLight(0xffffff, 1); // Ambient light
		this.spotLight = new THREE.SpotLight(0xffffff, 15);

		this.spotLight.position.set(0, 0, 2);
		this.spotLight.castShadow = true;

		this.spotLight.shadow.mapSize.width = this.windowWidth
		this.spotLight.shadow.mapSize.height = this.windowHeight

		//this.scene.add(this.ambientLight, this.spotLight);
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
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

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
		console.log("showing board")
		document.getElementById("board").classList.remove("d-none")
		this.camera.position.set(0, 0, 5);
		this.camera.lookAt(0, 0, 0)
		this.scene.remove(this.earthGroup)
		this.scene.add(this.ambientLight, this.spotLight);
		this.scene.add(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.paddle1, this.paddle2, this.ball)
	}
	hideBoard() {
		console.log("hide board")
		document.getElementById("board").classList.add("d-none")
		this.scene.add(this.earthGroup)
		this.scene.remove(this.ambientLight, this.spotLight);
		this.scene.remove(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.paddle1, this.paddle2, this.ball)
	}

	initMaterials() {
		const textureLoader = new THREE.TextureLoader();

		this.backgroundMat = new THREE.MeshStandardMaterial({
			map: textureLoader.load('./textures/asteroid/ground_0010_color_1k.jpg'),               // Color texture
			aoMap: textureLoader.load('./textures/asteroid/ground_0010_ao_1k.jpg'),                // Ambient Occlusion texture
			normalMap: textureLoader.load('./textures/asteroid/ground_0010_normal_opengl_1k.png'), // Normal map
			//displacementMap: textureLoader.load('./textures/asteroid/ground_0010_height_1k.png'),  // Height map (used as displacement map)
			roughnessMap: textureLoader.load('./textures/asteroid/ground_0010_roughness_1k.jpg'),  // Roughness map
			metalness: 0.5,              // Adjust metalness as needed
			roughness: 1,                // Adjust roughness as needed
			side: THREE.DoubleSide,
		});

		this.paddlesMat = new THREE.MeshStandardMaterial({
			color: 0xFFFFFF,      // White tint
			emissive: 0xFFFFFF,   // Green emissive color
			emissiveIntensity: 1, // Intensity of the emissive glow
			side: THREE.DoubleSide,
		});

		this.ballMat = new THREE.MeshStandardMaterial({
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
		this.controls.enableZoom = false;
		this.controls.enablePan = false;
		this.controls.enableDamping = true;
		this.controls.rotateSpeed = 0.5;
	}

	rotateEarth() {
		this.earthMesh.rotateY += 1;
		this.lightsMesh.rotateY += 0.02;
		this.cloudsMesh.rotateY += 0.023;
		this.glowMesh.rotateY+= 0.2;
	}

	render() {
		this.earthMesh.rotateY += 1;
		this.lightsMesh.rotateY += 0.02;
		this.cloudsMesh.rotateY += 0.023;
		this.glowMesh.rotateY+= 0.2;

		this.controls.update()
		this.composer.render()
	}

	handleWindowResize () {
		this.camera.updateProjectionMatrix();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.windowWidth, this.windowHeight);
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
		this.textColor = "#FFFFFF"

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
		if (player1Score === undefined || player2Score === undefined)
			return
		this.ctx.font = "".concat(`${this.scoreScale}`, "px 'Press Start 2P', cursive")
		this.ctx.fillStyle = this.textColor;

		this.ctx.fillText(`${player1Score}`, this.scoreMarginLeft, this.scoreMarginTop)

		this.ctx.fillText(`${player2Score}`, this.scoreMarginRight, this.scoreMarginTop)
	}

	displayMessage(message) {
		if (message === "" || message === undefined)
			return
		const len = message.length
		this.ctx.font = "".concat(`${this.messageScale}`, "px Impact, fantasy")
		this.ctx.fillStyle = this.textColor
		this.ctx.fillText(message, this.mid - len * this.messageScale * 0.2, this.messageMargin)
	}

	displayNames(player1, player2) {
		if (player1 === undefined)
			player1 = "Player 1"
		if (player2 === undefined)
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