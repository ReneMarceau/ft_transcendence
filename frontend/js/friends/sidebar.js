import { isAuthenticated } from "../auth/auth.js"
import { getCurrentUserId, getFriendList, getReceivedFriendRequestList, getSentFriendRequestList } from "../user.js"
import { createFriendList } from "./friend_list.js"
import { createReceivedFriendRequestList, createSentFriendRequestList } from "./friend_request.js"
import { initEventListeners } from "./friend_events.js"

async function createSidebar() {
	const userid = getCurrentUserId()
	const friendList = await getFriendList(userid)
	const friendListElement = await createFriendList(friendList)

	const receivedFriendRequestList = await getReceivedFriendRequestList(userid)
	const receivedFriendRequestListElement = await createReceivedFriendRequestList(receivedFriendRequestList)

	const sentFriendRequestList = await getSentFriendRequestList(userid)
	const sentFriendRequestListElement = await createSentFriendRequestList(sentFriendRequestList)

	const friendCollapse = document.getElementById("friendCollapse")
	friendCollapse.innerHTML = `
    <div class="container position-absolute top-5 end-0 bg-dark w-25" style="z-index: 1000">
			<div class="collapse" id="sidebarCollapse">	
                <div class="input-group m-3">
                    <input type="number" class="form-control" id="addFriendInput" placeholder="Enter friend's USER_ID (only)" aria-describedby="addFriendBtn">
                    <button type="button" class="btn btn-primary mr-3" id="addFriendBtn">Add Friend</button>
                </div>
				<div id="friendSidebar" class="d-flex m-2 p-2 flex-column align-items-stretch flex-shrink-0 text-bg-white">
					<h3 class="text-white fs-3 fw-bold">Friends</h3>
					<ul class="nav nav-pills flex-column mb-auto">
						<div id="friendListContainer" class="bg-dark overflow-auto" style="max-height: 30vh;">
							${friendListElement}
						</div>
					</ul>
					<hr>
					<h3 class="text-white fs-3 fw-bold">Friend Request</h3>
					<h5 class="text-white fs-4 fw-bold">Received</h5>
					<ul class="nav nav-pills flex-column mb-auto">
						<div id="receivedFriendRequestListContainer" class=" bg-dark overflow-auto" style="max-height: 30vh;">
							${receivedFriendRequestListElement}
						</div>
					</ul>
					<hr>
					<h5 class="text-white fs-4 fw-bold">Sent</h5>
					<ul class="nav nav-pills flex-column mb-auto">
						<div id="sentFriendRequestListContainer" class=" bg-dark overflow-auto" style="max-height: 30vh;">
							${sentFriendRequestListElement}
						</div>
					</ul>
				</div>
				</div>
			</div>
		</div>
    `

	const collapse = document.getElementById("sidebarCollapse");
	if (collapse) {
		document.addEventListener("click", (event) => {
			if (!collapse.contains(event.target)) {
				collapse.classList.remove("show");
			}
		});
	}

	initEventListeners()
}



export async function updateSideBar() {
	if (isAuthenticated() === false)
		return

	const friendListContainer = document.getElementById('friendListContainer')
	const receivedFriendRequestListContainer = document.getElementById('receivedFriendRequestListContainer')
	const sentFriendRequestListContainer = document.getElementById('sentFriendRequestListContainer')

	const userid = getCurrentUserId()
	if (friendListContainer) {
		console.log('updating friendlist...')
		const friendList = await getFriendList(userid)
		const friendListElement = await createFriendList(friendList)
		friendListContainer.innerHTML = friendListElement
	}

	if (receivedFriendRequestListContainer) {
		console.log('updating received friendlist...')
		const receivedFriendRequestList = await getReceivedFriendRequestList(userid)
		const receivedFriendRequestListElement = await createReceivedFriendRequestList(receivedFriendRequestList)
		receivedFriendRequestListContainer.innerHTML = receivedFriendRequestListElement
	}

	if (sentFriendRequestListContainer) {
		console.log('updating sent friendlist...')
		const sentFriendRequestList = await getSentFriendRequestList(userid)
		const sentFriendRequestListElement = await createSentFriendRequestList(sentFriendRequestList)
		sentFriendRequestListContainer.innerHTML = sentFriendRequestListElement
	}

	initEventListeners()
}

export async function initSideBar() {
	const friendBtn = document.getElementById("friendBtn")
	if (isAuthenticated() === false) {
		if (friendBtn != undefined)
			friendBtn.innerHTML = ""
		return
	}

	await createSidebar()
}
