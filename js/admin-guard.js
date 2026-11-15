
document.addEventListener("DOMContentLoaded", function () {

    const isLoggedIn =
        sessionStorage.getItem("veloraAdminLoggedIn") === "true";

    const currentPage = window.location.pathname.toLowerCase();

    const isLoginPage = currentPage.endsWith("/login.html");

    if (!isLoggedIn && !isLoginPage) {
        window.location.replace("login.html");
        return;
    }

    // Update admin email in header if the element exists
    const adminEmail = sessionStorage.getItem("veloraAdminEmail");
    const welcomeElement = document.querySelector(".admin-header-right span");

    if (isLoggedIn && adminEmail && welcomeElement) {
        welcomeElement.textContent = "Welcome, " + adminEmail;
    }

    // Logout links
    document.querySelectorAll(
        '.admin-logout, .sidebar-bottom a[href="login.html"]'
    ).forEach(function (link) {

        link.addEventListener("click", function (event) {
            event.preventDefault();

            sessionStorage.removeItem("veloraAdminLoggedIn");
            sessionStorage.removeItem("veloraAdminEmail");

            window.location.replace("login.html");
        });

    });

});
