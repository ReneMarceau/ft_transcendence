import { renderer } from "./graphic-engine.js";

export function render_game() {
	let main_frame = document.getElementById("pongDiv")
	main_frame.innerHTML = `
		<div class="container">
			<div class="row">
				<div class="col">
					<canvas id="background"></canvas>
				</div>
			</div>
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
		await match.route.view()
	}

	window.addEventListener("popstate", router)

	document.addEventListener("DOMContentLoaded", () => {
		//history.pushState(null, null, "/")
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
	let menu = document.querySelector("#menubtn")

	console.log("menu")
	hideMenu()
	localGameBtn.classList.remove('d-none')
}

function initLocalGame() {
	console.log("local")
	hideMenu()
	let menu = document.querySelector("#menubtn")

	menu.classList.remove('d-none')
}

function hideMenu() {
	let menu = document.querySelector("#menubtn")

	menu.classList.add('d-none')
}