
import { getCookie } from "../user.js";
import { createAlert } from "../utils.js";
import { initSideBar } from "./sidebar.js";

export function initEventListeners()
{


    const addFriendBtn = document.getElementById("addFriendBtn");
    addFriendBtn.addEventListener("click", async () =>
    {
        const addFriendInput = document.getElementById("addFriendInput");
        const friendId = addFriendInput.value;
        const response = await fetch(`api/profiles/${friendId}/send_friend_request/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify({
                receiver: friendId
            })
        })
        if (response.ok) {
            console.log(response.detail);
            createAlert("success", response.detail);
            initSideBar();
        } else {
            console.log("Failed to send friend request");
        }
    });

    const removeFriendBtns = document.getElementById("friendListContainer");
    const removeFriendBtn = removeFriendBtns.querySelectorAll(".btn-danger");
    removeFriendBtn.forEach(btn => {
        btn.addEventListener("click", async () => 
        {
            const friendId = btn.getAttribute("data-friend-id");
            console.log("Remove friend");
            const response = await fetch(`api/profiles/${friendId}/remove_friend/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
            })
            if (response.ok) {
                console.log(response.detail);
                createAlert("success", response.detail);
                initSideBar();
            } else {
                console.log("Failed to remove friend");
            }
        });
    });

    const receivedFrienRequestBtns = document.getElementById("receivedFriendRequestListContainer");
    const acceptFriendRequest = receivedFrienRequestBtns.querySelectorAll(".btn-success");
    acceptFriendRequest.forEach(btn => {
        btn.addEventListener("click", async () => 
        {
            const senderId = btn.getAttribute("data-sender-id");
            console.log("Accept friend request");
            const response = await fetch(`api/profiles/${senderId}/accept_friend_request/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
            })
            if (response.ok) {
                console.log(response.detail);
                createAlert("success", response.detail);
                initSideBar();
            } else {
                console.log("Failed to accept friend request");
            }
        });
    })

    const declineFriendRequest = receivedFrienRequestBtns.querySelectorAll(".btn-danger");
    declineFriendRequest.forEach(btn => {
        btn.addEventListener("click", async () => 
        {
            const senderId = btn.getAttribute("data-sender-id");
            console.log("Decline friend request");
            const response = await fetch(`api/profiles/${senderId}/decline_friend_request/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
            })
            if (response.ok) {
                console.log(response.detail);
                createAlert("success", response.detail);
                initSideBar();
            } else {
                console.log("Failed to decline friend request");
            }
        });
    })

    const cancelFriendRequest = document.getElementById("sentFriendRequestListContainer");
    const cancelFriendRequestBtn = cancelFriendRequest.querySelectorAll(".btn-danger");
    cancelFriendRequestBtn.forEach(btn => {
        btn.addEventListener("click", async () => 
        {
            const receiverId = btn.getAttribute("data-receiver-id");
            console.log("Cancel friend request");
            const response = await fetch(`api/profiles/${receiverId}/cancel_friend_request/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
            })
            if (response.ok) {
                console.log(response.detail);
                createAlert("success", response.detail);
                initSideBar();
            } else {
                console.log("Failed to cancel friend request");
            }
        });
    })

}