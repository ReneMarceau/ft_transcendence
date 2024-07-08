import { jwtDecode } from "jwt-decode"

export function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

export function getCurrentUserId() {
	try {
		const decoded = jwtDecode(localStorage.getItem('access_token'));
		console.log(decoded);
		//console.log(decoded.user_id);
		return decoded.user_id;
	} catch (error) {
		console.error('Error decoding token:', error);
		return null;
	}
}

export async function getUsername(userid = getCurrentUserId()) {
	const response = await fetch(`/api/users/${userid}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
			
		},
	})
	const data = await response.json()
	console.log("data.username =" + data.username);
	let username = ""
	if (response.status >= 200 && response.status < 300)
		username = data.username
	else {
		username = "error"
	}
	return username
}

export async function getEmail(userid) {
	const response = await fetch(`/api/users/${userid}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')

		},
	})
	const data = await response.json()
	console.log("data.email =" + data.email);
	let email = ""
	if (response.status >= 200 && response.status < 300)
		email = data.email
	else {
		email = "error"
	}	
	return email
}

export async function getAvatar(userid) {
	const response = await fetch(`/api/profiles/${userid}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
	})
	const data = await response.json()
	console.log("data.avatar =" + data.avatar);
	let avatar = ""
	if (response.ok)
		avatar = data.avatar
	else {
		avatar = "error"
	}
	return avatar
}

export async function getFriendList(userid) {
	const response = await fetch(`/api/profiles/${userid}/`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
	})
	const data = await response.json()
	console.log("data.friends =" + data.friends);
	let friends = ""
	if (response.ok)
		friends = data.friends
	else {
		friends = "error"
	}
	return friends
}

export async function getIs2Fa(userid) {
	const response = await fetch(`/api/users/${userid}/`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
	})
	const data = await response.json()
	console.log(data);
	console.log("data.is2fa =" + data.is_2fa_enabled);
	let is2fa = ""
	if (response.ok)
		is2fa = data.is_2fa_enabled
	else {
		is2fa = "error"
	}
	return is2fa
}

export async function getStatus(userid) {
	const response = await fetch(`/api/profiles/${userid}/`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
	})
	const data = await response.json()
	console.log("data.status =" + data.status);
	let status = ""
	if (response.ok)
		status = data.status
	else {
		status = "error"
	}
	return status
}