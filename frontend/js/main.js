import { render_game, pongMenu, initLocalGame, initAIGame, initRemoteGame, initTournament } from "./game/pong.js";
import { initAuth } from "./auth/auth.js"
import { initOAuth } from "./auth/oauth.js"
import { initNavBar } from "./navbar.js";
import { initSideBar } from "./sidebar.js";
import { initProfile } from "./profile/profile.js";


(async function () {
	render_game()
	initAuth()
	initRouter()
	await initNavBar()
	await initSideBar()
})();

export function initRouter() {
	let last_url;
	const navigateTo = url => {
		if (url != last_url) {
			history.pushState(null, null, url);
			last_url = url;
		}
		router();
	};

	const router = async () => {
		const routes = [
			{ path: "/", view: () => pongMenu() },
			{ path: "/localgame", view: () => initLocalGame() },
			{ path: "/aigame", view: () => initAIGame() },
			{ path: "/remotegame", view: () => initRemoteGame() },
			{ path: "/profile", view: (params) => initProfile(params.id) },
			{ path: "/oauth", view: () => initOAuth() },
			{ path: "/tournament", view: () => initTournament() },
		];

		const parseQueryParams = (queryString) => {
			const params = new URLSearchParams(queryString);
			const result = {};
			for (const [key, value] of params.entries()) {
				result[key] = value;
			}
			return result;
		};

		const potentialMatches = routes.map(route => {
			const routePath = window.location.pathname.split('?')[0];
			const isMatch = routePath === route.path;
			const queryParams = isMatch ? parseQueryParams(window.location.search) : {};
			return {
				route: route,
				isMatch: isMatch,
				params: queryParams
			};
		});

		let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

		if (!match) {
			match = {
				route: routes[0],
				isMatch: true,
				params: {}
			};
		}

		await match.route.view(match.params);
	};

	window.addEventListener('popstate', () => {
		last_url = "";
		router();
	});

	document.addEventListener("DOMContentLoaded", () => {
		document.addEventListener("click", e => {
			if (e.target.matches("[data-link]")) {
				e.preventDefault();
				navigateTo(e.target.href);
			} else if (e.target.closest("[data-link]")) {
				e.preventDefault();
				navigateTo(e.target.closest("[data-link]").href);
			}
		});
	});
	router();
}