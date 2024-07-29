import { isAuthenticated } from './auth/auth.js';
import { enable2FA, disable2FA } from './auth/2fa.js';
import {
	getCookie,
	getCurrentUserId,
	getUsername,
	getEmail,
	getAvatar,
	getIs2Fa
} from './user.js';
import { createAlert, reloadPage, sanitizeInput } from './utils.js';

export async function createSettings() {
	document.querySelector('body').insertAdjacentHTML(
		'afterbegin',
		`
		<div class="modal fade" id="settingsModal">
			<div class="modal-dialog" modal-dialog-centered>
				<div class="modal-content bg-dark">
					<div class="modal-header">
						<h5 class="modal-title fs-5" id="profileLabel">Settings</h5>
						<div class="btn-close" data-dissmiss="modal"></div>
					</div>
					<div class="modal-body">
						<div>
							<div id="profile-main" class="d-flex flex-column align-items-center">
								<div id="profile-picture-container" class="d-flex justify-content-center align-items-center position-relative">
									<div class="img-container">
										<img id="profilePicture" class="img-fluid" alt="profile picture" width="200" height="200">
									</div>
									<div class="svg-container btn btn-primary p-3 position-absolute bottom-0 end-0 translate-middle">
										<i class="bi bi-upload"></i>
									</div>
								</div>
							</div>
							<div class="container">
								<div class="row mb-3">
									<label for="newchangeUsernameForm" class="col-sm-2 col-form-label">Username:</label>
									<div class="col-sm-10">
										<h3 id="profile-main-username" class="form-control-plaintext"></h3>
									</div>
								</div>
								<div class="row">
									<label for="newchangeEmailForm" class="col-sm-2 col-form-label">Email:</label>
									<div class="col-sm-10">
										<h3 id="profile-main-email" class="form-control-plaintext"></h3>
									</div>
								</div>
							</div>
						</div>
						<hr>
						<div id="profile-settings" class="d-flex flex-column align-items-center">
						</div>
						<hr>
						<div id="2fa-settings" class="d-flex flex-column align-items-center">
						</div>
						<div id="qr-code-container"></div>
					</div>
				</div>
			</div
		</div>
		`
	);
	await initSettings();
}

async function ChangeImage(userid) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.click();
	input.addEventListener('change', async () => {
		const file = input.files[0];
		const formData = new FormData();
		formData.append('avatar', file);
		const response = await fetch(`/api/profiles/${userid}/`, {
			method: 'PATCH',
			headers: {
				'X-CSRFToken': getCookie('csrftoken'),
				Authorization: 'Bearer ' + localStorage.getItem('access_token')
			},
			body: formData
		});
		if (response.status == 413) {
			createAlert('danger', 'File too large, max size is 2MB');
			console.error('Upload failed:', response.detail);
		}
		if (response.ok) {
			const responseData = await response.json();
			console.log('Upload successful!');
			createAlert('success', responseData.detail);
			reloadPage();
		} else {
			const errorData = await response.json();
			createAlert('danger', errorData.detail);
			console.error('Upload failed');
		}
	});
}

function render_buttons(userid) {
	const main_frame = document.getElementById('profile-settings');
	main_frame.innerHTML = '<h2>Informations Settings</h2>';

	const formData = [
		{ id: 'changeUsernameForm', label: 'New Username', type: 'text' },
		{ id: 'changeEmailForm', label: 'New Email', type: 'email' },
		{ id: 'changePasswordForm', label: 'New Password', type: 'password' }
	];

	let buttonsHTML = '<div class="d-flex align-items-center">';
	formData.forEach((data) => {
		buttonsHTML += `<button id="change${data.id}Btn" type="button" class="btn btn-primary m-1">${data.label}</button>`;
	});
	buttonsHTML += '</div>';

	main_frame.insertAdjacentHTML('beforeend', buttonsHTML);
	formData.forEach((data) => {
		let formHTML = '';
		if (data.id === 'changePasswordForm') {
			formHTML = `
                <form class="mt-3 d-none" id="${data.id}" action="/api/users/${userid}/">
                    <label for="new${data.id}" class="m-1">${data.label}</label>
                    <div class="form-group d-flex align-items-center">
                        <input type="${data.type}" class="form-control m-1" id="new${data.id}" name="new${data.id}" placeholder="New Password">
                    </div>
                    <label for="confirm${data.id}" class="m-1">Confirm Password</label>
                    <div class="form-group d-flex align-items-center">
                        <input type="${data.type}" class="form-control m-1" id="confirm${data.id}" name="confirm${data.id}" placeholder="Confirm Password">
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                </form>
            `;
		} else {
			formHTML = `
                <form class="mt-3 d-none" id="${data.id}" action="/api/users/${userid}/">
                    <label for="new${data.id}" class="m-1">${data.label}</label>
                    <div class="form-group d-flex align-items-center">
                        <input type="${data.type}" class="form-control m-1" id="new${data.id}" name="new${data.id}" placeholder="${data.label}">
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>
                </form>
            `;
		}
		main_frame.insertAdjacentHTML('beforeend', formHTML);
	});

	document.getElementById('changeUsernameForm').classList.remove('d-none');
	formData.forEach((data) => {
		const changeBtn = document.getElementById(`change${data.id}Btn`);
		const changeForm = document.getElementById(data.id);

		changeBtn.addEventListener('click', function () {
			const allForms = document.querySelectorAll('form');
			allForms.forEach((changeForm) => {
				changeForm.classList.add('d-none');
			});
			changeForm.classList.remove('d-none');
		});
	});
}

async function changeInfo(userid, type, newInfo) {
	try {
		const response = await fetch(`/api/users/${userid}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
				Authorization: 'Bearer ' + localStorage.getItem('access_token')
			},
			body: JSON.stringify({ [type]: newInfo })
		});

		const responseData = await response.json(); // Assuming response contains JSON data
		console.log('Response:', responseData); // Log response data

		if (response.ok) {
			console.log(`${type} changed successfully!`);
			createAlert('success', `${type} changed successfully!`);
			reloadPage();
		} else {
			const errorKeys = ['username', 'password', 'email', 'detail'];
			const errorKey = errorKeys.find((key) => responseData[key]);

			if (errorKey) {
				createAlert('danger', responseData[errorKey]);
			}
		}
	} catch (error) {
		console.error(`${type} change failed:`, error);
	}
}

async function initChangeInfo(userid) {
	const forms = document
		.getElementById('profile-settings')
		.querySelectorAll('form');
	forms.forEach((form) => {
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			const input = sanitizeInput(form.querySelector('input'));
			const type = form.id.slice(6, -4).toLowerCase();

			if (type === 'password') {
				const newPassword = sanitizeInput(form.querySelector(`#new${form.id}`));
				const confirmPassword = sanitizeInput(
					form.querySelector(`#confirm${form.id}`)
				);

				if (newPassword !== confirmPassword) {
					console.error('Passwords do not match!');
					createAlert('danger', 'Passwords do not match!');
					//alert('Passwords do not match!');
					return;
				}
				await changeInfo(userid, type, newPassword);
			}

			console.log(`Changing ${type}...`);
			console.log(`New ${type}:`, input);
			await changeInfo(userid, type, input);
		});
	});
}

async function render_two_fa_settings() {
	const twofaSettings = document.getElementById('2fa-settings');
	twofaSettings.innerHTML = `
			<h2 class="mb-4">2FA Settings</h2>
            <div class="d-flex">
                <button id="enable2faBtn" class="btn btn-primary mx-2">Enable 2FA</button>
                <button id="disable2faBtn" class="btn btn-primary mx-2">Disable 2FA</button>
            </div>
			`;
}

async function initSettings() {
	if (isAuthenticated() === false) return;

	const userid = getCurrentUserId();
	document.getElementById('profile-main-username').innerHTML =
		await getUsername(userid);
	document.getElementById('profile-main-email').innerHTML =
		await getEmail(userid);
	document.getElementById('profilePicture').src = await getAvatar(userid);

	const changeImageBtn = document
		.getElementById('profile-picture-container')
		.querySelector('.svg-container');
	changeImageBtn.addEventListener('click', () => ChangeImage(userid));

	render_buttons(userid);
	initChangeInfo(userid);

	render_two_fa_settings();
	const enable2faBtn = document.getElementById('enable2faBtn');
	const disable2faBtn = document.getElementById('disable2faBtn');

	const is2fa = await getIs2Fa(userid);
	if (is2fa) enable2faBtn.classList.add('d-none');
	else disable2faBtn.classList.add('d-none');

	enable2faBtn.addEventListener('click', async () => {
		console.log('Enabling 2FA...');
		await enable2FA();
	});
	disable2faBtn.addEventListener('click', async () => {
		console.log('Disabling 2FA...');
		await disable2FA();
	});
}
