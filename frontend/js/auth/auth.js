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
                <form id="login-form">
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
                <form id="signup-form">
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

export async function initAuth() {
    render_auth();

    const handleFormSubmit = (formId, resolve, reject) => {
        return async function(event) {
            event.preventDefault();

            const csrftoken = getCookie('csrftoken');


            let url;
            let username;
            let password;
            let email;
            let data;
            if (formId === 'login-form') {
                url = 'https://localhost/auth/login/';
                username = document.getElementById("login-username").value;
                password = document.getElementById("login-password").value;
                data = {
                    username: username,
                    password: password,
                    csrfmiddlewaretoken: csrftoken
                };
            } else if (formId === 'signup-form') {
                url = 'https://localhost/auth/signup/';
                username = document.getElementById("signup-username").value;
                password = document.getElementById("signup-password").value;
                email = document.getElementById("signup-email").value;
                data = {
                    username: username,
                    email: email,
                    password: password,
                    csrfmiddlewaretoken: csrftoken
                };
            }

            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                        // Only send the token to relative URLs i.e. locally.
                        xhr.setRequestHeader("X-CSRFToken", csrftoken);
                    }
                }
            });

            $.ajax({
                url: url,
                method: 'POST',
                data: data,

                success: function(response) {
                    resolve(`${formId} successful.`);
                    return true
                },

                error: function(response) {
                    alert('Sign up failed. Please try again.');
                    reject(`${formId} failed.`);
                    return false
                }
            });
        };
    };

    try {
        const authResponse = await new Promise((resolve, reject) => {
            document.getElementById('login-form').addEventListener('submit', handleFormSubmit('login-form', resolve, reject), { once: true });
            document.getElementById('signup-form').addEventListener('submit', handleFormSubmit('signup-form', resolve, reject), { once: true });
        });
        console.log('Auth Response:', authResponse);
    } catch (error) {
        console.error('Auth Error:', error);
        return false;
    }

    let main_frame = document.getElementById("authDiv");
    main_frame.innerHTML = ``;
    return true
}