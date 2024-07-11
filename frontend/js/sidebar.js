import { isAuthenticated } from "./auth/auth.js"
import { getCurrentUserId, getFriendList, getStatus, getUsername, getCookie } from "./user.js"
import { createAlert } from "./utils.js"

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

async function createFriendList(friendList) {
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

async function createSidebar() {
	const userid = getCurrentUserId()
	const friendList = await getFriendList(userid)
	const friendListElement = await createFriendList(friendList)

	const friendCollapse = document.getElementById("friendCollapse")
	friendCollapse.innerHTML = `
    <div class="container position-absolute top-5 start-70 end-0 bg-dark" style="max-width: 30%; z-index: 1000">
			<div class="collapse" id="sidebarCollapse">	
                <div class="input-group m-3">
                    <input type="number" class="form-control" id="addFriendInput" placeholder="Enter friend's USER_ID (only)" aria-describedby="addFriendBtn">
                    <button type="button" class="btn btn-primary" id="addFriendBtn">Add Friend</button>
                </div>
				<div id="friendSidebar" class="d-flex m-2 p-2 flex-column align-items-stretch flex-shrink-0 text-bg-white">
					<h3 class="text-white fs-3 fw-bold">Friends</h3>
						<ul class="nav nav-pills flex-column mb-auto">
							<div id="friendListContainer">
                                ${friendListElement}
                            </div>
					   </ul>
                       <hr>
                       friendRequest here
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

async function initAddFriends() {
	const addFriendBtn = document.getElementById("addFriendBtn")
	const addFriendInput = document.getElementById("addFriendInput")
	const userid = getCurrentUserId()
	addFriendBtn.addEventListener("click", async () => {
		const friendList = await getFriendList(userid)
		if (friendList.includes(parseInt(addFriendInput.value))) {
			createAlert('danger', 'User is already your friend');
			return
		}
		console.log("addFriendInput.value: ", addFriendInput.value);
		console.log("userid: ", userid);
		if (parseInt(addFriendInput.value) === userid) {
			createAlert('danger', 'You cannot add yourself as a friend');
			return
		}

		friendList.push(addFriendInput.value)

		const response = await fetch(`/api/profiles/${userid}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
				'Authorization': 'Bearer ' + localStorage.getItem('access_token')
			},
			body: JSON.stringify({
				friends: friendList
			}),
			credentials: 'same-origin'
		});
		if (response.ok) {
			const responseData = await response.json();
			console.log(responseData);
			createAlert('success', responseData.detail);
			initSideBar()
		} else {
			const errorData = await response.json();
			if (errorData.detail === undefined)
				createAlert('danger', 'User not found');
			else
				createAlert('danger', errorData.detail);
			console.error('Error:', errorData);
		}
	});
}

async function initRemoveFriends() {
	const friendListContainer = document.getElementById("friendListContainer");
	const removeFriendButtons = friendListContainer.querySelectorAll(".btn-delete-friend");

	removeFriendButtons.forEach(button => {
		button.addEventListener("click", async () => {
			const userid = getCurrentUserId();
			const friendList = await getFriendList(userid);
			const friendId = parseInt(button.getAttribute("data-friend-id"));
			console.log(friendId);
			const newFriendList = friendList.filter(item => item !== friendId);
			console.log(newFriendList);

			const response = await fetch(`/api/profiles/${userid}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRFToken': getCookie('csrftoken'),
					'Authorization': 'Bearer ' + localStorage.getItem('access_token')
				},
				body: JSON.stringify({
					friends: newFriendList
				}),
				credentials: 'same-origin'
			});

			if (response.ok) {
				const responseData = await response.json();
				console.log(responseData);
				createAlert('success', responseData.detail);
				initSideBar();
			} else {
				const errorData = await response.json();
				createAlert('danger', errorData.detail);
				console.error('Error:', errorData);
			}
		});
	});
}


export async function initSideBar() {
	const friendBtn = document.getElementById("friendBtn")
	if (isAuthenticated() === false) {
		if (friendBtn != undefined)
			friendBtn.innerHTML = ""
		return
	}
	await createSidebar()
	await initAddFriends()
	await initRemoveFriends()

}
