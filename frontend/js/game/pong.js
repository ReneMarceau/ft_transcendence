import { renderer } from "./graphic-engine.js";
import { LocalController } from "./controller.js"
import { AIController } from "./controller.js"
import { RemoteController } from "./controller.js"
import { Game } from "./Game.js"
import { isAuthenticated } from "../auth/auth.js"
import { Tournament } from "./tournament.js"
import { getUsername } from "../user.js";
import { updateFriendStatus } from "../friends/friend_events.js";
import { gameCancel } from "../utils.js";

export function render_game() {
	let main_frame = document.querySelector("#pongDiv")
	main_frame.innerHTML = `
	<div id="playerForm" class="md-5"></div>
	<canvas id="board" class="d-none"></canvas>
	<canvas id="background"></canvas>
	`
	renderer.init()
}

function hideProfile() {
	let profile = document.getElementById("profileDiv")
	if (profile) {
		profile.classList.add("d-none")
	}
}

let ws = null

window.addEventListener("beforeunload", function (event) {
	if (ws) {
		ws.close()
	}
})

function initWebsocket() {
	ws = new WebSocket(`wss://${window.location.host}/ws/status/`)
	ws.onopen = function (event) {
		console.log("[open] Connection established");
	}
	ws.onmessage = function (event) {
		const data = JSON.parse(event.data)
		console.log(data)
		updateFriendStatus(data.username, data.status)
	}
	ws.onclose = function (event) {
		if (event.wasClean) {
			console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			console.log('[close] Connection died');
		}
	}

	ws.onerror = function (error) {
		console.log(`[error] ${error.message}`);
	}
	document.addEventListener('gameStart', () => {
		ws.send("in_game")
	});

	document.addEventListener("gameCancel", () => {
		ws.send("online")
	});

	document.addEventListener("gameOver", () => {
		ws.send("online")
	});

}

export async function pongMenu() {
	hideProfile()
	renderer.hideBoard()
	renderer.hideBracket()
	const pongTournament = document.getElementById("playerForm")
	pongTournament.innerHTML = ""

	document.dispatchEvent(gameCancel);

	if (isAuthenticated() === true) {
		initWebsocket()
		let localGameBtn = document.querySelector("#localgamebtn")
		//let remoteGameBtn = document.querySelector("#remotegamebtn")
		let aiGameBtn = document.querySelector("#aigamebtn")
		let tournamentBtn = document.querySelector("#tournamentbtn")
		// let ftTitle = document.querySelector("#ft_title")
		// ftTitle.classList.remove('d-none')
		tournamentBtn.classList.remove('d-none')
		localGameBtn.classList.remove('d-none')
		aiGameBtn.classList.remove('d-none')
		//remoteGameBtn.classList.remove('d-none')
	}
}

export async function initTournament() {
	console.log("tournament")
	hideMenu()
	renderer.hideBoard()
	renderer.hideBracket()
	const tournament = new Tournament()
}

export async function initLocalGame() {
	console.log("local")
	hideMenu()
	const username = await getUsername()
	let controller = new LocalController(username)
	controller.init()
	let game = new Game(controller,)
	game.run()

}

export async function initAIGame() {
	console.log("AI")
	hideMenu()
	const username = await getUsername()
	let controller = new AIController(username)
	controller.init()
	let game = new Game(controller)
	game.run()
}

export async function initRemoteGame() {
	//TODO make sure you are auth
	console.log("remote")
	hideMenu()
	let controller = new RemoteController()
	controller.init()
	let game = new Game(controller)
	game.run()
}

function hideMenu() {
	let localGameBtn = document.querySelector("#localgamebtn")
	let aiGameBtn = document.querySelector("#aigamebtn")
	//let remoteGameBtn = document.querySelector("#remotegamebtn")
	let tournamentBtn = document.querySelector("#tournamentbtn")

	tournamentBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
	//remoteGameBtn.classList.add('d-none')
	aiGameBtn.classList.add('d-none')

}