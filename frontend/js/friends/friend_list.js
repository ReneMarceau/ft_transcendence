import { getUsername, getStatus, getAvatar } from "../user.js"

function getStatusClass(status) {
	let statusClass = ""
	let statusName = ""
	if (status === "online") {
		statusName = "Online"
		statusClass = "badge-success"
	} else if (status === "offline") {
		statusName = "Offline"
		statusClass = "badge bg-danger"
	} else if (status === "in_game") {
		statusName = "In Game"
		statusClass = "badge-warning"
	} else {
		statusName = "Unknown"
		statusClass = "badge-secondary"
	}
	return `<span class="badge m-2 ${statusClass}">${statusName}</span>`
}

export async function createFriendList(friendList) {
	let friendListElement = ""
	for (let i = 0; i < friendList.length; i++) {
		const username = await getUsername(friendList[i])
		const avatar = await getAvatar(friendList[i])
		const status = await getStatus(friendList[i])
		friendListElement += `

		<li class="nav-item border border-primary rounded mb-2 w-50">
			<div class="row align-items-center p-2">
				<div class="col-auto">
					<img src="${avatar}" alt="${username}'s avatar" class="rounded-circle" width="40" height="40">
				</div>
				<div class="col">
					<a href="/profile?id=${friendList[i]}" class="nav-link" data-link>${username}${getStatusClass(status)}</a>
				</div>
				<div class="col-auto">
					<a id="removeFriendBtn-${friendList[i]}" data-friend-id="${friendList[i]}" class="btn btn-sm btn-outline-danger">
						<i class="bi bi-x-lg"></i>
					</a>
				</div>
			</div>
		</li>
        `
	}
	if (friendListElement === "") {
		friendListElement = "you have no friends, yet..."
	}
	return friendListElement
}
