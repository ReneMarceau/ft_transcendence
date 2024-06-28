export function render_auth() {
	let main_frame = document.getElementById("authDiv")
	main_frame.innerHTML = `
        <h2 class="text-center mt-5">Pong Login</h2>
        <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="login-tab" data-toggle="tab" href="#login" role="tab" aria-controls="login" aria-selected="true">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="signup-tab" data-toggle="tab" href="#signup" role="tab" aria-controls="signup" aria-selected="false">Sign Up</a>
            </li>
        </ul>
        <div class="tab-content" id="myTabContent">
            <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
                <form id="login-form" action="/auth/login/">
                    <div class="form-group">
                        <label for="login-username">Username</label>
                        <input type="text" class="form-control" id="login-username" placeholder="Enter username" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" class="form-control" id="login-password" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Login</button>
                </form>
            </div>
            <div class="tab-pane fade" id="signup" role="tabpanel" aria-labelledby="signup-tab">
                <form id="signup-form" action="/auth/signup/">
                    <div class="form-group">
                        <label for="signup-username">Username</label>
                        <input type="text" class="form-control" id="signup-username" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email address</label>
                        <input type="email" class="form-control" id="signup-email" placeholder="Enter email" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password</label>
                        <input type="password" class="form-control" id="signup-password" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Sign Up</button>
                </form>
            </div>
        </div>
	`
}

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
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
		let main_frame = document.getElementById("authDiv");
		main_frame.innerHTML = ``;
	} else {
		const errorData = await response.json();
		console.error('Error:', errorData);
		alert('Sign up failed. Please try again.');
	}
}


export function isAuthenticated() {
	const access_token = localStorage.getItem('access_token');
	const refresh_token = localStorage.getItem('refresh_token');
	return ((access_token && (access_token != undefined)) || (refresh_token && (refresh_token != undefined)))
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