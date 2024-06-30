import { isAuthenticated } from "./auth/auth.js"

async function createSidebar(){
    const friendCollapse = document.getElementById("friendCollapse")

    friendCollapse.innerHTML = `
    <div class="container position-absolute top-5 start-70 end-0 bg-light" style="max-width: 30%; z-index: 1000">
			<div class="collapse" id="sidebarCollapse">	
				<div id="friendSidebar" class="d-flex m-2 p-2 flex-column align-items-stretch flex-shrink-0 text-bg-dark">
					<h3 class="text-primary fs-3 fw-bold">Friends</h3>
						<ul class="nav nav-pills flex-column mb-auto">
							<div id="friendListContainer">
                                friendlist here
                            </div>
					   </ul>
                       friendRequest here
				</div>
			</div>
		</div>
    `

    const collapse = document.getElementById("sidebarCollapse")
    if (collapse) {
        document.addEventListener("click", () => {
            collapse.classList.remove("show")
        });
    }

}

export async function initSideBar() {
    const friendBtn = document.getElementById("friendBtn")
    if (isAuthenticated == false) {
        if (friendBtn != undefined)
            friendBtn.innerHTML = ""
        return
    }

    await createSidebar()
}