
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
		return true
	} else {
		console.log("Failed", result.detail);
		createAlert("danger", result.detail);
		return false
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

function handleAddFriendClick(e) {
	e.preventDefault();
	const addFriendInput = document.getElementById("addFriendInput");
	const friendId = addFriendInput.value;
	if (friendId === "") {
		createAlert("danger", "Please provide a user id");
		return;
	}
	handleFriendEvents("POST", 'send_friend_request', friendId);
}

function handleRemoveFriendClick(e) {
	e.preventDefault();
	const friendId = e.currentTarget.getAttribute("data-friend-id");
	handleFriendEvents("DELETE", `remove_friend`, friendId);
}

function handleAcceptFriendRequestClick(e) {
	e.preventDefault();
	const senderId = e.currentTarget.getAttribute("data-sender-id");
	handleFriendEvents("POST", 'accept_friend_request', senderId);
}

function handleDeclineFriendRequestClick(e) {
	e.preventDefault();
	const senderId = e.currentTarget.getAttribute("data-sender-id");
	handleFriendEvents("DELETE", `decline_friend_request`, senderId);
}

function handleCancelFriendRequestClick(e) {
	e.preventDefault();
	const receiverId = e.currentTarget.getAttribute("data-receiver-id");
	handleFriendEvents("DELETE", `cancel_friend_request`, receiverId);
}

export function initEventListeners() {
	console.log("event friends");

	const addFriendBtn = document.getElementById("addFriendBtn");
	if (addFriendBtn) {
		addFriendBtn.removeEventListener("click", handleAddFriendClick);
		addFriendBtn.addEventListener("click", handleAddFriendClick);
	}

	const removeFriendBtns = document.getElementById("friendListContainer");
	const removeFriendBtn = removeFriendBtns.querySelectorAll(".btn-outline-danger");
	removeFriendBtn.forEach(btn => {
		btn.removeEventListener("click", handleRemoveFriendClick);
		btn.addEventListener("click", handleRemoveFriendClick);
	});

	const receivedFriendRequestBtns = document.getElementById("receivedFriendRequestListContainer");
	const acceptFriendRequest = receivedFriendRequestBtns.querySelectorAll(".btn-outline-success");
	acceptFriendRequest.forEach(btn => {
		btn.removeEventListener("click", handleAcceptFriendRequestClick);
		btn.addEventListener("click", handleAcceptFriendRequestClick);
	});

	const declineFriendRequest = receivedFriendRequestBtns.querySelectorAll(".btn-outline-danger");
	declineFriendRequest.forEach(btn => {
		btn.removeEventListener("click", handleDeclineFriendRequestClick);
		btn.addEventListener("click", handleDeclineFriendRequestClick);
	});

	const cancelFriendRequest = document.getElementById("sentFriendRequestListContainer");
	const cancelFriendRequestBtn = cancelFriendRequest.querySelectorAll(".btn-outline-danger");
	cancelFriendRequestBtn.forEach(btn => {
		btn.removeEventListener("click", handleCancelFriendRequestClick);
		btn.addEventListener("click", handleCancelFriendRequestClick);
	});
}