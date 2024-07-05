import { renderer } from "./graphic-engine.js";
import { LocalController } from "./controller.js"
import { AIController } from "./controller.js"
import { RemoteController } from "./controller.js"
import { Game } from "./Game.js"
import { isAuthenticated } from "../auth/auth.js"

export function render_game() {
	let main_frame = document.querySelector("#pongDiv")
	main_frame.innerHTML = `
	<canvas id="board" class="d-none"></canvas>
	<canvas id="background"></canvas>
	`
	// <div class="text-center">
	// 	<h1 id="ft_title" class="d-none" style="font-family: 'Press Start 2P', cursive">ft_trnascnacdance</h1>
	// </div>

	let tournamentBtn = document.querySelector("#tournamentbtn")
	tournamentBtn.innerHTML = `
	Tournament
	<div class="dropdown-menu" id="debugDropdownMenu">
		<a class="dropdown-item" href="#">New tournament</a>
		<a class="dropdown-item" href="#">Join tournament</a>
	</div>
	`
	tournamentBtn.addEventListener("click", function () {
			var dropdownMenu = document.getElementById('debugDropdownMenu');
			dropdownMenu.classList.toggle('show');
	});

	renderer.init()
}

function hideProfile() {
	let profile = document.getElementById("profileDiv")
	if (profile) {
		profile.classList.add("d-none")
	}
}


export async function pongMenu() {
	hideProfile()
	if (isAuthenticated() === true) {
		let localGameBtn = document.querySelector("#localgamebtn")
		let remoteGameBtn = document.querySelector("#remotegamebtn")
		let aiGameBtn = document.querySelector("#aigamebtn")
		let tournamentBtn = document.querySelector("#tournamentbtn")
		// let ftTitle = document.querySelector("#ft_title")
		// ftTitle.classList.remove('d-none')
		tournamentBtn.classList.remove('d-none')
		localGameBtn.classList.remove('d-none')
		remoteGameBtn.classList.remove('d-none')
		aiGameBtn.classList.remove('d-none')
	}
}

export async function initTournament() {
	console.log("tournament")
	hideMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller,)
	game.run()
}

export async function initLocalGame() {
	console.log("local")
	hideMenu()
	let controller = new LocalController()
	controller.init()
	let game = new Game(controller)
	game.run()
}

export async function initAIGame() {
	console.log("AI")
	hideMenu()
	let controller = new AIController()
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
	let remoteGameBtn = document.querySelector("#remotegamebtn")
	let tournamentBtn = document.querySelector("#tournamentbtn")
	let menu = document.querySelector("#menubtn")

	menu.classList.add('d-none')
	tournamentBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
	remoteGameBtn.classList.add('d-none')
	aiGameBtn.classList.add('d-none')

}