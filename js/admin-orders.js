
document.addEventListener("DOMContentLoaded", function () {

    // DEFAULT DEMO ORDERS
    const sampleOrders = [
        {
            id: "VL1001",
            customer: "Rahul Sharma",
            product: "Classic Casual Shirt",
            amount: 799,
            date: "10 Nov 2026",
            status: "Pending",
            isDemo: true
        },
        {
            id: "VL1002",
            customer: "Priya Das",
            product: "Floral Summer Dress",
            amount: 1499,
            date: "09 Nov 2026",
            status: "Shipped",
            isDemo: true
        },
        {
            id: "VL1003",
            customer: "Ananya Roy",
            product: "Kids Casual Wear",
            amount: 699,
            date: "08 Nov 2026",
            status: "Delivered",
            isDemo: true
        },
        {
            id: "VL1004",
            customer: "Sneha Roy",
            product: "Maternity Cotton Dress",
            amount: 1599,
            date: "10 Nov 2026",
            status: "Pending",
            isDemo: true
        }
    ];

    // HTML ELEMENTS
    const ordersList = document.getElementById("admin-orders-list");
    const statusFilter = document.getElementById("order-status-filter");
    const orderMessage = document.getElementById("order-message");

    // LOAD CUSTOMER ORDERS SAFELY
    function getSavedCustomerOrders() {

        try {

            const savedOrders = JSON.parse(
                localStorage.getItem("veloraOrders")
            );

            return Array.isArray(savedOrders) ? savedOrders : [];

        } catch (error) {

            console.error("Could not load customer orders:", error);
            return [];

        }

    }

    // CONVERT CUSTOMER ORDERS INTO ADMIN FORMAT
    function loadCustomerOrders() {

        const savedOrders = getSavedCustomerOrders();

        return savedOrders.map(function (order) {

            const items = Array.isArray(order.items)
                ? order.items
                : [];

            const productNames = items.map(function (item) {

                return (
                    item.productName ||
                    item.name ||
                    item.title ||
                    "Product"
                );

            });

            return {

                id: order.orderId || "N/A",

                customer: order.customerName || "Customer",

                product: productNames.join(", ") || "Product",

                amount: Number(order.total) || 0,

                date: order.orderDate || "N/A",

                status: order.status === "Order Placed"
                    ? "Pending"
                    : order.status || "Pending",

                storageId: order.orderId,

                isDemo: false

            };

        });

    }

    // COMBINE DEMO AND REAL CUSTOMER ORDERS
    let orders = sampleOrders.concat(loadCustomerOrders());

    // SHOW MESSAGE
    function showMessage(message, color) {

        if (!orderMessage) return;

        orderMessage.textContent = message;
        orderMessage.style.color = color || "#8b684d";

    }

    // UPDATE ORDER STATISTICS
    function updateOrderStats() {

        const total = document.getElementById("total-orders");
        const pending = document.getElementById("pending-orders");
        const shipped = document.getElementById("shipped-orders");
        const delivered = document.getElementById("delivered-orders");

        if (total) {
            total.textContent = orders.length;
        }

        if (pending) {
            pending.textContent = orders.filter(function (order) {
                return order.status === "Pending";
            }).length;
        }

        if (shipped) {
            shipped.textContent = orders.filter(function (order) {
                return order.status === "Shipped";
            }).length;
        }

        if (delivered) {
            delivered.textContent = orders.filter(function (order) {
                return order.status === "Delivered";
            }).length;
        }

    }

    // SAVE CUSTOMER ORDER STATUS
    function saveCustomerOrderStatus(order) {

        if (!order.storageId || order.isDemo) {
            return true;
        }

        const savedOrders = getSavedCustomerOrders();

        const customerOrder = savedOrders.find(function (item) {
            return item.orderId === order.storageId;
        });

        if (!customerOrder) {
            return false;
        }

        customerOrder.status = order.status;

        try {

            localStorage.setItem(
                "veloraOrders",
                JSON.stringify(savedOrders)
            );

            return true;

        } catch (error) {

            console.error("Could not update order:", error);
            return false;

        }

    }

    // DISPLAY ORDERS
    function displayOrders() {

        if (!ordersList) return;

        ordersList.innerHTML = "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "ALL";

        const filteredOrders = orders.filter(function (order) {

            return (
                selectedStatus === "ALL" ||
                order.status === selectedStatus
            );

        });

        // CREATE ORDER ROWS
        filteredOrders.forEach(function (order) {

            const row = document.createElement("tr");

            // ORDER INFORMATION
            const values = [
                order.id,
                order.customer,
                order.product,
                "₹" + Number(order.amount).toLocaleString("en-IN"),
                order.date
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);

            });

            // STATUS DROPDOWN
            const statusCell = document.createElement("td");
            const statusSelect = document.createElement("select");

            const statuses = [
                "Pending",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];

            statuses.forEach(function (status) {

                const option = document.createElement("option");

                option.value = status;
                option.textContent = status;

                if (order.status === status) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);

            });

            // UPDATE ORDER STATUS
            statusSelect.addEventListener("change", function () {

                const previousStatus = order.status;

                order.status = statusSelect.value;

                if (!saveCustomerOrderStatus(order)) {

                    order.status = previousStatus;
                    statusSelect.value = previousStatus;

                    showMessage(
                        "Could not save the order status.",
                        "#c0392b"
                    );

                    return;

                }

                showMessage(
                    "Order status updated successfully!",
                    "green"
                );

                displayOrders();

            });

            statusCell.appendChild(statusSelect);
            row.appendChild(statusCell);

            // VIEW ORDER DETAILS
            const actionCell = document.createElement("td");
            const viewButton = document.createElement("button");

            viewButton.type = "button";
            viewButton.textContent = "VIEW";

            viewButton.addEventListener("click", function () {

                alert(
                    "Order: " + order.id +
                    "\nCustomer: " + order.customer +
                    "\nProduct: " + order.product +
                    "\nAmount: ₹" + order.amount +
                    "\nDate: " + order.date +
                    "\nStatus: " + order.status
                );

            });

            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);

            ordersList.appendChild(row);

        });

        // EMPTY FILTER RESULT
        if (filteredOrders.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = "No orders found.";

            row.appendChild(cell);
            ordersList.appendChild(row);

        }

        updateOrderStats();

    }

    // FILTER ORDERS
    if (statusFilter) {

        statusFilter.addEventListener("change", displayOrders);

    }

    // INITIAL DISPLAY
    displayOrders();

});
