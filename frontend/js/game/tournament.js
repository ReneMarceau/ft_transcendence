import { getUsername } from "../user.js"
import { isAuthenticated } from "../auth/auth.js"
import { LocalController } from "./controller.js"
import { Game } from "./Game.js"

const Status = {
	WAITING: 0,
	PLAYING: 1,
	END: 2
}


export class Tournament {
    constructor() {
		this.players = []
        this.winner = ""
		this.winner_semi = []
        this.game_nb = 1
		this.is_running = false
     	this.displayForm()
		this.init()
    }

	init()
	{
		const tournamentForm = document.getElementById("tournamentForm")
		tournamentForm.addEventListener("submit", async (e) => {
			e.preventDefault()
			this.status = Status.WAITING
			this.players[1] = document.getElementById("player1Tournament").value
			this.players[2] = document.getElementById("player2Tournament").value
			this.players[3] = document.getElementById("player3Tournament").value
			this.players[4] = document.getElementById("player4Tournament").value
		})

		document.addEventListener("keyup", (e) => {
			if (this.status != Status.PLAYING)
			{
				if (e.code === "Space") {
					this.hideForm()
					this.playGame()
				}
			}
		})
	}

	endGame()
	{
		if (this.game_nb === 1)
		{
			this.winner_semi[1] = this.players[1] //temporary i need to remake the event listener stuff
		}
		else if (this.game_nb === 2)
		{
			this.winner_semi[2] = this.players[3]
		}
		else if (this.game_nb === 3)
		{
			this.winner = this.players[1]
		}
	}

	playGame()
	{	
		this.status = Status.PLAYING
		if (this.game_nb === 1)
		{
			const controller = new LocalController(this.players[1], this.players[2])
			const game = new Game(controller)
			controller.init
			game.run()
			this.game_nb++
		}
		else if (this.game_nb === 2)
		{
			const controller = new LocalController(this.players[3], this.players[4])
			const game = new Game(controller)
			controller.init
			game.run()
			this.game_nb++
		}

		if (this.game_nb === 3)
		{
			const controller = new LocalController(this.winner_semi[1], winner_semi[2])
			const game = new Game(controller)
			controller.init
			game.run()
			this.game_nb++
		}

	}


    async displayForm() {
        const playerForm = document.getElementById("playerForm")
        playerForm.innerHTML = tournamentForm()
        if (isAuthenticated()) {
            const player1Input = document.getElementById("player1Tournament");
            const username = await getUsername()
            player1Input.value = username
        }
    }

	hideForm() {
		const playerForm = document.getElementById("playerForm")
		playerForm.innerHTML = ""
	}

}

function tournamentForm() {
    return `
	<div class="d-flex justify-content-center">
		<form id="tournamentForm" class="bg-dark m-2 p-4 border border-3 border-rounded border-primary" style="width: 400px;" novalidate>
			<h4 class="text-primary fs-3 fw-bold text-center">Enter aliases</h4>
			<div class="mb-3">
				<label for="player1Tournament" class="form-label text-secondary">Player1</label>
				<input type="text" class="form-control" id="player1Tournament"/>
			</div>
			<div class="mb-3">
				<label for="player2Tournament" class="form-label text-secondary">Player2</label>
				<input type="text" class="form-control" id="player2Tournament"/>
			</div>
			<div class="mb-3">
				<label for="player3Tournament" class="form-label text-secondary">Player3</label>
				<input type="text" class="form-control" id="player3Tournament"/>
			</div>
			<div class="mb-3">
				<label for="player4Tournament" class="form-label text-secondary">Player4</label>
				<input type="text" class="form-control" id="player4Tournament"/>
			</div>
			<div id="tournamentError"></div>
			<button type="submit" id="tournamentFormSubmit" class="btn btn-primary">Submit</button>
		</form>
	</div>

	`
}