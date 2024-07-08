import { getUsername } from "../user.js"
import { isAuthenticated } from "../auth/auth.js"


export class Tournament {
    constructor() {
        this.winner = ""
        this.players = []
        this.game_nb = 1
        this.displayForm()   
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

}

function tournamentForm() {
    return `
	<div class="d-flex justify-content-center">
		<form id="tournamentForm" class="bg-dark m-2 p-4 border border-3 border-rounded border-primary" style="width: 400px;" novalidate>
			<h4 class="text-primary fs-3 fw-bold text-center">Enter aliases</h4>
			<div class="mb-3">
				<label for="player1Tournament" class="form-label text-secondary">Player1</label>
				<input type="text" class="form-control" id="player1Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div class="mb-3">
				<label for="player2Tournament" class="form-label text-secondary">Player2</label>
				<input type="text" class="form-control" id="player2Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div class="mb-3">
				<label for="player3Tournament" class="form-label text-secondary">Player3</label>
				<input type="text" class="form-control" id="player3Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div class="mb-3">
				<label for="player4Tournament" class="form-label text-secondary">Player4</label>
				<input type="text" class="form-control" id="player4Tournament"/>
				<div class="validation-field"></div>
			</div>
			<div id="tournamentError"></div>
			<button type="submit" id="tournamentFormSubmit" class="btn btn-primary">Submit</button>
		</form>
	</div>

	`
}