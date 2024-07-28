
import { getCookie } from "../user.js";
import { createAlert } from "../utils.js";
import { updateSideBar } from "./sidebar.js";

async function handleFriendEvents(method, action, user_id) {
	const response = await fetch(`api/profiles/${user_id}/${action}/`, {
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"X-CSRFToken": getCookie("csrftoken"),
			"Authorization": "Bearer " + localStorage.getItem("access_token"),
		},
	});
	const result = await response.json();
	console.log(result);
	if (response.ok) {
		await updateSideBar()
		console.log("Success", result.detail);
		createAlert("success", result.detail);
	} else {
		console.log("Failed", result.detail);
		createAlert("danger", result.detail);
	}
}

export async function updateFriendStatus(username, status) {
	const friendElements = document.querySelectorAll('.nav-item');
	friendElements.forEach(friendElement => {
		const friendLink = friendElement.querySelector('a.nav-link');
		if (friendLink && friendLink.textContent.trim() === username) {
			const statusBadge = friendElement.querySelector('span.badge');
			statusBadge.textContent = status;
		}
	});
	await updateSideBar()
}

export function initEventListeners() {
	console.log("event friends")

	const addFriendBtn = document.getElementById("addFriendBtn");
	if (addFriendBtn) {
		addFriendBtn.addEventListener("click", async () => {
			const addFriendInput = document.getElementById("addFriendInput");
			const friendId = addFriendInput.value;
			if (friendId === "") {
				createAlert("danger", "Please provide a user id");
				return;
			}
			await handleFriendEvents("POST", 'send_friend_request', friendId);
		});
	}


	const removeFriendBtns = document.getElementById("friendListContainer");
	const removeFriendBtn = removeFriendBtns.querySelectorAll(".btn-outline-danger");
	removeFriendBtn.forEach(btn => {
		btn.addEventListener("click", async () => {
			const friendId = btn.getAttribute("data-friend-id");
			await handleFriendEvents("DELETE", `remove_friend`, friendId);
		});
	});

	const receivedFrienRequestBtns = document.getElementById("receivedFriendRequestListContainer");
	const acceptFriendRequest = receivedFrienRequestBtns.querySelectorAll(".btn-outline-success");
	acceptFriendRequest.forEach(btn => {
		btn.addEventListener("click", async () => {
			const senderId = btn.getAttribute("data-sender-id");
			await handleFriendEvents("POST", 'accept_friend_request', senderId);
		});
	});

	const declineFriendRequest = receivedFrienRequestBtns.querySelectorAll(".btn-outline-danger");
	declineFriendRequest.forEach(btn => {
		btn.addEventListener("click", async () => {
			const senderId = btn.getAttribute("data-sender-id");
			await handleFriendEvents("DELETE", `decline_friend_request`, senderId);
		});
	});
	const cancelFriendRequest = document.getElementById("sentFriendRequestListContainer");
	const cancelFriendRequestBtn = cancelFriendRequest.querySelectorAll(".btn-outline-danger");
	cancelFriendRequestBtn.forEach(btn => {
		btn.addEventListener("click", async () => {
			const receiverId = btn.getAttribute("data-receiver-id");
			await handleFriendEvents("DELETE", `cancel_friend_request`, receiverId);
		});
	});
}