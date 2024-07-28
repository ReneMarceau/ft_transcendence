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

		//Bracket
		this.bracket = document.getElementById("bracket")
		this.ctx = this.bracket.getContext("2d")

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
		this.initBracket();

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
		function getFresnelMat({ rimHex = 0x0088ff, facingHex = 0x000000 } = {}) {
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
		const geometry = new THREE.IcosahedronGeometry(1.5, detail);
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

		this.bracketLight = new THREE.PointLight(0xffffff, 10)
		this.bracketLight.position.set(2, 2, 2)
		this.bracketLight.intensity = 13
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

	initBracket() {
		this.bracketGroup = new THREE.Group();
		const MiddleGeometry = new THREE.BoxGeometry(this.boardWidth / 2, 0.027, 0.04);
		const EntryGeometry = new THREE.BoxGeometry(this.boardWidth / 4, 0.027, 0.04);
		const verticalGeometry = new THREE.BoxGeometry(0.027, this.boardHeight, 0.04);

		this.bracketMiddle = new THREE.Mesh(MiddleGeometry, this.greenGlowMat);
		this.entryTL = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.entryTR = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.entryBL = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.entryBR = new THREE.Mesh(EntryGeometry, this.greenGlowMat);
		this.verticalBracketLeft = new THREE.Mesh(verticalGeometry, this.greenGlowMat);
		this.verticalBracketRight = new THREE.Mesh(verticalGeometry, this.greenGlowMat);

		this.bracketMiddle.position.set(0, 0, 0)
		this.entryTL.position.set((this.boardWidth / -2) + this.boardWidth / 8, this.boardHeight / -2, 0)
		this.entryBL.position.set((this.boardWidth / -2) + this.boardWidth / 8, this.boardHeight / 2, 0)
		this.entryTR.position.set((this.boardWidth / 2) - this.boardWidth / 8, this.boardHeight / -2, 0)
		this.entryBR.position.set((this.boardWidth / 2) - this.boardWidth / 8, this.boardHeight / 2, 0)
		this.verticalBracketLeft.position.set((this.boardWidth / -2) + this.boardWidth / 4, 0, 0)
		this.verticalBracketRight.position.set((this.boardWidth / 2) - this.boardWidth / 4, 0, 0)

		this.bracketGroup.add(this.bracketMiddle, this.entryBL, this.entryBR, this.entryTL, this.entryTR, this.verticalBracketLeft, this.verticalBracketRight, this.bracketLight);
	}

	showBoard() {
		console.log("showing board")
		document.getElementById("board").classList.remove("d-none")
		this.camera.position.set(0, 0, 3);
		this.camera.lookAt(0, 0, 0)
		this.scene.remove(this.earthGroup)
		this.scene.add(this.ambientLight, this.spotLight);
		this.scene.add(this.topHori, this.bottomHori, this.gameboard, this.leftVert, this.rightVert, this.paddle1, this.paddle2, this.ball)
	}

	showBracket(game_nb = 1, player1 = "", player2 = "", player3 = "", player4 = "", finalist1 = "", finalist2 = "", winner = "") {
		const font = new FontFace('VT323', 'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isRFJXGdg.woff2)');
		font.load().then((loadedFont) => {
			document.fonts.add(loadedFont);
			this.renderBracket(game_nb, player1, player2, player3, player4, finalist1, finalist2, winner);
		}).catch(function (error) {
			console.error('Font loading failed:', error);
		});
	}

	renderBracket(game_nb, player1, player2, player3, player4, finalist1, finalist2, winner) {
		console.log('showing bracket');
		this.scene.remove(this.earthGroup);
		let dpi = window.devicePixelRatio;
		console.log(dpi);
		let style_height = +getComputedStyle(this.bracket).getPropertyValue("height").slice(0, -2);
		let style_width = +getComputedStyle(this.bracket).getPropertyValue("width").slice(0, -2);

		console.log(`style_height: ${style_height}`);
		console.log(`style_width: ${style_width}`);

		this.bracket.setAttribute('height', style_height * dpi);
		this.bracket.setAttribute('width', style_width * dpi);

		this.ctx.clearRect(0, 0, this.bracket.width, this.bracket.height);
		const scale = 0.2 * 90;
		const nextGame = "Press Space to start next game!";
		const textEntries = [
			{ text: player1, x: this.bracket.width / 2 - this.bracket.width / 4.5, y: this.bracket.height / 2 - this.bracket.height / 4 - scale },
			{ text: player2, x: this.bracket.width / 2 - this.bracket.width / 4.5, y: this.bracket.height / 2 + this.bracket.height / 4 + 4.5 * scale },
			{ text: player3, x: this.bracket.width / 2 + this.bracket.width / 4.5, y: this.bracket.height / 2 - this.bracket.height / 4 - scale },
			{ text: player4, x: this.bracket.width / 2 + this.bracket.width / 4.5, y: this.bracket.height / 2 + this.bracket.height / 4 + 4.5 * scale },
			{ text: finalist1, x: this.bracket.width / 2, y: this.bracket.height / 2 - this.bracket.height / 20 + 3.5 * scale },
			{ text: finalist2, x: this.bracket.width / 2, y: this.bracket.height / 2 + this.bracket.height / 20 },
			{ text: winner, x: this.bracket.width / 2, y: this.bracket.height / 2 - this.bracket.height / 3.5 },
			{ text: nextGame, x: this.bracket.width / 2, y: this.bracket.height / 2 - this.bracket.height / 8 }
		];

		this.bracketGroup.translateY(-0.05)
		this.scene.add(this.bracketGroup);

		this.ctx.font = '90px "VT323", monospace';
		this.ctx.fillStyle = "#888888";

		const drawText = (text, x, y) => {
			const len = text.length;
			this.ctx.fillText(text, x - (scale * len), y);
		};

		drawText(player1, textEntries[0].x, textEntries[0].y);
		drawText(player2, textEntries[1].x, textEntries[1].y);
		drawText(player3, textEntries[2].x, textEntries[2].y);
		drawText(player4, textEntries[3].x, textEntries[3].y);
		drawText(finalist1, textEntries[4].x, textEntries[4].y);
		drawText(finalist2, textEntries[5].x, textEntries[5].y);

		this.ctx.fillStyle = "#FFFFFF";
		if (game_nb != 4) {
			drawText(nextGame, textEntries[7].x, textEntries[7].y);
		}
		if (game_nb == 1) {
			drawText(player1, textEntries[0].x, textEntries[0].y);
			drawText(player2, textEntries[1].x, textEntries[1].y);
		} else if (game_nb == 2) {
			drawText(player3, textEntries[2].x, textEntries[2].y);
			drawText(player4, textEntries[3].x, textEntries[3].y);
		} else if (game_nb == 3) {
			drawText(finalist1, textEntries[4].x, textEntries[4].y);
			drawText(finalist2, textEntries[5].x, textEntries[5].y);
		} else if (game_nb == 4) {
			drawText(winner, textEntries[6].x, textEntries[6].y);
		}

		this.ctx.stroke();
		this.camera.position.set(0, 0, 4);
		this.controls.enabled = false;

		console.log('Canvas element:', this.bracket);
		console.log('Context:', this.ctx);
		console.log('Font applied:', this.ctx.font);
		console.log(`game_nb: ${game_nb}`);
		console.log(`player1 : ${player1}`);
	}

	hideBracket() {
		this.scene.remove(this.bracketGroup)
		this.ctx.clearRect(0, 0, this.bracket.width, this.bracket.height)
		this.controls.enabled = true
	}

	hideBoard() {
		console.log("hide board")
		document.getElementById("board").classList.add("d-none")
		this.camera.position.set(0, 0, 5);
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

	render() {
		this.earthMesh.rotation.y += 0.002;
		this.lightsMesh.rotation.y += 0.002;
		this.cloudsMesh.rotation.y += 0.0023;
		this.glowMesh.rotation.y += 0.002;
		this.starField.rotation.y -= 0.0002;
		this.controls.update()
		this.composer.render()
	}

	handleWindowResize() {
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight;

		this.camera.aspect = this.windowWidth / this.windowHeight;
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
		console.log(dpi)
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

		this.messageMargin = this.height / 2 + this.height / 4
		this.messageScale = this.width / 15

		this.startTimerMargin = this.height / 2 + this.height / 4
		this.startTimerScale = this.height / 3
		this.startTimerCenter = this.mid - (this.startTimerScale * 0.2)

		this.marginNames = this.board.height / 5

		this.Renderer = renderer
		//this.Renderer.showBoard()
	}

	display(model) {

		if (model != "none" && model != undefined) {
			this.clearFrame()
			this.displayStartTimer(model.start_timer_s)
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

	displayBracket(players) {
		console.log("displayBracket")
		console.log(players)
		this.Renderer.hideBoard()

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
		this.ctx.font = "".concat(`${this.messageScale}`, "px VT323, monospace")
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
		this.ctx.font = "".concat(`${this.messageScale}`, "px VT323, monospace")
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