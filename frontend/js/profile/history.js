import { getUsername, getAvatar } from "../user.js";

async function getGameData(game, userid) {
	let player1Data = await Promise.all([
		getUsername(game.profile.user),
		getAvatar(game.profile.user),
		game.score_player1
	]);

	let player2Data = await Promise.all([
		game.player2,
		`https://${document.location.host}/media/avatars/default-avatar.png`,
		game.score_player2
	]);

	return {
		player1: userid,
		player2: null,
		player1_username: player1Data[0],
		player1_avatar: player1Data[1],
		score_player1: player1Data[2],
		player2_username: player2Data[0],
		player2_avatar: player2Data[1],
		score_player2: player2Data[2],
		status: game.winner === game.player1
			? `<div class="p-1"><h5 class="text-success fs-3 fw-bold text-center">Win</h5></div>`
			: game.winner === game.player2
			? `<div class="p-1"><h5 class="text-danger fs-3 fw-bold text-center">Loss</h5></div>`
			: `<div class="p-1"><h5 class="text-warning fs-3 fw-bold text-center">Draw</h5></div>`,
		finished_at: game.finished_at,
	};
}

export async function renderHistory(stats, userid) {
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
			const formattedDate = new Date(game_data.finished_at).toLocaleString("en-US", {
				weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
			});

			history_div.innerHTML += `
                <div class="row align-items-center bg-dark justify-content-around border border-primary border-3 rounded p-2 m-2">
                    <div class="col-2"><img src="${game_data.player1_avatar}" class="img-fluid rounded float-left"></div>
                    <div class="col-3">
                        <div class="d-flex flex-column">
                            <div class="p-1">
                                <h5 class="user-link fs-4 fw-bold text-center text-white">${game_data.player1_username}</h5>
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
                                <h5 class="user-link fs-4 fw-bold text-center text-white">${game_data.player2_username}</h5>
                            </div>
                            <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game_data.score_player2}</h5></div>
                        </div>
                    </div>
                    <div class="col-2"><img src="${game_data.player2_avatar}" class="img-fluid rounded float-left"></div>
					<div class="col-12"><h6 class="text-secondary fs-6 fw-bold text-right mt-3">${formattedDate}</h6></div>
                </div>`;
		}));
	}
}