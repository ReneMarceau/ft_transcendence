import { graphicEngine } from "./graphic-engine.js"
import { renderer } from "./graphic-engine.js"

import { getCookie } from "../user.js";

// eNUM FOR all GAME TYPES
export const GAME_TYPES = {
	VS_AI: "vs_ai",
	ONE_VS_ONE: "1vs1",
	TOURNAMENT: "tournament",
}

async function startGame(gameType = GAME_TYPES.ONE_VS_ONE, player1, player2) {
	const response = await fetch("/api/games/", {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
		},
		credentials: 'same-origin',
		body: JSON.stringify({
			type: gameType,
			status: 'started',
			player1: player1,
			player2: player2,
		}),
	});
	if (!response.ok) {
		throw new Error("Failed to start game");
	}
	const data = await response.json();
	return data;
}

export async function endGame(gameId, score_player1, score_player2) {
	if (gameId === null)
		return;
	const response = await fetch(`/api/games/${gameId}/`, {
		method: "PATCH",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
		},
		credentials: 'same-origin',
		body: JSON.stringify({
			status: 'finished',
			score_player1: score_player1,
			score_player2: score_player2,
		}),
	});
	if (!response.ok) {
		throw new Error("Failed to end game");
	}
}

export class Game {
	constructor(controller, is_tournament = false) {
		renderer.showBoard();

		this.is_tournament = is_tournament
		this.controller = controller;
		this.graphicEngine = new graphicEngine();
		this.running = true;
		this.gameId = null;
		this.gameType = this.is_tournament ? GAME_TYPES.TOURNAMENT : null;
		if (this.gameType === null && this.controller.player2 === 'AI')
			this.gameType = GAME_TYPES.VS_AI;
		else if (this.gameType === null)
			this.gameType = GAME_TYPES.ONE_VS_ONE;

		this.setupMenuButton();
	}

	setupMenuButton() {
		const menuButton = document.querySelector("#menubtn");
		if (menuButton) {
			menuButton.classList.remove("d-none");
			menuButton.addEventListener("click", this.handleMenuButtonClick.bind(this));
		}
		window.addEventListener("popstate", this.handlePopState.bind(this));
	}

	handleMenuButtonClick() {
		this.running = false;
		this.controller.cleanup();
		this.controller.stop = true;
	}

	handlePopState() {
		console.log("popstate event");
		this.running = false;
		this.controller.cleanup();
		this.controller.stop = true;
		renderer.hideBoard();
	}


	stop(){
		this.controller.cleanup();
		const gameEnd = new CustomEvent("gameEnd", { detail: this.controller.getWinner() });
		document.dispatchEvent(gameEnd);
	}
	
	async run() {
		console.log("Game started");
		if (this.controller.is_user) {
			console.log("Game is user");
			const gameData = await startGame(this.gameType, this.controller.player1, this.controller.player2);
			this.gameId = gameData.id;
			console.log("Game started with id: " + gameData.id);
		}
		
		const update = async () => {
			if (this.controller.running === false) {
				if (this.is_tournament === true)
					{
						this.stop()
						this.graphicEngine.clearFrame()
					}
					//renderer.hideBoard();
					await endGame(this.gameId, this.controller.player1Score, this.controller.player2Score);
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