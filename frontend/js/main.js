import { render_game, pongMenu, initLocalGame, initAIGame, initRemoteGame } from "./game/pong.js";
import { initAuth } from "./auth/auth.js"


(async function () {
	await initAuth()
	initRooter()
	render_game()
})();


export function initRooter() {
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

	document.body.addEventListener("click", e => {
		if (e.target.matches("[data-link]")) {
			e.preventDefault()
			navigateTo(e.target.href)
		}
	})
	router()
}