
import { getCookie } from "../user.js";
import { createAlert } from "../utils.js";
import { initSideBar } from "./sidebar.js";

async function handleFriendEvents(url, method) {
	const response = await fetch(url, {
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
		console.log("Success", result.detail);
		createAlert("success", result.detail);
		initSideBar();
	} else {
		console.log("Failed", result.detail);
		createAlert("danger", result.detail);
	}
}

export function initEventListeners() {
	const addFriendBtn = document.getElementById("addFriendBtn");
	addFriendBtn.addEventListener("click", async () => {
		const addFriendInput = document.getElementById("addFriendInput");
		const friendId = addFriendInput.value;
		await handleFriendEvents(`api/profiles/${friendId}/send_friend_request/`, "POST");
	});

	const removeFriendBtns = document.getElementById("friendListContainer");
	const removeFriendBtn = removeFriendBtns.querySelectorAll(".btn-danger");
	removeFriendBtn.forEach(btn => {
		btn.addEventListener("click", async () => {
			const friendId = btn.getAttribute("data-friend-id");
			await handleFriendEvents(`api/profiles/${friendId}/remove_friend/`, "DELETE");
		});
	});

	const receivedFrienRequestBtns = document.getElementById("receivedFriendRequestListContainer");
	const acceptFriendRequest = receivedFrienRequestBtns.querySelectorAll(".btn-success");
	acceptFriendRequest.forEach(btn => {
		btn.addEventListener("click", async () => {
			const senderId = btn.getAttribute("data-sender-id");
			await handleFriendEvents(`api/profiles/${senderId}/accept_friend_request/`, "POST");
		});
	});

	const declineFriendRequest = receivedFrienRequestBtns.querySelectorAll(".btn-danger");
	declineFriendRequest.forEach(btn => {
		btn.addEventListener("click", async () => {
			const senderId = btn.getAttribute("data-sender-id");
			await handleFriendEvents(`api/profiles/${senderId}/decline_friend_request/`, "DELETE");
		});
	});
	const cancelFriendRequest = document.getElementById("sentFriendRequestListContainer");
	const cancelFriendRequestBtn = cancelFriendRequest.querySelectorAll(".btn-danger");
	cancelFriendRequestBtn.forEach(btn => {
		btn.addEventListener("click", async () => {
			const receiverId = btn.getAttribute("data-receiver-id");
			await handleFriendEvents(`api/profiles/${receiverId}/cancel_friend_request/`, "DELETE");
		});
	});
}