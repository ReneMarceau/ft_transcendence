import { isAuthenticated } from "../auth/auth.js"
import { renderer } from "../game/graphic-engine.js"
import { getCurrentUserId, getUsername, getAvatar, getStats } from "../user.js"
import { renderStats } from "./stats.js"
import { renderHistory } from "./history.js"
import { cancelGame } from "../utils.js"

function hidePong() {
	renderer.hideBoard()
	renderer.hideBracket()
	let localGameBtn = document.querySelector("#localgamebtn")
	let aiGameBtn = document.querySelector("#aigamebtn")
	//let remoteGameBtn = document.querySelector("#remotegamebtn")
	let tournamentBtn = document.querySelector("#tournamentbtn")

	tournamentBtn.classList.add('d-none')
	localGameBtn.classList.add('d-none')
	//remoteGameBtn.classList.add('d-none')
	aiGameBtn.classList.add('d-none')
}

export async function initProfile(userid = getCurrentUserId()) {
	console.log("user id :" + userid)
    const playerForm = document.getElementById("playerForm")
    playerForm.innerHTML = ``
	hidePong()
	if (isAuthenticated() === false )
		return;
	
	document.dispatchEvent(cancelGame);
	
	let profile = document.getElementById("profileDiv")
	profile.classList.remove("d-none")

    // Promise.all is used so that the profile information is fetched in parallel (fastest)
    let listProfileInfo = await Promise.all([
        getUsername(userid),
        getAvatar(userid),
        getStats(userid)
    ])
	renderProfile(userid, listProfileInfo[0], listProfileInfo[1]);
	renderStats(listProfileInfo[2], userid);
	await renderHistory(listProfileInfo[2], userid);
}

function renderProfile(userid, username, avatar) {
	document.getElementById("profileDiv").innerHTML = `
        <div class="row justify-content-center align-items-center">
            <div class="col-md-4 text-center mb-4 mb-md-0">
                <img src="${avatar}" class="rounded-circle img-fluid shadow-lg" alt="Avatar" style="width: 200px; height: 200px;">
            </div>
            <div class="col-md-8 text-center text-md-start mx-auto">
                <h1 class="bold py-3 fs-2 fw-bold" style="font-family: 'Press Start 2P', cursive; word-wrap: break-word;">${username}</h1>
                <div class="d-flex justify-content-center align-items-center">
                <span style="font-family: 'Press Start 2P'; margin-right: 10px;">User ID #</span>
                <div class="col-sm-2">
                    <input type="text" readonly class="form-control-plaintext text-center fs-4" value="${userid}" style="font-family: 'Press Start 2P';">
                </div>
            </div>
            </div>
        </div>
        <hr class="w-50 mx-auto my-2"/>
        <section class="p-2">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    User Stats
                </div>
                <div id="stats" class="card-body bg-dark">
                </div>
            </div>
        </section>
        <section class="p-2">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    Game History
                </div>
                <div id="history" class="card-body bg-dark overflow-auto" style="max-height: 20vh;">
                </div>
            </div>
        </section>
    `;
}