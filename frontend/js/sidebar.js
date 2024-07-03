import { isAuthenticated } from "./auth/auth.js"
import { getCurrentUserId, getFriendList, getStatus, getUsername } from "./user.js"

async function createFriendList(friendList) {
    let friendListElement = ""
    for (let i = 0; i < friendList.length; i++) {
        const username = await getUsername(friendList[i])
        const status = await getStatus(friendList[i])
        friendListElement += `
        <li class="nav-item" style="margin: 0px;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <a href="api/profiles/${friendList[i]}" class="nav-link">
                        ${username}
                    <span class="badge rounded-pill">
                        ${status}
                        </span>
                    </a>
                </div>
                <div class="col">
                    <a class="btn btn-sm btn-danger btn-delete-friend">Delete</a>
                </div>
            </div>
        </li>
        `
    }
    if (friendListElement == "") {
        friendListElement = "you have no friends, yet..."
    }
    return friendListElement
}

async function createSidebar(){
    const userid = getCurrentUserId()
    const friendList = await getFriendList(userid)
    const friendListElement = await createFriendList(friendList) 
    
    const friendCollapse = document.getElementById("friendCollapse")
    friendCollapse.innerHTML = `
    <div class="container position-absolute top-5 start-70 end-0 bg-dark" style="max-width: 30%; z-index: 1000">
			<div class="collapse" id="sidebarCollapse">	
				<div id="friendSidebar" class="d-flex m-2 p-2 flex-column align-items-stretch flex-shrink-0 text-bg-white">
					<h3 class="text-white fs-3 fw-bold">Friends</h3>
						<ul class="nav nav-pills flex-column mb-auto">
							<div id="friendListContainer">
                                ${friendListElement}
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