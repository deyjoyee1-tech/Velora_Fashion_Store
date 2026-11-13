
document.addEventListener("DOMContentLoaded", function () {

    // SHOW MESSAGE
    function showMessage(element, message, isSuccess) {
        if (!element) return;

        element.textContent = message;
        element.style.color = isSuccess ? "#477a50" : "#b33a3a";
    }


    // SAFELY LOAD USERS
    function getUsers() {
        try {
            const users = JSON.parse(
                localStorage.getItem("veloraUsers")
            );

            return Array.isArray(users) ? users : [];

        } catch (error) {
            return [];
        }
    }


    // SAVE USERS
    function saveUsers(users) {
        localStorage.setItem(
            "veloraUsers",
            JSON.stringify(users)
        );
    }


    // CUSTOMER REGISTRATION
    const registerForm = document.getElementById("register-form");

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim().toLowerCase();
            const phone = document.getElementById("register-phone").value.trim();
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            const message = document.getElementById("register-message");

            if (!name || !email || !phone || !password || !confirmPassword) {
                showMessage(message, "Please fill in all fields.", false);
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage(message, "Please enter a valid email address.", false);
                return;
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                showMessage(message, "Please enter a valid 10-digit mobile number.", false);
                return;
            }

            if (password.length < 6) {
                showMessage(message, "Password must contain at least 6 characters.", false);
                return;
            }

            if (password !== confirmPassword) {
                showMessage(message, "Passwords do not match.", false);
                return;
            }

            const users = getUsers();

            const existingUser = users.some(function (user) {
                return user.email === email;
            });

            if (existingUser) {
                showMessage(message, "An account with this email already exists.", false);
                return;
            }

            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                password: password
            };

            users.push(newUser);

            saveUsers(users);

            localStorage.setItem(
                "veloraCurrentUser",
                JSON.stringify({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone
                })
            );

            showMessage(message, "Registration successful! Welcome to VÊLORA.", true);

            registerForm.reset();

            setTimeout(function () {
                window.location.href = "profile.html";
            }, 1500);

        });

    }


    // CUSTOMER LOGIN
    const loginForm = document.getElementById("login-form");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const password = document.getElementById("login-password").value;

            const message = document.getElementById("login-message");

            if (!email || !password) {
                showMessage(message, "Please enter your email and password.", false);
                return;
            }

            const users = getUsers();

            const user = users.find(function (item) {
                return item.email === email && item.password === password;
            });

            if (!user) {
                showMessage(message, "Invalid email or password. Please try again.", false);
                return;
            }

            localStorage.setItem(
                "veloraCurrentUser",
                JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                })
            );

            showMessage(message, "Login successful! Welcome back.", true);

            loginForm.reset();

            setTimeout(function () {
                window.location.href = "profile.html";
            }, 1200);

        });

    }

});
