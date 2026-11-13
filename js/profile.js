
document.addEventListener("DOMContentLoaded", function () {

    const profileForm = document.getElementById("profile-form");
    const profileMessage = document.getElementById("profile-message");

    // STOP IF PROFILE FORM DOES NOT EXIST
    if (!profileForm) return;


    // SAFELY LOAD SAVED DATA
    function getSavedData(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch (error) {
            return {};
        }
    }

    const savedProfile = getSavedData("veloraProfile");
    const currentUser = getSavedData("veloraCurrentUser");


    // LOAD PROFILE INFORMATION
    document.getElementById("profile-name").value =
        savedProfile.name || currentUser.name || "";

    document.getElementById("profile-email").value =
        savedProfile.email || currentUser.email || "";

    document.getElementById("profile-phone").value =
        savedProfile.phone || currentUser.phone || "";

    document.getElementById("profile-address").value =
        savedProfile.address || "";

    document.getElementById("profile-city").value =
        savedProfile.city || "";

    document.getElementById("profile-state").value =
        savedProfile.state || "";

    document.getElementById("profile-pin").value =
        savedProfile.pin || "";


    // DISPLAY MESSAGE
    function showMessage(message, success) {

        if (!profileMessage) return;

        profileMessage.textContent = message;

        profileMessage.style.color = success
            ? "#477a50"
            : "#c0392b";
    }


    // SAVE PROFILE INFORMATION
    profileForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const profile = {

            name: document.getElementById("profile-name").value.trim(),

            email: document.getElementById("profile-email").value.trim(),

            phone: document.getElementById("profile-phone").value.trim(),

            address: document.getElementById("profile-address").value.trim(),

            city: document.getElementById("profile-city").value.trim(),

            state: document.getElementById("profile-state").value.trim(),

            pin: document.getElementById("profile-pin").value.trim()

        };


        // CHECK REQUIRED FIELDS
        if (
            !profile.name ||
            !profile.email ||
            !profile.phone ||
            !profile.address ||
            !profile.city ||
            !profile.state ||
            !profile.pin
        ) {

            showMessage("Please fill in all fields.", false);
            return;

        }


        // VALIDATE EMAIL
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {

            showMessage("Please enter a valid email address.", false);
            return;

        }


        // VALIDATE PHONE NUMBER
        if (!/^[0-9]{10}$/.test(profile.phone)) {

            showMessage("Please enter a valid 10-digit phone number.", false);
            return;

        }


        // VALIDATE PIN CODE
        if (!/^[0-9]{6}$/.test(profile.pin)) {

            showMessage("Please enter a valid 6-digit PIN code.", false);
            return;

        }


        // SAVE PROFILE
        localStorage.setItem(
            "veloraProfile",
            JSON.stringify(profile)
        );


        // UPDATE CURRENT USER DETAILS
        const updatedUser = {
            ...currentUser,
            name: profile.name,
            email: profile.email,
            phone: profile.phone
        };

        localStorage.setItem(
            "veloraCurrentUser",
            JSON.stringify(updatedUser)
        );


        // UPDATE REGISTERED USER DETAILS
        try {

            const users = JSON.parse(
                localStorage.getItem("veloraUsers")
            ) || [];

            const updatedUsers = users.map(function (user) {

                if (user.id === currentUser.id) {

                    return {
                        ...user,
                        name: profile.name,
                        email: profile.email,
                        phone: profile.phone
                    };

                }

                return user;

            });

            localStorage.setItem(
                "veloraUsers",
                JSON.stringify(updatedUsers)
            );

        } catch (error) {
            console.error("Could not update registered user details.");
        }


        showMessage(
            "Your profile has been saved successfully!",
            true
        );

    });

});
