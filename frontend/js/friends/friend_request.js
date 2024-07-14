import { getUsername } from "../user.js"

export async function createReceivedFriendRequestList(friendRequestList) {
	console.log(friendRequestList)
	console.log(friendRequestList.length)
	let friendRequestListElement = ""
	for (let i = 0; i < friendRequestList.length; i++) {
		const username = await getUsername(friendRequestList[i].sender)
		friendRequestListElement += `
		<li class="nav-item" style="margin: 0px;">
			<div class="row align-items-center">
				<div class="col-auto">
					<a href="/profile?id=${friendRequestList[i].sender}" class="nav-link" data-link>${username}</a>
				</div>
				<div class="col-auto">
					<a id="acceptFriendRequest-${friendRequestList[i].id}" data-sender-id="${friendRequestList[i].sender}" class="btn btn-success"><i class="bi bi-check-lg"></i></a>
					<a id="declineFriendRequest-${friendRequestList[i].id}" data-sender-id="${friendRequestList[i].sender}" class="btn btn-danger"><i class="bi bi-x-lg"></i></a>
				</div>
			</div>
		</li>
		`
	}
	if (friendRequestListElement === "") {
		friendRequestListElement = "you have no friend requests, yet..."
	}
	return friendRequestListElement
}

export async function createSentFriendRequestList(friendRequestList) {
	console.log(friendRequestList)
	console.log(friendRequestList.length)
	let friendRequestListElement = ""
	for (let i = 0; i < friendRequestList.length; i++) {
		const username = await getUsername(friendRequestList[i].receiver)
		friendRequestListElement += `
		<li class="nav-item" style="margin: 0px;">
			<div class="row align-items-center">
				<div class="col-auto">
					<a href="/profile?id=${friendRequestList[i].receiver}" class="nav-link" data-link>${username}</a>
				</div>
				<div class="col-auto">
					<a id="cancelFriendRequest-${friendRequestList[i].id}" data-receiver-id="${friendRequestList[i].receiver}" class="btn btn-danger"><i class="bi bi-x-lg"></i></a>
				</div>
			</div>
		</li>
		`
	}
	if (friendRequestListElement === "") {
		friendRequestListElement = "you have no friend requests, yet..."
	}
	return friendRequestListElement
}