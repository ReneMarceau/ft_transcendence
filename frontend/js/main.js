import { render_game, pongMenu, initLocalGame, initAIGame, initRemoteGame, initTournament } from "./game/pong.js";
import { initProfile } from "./profile.js";
import { initAuth } from "./auth/auth.js"
import { initOAuth } from "./auth/oauth.js"
import { initNavBar } from "./navbar.js";
import { initSideBar } from "./sidebar.js";


(async function () {
	render_game()
	initAuth()
	initRouter()
	await initNavBar()
	await initSideBar()
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
			{ path: "/aigame", view: () => initAIGame() },
			{ path: "/remotegame", view: () => initRemoteGame() },
			{ path: "/profile", view: () => initProfile() },
			{ path: "/oauth", view: () => initOAuth()},
			{ path: "/tournament", view: () => initTournament() },
		]

		const potentialMatches = routes.map((route) => {
			return {
				route: route,
				isMatch:  window.location.pathname + window.location.search === route.path

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

	window.addEventListener('popstate', () => {
		last_url = ""
		router()
	});
	
	document.addEventListener("DOMContentLoaded", () => {
		document.addEventListener("click", e => {
			if (e.target.matches("[data-link]")) {
				e.preventDefault()
				navigateTo(e.target.href)
			}
		})
	});
	router()
}