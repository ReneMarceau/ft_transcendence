import { reloadPage, createAlert } from "../utils.js";
import { render_2fa, handle2FA } from "./2fa.js";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "../user.js";

export async function initOAuth() {
	console.log('initOAuth');
	const url = new URL(window.location.href);
	const params = new URLSearchParams(url.search);

	const refresh = params.get('refresh');
	const access = params.get('access');
	if (!refresh || !access) {
		return false
	}
	const decoded = jwtDecode(access);
	const response = await (fetch(`/api/users/${decoded.user_id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + access
		},
		credentials: 'same-origin'

	}));
	if (response.ok) {
		const responseData = await response.json();
		console.log(responseData);
		if (responseData.is_2fa_enabled == true) {
			render_2fa();
			await handle2FA({ access: access, refresh: refresh });
		} else if (refresh && access) {
			localStorage.setItem('access_token', access);
			localStorage.setItem('refresh_token', refresh);
			createAlert('success', 'Successfully logged in with 42');
			const cleanUrl = window.location.origin + window.location.pathname;
			history.replaceState({}, document.title, cleanUrl);
		}
		console.log(refresh, access);
		return true;
	}
	else {
		createAlert('danger', 'Failed to get user data');
		reloadPage();
		return false
	}
	return false

}