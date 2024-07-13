import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"

export class Game {
	constructor(controller, is_tournament = false) {
		renderer.showBoard();
		
		this.is_tournament = is_tournament
		this.controller = controller;
		this.graphicEngine = new graphicEngine();
		this.running = true;

		this.setupMenuButton();
	}

	setupMenuButton() {
		const menuButton = document.querySelector("#menubtn");
		if (menuButton) {
			menuButton.classList.remove("d-none");
			menuButton.addEventListener("click", this.handleMenuButtonClick.bind(this));
		}
	}

	handleMenuButtonClick() {
		this.running = false;
		this.controller.cleanup();
		this.controller.stop = true;
	}

	stop()
	{
		this.controller.cleanup();
		const gameEnd = new CustomEvent("gameEnd", { detail: this.controller.getWinner() });
		document.dispatchEvent(gameEnd);
	}

	run() {
		const update = () => {
			if (this.controller.running === false) {
				if (this.is_tournament === true)
				{
					this.stop()
					this.graphicEngine.clearFrame()
				}
				//renderer.hideBoard();
				console.log("game over");
				return;
			}
			const data = this.controller.update();
			this.graphicEngine.display(data);
			requestAnimationFrame(update);
		};
		update();
	}
}