import { render_game, pongMenu, initLocalGame, initAIGame, initRemoteGame } from "./game/pong.js";
import { initAuth } from "./auth/auth.js"


(async function () {
	if (await initAuth() == false) {
		return
	}
	initRouter()
	render_game()
})();


export function initRouter() {

	let last_url
	const navigateTo = url => {
		if (url != last_url) {
			history.pushState(null, null, url)
			last_url = url
		}
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
				isMatch: window.location.pathname === route.path
				
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

	window.addEventListener('popstate', () => {
		last_url = "/"
		router()
	});

	document.body.addEventListener("click", e => {
		if (e.target.matches("[data-link]")) {
			e.preventDefault()
			navigateTo(e.target.href)
		}
	})
	router()
}