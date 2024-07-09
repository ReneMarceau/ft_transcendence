import { isAuthenticated } from "./auth/auth.js"
import { renderer } from "./game/graphic-engine.js"
import { getCurrentUserId, getUsername, getAvatar } from "./user.js"

function hidePong() {
	renderer.hideBoard()
	const gameBtnDiv = document.getElementById("gameBtnDiv")
	gameBtnDiv.innerHTML = ""
}

export async function initProfile(userid = getCurrentUserId()) {
	console.log("user id :" + userid)
	hidePong()
	if (isAuthenticated() === false)
		return;

	let profile = document.getElementById("profileDiv")
	profile.classList.remove("d-none")

	const username = await getUsername(userid)
	const avatar = await getAvatar(userid)
	renderProfile(username, avatar);
	renderStats();
}

function renderStats() {
	let stats_div = document.getElementById("stats")
	stats_div.innerHTML = `
        <div id="profile-stats" class="container text-center">
            <div class="d-flex justify-content-around">
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Winrate</h5>
                        <h1 class="card-body fs-4">x%</h1>
                    </div>
                </div>
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Games</h5>
                        <h1 class="card-body fs-4">x</h1>
                    </div>
                </div>
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Wins</h5>
                        <h1 class="card-body fs-4">x</h1>
                    </div>
                </div>
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Losses</h5>
                        <h1 class="card-body fs-4">x</h1>
                    </div>
                </div>
            </div>
        </div>
    </section>
		`
}

function renderProfile(username, avatar) {
	document.getElementById("profileDiv").innerHTML = `
	<div class="row justify-content-center align-items-center">
		<div class="col-md-6 text-center mb-4 mb-md-0">
			<img src="${avatar}" class="rounded-circle img-fluid shadow-lg" alt="Avatar" style="max-width: 200px; max-height: 200px;">
		</div>
		<div class="col-md-6 text-center text-md-start">
			<h1 class="bold py-3 fs-2 fw-bold" style="font-family: 'Press Start 2P', cursive; word-wrap: break-word;">${username}</h1>
		</div>
	</div>
	<hr class="w-25 mx-auto"/>
	<section class="p-4">
		<div class="card">
			<div class="card-header bg-primary text-white">
				User Stats
			</div>
			<div id="stats" class="card-body bg-dark">
			</div>
		</div>
	</section>
	<hr class="w-25 mx-auto"/>
	<section id="history" class="p-4">
		<div class="card">
			<div class="card-header bg-primary text-white">
				Game History
			</div>
			<div class="card-body bg-dark">
			</div>
		</div>
	</section>
	`
}