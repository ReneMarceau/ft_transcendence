import { renderer } from "./graphic-engine.js";
import { LocalController } from "./controller.js"
import { AIController } from "./controller.js"
import { RemoteController } from "./controller.js"
import { Game } from "./Game.js"

export function render_game() {
	let main_frame = document.getElementById("pongDiv")
	main_frame.innerHTML = `
		<div class="container">
					<canvas id="board"></canvas>
					<canvas id="background"></canvas>
		</div>
	`
	renderer.init()
}


export function initLocalPong() {
	const navigateTo = url => {
		history.pushState(null, null, url)
		router()
	}

	const router = async () => {
		const routes = [
			{ path: "/", view: () => pongMenu() },
			{ path: "/localgame", view: () => initLocalGame() },
			{ path: "/aigame", view: () => initAIGame()},
			{ path: "/remotegame", view: () => initRemoteGame()}
		]

		const potentialMatches = routes.map(route => {
			return {
				route: route,
				isMatch: location.pathname === route.path
			}
		})

		let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch)

		if (!match) {
			match = {
				route: routes[0],
				isMatch: true
			}
		}
		 match.route.view()
	}

	document.addEventListener("DOMContentLoaded", () => {
		document.body.addEventListener("click", e => {
			if (e.target.matches("[data-link]")) {
				e.preventDefault()
				navigateTo(e.target.href)
			}
		})
	})
	router()
}


export async function pongMenu() {
	let localGameBtn = document.querySelector("#localgamebtn")
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let aiGameBtn = document.querySelector("#aigamebtn")

	console.log("menu")
	localGameBtn.classList.remove('d-none')
	remoteGameBtn.classList.remove('d-none')
	aiGameBtn.classList.remove('d-none')
}

function initLocalGame() {
	console.log("local")	
	hideMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller,)
	game.run()
}

function initAIGame() {
	console.log("AI")	
	hideMenu()
	let controller = new AIController()
	controller.init()
	let game = new Game(controller,)
	game.run()
}

function initRemoteGame() {
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