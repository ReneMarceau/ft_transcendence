import { getAvatar, getUsername } from "../user.js"

export async function createReceivedFriendRequestList(friendRequestList) {
	console.log(friendRequestList)
	console.log(friendRequestList.length)

	if (friendRequestList.length === 0)
		return `<div class="container p-3 border fs-3 border-primary border-rounded border-3 bg-dark text-danger">No friend request received yet...</div>`
	
	let friendRequestListElement = ""
	for (let i = 0; i < friendRequestList.length; i++) {
		const username = await getUsername(friendRequestList[i].sender)
		const avatar = await getAvatar(friendRequestList[i].sender)
		friendRequestListElement += `
		<li class="nav-item border border-primary rounded mb-2 w-75">
			<div class="row align-items-center p-2">
				<div class="col-auto">
					<img src="${avatar}" alt="${username}'s avatar" class="rounded-circle" width="40" height="40">
				</div>
				<div class="col">
					<a href="/profile?id=${friendRequestList[i].sender}" class="fw-bold text-center text-white fs-6" data-link>${username}</a>
				</div>
				<div class="col-auto">
					<a id="acceptFriendRequest-${friendRequestList[i].id}" data-sender-id="${friendRequestList[i].sender}" class="btn btn-sm btn-outline-success">
						<i class="bi bi-check-lg"></i>
					</a>
					<a id="declineFriendRequest-${friendRequestList[i].id}" data-sender-id="${friendRequestList[i].sender}" class="btn btn-sm btn-outline-danger">
						<i class="bi bi-x-lg"></i>
					</a>
				</div>
			</div>
		</li>
		`
	}
	return friendRequestListElement
}

export async function createSentFriendRequestList(friendRequestList) {
	console.log(friendRequestList)
	console.log(friendRequestList.length)

	if (friendRequestList.length === 0)
		return `<div class="container p-3 border fs-3 border-primary border-rounded border-3 bg-dark text-danger">No friend request sent yet...</div>`
	let friendRequestListElement = ""
	for (let i = 0; i < friendRequestList.length; i++) {
		const username = await getUsername(friendRequestList[i].receiver)
		const avatar = await getAvatar(friendRequestList[i].receiver)
		friendRequestListElement += `
		<li class="nav-item border border-primary rounded mb-2 w-75">
			<div class="row align-items-center p-2">
				<div class="col-auto">
					<img src="${avatar}" alt="${username}'s avatar" class="rounded-circle" width="40" height="40">
				</div>
				<div class="col">
					<a href="/profile?id=${friendRequestList[i].receiver}" class="fw-bold text-center text-white fs-6" data-link>${username}</a>
				</div>
				<div class="col-auto">
					<a id="cancelFriendRequest-${friendRequestList[i].id}" data-receiver-id="${friendRequestList[i].receiver}" class="btn btn-sm btn-outline-danger">
					<i class="bi bi-x-lg"></i>
					</a>
				</div>
			</div>
		</li>
		`
	}
	return friendRequestListElement
}