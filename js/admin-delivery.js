
document.addEventListener("DOMContentLoaded", function () {

    // DEFAULT DEMO DELIVERIES
    const defaultDeliveries = [
        {
            id: "DEL001",
            orderId: "ORD101",
            customer: "Aarav Sharma",
            partner: "Rahul Kumar",
            date: "12 Nov 2026",
            status: "In Transit"
        },
        {
            id: "DEL002",
            orderId: "ORD102",
            customer: "Priya Das",
            partner: "Amit Singh",
            date: "13 Nov 2026",
            status: "Pending"
        },
        {
            id: "DEL003",
            orderId: "ORD103",
            customer: "Ananya Roy",
            partner: "Suman Ghosh",
            date: "10 Nov 2026",
            status: "Delivered"
        },
        {
            id: "DEL004",
            orderId: "ORD104",
            customer: "Rohan Sen",
            partner: "Rahul Kumar",
            date: "14 Nov 2026",
            status: "In Transit"
        }
    ];

    // PAGE ELEMENTS
    const table = document.getElementById("delivery-table-body");

    const totalElement = document.getElementById("total-deliveries");
    const transitElement = document.getElementById("in-transit");
    const deliveredElement = document.getElementById("delivered");
    const pendingElement = document.getElementById("delivery-pending");
    const message = document.getElementById("delivery-message");

    // LOAD DELIVERIES
    function loadDeliveries() {

        try {

            const saved = JSON.parse(
                localStorage.getItem("veloraDeliveries")
            );

            if (Array.isArray(saved)) {
                return saved;
            }

        } catch (error) {

            console.error("Could not load deliveries:", error);

        }

        return defaultDeliveries.map(function (item) {
            return { ...item };
        });

    }

    let deliveries = loadDeliveries();

    // SHOW MESSAGE
    function showMessage(text, color) {

        if (!message) return;

        message.textContent = text;
        message.style.color = color || "#8b684d";

    }

    // SAVE DELIVERIES
    function saveDeliveries() {

        try {

            localStorage.setItem(
                "veloraDeliveries",
                JSON.stringify(deliveries)
            );

            return true;

        } catch (error) {

            console.error("Could not save deliveries:", error);

            showMessage(
                "Unable to save delivery changes. Please try again.",
                "#c0392b"
            );

            return false;

        }

    }

    // UPDATE DELIVERY STATISTICS
    function updateDeliveryStats() {

        if (totalElement) {
            totalElement.textContent = deliveries.length;
        }

        if (transitElement) {
            transitElement.textContent = deliveries.filter(function (item) {
                return item.status === "In Transit";
            }).length;
        }

        if (deliveredElement) {
            deliveredElement.textContent = deliveries.filter(function (item) {
                return item.status === "Delivered";
            }).length;
        }

        if (pendingElement) {
            pendingElement.textContent = deliveries.filter(function (item) {
                return item.status === "Pending";
            }).length;
        }

    }

    // DISPLAY DELIVERIES
    function displayDeliveries() {

        if (!table) return;

        table.innerHTML = "";

        if (deliveries.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No delivery records available.";

            row.appendChild(cell);
            table.appendChild(row);

            updateDeliveryStats();
            return;

        }

        deliveries.forEach(function (delivery) {

            const row = document.createElement("tr");

            const values = [
                delivery.id || "N/A",
                delivery.orderId || "N/A",
                delivery.customer || "Customer",
                delivery.partner || "Not assigned",
                delivery.date || "N/A",
                delivery.status || "Pending"
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);

            });

            // STATUS DROPDOWN
            const actionCell = document.createElement("td");

            const select = document.createElement("select");

            select.className = "delivery-status-select";
            select.dataset.deliveryId = delivery.id;

            const statuses = [
                "Pending",
                "In Transit",
                "Delivered"
            ];

            statuses.forEach(function (status) {

                const option = document.createElement("option");

                option.value = status;
                option.textContent = status;

                if (delivery.status === status) {
                    option.selected = true;
                }

                select.appendChild(option);

            });

            actionCell.appendChild(select);
            row.appendChild(actionCell);

            table.appendChild(row);

        });

        updateDeliveryStats();

    }

    // CHANGE DELIVERY STATUS
    if (table) {

        table.addEventListener("change", function (event) {

            if (
                !event.target.classList.contains("delivery-status-select")
            ) {
                return;
            }

            const deliveryId = event.target.dataset.deliveryId;
            const newStatus = event.target.value;

            const validStatuses = [
                "Pending",
                "In Transit",
                "Delivered"
            ];

            if (!validStatuses.includes(newStatus)) {
                return;
            }

            const delivery = deliveries.find(function (item) {
                return item.id === deliveryId;
            });

            if (!delivery) return;

            const previousStatus = delivery.status;

            delivery.status = newStatus;

            if (!saveDeliveries()) {

                delivery.status = previousStatus;
                displayDeliveries();

                return;

            }

            displayDeliveries();

            showMessage(
                "Delivery status updated successfully!",
                "green"
            );

        });

    }

    // INITIAL DISPLAY
    if (saveDeliveries()) {
        displayDeliveries();
    }

});
