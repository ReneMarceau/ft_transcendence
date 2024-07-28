import { getAlias } from "../user.js" 
import { isAuthenticated } from "../auth/auth.js"
import { LocalController } from "./controller.js"
import { Game } from "./Game.js"
import { createAlert, sanitizeInput } from "../utils.js";
import { setAlias } from "../user.js";
import { renderer } from "./graphic-engine.js";

const Status = {
    WAITING: 0,
    PLAYING: 1,
    SEMI: 2,
    FINAL: 3,
    END: 4
}


export class Tournament {
    constructor() {
        this.players = []
        this.winner = ""
        this.winner_semi = []
        this.game_nb = 1
        this.is_running = false
        this.status = Status.WAITING
        this.displayForm()
        this.init()
        this.is_empty = false
        this.alias = ""
    }

    init() {
        const tournamentForm = document.getElementById("tournamentForm")
        tournamentForm.addEventListener("submit", async (e) => {
            e.preventDefault()
            this.players[1] = sanitizeInput(document.getElementById("player1Tournament"));
            this.players[2] = sanitizeInput(document.getElementById("player2Tournament"));
            this.players[3] = sanitizeInput(document.getElementById("player3Tournament"));
            this.players[4] = sanitizeInput(document.getElementById("player4Tournament"));

            this.is_empty = this.players.some((player) => player === "")
            if (this.is_empty) {
                createAlert("danger", "Please fill all the fields");
                return;
            }
            
            if (this.alias !== this.players[1]) {
                await setAlias(this.players[1]);
            }
            this.status = Status.SEMI
			console.log('before display bracket!')
			this.displayBracket()
        })

        document.addEventListener("keyup", (e) => {
            if (e.code === 'Space' && !this.is_empty) {
                console.log(this.status)
                if ((this.status === Status.SEMI || this.status === Status.FINAL) && !this.is_running) {
                    this.playGame()
                    this.is_running = true
                }
            }
        })

        document.addEventListener("gameEnd", (e) => {
            console.log("gameEnd")
            this.is_running = false
            if (this.game_nb == 2)
                this.winner_semi[1] = e.detail
            else if (this.game_nb === 3)
                this.winner_semi[2] = e.detail
            else if (this.game_nb === 4 || this.status === Status.FINAL)
                this.winner = e.detail
            console.log(this.winner)
            console.log(this.winner_semi[1])
            console.log(this.winner_semi[2])
			this.displayBracket()
        })
    }

    playGame() {
		renderer.hideBracket()
        if (this.status === Status.END)
            return
        if (this.game_nb === 1) {
            const controller = new LocalController(this.players[1], this.players[2])
            controller.init()
            // console.log("game number 1")
            // document.removeEventListener("keyup", this.handleKeyUp)
            const game = new Game(controller, true)
            game.run()
            this.game_nb++
            return
        }
        else if (this.game_nb === 2) {
            const controller = new LocalController(this.players[3], this.players[4], false)
            controller.init()
            const game = new Game(controller, true)
            game.run()
            this.game_nb++
            this.status = Status.FINAL
            return
        }

        if (this.game_nb === 3) {
            const is_user = this.winner_semi[1] === this.alias
            const controller = new LocalController(this.winner_semi[1], this.winner_semi[2], is_user)
            controller.init()
            const game = new Game(controller, true)
            game.run()
            this.game_nb++
            this.status = Status.END
            return
        }

    }

	displayBracket() {
		const playerForm = document.getElementById("playerForm")
		playerForm.innerHTML = ""

		renderer.hideBoard()
		if (this.status === Status.END) {
			renderer.showBracket(this.game_nb, this.players[1], this.players[2], this.players[3], this.players[4],
			this.winner_semi[1], this.winner_semi[2], `The winner is ${this.winner}`)
			return
		}
		if (this.game_nb === 1) {
			renderer.showBracket(this.game_nb, this.players[1], this.players[2], this.players[3], this.players[4])
		}
		if (this.game_nb === 2) {
			renderer.showBracket(this.game_nb, this.players[1], this.players[2], this.players[3], this.players[4],
			this.winner_semi[1])
		}
		if (this.game_nb === 3) {
			renderer.showBracket(this.game_nb, this.players[1], this.players[2], this.players[3], this.players[4],
			this.winner_semi[1], this.winner_semi[2])
		}
	}

    async displayForm() {
        const playerForm = document.getElementById("playerForm")
        playerForm.innerHTML = tournamentForm()
        if (isAuthenticated()) {
            const player1Input = document.getElementById("player1Tournament");
            this.alias = await getAlias()
            player1Input.value = this.alias
        }
    }
}

function tournamentForm() {
    return `
	<div class="d-flex justify-content-center">
		<form id="tournamentForm" class="bg-dark m-2 p-4 border border-3 border-rounded border-primary" style="width: 400px;" novalidate>
			<h4 class="text-secondary fs-3 fw-bold text-center">Enter aliases</h4>
			<div class="mb-3">
				<label for="player1Tournament" class="form-label text-secondary">Player1</label>
				<input type="text" class="form-control" id="player1Tournament" required/>
			</div>
			<div class="mb-3">
				<label for="player2Tournament" class="form-label text-secondary">Player2</label>
				<input type="text" class="form-control" id="player2Tournament" required/>
			</div>
			<div class="mb-3">
				<label for="player3Tournament" class="form-label text-secondary">Player3</label>
				<input type="text" class="form-control" id="player3Tournament" required/>
			</div>
			<div class="mb-3">
				<label for="player4Tournament" class="form-label text-secondary">Player4</label>
				<input type="text" class="form-control" id="player4Tournament" required/>
			</div>
			<div id="tournamentError"></div>
			<button type="submit" id="tournamentFormSubmit" class="btn btn-primary">Submit</button>
		</form>
	</div>

	`
}