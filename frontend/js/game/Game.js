import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"


export class Game {
	constructor(controller) {
		this.initializeRenderer();
		this.controller = controller;
		this.graphicEngine = new graphicEngine();
		this.running = true;

		this.setupMenuButton();
	}

	initializeRenderer() {
		renderer.showBoard();
		renderer.hideBoard();
	}

	setupMenuButton() {
		const menuButton = document.querySelector("#menubtn");
		menuButton.classList.remove("d-none");
		if (menuButton) {
			menuButton.addEventListener("click", this.handleMenuButtonClick.bind(this));
		}
	}

	handleMenuButtonClick() {
		this.running = false;
		this.controller.cleanup();
		this.controller.stop = true;
	}

	run() {
		const update = () => {
			if (!this.running) {
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