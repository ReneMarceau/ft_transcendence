import { createAlert, reloadPage } from '../utils.js';
import { getCookie } from '../user.js';

export function render_2fa() {
	const overlay = document.createElement('div');
	overlay.id = 'overlay';
	overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9999;';

	document.body.appendChild(overlay);
	document.getElementById("authDiv").innerHTML += `
        <div style="z-index: 10000" class="modal fade show" id="twofa-form-modal" tabindex="-1" role="dialog" aria-labelledby="twofa-Label" aria-hidden="true" data-backdrop="static" data-keyboard="false">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-secondary" id="twofa-Label">2FA token</h5>
                    </div>
                    <div class="modal-body">
                        <form id="twofa-form" action="/auth/2fa/verify-token/">
                            <div class="form-group">
                                <label for="twofa-input">Token</label>
                                <input type="number" class="form-control" id="twofa-input" placeholder="123 456" autocomplete="off" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Verify</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
	$('#twofa-form-modal').modal('show');
}


export async function enable2FA() {
	const response = await fetch('/auth/2fa/enable-2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
		credentials: 'same-origin'
	});
	if (response.ok) {
		const responseData = await response.json();
		console.log(responseData);
		createAlert('success', responseData.detail);
		generateTwoFa();
	} else {
		const errorData = await response.json();
		createAlert('danger', errorData.detail);
		console.error('Error:', errorData);
	}
}

export async function disable2FA() {
	const response = await fetch('/auth/2fa/disable-2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		},
		credentials: 'same-origin'
	});
	if (response.ok) {
		const responseData = await response.json();
		console.log(responseData);
		createAlert('success', responseData.detail);
		reloadPage();
	} else {
		const errorData = await response.json();
		createAlert('danger', errorData.detail);
		console.error('Error:', errorData);
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
		document.getElementById("enable2faBtn").classList.add('d-none');
		qrCodeContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 100%;">
        <div class="text-center">
            <p>Scan the QR code with your authenticator app</p>
            <h3 class="text-warning">Dont lose your secret key<i class="bi bi-exclamation-triangle"></i></h3>
            <img src="${url}" alt="QR Code" style="max-width: 300px; max-height: 300px"/>
            </div>
        </div>
        `;
	} else {
		const errorData = await response.json();
		console.error('Error:', errorData);
		alert('Failed. Please try again.');
	}
}

async function verifyToken(url, data, token) {
	console.log('Verifying token:', token);

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': 'Bearer ' + data.access
		},
		credentials: 'same-origin',
		body: JSON.stringify({ otp: token })
	});

	if (response.ok) {
		console.log('Token verified');
		const responseData = await response.json();
		localStorage.setItem('access_token', data.access);
		localStorage.setItem('refresh_token', data.refresh);
		createAlert('success', responseData.detail);
		reloadPage();

	} else {
		const errorData = await response.json();
		console.error('Error verifying token:', errorData);
		createAlert('danger', errorData.detail);
	}
}

export async function handle2FA(responseData) {
	console.log('handle2FA');
	console.log(responseData)
	document.getElementById('twofa-form').addEventListener('submit', async function (event) {
		event.preventDefault();
		const token = document.getElementById("twofa-input").value;
		console.log(document.getElementById("twofa-input")); // Check if the element is found
		console.log(`token =${token}`)
		const url = event.target.action;
		await verifyToken(url, responseData, token);
	});
}