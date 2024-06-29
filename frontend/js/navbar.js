import { isAuthenticated } from './auth/auth.js'
import { authLogout } from './auth/auth.js'

export async function initNavBar () {
    document.querySelector('body').insertAdjacentHTML('afterbegin', `
        <nav class="navbar navbar-expand-sm sticky-top navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar navbar-brand" href="/">Home</a>
                <div id="navBarButtons">
                </div>
            </div>
        </nav>
    `)
    await createButtons()
}

async function createButtons() {
    if (isAuthenticated() == true) {
        let nav = document.querySelector("#navBarButtons")
        nav.innerHTML = `
            <div class="d-flex navbar-nav ms-auto">
               <a id="friendBtn" class="btn btn-primary nav-item m-2" data-toggle="collapse" data-target="#sidebarCollapse">Friends</a>
            <a id="profileBtn" class="btn btn-primary nav-item m-2" href="/profile" data-link>Profile</a>
            <a id="settingsBtn" class="btn btn-primary nav-item m-2" data-toggle="modal" data-target="#settingsModal">Settings</a>
            <a id="logoutBtn" class="btn btn-secondary nav-item m-2">Logout</a>
            </div>
        `
        authLogout()
    }
    else
    {
        //todo- if not auth
    }
}