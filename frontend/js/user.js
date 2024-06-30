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

export async function getUsername(userid) {
	const response = await fetch(`/api/profiles/${userid}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
	})
	const data = await response.json()
	console.log("data.alias =" + data.alias);
	let username = ""
	if (response.status >= 200 && response.status < 300)
		username = data.alias
	else {
		username = "error"
	}
	return username
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
	if (response.status >= 200 && response.status < 300)
		avatar = data.avatar
	else {
		avatar = "error"
	}
	return avatar
}