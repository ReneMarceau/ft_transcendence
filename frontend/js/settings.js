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
								<div id="profile-picture-container" class="d-flex justify-content-center align-items-center">
									<div class="img-container">
										<img id="profilePicture" class="" alt="profile picture" width="200" height="200">
									</div>
								<div class="svg-container btn btn-primary p-2 mx-auto">
									<i class="bi bi-upload"></i>
								</div>
							</div>
							<span id="profile-main-username" class="fs-1"></span>
						</div>
						<hr>
					</div>
				</div>
			</div
		</div>
		`)
	await initSettings()
}

async function initSettings() {
	const userid = getCurrentUserId()
	const username = await getUsername(userid)
	const avatar = await getAvatar(userid)
	
	if (username){
		document.getElementById("profile-main-username").innerText = username
	}

	if (avatar){
		document.getElementById("profilePicture").src = avatar
	}
	const changeImageBtn = document.getElementById("profile-picture-container").querySelector(".svg-container")
	changeImageBtn.addEventListener("click", () => {
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
			if (response.status === 200){
				const data = await response.json()
				document.getElementById("profilePicture").src = data.avatar
			} else {
				console.error('Upload failed:', response.statusText)
			}
		})
	})

}