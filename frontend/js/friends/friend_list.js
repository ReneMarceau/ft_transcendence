import { getUsername, getStatus } from "../user.js"

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
		const status = await getStatus(friendList[i])
		friendListElement += `
        <li class="nav-item" style="margin: 0px;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <a href="/profile?id=${friendList[i]}" class="nav-link" data-link>${username}${getStatusClass(status)}</a>
                </div>
                <div class="col">
                    <a id="removeFriendBtn-${friendList[i]}" class="btn btn-sm btn-danger btn-delete-friend" data-friend-id="${friendList[i]}">Delete</a>
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
