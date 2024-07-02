import { getCookie, getCurrentUserId, getUsername, getAvatar } from "./user.js"


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
						</div>
						<hr>
						<div id="profile-settings" class="d-flex flex-column align-items-center">
							<div class="d-flex justify-content-between w-75">
								<span class="fs-4">Username</span>
								<span class="fs-4"><a id="changeUsernameBtn" class="btn p-1">Change</a></span>
							</div>
							<div class="d-flex justify-content-between w-75">
								<span class="fs-4">Password</span>
								<span class="fs-4"><a class="btn p-1">Change</a></span>
							</div>
						</div>
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
			//const data = await response.json()
			// document.getElementById("profilePicture").src = data.avatar
			location.reload()
		} else {
			console.error('Upload failed:', response.statusText)
		}
	})
}

async function ChangeUsername(userid) {
	// Prompt the user to enter a new username
	const newUsername = prompt("Enter the new username:");

	// Check if the user provided a new username
	if (newUsername) {
		try {
			const response = await fetch(`/api/users/${userid}/`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": getCookie("csrftoken"),
					'Authorization': 'Bearer ' + localStorage.getItem('access_token')
				},
				body: JSON.stringify({ username: newUsername })
			});
			if (response.ok) {
				// const data = await response.json();
				// getUsername(userid) = data.username;
				location.reload()
			} else {
				console.error('Username change failed:', response.statusText);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	} else {
		console.log('Username change cancelled or no username entered');
	}
}

async function initSettings() {
	const userid = getCurrentUserId()
	document.getElementById("profile-main-username").innerText = await getUsername(userid)
	document.getElementById("profilePicture").src = await getAvatar(userid)

	const changeImageBtn = document.getElementById("profile-picture-container").querySelector(".svg-container");
	changeImageBtn.addEventListener("click", () => ChangeImage(userid));
	const changeUsernameBtn = document.getElementById("changeUsernameBtn");
	changeUsernameBtn.addEventListener("click", () => ChangeUsername(userid));


}