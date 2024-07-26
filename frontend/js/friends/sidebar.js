import { isAuthenticated } from "../auth/auth.js"
import { getCurrentUserId, getFriendList, getReceivedFriendRequestList, getSentFriendRequestList} from "../user.js"
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
						<div id="friendListContainer">
							${friendListElement}
						</div>
					</ul>
					<hr>
					<h3 class="text-white fs-3 fw-bold">Friend Request</h3>
					<h4 class="text-white fs-4 fw-bold">Received</h4>
					<ul class="nav nav-pills flex-column mb-auto">
						<div id="receivedFriendRequestListContainer">
							${receivedFriendRequestListElement}
						</div>
					</ul>
					<h4 class="text-white fs-4 fw-bold">Sent</h4>
					<ul class="nav nav-pills flex-column mb-auto">
						<div id="sentFriendRequestListContainer">
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
}



export async function initSideBar() {
	const friendBtn = document.getElementById("friendBtn")
	if (isAuthenticated() === false) {
		if (friendBtn != undefined)
			friendBtn.innerHTML = ""
		return
	}
	await createSidebar()
	initEventListeners()

}
