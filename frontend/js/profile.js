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
 	<h3 class="text-primary fs-1 fw-bold text-center">${username}</h3>
	<img src="${avatar}" class="rounded-circle mx-auto d-block" alt="avatar" width="200" height="200">
    <section id="stats" class="p-4">
		statistic section
    </section> 
    <hr class="w-25 mx-auto"/>
    <section id="history" class="p-4">
		history section
	</section>
	`
}