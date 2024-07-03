import { disable2FA, enable2FA, verifyToken } from "./auth/auth.js"
import { getCookie, getCurrentUserId, getUsername, getEmail, getAvatar } from "./user.js"

export async function createSettings() {
	document.querySelector('body').insertAdjacentHTML('afterbegin', `
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
							<h2 id="profile-main-username" class="fs-1"></h2>
							<h3 id="profile-main-email" class="fs-3"></h3>
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
		`)
	await initSettings()
}

async function ChangeImage(userid) {
	const input = document.createElement("input")
	input.type = "file"
	input.accept = "image/*"
	input.click()
	input.addEventListener("change", async () => {
		const file = input.files[0]
		const formData = new FormData()
		formData.append("avatar", file)
		const response = await fetch(`/api/profiles/${userid}/`, {
			method: "PATCH",
			headers: {
				"X-CSRFToken": getCookie("csrftoken"),
				'Authorization': 'Bearer ' + localStorage.getItem('access_token')
			},
			body: formData
		})
		if (response.ok) {
			console.log('Upload successful!')
			location.reload()
		} else {
			console.error('Upload failed:', response.statusText)
		}
	})
}

function render_buttons(userid) {
	const main_frame = document.getElementById("profile-settings");
	main_frame.innerHTML = '<h2>Informations Settings</h2>';

	const formData = [
		{ id: 'changeUsernameForm', label: 'New Username', type: 'text' },
		{ id: 'changeEmailForm', label: 'New Email', type: 'email' },
		{ id: 'changePasswordForm', label: 'New Password', type: 'password' }
	];

	let buttonsHTML = '<div class="d-flex align-items-center">';
	formData.forEach((data, index) => {
		buttonsHTML += `<button id="change${data.id}Btn" type="button" class="btn btn-primary m-1">${data.label}</button>`;
	});
	buttonsHTML += '</div>';

	main_frame.insertAdjacentHTML('beforeend', buttonsHTML);
	formData.forEach(data => {
		let formHTML = `
            <form class="mt-3 d-none" id="${data.id}" action="/api/users/${userid}/">
				<label for="new${data.id}" class="m-1">${data.label}</label>
                <div class="form-group d-flex align-items-center">
                    <input type="${data.type}" class="form-control m-1" id="new${data.id}" name="new${data.id}">
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
            </form>
        `;
		main_frame.insertAdjacentHTML('beforeend', formHTML);
	});

	document.getElementById("changeUsernameForm").classList.remove("d-none");
	formData.forEach(data => {
		const changeBtn = document.getElementById(`change${data.id}Btn`);
		const changeForm = document.getElementById(data.id);

		changeBtn.addEventListener("click", function () {
			const allForms = document.querySelectorAll('form');
			allForms.forEach(changeForm => {
				changeForm.classList.add('d-none');
			});
			changeForm.classList.remove('d-none');
		});
	});
}

async function changeInfo(userid, type, newInfo) {
	try {
		const response = await fetch(`/api/users/${userid}/`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie("csrftoken"),
				'Authorization': 'Bearer ' + localStorage.getItem('access_token')
			},
			body: JSON.stringify({ [type]: newInfo })
		});

		const responseData = await response.json(); // Assuming response contains JSON data
		console.log('Response:', responseData); // Log response data

		if (response.ok) {
			console.log(`${type} changed successfully!`);
			location.reload();
		} else {
			console.error(`${type} change failed:`, response.statusText);
		}
	} catch (error) {
		console.error(`${type} change failed:`, error);
	}
}

async function initChangeInfo(userid) {
	const forms = document.getElementById("profile-settings").querySelectorAll("form");
	forms.forEach(form => {
		form.addEventListener("submit", async (event) => {
			event.preventDefault();
			const input = form.querySelector("input").value;
			const type = form.id.slice(6, -4).toLowerCase();
			console.log(`Changing ${type}...`);
			console.log(`New ${type}:`, input);
			await changeInfo(userid, type, input);
		});
	});
}

async function render_two_fa_settings() {
	const twofaSettings = document.getElementById("2fa-settings");
	twofaSettings.innerHTML = `
			<h2 class="mb-4">2FA Settings</h2>
            <div class="d-flex">
                <button id="enable2faBtn" class="btn btn-primary mx-2">Enable 2FA</button>
                <button id="disable2faBtn" class="btn btn-primary mx-2">Disable 2FA</button>
            </div>
			`;
	//<input type="text" id="totpToken" placeholder="Enter TOTP Token">
	//<button id="verifyBtn" class="btn btn-primary mx-2">Verify Token</button>

}

async function initSettings() {
	const userid = getCurrentUserId()
	document.getElementById("profile-main-username").innerText = await getUsername(userid)
	document.getElementById("profile-main-email").innerText = await getEmail(userid)
	document.getElementById("profilePicture").src = await getAvatar(userid)

	const changeImageBtn = document.getElementById("profile-picture-container").querySelector(".svg-container");
	changeImageBtn.addEventListener("click", () => ChangeImage(userid));

	render_buttons(userid);
	initChangeInfo(userid);

	render_two_fa_settings();
	const enable2faBtn = document.getElementById("enable2faBtn");
	const disable2faBtn = document.getElementById("disable2faBtn");

	enable2faBtn.addEventListener("click", async () => {
		console.log("Enabling 2FA...");
		await enable2FA();
	});
	disable2faBtn.addEventListener("click", async () => {
		console.log("Disabling 2FA...");
		await disable2FA();
		location.reload();
	});

	// const verifyBtn = document.getElementById("verifyBtn");
	// verifyBtn.addEventListener("click", async () => {
	// 	console.log("Verifying token...");
	// 	await verifyToken();
	// });

}