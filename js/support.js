
document.addEventListener("DOMContentLoaded", function () {

    const supportForm = document.getElementById("support-form");
    const responseMessage = document.getElementById("support-response");

    if (!supportForm || !responseMessage) return;

    // SHOW RESPONSE MESSAGE
    function showMessage(message, color) {
        responseMessage.textContent = message;
        responseMessage.style.color = color;
    }

    // HANDLE FORM SUBMISSION
    supportForm.addEventListener("submit", function (event) {

        event.preventDefault();

        if (!supportForm.reportValidity()) return;

        // GET CUSTOMER DETAILS
        const supportRequest = {

            requestId: "SUP" + Date.now(),

            name: document.getElementById("support-name").value.trim(),

            email: document.getElementById("support-email").value.trim(),

            reason: document.getElementById("support-reason").value,

            message: document.getElementById("support-message").value.trim(),

            date: new Date().toLocaleString("en-IN"),

            status: "Pending"

        };

        // CHECK REQUIRED FIELDS
        if (
            !supportRequest.name ||
            !supportRequest.email ||
            !supportRequest.reason ||
            !supportRequest.message
        ) {
            showMessage(
                "Please fill in all fields.",
                "#c0392b"
            );
            return;
        }

        // VALIDATE EMAIL
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(supportRequest.email)) {
            showMessage(
                "Please enter a valid email address.",
                "#c0392b"
            );
            return;
        }

        // LOAD EXISTING REQUESTS
        let requests = [];

        try {

            const savedRequests = localStorage.getItem(
                "veloraSupportRequests"
            );

            if (savedRequests) {

                const parsedRequests = JSON.parse(savedRequests);

                if (!Array.isArray(parsedRequests)) {
                    throw new Error("Invalid support request storage.");
                }

                requests = parsedRequests;
            }

        } catch (error) {

            showMessage(
                "Unable to access saved requests. Please try again.",
                "#c0392b"
            );

            return;
        }

        // SAVE NEW REQUEST
        try {

            requests.push(supportRequest);

            localStorage.setItem(
                "veloraSupportRequests",
                JSON.stringify(requests)
            );

            showMessage(
                "Thank you! Your message has been submitted successfully.",
                "green"
            );

            supportForm.reset();

        } catch (error) {

            showMessage(
                "Unable to submit your request. Please try again.",
                "#c0392b"
            );

        }

    });

});
