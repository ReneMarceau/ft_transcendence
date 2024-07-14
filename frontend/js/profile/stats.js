

function getWinrateColor(winrate) {
    if (winrate >= 75) {
        return "text-success";
    } else if (winrate < 25) {
        return "text-danger";
    } else {
        return "text-warning";
    }
}


export function renderStats(stats, userid) {
	console.log(stats)
	const games_won = stats.games_won;
	const games_lost = stats.games_lost;
	const games_total = games_won + games_lost;
	const winrate = games_total > 0 ? Math.round(games_won / games_total * 100) : 0;

    const winrate_color = getWinrateColor(winrate);

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