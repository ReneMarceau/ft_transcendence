import { render_game } from "./game/pong.js";
import { initLocalPong } from "./game/pong.js"
import { initAuth } from "./auth/auth.js"


(async function () {
	await initAuth()
	render_game()
	initLocalPong()
})();