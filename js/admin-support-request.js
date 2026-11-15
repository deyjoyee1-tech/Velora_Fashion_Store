
document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "veloraSupportRequests";

    // Do not create duplicate sections
    if (document.getElementById("velora-admin-support")) return;

    const style = document.createElement("style");

    style.textContent = `
        #velora-admin-support {
            margin: 35px auto;
            padding: 25px;
            max-width: 1200px;
            background: #fffdf9;
            border: 1px solid #e8ddcc;
            border-radius: 14px;
            color: #30271f;
            font-family: Arial, sans-serif;
        }

        #velora-admin-support h2 {
            margin: 0 0 8px;
            color: #49382d;
            letter-spacing: 1px;
        }

        .velora-support-subtitle {
            color: #887a6e;
            font-size: 13px;
            margin-bottom: 22px;
        }

        .velora-support-stats {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .velora-support-stat {
            flex: 1;
            min-width: 130px;
            padding: 15px;
            background: #f6f0e7;
            border-radius: 9px;
        }

        .velora-support-stat strong {
            display: block;
            font-size: 22px;
            color: #49382d;
            margin-top: 5px;
        }

        .velora-support-stat span {
            font-size: 11px;
            color: #887a6e;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .velora-support-card {
            border: 1px solid #e8ddcc;
            border-radius: 10px;
            padding: 17px;
            margin-bottom: 13px;
            background: white;
        }

        .velora-support-card h3 {
            margin: 0 0 10px;
            font-size: 15px;
            color: #49382d;
        }

        .velora-support-card p {
            margin: 7px 0;
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: anywhere;
        }

        .velora-support-card label {
            display: block;
            font-size: 11px;
            color: #887a6e;
            margin: 12px 0 5px;
        }

        .velora-support-card select {
            padding: 9px 12px;
            border: 1px solid #d7c6a9;
            border-radius: 6px;
            background: #fffdf9;
            color: #30271f;
        }

        .velora-support-empty {
            padding: 25px;
            text-align: center;
            background: #f8f4ed;
            border-radius: 9px;
            color: #887a6e;
            font-size: 13px;
        }

        .velora-support-refresh {
            padding: 10px 16px;
            background: #49382d;
            color: white;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 18px;
        }

        .velora-support-request-id {
            font-size: 11px !important;
            color: #987a53;
            letter-spacing: 1px;
        }
    `;

    document.head.appendChild(style);

    const section = document.createElement("section");
    section.id = "velora-admin-support";

    section.innerHTML = `
        <h2>CUSTOMER SUPPORT REQUESTS</h2>
        <p class="velora-support-subtitle">
            Review customer queries and manage requests for human assistance.
        </p>

        <div class="velora-support-stats">
            <div class="velora-support-stat">
                <span>Total Requests</span>
                <strong id="velora-support-total">0</strong>
            </div>

            <div class="velora-support-stat">
                <span>Pending</span>
                <strong id="velora-support-pending">0</strong>
            </div>

            <div class="velora-support-stat">
                <span>Resolved</span>
                <strong id="velora-support-resolved">0</strong>
            </div>
        </div>

        <button class="velora-support-refresh" id="velora-support-refresh">
            ↻ REFRESH REQUESTS
        </button>

        <div id="velora-support-list"></div>
    `;

    document.body.appendChild(section);

    const list = document.getElementById("velora-support-list");

    function getRequests() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function renderRequests() {
        const requests = getRequests();

        const pending = requests.filter(request =>
            request.status === "Pending"
        ).length;

        const resolved = requests.filter(request =>
            request.status === "Resolved"
        ).length;

        document.getElementById("velora-support-total").textContent =
            requests.length;

        document.getElementById("velora-support-pending").textContent =
            pending;

        document.getElementById("velora-support-resolved").textContent =
            resolved;

        list.innerHTML = "";

        if (requests.length === 0) {
            list.innerHTML = `
                <div class="velora-support-empty">
                    No customer support requests have been received yet.
                </div>
            `;
            return;
        }

        requests.slice().reverse().forEach(request => {
            const card = document.createElement("div");
            card.className = "velora-support-card";

            const heading = document.createElement("h3");
            heading.textContent =
                request.customerName || "VÊLORA Customer";

            const id = document.createElement("p");
            id.className = "velora-support-request-id";
            id.textContent = "REQUEST ID: " + (request.requestId || "N/A");

            const email = document.createElement("p");
            email.textContent =
                "Email: " + (request.customerEmail || "Not available");

            const topic = document.createElement("p");
            topic.textContent =
                "Help topic: " + (request.topic || "Other Issues");

            const order = document.createElement("p");
            order.textContent =
                "Order ID: " + (request.orderId || "Not selected");

            const description = document.createElement("p");
            description.textContent =
                "Issue: " + (request.description || "No description provided.");

            const date = document.createElement("p");
            date.textContent = "Submitted: " +
                (request.requestDate
                    ? new Date(request.requestDate).toLocaleString("en-IN")
                    : "Not available");

            const label = document.createElement("label");
            label.textContent = "Update request status";

            const select = document.createElement("select");

            ["Pending", "In Progress", "Resolved", "Rejected"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                select.appendChild(option);
            });

            select.value = request.status || "Pending";

            select.addEventListener("change", () => {
                const updatedRequests = getRequests();

                const matchingRequest = updatedRequests.find(item =>
                    item.requestId === request.requestId
                );

                if (matchingRequest) {
                    matchingRequest.status = select.value;

                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(updatedRequests)
                    );

                    renderRequests();
                }
            });

            card.append(
                heading,
                id,
                email,
                topic,
                order,
                description,
                date,
                label,
                select
            );

            list.appendChild(card);
        });
    }

    document.getElementById("velora-support-refresh")
        .addEventListener("click", renderRequests);

    window.addEventListener("storage", event => {
        if (event.key === STORAGE_KEY) {
            renderRequests();
        }
    });

    renderRequests();
});
