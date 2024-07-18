import { reloadPage, createAlert } from "../utils.js";
import { render_2fa, handle2FA } from "./2fa.js";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "../user.js";

async function fetchUserData(access) {
	return fetch(`/api/users/${jwtDecode(access).user_id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': `Bearer ${access}`
		},
		credentials: 'same-origin'
	});
}

async function handleSuccessfulOAuth(access, refresh, responseData) {
	if (responseData.is_2fa_enabled) {
		render_2fa();
		await handle2FA({ access, refresh });
	} else {
		localStorage.setItem('access_token', access);
		localStorage.setItem('refresh_token', refresh);
		createAlert('success', 'Successfully logged in with 42');
		const cleanUrl = window.location.origin + window.location.pathname;
		history.replaceState({}, document.title, cleanUrl);
	}
}

export async function initOAuth() {
	console.log('initOAuth');
	const params = new URLSearchParams(window.location.search);
	const refresh = params.get('refresh');
	const access = params.get('access');

	if (!refresh || !access) {
		return false;
	}

	const response = await fetchUserData(access);
	const responseData = await response.json();
	if (!response.ok) {
		createAlert('danger', 'Failed to get user data');
		reloadPage();
		return false;
	}

	console.log(responseData);
	await handleSuccessfulOAuth(access, refresh, responseData);
	console.log(refresh, access);
	return true;
}