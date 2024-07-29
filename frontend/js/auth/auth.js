import { getCookie, getCurrentUserId } from '../user.js';
import { createAlert, reloadPage, sanitizeInput } from "../utils.js"
import { initOAuth } from './oauth.js';
import { handle2FA, render_2fa } from './2fa.js';
import { jwtDecode } from "jwt-decode"

function createModal(id, title, formAction, fields) {
	return `
        <div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="${id}Label" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-secondary" id="${id}Label">${title}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="${id}-form" action="${formAction}">
                            ${fields.map(field => `
                                <div class="form-group">
                                    <label for="${field.id}">${field.label}</label>
                                    <input type="${field.type}" class="form-control" id="${field.id}" placeholder="${field.placeholder}" required>
                                </div>
                            `).join('')}
                            <button type="submit" class="btn btn-primary btn-block">${title}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
}

function createModalButton(id, title, color) {
	return `
		<button type="button" class="btn btn-${color} m-2" data-toggle="modal" data-target="#${id}">
			${title}
		</button>
		`;
}

export function render_auth() {
	let main_frame = document.getElementById("authDiv")

	const login_btn = createModalButton('login-form', 'Login', 'primary');

	const login_fields = [
		{ id: 'login-username', label: 'Username', type: 'text', placeholder: 'Enter username' },
		{ id: 'login-password', label: 'Password', type: 'password', placeholder: 'Password' }
	];

	const signup_btn = createModalButton('signup-form', 'Sign Up', 'primary');

	const signup_fields = [
		{ id: 'signup-username', label: 'Username', type: 'text', placeholder: 'Username' },
		{ id: 'signup-email', label: 'Email address', type: 'email', placeholder: 'Enter email' },
		{ id: 'signup-password', label: 'Password', type: 'password', placeholder: 'Password' }
	];


	main_frame.innerHTML += `
        <div class="d-flex justify-content-center align-items-center" style="height:80%">
            <div class="text-center">
                <h1 class="mt-5" style="font-family: 'Press Start 2P', cursive">ft_traanscancdancee</h1>
                ${login_btn}
                ${signup_btn}
				<a class="btn btn-secondary" id="oauth-form" href="/auth/oauth2/redirect/">
					<img src="https://icons.iconarchive.com/icons/simpleicons-team/simple/64/42-icon.png"
					alt="42 logo" style="width: 25px; height: 25px; padding: 0px"/>
				</a>
            </div>
        </div>`;
	main_frame.innerHTML += createModal('login-form', 'Login', '/auth/login/', login_fields);
	main_frame.innerHTML += createModal('signup-form', 'Sign Up', '/auth/signup/', signup_fields);
}

function authLogin() {
	const csrftoken = getCookie('csrftoken');

	document.getElementById('login-form').addEventListener('submit', function (event) {
		event.preventDefault();
		const username = sanitizeInput(document.getElementById("login-username"));
		const password = sanitizeInput(document.getElementById("login-password"));

		const url = event.target.action
		const data = {
			username: username,
			password: password,
			csrfmiddlewaretoken: csrftoken,
		}
		sendRequest(url, data, csrftoken)

	});
}

function authSignup() {
	const csrftoken = getCookie('csrftoken');

	document.getElementById('signup-form').addEventListener('submit', function (event) {
		event.preventDefault();
		const username = sanitizeInput(document.getElementById("signup-username"));
		const password = sanitizeInput(document.getElementById("signup-password"));
		const email = sanitizeInput(document.getElementById("signup-email"));

		const url = event.target.action
		const data = {
			username: username,
			password: password,
			email: email,
			csrfmiddlewaretoken: csrftoken,
		}
		sendRequest(url, data, csrftoken)

	});
}

async function sendRequest(url, data, csrftoken) {
	console.log(url)
	console.log("[data sent] url: " + url + " data: " + JSON.stringify(data))
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken,

		},
		body: JSON.stringify(data)
	});
	if (response.ok) //200 login, 201 signup
	{
		const responseData = await response.json();
		console.log(responseData);
		if (responseData.is_2fa_enabled == true) {
			render_2fa();
			await handle2FA(responseData);
		}
		else {
			localStorage.setItem('access_token', responseData.access);
			localStorage.setItem('refresh_token', responseData.refresh);
			createAlert('success', responseData.detail);
			reloadPage(true);
		}
	} else {
		const errorData = await response.json();
		console.error('Error:', errorData);
		const errorKeys = ['username', 'password', 'email', 'detail'];
		const errorKey = errorKeys.find(key => errorData[key]);
		
		if (errorKey) {
			createAlert('danger', errorData[errorKey]);
		}
	}
}

export function isAuthenticated() {
	const access_token = localStorage.getItem('access_token');
	const refresh_token = localStorage.getItem('refresh_token');
	//console.log("access_token " + access_token)
	//console.log("refresh_token " + refresh_token)
	if (access_token === null && refresh_token === null)
		return false;
	try{
		const decoded = jwtDecode(localStorage.getItem('access_token'));
		//console.log(decoded);
		if (decoded.exp < Date.now() / 1000) {
			console.log("Token expired")
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			return false;
		}
	}
	catch (error) {
		console.error('Error decoding token:', error);
		return null;
	}
	console.log("Token valid")
	return true;
}

export function authLogout() {
	const logoutBtn = document.getElementById('logoutBtn');
	logoutBtn.addEventListener('click', async function (event) {
		event.preventDefault();
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		createAlert('success', 'Logged out successfully!');
		reloadPage(true);
	})
}

export async function initAuth() {
	//localStorage.clear(); //uncomment to clear local storage
	if (await initOAuth() == true) return;
	if (isAuthenticated() === true) {
		let main_frame = document.getElementById("authDiv");
		main_frame.innerHTML = ``;
	}
	else {
		render_auth();
		authLogin();
		authSignup();
	}
}
