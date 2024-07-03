import { getCookie } from '../user.js';

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


	const oauth_btn = createModalButton('oauth-form', '42', 'secondary');
	main_frame.innerHTML = `
        <div class="d-flex justify-content-center align-items-center vh-100">
            <div class="text-center">
                <h1 class="mb-4">ft_traanscancdancee</h1>
                ${login_btn}
                ${signup_btn}
				${oauth_btn}
            </div>
        </div>`;
	main_frame.innerHTML += createModal('login-form', 'Login', '/auth/login/', login_fields);
	main_frame.innerHTML += createModal('signup-form', 'Sign Up', '/auth/signup/', signup_fields);
}

function authLogin() {
	const csrftoken = getCookie('csrftoken');

	document.getElementById('login-form').addEventListener('submit', function (event) {
		event.preventDefault();
		const username = document.getElementById("login-username").value;
		const password = document.getElementById("login-password").value;

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
		const username = document.getElementById("signup-username").value;
		const password = document.getElementById("signup-password").value;
		const email = document.getElementById("signup-email").value;

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
			'X-CSRFToken': csrftoken
		},
		body: JSON.stringify(data)
	});
	if (response.status >= 200 && response.status < 300) //200 login, 201 signup
	{
		const responseData = await response.json();
		console.log(responseData);
		localStorage.setItem('access_token', responseData.access);
		localStorage.setItem('refresh_token', responseData.refresh);
		location.reload()
	} else {
		const errorData = await response.json();
		console.error('Error:', errorData);
		alert('Failed. Please try again.');
	}
}


export function isAuthenticated() {
	const access_token = localStorage.getItem('access_token');
	const refresh_token = localStorage.getItem('refresh_token');
	//console.log("access_token " + access_token)
	//console.log("refresh_token " + refresh_token)
	return ((access_token && (access_token != undefined)) || (refresh_token && (refresh_token != undefined)))
}

export function authLogout() {
	const logoutBtn = document.getElementById('logoutBtn');
	logoutBtn.addEventListener('click', async function (event) {
		event.preventDefault();
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		location.reload()
	})
}

export function initAuth() {
	//localStorage.clear(); //uncomment to clear local storage
	if (isAuthenticated() == true) {
		let main_frame = document.getElementById("authDiv");
		main_frame.innerHTML = ``;
	}
	else {
		render_auth();
		authLogin();
		authSignup();
	}
}

export async function enable2FA() {
	const response = await fetch('/auth/2fa/enable-2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
		credentials: 'same-origin'
	});
	if (response.ok) {
		const responseData = await response.json();
		console.log(responseData);
		alert('2FA enabled successfully!');
		generateTwoFa();
	} else {
		const errorData = await response.json();
		if (errorData.detail === '2FA is already enabled for this user.')
			alert('2FA is already enabled for this user.');
		else
			alert('Failed. Please try again.');
		console.error('Error:', errorData);
	}
}

export async function disable2FA() {
	const response = await fetch('/auth/2fa/disable-2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
		credentials: 'same-origin'
	});
	if (response.ok) {
		const responseData = await response.json();
		console.log(responseData);
		alert('2FA disable successfully!');
	} else {
		const errorData = await response.json();
		console.error('Error:', errorData);
		alert('Failed. Please try again.');
	}
}

async function generateTwoFa() {
	const qrCodeContainer = document.getElementById('qr-code-container');
	qrCodeContainer.innerHTML = '';
	const response = await fetch(`/auth/2fa/generate-qr/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
		credentials: 'same-origin'
	});
	if (response.ok) {
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		qrCodeContainer.innerHTML = `<img src="${url}" alt="QR Code" />`;
	} else {
		const errorData = await response.json();
		console.error('Error:', errorData);
		alert('Failed. Please try again.');
	}
}

export async function verifyToken() {
	const token = document.getElementById('totpToken').value;
	console.log('Verifying token:', token);

	const response = await fetch('/auth/verify-token/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
		credentials: 'same-origin',
		body: JSON.stringify({ token: token })
	});

	if (response.ok) {
		console.log('Token verified');
		alert('Token verified successfully.');
	} else {
		const errorData = await response.json();
		console.error('Error verifying token:', errorData);
		alert('Failed to verify token. Please try again.');
	}
}