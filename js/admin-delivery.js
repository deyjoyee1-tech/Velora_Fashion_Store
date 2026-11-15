
document.addEventListener("DOMContentLoaded", function () {
    alert("DELIVERY SCRIPT LOADED");
alert("VÊLORA DELIVERY SCRIPT LOADED");
    // ==========================================
    // VÊLORA DELIVERY MANAGEMENT
    // Connected to customer orders
    // ==========================================

    const ORDERS_KEY = "veloraOrders";
    const DELIVERY_KEY = "veloraDeliveries";

    // PAGE ELEMENTS
    const table = document.getElementById("delivery-table-body");

    const totalElement = document.getElementById("total-deliveries");
    const transitElement = document.getElementById("in-transit");
    const deliveredElement = document.getElementById("delivered");
    const pendingElement = document.getElementById("delivery-pending");
    const message = document.getElementById("delivery-message");

    let orders = [];
    let deliveries = [];

    // ==========================================
    // STORAGE HELPERS
    // ==========================================

    function readArray(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Could not read " + key, error);
            return [];
        }
    }

    function saveArray(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Could not save " + key, error);
            showMessage("Unable to save changes. Please try again.", "#c0392b");
            return false;
        }
    }

    function getOrderId(order) {
        return String(order.orderId || order.id || "");
    }

    function getOrderStatus(order) {
        return String(order.status || "Order Placed").trim().toLowerCase();
    }

    function isCancelled(order) {
        return getOrderStatus(order) === "cancelled";
    }

    function showMessage(text, color) {
        if (!message) return;

        message.textContent = text;
        message.style.color = color || "#8b684d";
    }

    // ==========================================
    // CONVERT ORDER STATUS TO DELIVERY STATUS
    // ==========================================

    function getDeliveryStatus(order) {
        const status = getOrderStatus(order);

        if (status === "delivered") return "Delivered";

        if (
            status === "shipped" ||
            status === "in transit" ||
            status === "out for delivery"
        ) {
            return "In Transit";
        }

        return "Pending";
    }

    // ==========================================
    // LOAD REAL CUSTOMER ORDERS
    // ==========================================

    function loadDeliveries() {
        orders = readArray(ORDERS_KEY);

        const savedDeliveries = readArray(DELIVERY_KEY);

        deliveries = orders
            .filter(function (order) {
                return order && getOrderId(order) && !isCancelled(order);
            })
            .map(function (order) {

                const orderId = getOrderId(order);

                const saved = savedDeliveries.find(function (item) {
                    return String(item.orderId) === orderId;
                });

                const partner =
                    order.deliveryPartner ||
                    order.partner ||
                    (saved && saved.partner) ||
                    "";

                const expectedDate =
                    order.expectedDeliveryDate ||
                    (saved && saved.date) ||
                    "";

                return {
                    id: "DEL-" + orderId,
                    orderId: orderId,
                    customer:
                        order.customerName ||
                        order.customer ||
                        "Customer",
                    partner: partner,
                    date: expectedDate,
                    status: getDeliveryStatus(order)
                };
            });

        // Keep delivery records connected to actual orders only.
        saveArray(DELIVERY_KEY, deliveries);
    }

    // ==========================================
    // DATE HELPERS
    // ==========================================

    function formatDateForInput(value) {
        if (!value) return "";

        const text = String(value);

        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return text;
        }

        const date = new Date(text);

        if (isNaN(date.getTime())) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    function formatDateForDisplay(value) {
        if (!value) return "Not scheduled";

        const date = new Date(value + "T00:00:00");

        if (isNaN(date.getTime())) return String(value);

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // ==========================================
    // SAVE DELIVERY DETAILS TO ORDER
    // ==========================================

    function saveDeliveryDetails(delivery) {
        const currentOrders = readArray(ORDERS_KEY);

        const index = currentOrders.findIndex(function (order) {
            return getOrderId(order) === String(delivery.orderId);
        });

        if (index === -1) {
            showMessage("The original customer order could not be found.", "#c0392b");
            return false;
        }

        currentOrders[index].deliveryPartner = delivery.partner;
        currentOrders[index].expectedDeliveryDate = delivery.date;

        if (!saveArray(ORDERS_KEY, currentOrders)) {
            return false;
        }

        orders = currentOrders;
        return true;
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    function updateCustomerOrderStatus(delivery, newStatus) {
        const currentOrders = readArray(ORDERS_KEY);

        const index = currentOrders.findIndex(function (order) {
            return getOrderId(order) === String(delivery.orderId);
        });

        if (index === -1) {
            showMessage("Customer order not found.", "#c0392b");
            return false;
        }

        const order = currentOrders[index];

        if (isCancelled(order)) {
            showMessage("Cancelled orders cannot be delivered.", "#c0392b");
            return false;
        }

        if (newStatus === "Pending") {
            order.status = "Processing";
            delete order.shippedAt;
            delete order.outForDeliveryAt;
            delete order.deliveredAt;
        }

        if (newStatus === "In Transit") {
            order.status = "Shipped";
            order.shippedAt = order.shippedAt || new Date().toISOString();
            delete order.deliveredAt;
        }

        if (newStatus === "Delivered") {
            order.status = "Delivered";
            order.deliveredAt = new Date().toISOString();
        }

        if (!saveArray(ORDERS_KEY, currentOrders)) {
            return false;
        }

        orders = currentOrders;
        return true;
    }

    // ==========================================
    // DELIVERY STATISTICS
    // ==========================================

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

    // ==========================================
    // CREATE TABLE CELL
    // ==========================================

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        return cell;
    }

    // ==========================================
    // DISPLAY DELIVERY RECORDS
    // ==========================================

    function displayDeliveries() {
        if (!table) return;

        table.innerHTML = "";

        if (deliveries.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No customer orders available for delivery yet.";

            row.appendChild(cell);
            table.appendChild(row);

            updateDeliveryStats();
            return;
        }

        deliveries.forEach(function (delivery) {
            const row = document.createElement("tr");

            // DELIVERY ID
            row.appendChild(createCell(delivery.id));

            // ORDER ID
            row.appendChild(createCell(delivery.orderId));

            // CUSTOMER
            row.appendChild(createCell(delivery.customer));

            // DELIVERY PARTNER INPUT
            const partnerCell = document.createElement("td");

            const partnerInput = document.createElement("input");
            partnerInput.type = "text";
            partnerInput.className = "delivery-partner-input";
            partnerInput.value = delivery.partner;
            partnerInput.placeholder = "Assign partner";
            partnerInput.maxLength = 60;
            partnerInput.dataset.deliveryId = delivery.id;
            partnerInput.setAttribute("aria-label", "Delivery partner");

            partnerCell.appendChild(partnerInput);
            row.appendChild(partnerCell);

            // EXPECTED DELIVERY DATE INPUT
            const dateCell = document.createElement("td");

            const dateInput = document.createElement("input");
            dateInput.type = "date";
            dateInput.className = "delivery-date-input";
            dateInput.value = formatDateForInput(delivery.date);
            dateInput.dataset.deliveryId = delivery.id;
            dateInput.setAttribute("aria-label", "Expected delivery date");

            dateCell.appendChild(dateInput);

            const dateLabel = document.createElement("small");
            dateLabel.textContent = formatDateForDisplay(delivery.date);
            dateLabel.style.display = "block";
            dateLabel.style.marginTop = "5px";
            dateLabel.style.color = "#8b7b6c";

            dateCell.appendChild(dateLabel);
            row.appendChild(dateCell);

            // CURRENT STATUS
            const statusCell = document.createElement("td");

            const statusLabel = document.createElement("span");
            statusLabel.textContent = delivery.status;
            statusLabel.className = "delivery-current-status";
            statusCell.appendChild(statusLabel);

            row.appendChild(statusCell);

            // STATUS ACTION
            const actionCell = document.createElement("td");

            const select = document.createElement("select");
            select.className = "delivery-status-select";
            select.dataset.deliveryId = delivery.id;

            ["Pending", "In Transit", "Delivered"].forEach(function (status) {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                option.selected = delivery.status === status;
                select.appendChild(option);
            });

            actionCell.appendChild(select);
            row.appendChild(actionCell);

            table.appendChild(row);
        });

        updateDeliveryStats();
    }

    // ==========================================
    // FIND DELIVERY RECORD
    // ==========================================

    function findDelivery(id) {
        return deliveries.find(function (item) {
            return String(item.id) === String(id);
        });
    }

    // ==========================================
    // SAVE PARTNER AND DATE
    // ==========================================

    if (table) {
        table.addEventListener("change", function (event) {

            const target = event.target;

            if (
                !target.classList.contains("delivery-partner-input") &&
                !target.classList.contains("delivery-date-input")
            ) {
                return;
            }

            const delivery = findDelivery(target.dataset.deliveryId);
            if (!delivery) return;

            const oldPartner = delivery.partner;
            const oldDate = delivery.date;

            if (target.classList.contains("delivery-partner-input")) {
                delivery.partner = target.value.trim();
            }

            if (target.classList.contains("delivery-date-input")) {
                delivery.date = target.value;
            }

            if (!saveDeliveryDetails(delivery)) {
                delivery.partner = oldPartner;
                delivery.date = oldDate;
                displayDeliveries();
                return;
            }

            saveArray(DELIVERY_KEY, deliveries);
            displayDeliveries();

            showMessage("Delivery details saved successfully.", "green");
        });

        // ======================================
        // CHANGE DELIVERY STATUS
        // ======================================

        table.addEventListener("change", function (event) {

            const target = event.target;

            if (!target.classList.contains("delivery-status-select")) {
                return;
            }

            const delivery = findDelivery(target.dataset.deliveryId);
            if (!delivery) return;

            const newStatus = target.value;

            const validStatuses = [
                "Pending",
                "In Transit",
                "Delivered"
            ];

            if (!validStatuses.includes(newStatus)) {
                return;
            }

            const previousStatus = delivery.status;

            delivery.status = newStatus;

            if (!updateCustomerOrderStatus(delivery, newStatus)) {
                delivery.status = previousStatus;
                displayDeliveries();
                return;
            }

            if (!saveArray(DELIVERY_KEY, deliveries)) {
                delivery.status = previousStatus;
                displayDeliveries();
                return;
            }

            displayDeliveries();

            showMessage(
                "Delivery status updated. The customer's order status has also been updated.",
                "green"
            );
        });
    }

    // ==========================================
    // REFRESH WHEN ORDERS CHANGE IN ANOTHER TAB
    // ==========================================

    window.addEventListener("storage", function (event) {
        if (
            event.key === ORDERS_KEY ||
            event.key === DELIVERY_KEY
        ) {
            loadDeliveries();
            displayDeliveries();
            showMessage("Delivery records refreshed.", "#8b684d");
        }
    });

    // ==========================================
    // INITIAL PAGE LOAD
    // ==========================================

    loadDeliveries();
    displayDeliveries();

});
