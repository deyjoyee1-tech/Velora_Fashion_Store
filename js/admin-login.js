
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("admin-login-form");
    const emailInput = document.getElementById("admin-email");
    const passwordInput = document.getElementById("admin-password");
    const message = document.getElementById("admin-login-message");
    const toggleButton = document.getElementById("toggle-admin-password");

    if (!loginForm) return;

    // DEMO ADMIN CREDENTIALS
    const ADMIN_EMAIL = "admin@velora.com";
    const ADMIN_PASSWORD = "Velora@123";

    // Redirect if this browser already has an admin session
    if (sessionStorage.getItem("veloraAdminLoggedIn") === "true") {
        window.location.href = "dashboard.html";
        return;
    }

    // Show / hide password
    if (toggleButton && passwordInput) {
        toggleButton.addEventListener("click", function () {

            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";
            toggleButton.textContent = isPassword ? "HIDE" : "SHOW";
            toggleButton.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );

        });
    }

    // Login
    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        message.textContent = "";
        message.style.color = "#b42318";

        if (!email || !password) {
            message.textContent = "Please enter your email and password.";
            return;
        }

        if (
            email === ADMIN_EMAIL &&
            password === ADMIN_PASSWORD
        ) {

            sessionStorage.setItem("veloraAdminLoggedIn", "true");
            sessionStorage.setItem("veloraAdminEmail", ADMIN_EMAIL);

            message.style.color = "#26734d";
            message.textContent = "Login successful. Opening dashboard...";

            const submitButton = loginForm.querySelector(
                'button[type="submit"]'
            );

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "OPENING DASHBOARD...";
            }

            window.location.href = "dashboard.html";

        } else {

            message.textContent = "Incorrect email or password. Please try again.";
            passwordInput.value = "";
            passwordInput.focus();

        }

    });

});
