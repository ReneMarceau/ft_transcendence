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

export async function initAuth() {
    render_auth()

    function waitForSubmit(formId, url) {
        return new Promise((resolve, reject) => {
            document.getElementById(formId).addEventListener("submit", async function(event) {
                event.preventDefault();
                const username = document.getElementById("login-username").value;
                const password = document.getElementById("login-password").value;
                console.log("Login form submitted with username:", username, "and password", password);

                $.ajax({
                    url: url,
                    method: 'POST',
                    data: {
                        username: username,
                        password: password
                    },
                    success: function(response) {
                        resolve('Login successful.');
                    },
                    error: function(response) {
                        reject('Login failed. Please check your credentials.');
                    }
                });
            } , { once: true });
        });
    }

    try {
        const loginResponse = await waitForSubmit('login-form', 'https://localhost/auth/login/');
        console.log('Login Response:', loginResponse);
    } catch (error) {
        console.error('Login Error:', error);
    }

    let main_frame = document.getElementById("authDiv")
    main_frame.innerHTML = ``

    // document.getElementById("login-form").addEventListener("submit", async function(event) {
    //     event.preventDefault();
    //     const username = document.getElementById("login-username").value;
    //     const password = document.getElementById("login-password").value;
    //     console.log("Login form submitted with username:", username, "and password:", password);

    //     $.ajax({
    //         url: 'https://localhost/auth/login/',
    //         method: 'POST',
    //         data: {
    //             username: username,
    //             password: password
    //         },
    //         success: function(response) {
    //             alert('Login successful.');
    //         },
    //         error: function(response) {
    //             alert('Login failed. Please check your credentials.');
    //         }
    //     });
    // });

    // document.getElementById("signup-form").addEventListener("submit", async function(event) {
    //     event.preventDefault();
    //     const username = document.getElementById("signup-username").value;
    //     const email = document.getElementById("signup-email").value;
    //     const password = document.getElementById("signup-password").value;
    //     console.log("Signup form submitted with username:", username, "email:", email, "and password:", password);

    //     $.ajax({
    //         url: 'https://localhost/auth/signup/',
    //         method: 'POST',
    //         data: {
    //             username: username,
    //             email: email,
    //             password: password
    //         },
    //         success: function(response) {
    //             alert('Sign up successful. Please login.');
    //         },
    //         error: function(response) {
    //             alert('Sign up failed. Please try again.');
    //         }
    //     });
    // });

    
} 