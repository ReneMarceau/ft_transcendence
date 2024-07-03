import { isAuthenticated } from './auth/auth.js'
import { authLogout } from './auth/auth.js'
import { createSettings } from './settings.js'

export async function initNavBar() {
	document.querySelector('body').insertAdjacentHTML('afterbegin', `
        <nav class="navbar navbar-expand-sm sticky-top navbar-dark bg-dark">
            <div class="container-fluid">
            <a class="btn btn-primary navbar-brand" href="/">
                <i class="bi bi-house-fill"></i> Home
            </a>
                <div id="navBarButtons">
                </div>
            </div>
        </nav>
    `)
	await createButtons()
}

async function createButtons() {
	if (isAuthenticated() === true) {
		let nav = document.querySelector("#navBarButtons")
		nav.innerHTML = `
            <div class="d-flex navbar-nav ms-auto">
               <a id="friendBtn" class="btn btn-primary nav-item m-2" data-toggle="collapse" data-target="#sidebarCollapse">Friends
					<i class="bi bi-people-fill"></i>
			   </a>
            	<a id="profileBtn" class="btn btn-primary nav-item m-2" href="/profile" data-link>Profile
					<i class="bi bi-person-fill"></i>
				</a>
				<a id="settingsBtn" class="btn btn-primary nav-item m-2" data-toggle="modal" data-target="#settingsModal">Settings
					<i class="bi bi-gear-fill"></i>
				</a>
				<a id="logoutBtn" class="btn btn-secondary nav-item m-2">Logout
					<i class="bi bi-box-arrow-right"></i>
				</a>
            </div>
        `
		authLogout()
		await createSettings()
	}
	else {
		//todo- if not auth
	}
}