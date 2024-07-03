import { renderer } from "./game/graphic-engine.js"
import { getCurrentUserId, getUsername, getAvatar } from "./user.js"

function hidePong() {
	renderer.hideBoard()
	const pongDiv = document.getElementById("pongDiv")
	pongDiv.innerHTML = ""
	const gameBtnDiv = document.getElementById("gameBtnDiv")
	gameBtnDiv.innerHTML = ""
}

export async function initProfile() {
	hidePong()

	let profile = document.getElementById("profileDiv")
	profile.classList.remove("d-none")

	const userid = getCurrentUserId()
	const username = await getUsername(userid)
	const avatar = await getAvatar(userid)
	renderProfile(username, avatar)
}

function renderProfile(username, avatar) {
	document.getElementById("profileDiv").innerHTML = `
    <div class="justify-content-center p-4 align-items-center">
		<div class="row">
			<div class="col-md-6 text-center">
				<img src="${avatar}" class="rounded-circle img-fluid shadow-lg" alt="Avatar" style="width: 200px; height: 200px;">
			</div>
			<div class="col-md-6">
				<h1 class="display-4 text-secondary bold py-3 fs-2 fw-bold" style="font-family: 'Press Start 2P', cursive;">${username}</h1>
			</div>
		</div>
	<section id="stats" class="p-4">
		<div class="card">
			<div class="card-header bg-primary text-white">
				User Stats
			</div>
		</div>
	</section>
    <hr class="w-25 mx-auto"/>
    <section id="history" class="p-4">
			<div class="card">
			<div class="card-header bg-primary text-white">
				Game History
			</div>
		</div>
	</section>
	`
}