import { renderer } from "./game/graphic-engine.js"
import { getCookie } from "./auth/auth.js"
import { jwtDecode } from "jwt-decode"

function hidePong() {
	renderer.hideBoard()
	const pongDiv = document.getElementById("pongDiv")
	pongDiv.innerHTML = ""
	const gameBtnDiv = document.getElementById("gameBtnDiv")
	gameBtnDiv.innerHTML = ""
}

function getCurrentUserId() {
	const token = localStorage.getItem('access_token');

	try {
		const decoded = jwtDecode(token);
		console.log(decoded);
		//console.log(decoded.user_id);
		return decoded.user_id;
	} catch (error) {
		console.error('Error decoding token:', error);
		return null;
	}
}

async function getUsername(userid) {
	const csrftoken = getCookie('csrftoken');

	const response = await fetch("/api/profiles/" + userid, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': csrftoken
		},
	})
	const data = await response.json()
	console.log("data.alias =" + data.alias);
	let username = ""
	if (response.status >= 200 && response.status < 300)
		username = data.alias
	else {
		username = "error"
	}
	return username
}

async function getAvatar(userid) {
	const csrftoken = getCookie('csrftoken');

	const response = await fetch("/api/profiles/" + userid, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': csrftoken
		},
	})
	const data = await response.json()
	console.log("data.avatar =" + data.avatar);
	let avatar = ""
	if (response.status >= 200 && response.status < 300)
		avatar = data.avatar
	else {
		avatar = "error"
	}
	return avatar
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
	const profile = document.getElementById("profileDiv")
	profile.innerHTML = `
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