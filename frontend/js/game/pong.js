import { renderer } from "./graphic-engine.js";
import { LocalController } from "./controller.js"
import { AIController } from "./controller.js"
import { RemoteController } from "./controller.js"
import { Game } from "./Game.js"
import { isAuthenticated } from "../auth/auth.js"

export function render_game() {
	let main_frame = document.querySelector("#pongDiv")
	main_frame.innerHTML = `
		<canvas id="board"></canvas>
		<canvas id="background" class="d-none"></canvas>
	`
	renderer.init()
}


export async function pongMenu() {
	
	if (isAuthenticated() == true) {
		let localGameBtn = document.querySelector("#localgamebtn")
		let remoteGameBtn = document.querySelector("#remotegamebtn")
		let aiGameBtn = document.querySelector("#aigamebtn")

		console.log("menu")
		localGameBtn.classList.remove('d-none')
		remoteGameBtn.classList.remove('d-none')
		aiGameBtn.classList.remove('d-none')
	}
}

export async function initLocalGame() {
	console.log("local")
	hideMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller,)
	game.run()
}

export async function initAIGame() {
	console.log("AI")
	hideMenu()
	let controller = new AIController()
	controller.init()
	let game = new Game(controller,)
	game.run()
}

export async function initRemoteGame() {
	//TODO make sure you are auth
	console.log("remote")
	hideMenu()
	let controller = new RemoteController()
	controller.init()
	let game = new Game(controller,)
	game.run()
}

function hideMenu() {
	let localGameBtn = document.querySelector("#localgamebtn")
	let aiGameBtn = document.querySelector("#aigamebtn")
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let menu = document.querySelector("#menubtn")
	menu.classList.add('d-none')
	localGameBtn.classList.add('d-none')
	remoteGameBtn.classList.add('d-none')
	aiGameBtn.classList.add('d-none')

}