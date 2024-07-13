import { isAuthenticated } from "./auth/auth.js"
import { renderer } from "./game/graphic-engine.js"
import { getCurrentUserId, getUsername, getAvatar, getStats, getFriendList, getCookie } from "./user.js"
import { createAlert } from "./utils.js"
import { initSideBar } from "./sidebar.js"

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
	renderProfile(userid, username, avatar);
	const stats = await getStats(userid)
	renderStats(stats, userid);
	await renderHistory(stats, userid);
}

function renderStats(stats, userid) {
	console.log(stats)
	const games_won = stats.games_won;
	const games_lost = stats.games_lost;
	const games_total = games_won + games_lost;
	const winrate = games_total > 0 ? Math.round(games_won / games_total * 100) : 0;

    let winrate_color = "text-secondary"
    if (winrate >= 75) {
        winrate_color = "text-success"
    }
    else if (winrate < 25) {
        winrate_color = "text-danger"
    }
    else if (winrate > 25) {
        winrate_color = "text-warning"
    }

	let stats_div = document.getElementById("stats")
	stats_div.innerHTML = `
        <div id="profile-stats" class="container text-center">
            <div class="d-flex justify-content-around">
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Winrate</h5>
                        <h1 class="card-body fs-4 ${winrate_color}">${winrate}%</h1>
                    </div>
                </div>
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Games</h5>
                        <h1 class="card-body fs-4">${games_total}</h1>
                    </div>
                </div>
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Wins</h5>
                        <h1 class="card-body fs-4">${games_won}</h1>
                    </div>
                </div>
                <div class="card border border-3 bg-dark border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Losses</h5>
                        <h1 class="card-body fs-4">${games_lost}</h1>
                    </div>
                </div>
            </div>
        </div>
    </section>
		`
}

async function getGameData(game, userid) {
	let player1Data = await Promise.all([
		getUsername(game.player1),
		getAvatar(game.player1),
		game.score_player1
	]);

	let player2Data = await Promise.all([
		getUsername(game.player2),
		getAvatar(game.player2),
		game.score_player2
	]);

	return {
		player1: game.player1,
		player2: game.player2,
		player1_username: player1Data[0],
		player1_avatar: player1Data[1],
		score_player1: player1Data[2],
		player2_username: player2Data[0],
		player2_avatar: player2Data[1],
		score_player2: player2Data[2],
		status: game.winner === userid
			? `<div class="p-1"><h5 class="text-success fs-3 fw-bold text-center">Win</h5></div>`
			: `<div class="p-1"><h5 class="text-danger fs-3 fw-bold text-center">Loss</h5></div>`
	};
}

async function renderHistory(stats, userid) {
	const game_history = stats.game_history;
	console.log(game_history)
	let history_div = document.getElementById("history")
	history_div.innerHTML = `
		<div id="match-history" class="container text-center">	
	`
	if (game_history === undefined || game_history.length === 0) {
		history_div.innerHTML += `<div class="container p-3 border fs-3 border-primary border-rounded border-3 bg-dark text-danger">No game played yet...</div>`
	} else {
		await Promise.all(game_history.map(async (game) => {
			if (game.player2 === null) // Ignore AI games temporarily (to be fixed)
				return;

			const game_data = await getGameData(game, userid);

			history_div.innerHTML += `
                <div class="row align-items-center bg-dark justify-content-around border border-primary border-3 rounded p-2 m-2">
                    <div class="col-2"><img src="${game_data.player1_avatar}" class="img-fluid rounded float-left"></div>
                    <div class="col-3">
                        <div class="d-flex flex-column">
                            <div class="p-1">
                                <h5 class="user-link fs-4 fw-bold text-center"><a href="/profile?id=${game_data.player1}" data-link>${game_data.player1_username}</a></h5>
                            </div>
                            <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game_data.score_player1}</h5></div>
                        </div>
                    </div>
                    <div class="col-2">
                        <div class="d-flex align-items-center flex-column">
                            <div class="p-1">${game_data.status}</div>
                            <div class="p-1"><h5 class="fs-6 text-center text-secondary">${game.type}</h5></div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="d-flex flex-column">
                            <div class="p-1">
                                <h5 class="user-link fs-4 fw-bold text-center"><a href="/profile?id=${game_data.player2}" data-link>${game_data.player2_username}</a></h5>
                            </div>
                            <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game_data.score_player2}</h5></div>
                        </div>
                    </div>
                    <div class="col-2"><img src="${game_data.player2_avatar}" class="img-fluid rounded float-left"></div>
                </div>`;
		}));
	}
}

function renderProfile(userid, username, avatar) {
	document.getElementById("profileDiv").innerHTML = `
        <div class="row justify-content-center align-items-center">
            <div class="col-md-4 text-center mb-4 mb-md-0">
                <img src="${avatar}" class="rounded-circle img-fluid shadow-lg" alt="Avatar" style="max-width: 200px; max-height: 200px;">
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
        <hr class="w-50 mx-auto my-4"/>
        <section class="p-3">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    User Stats
                </div>
                <div id="stats" class="card-body bg-dark">
                </div>
            </div>
        </section>
        <section class="p-3">
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