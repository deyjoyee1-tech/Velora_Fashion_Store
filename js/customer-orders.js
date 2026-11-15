
document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "veloraOrders";
    const REQUEST_KEY = "veloraOrderRequests";
    const ordersList = document.getElementById("customer-orders-list");

    if (!ordersList) return;

    // =====================================
    // 1. LOCAL STORAGE HELPERS
    // =====================================

    function readStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage error:", key, error);
            return [];
        }
    }

    function saveOrders(orders) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }

    function getOrders() {
        return readStorage(STORAGE_KEY);
    }

    function getRequests() {
        return readStorage(REQUEST_KEY);
    }

    function saveRequests(requests) {
        localStorage.setItem(REQUEST_KEY, JSON.stringify(requests));
    }

    // =====================================
    // 2. CURRENT CUSTOMER
    // =====================================

    function getCurrentUser() {
        try {
            const saved = localStorage.getItem("veloraCurrentUser");
            if (!saved) return null;

            try {
                return JSON.parse(saved);
            } catch (error) {
                return saved;
            }
        } catch (error) {
            return null;
        }
    }

    function getCurrentUserEmail(user) {
        if (!user) return "";

        if (typeof user === "string") {
            return user.trim().toLowerCase();
        }

        return String(
            user.email ||
            user.customerEmail ||
            user.userEmail ||
            (user.user && user.user.email) ||
            ""
        ).trim().toLowerCase();
    }

    // =====================================
    // 3. GENERAL HELPERS
    // =====================================

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    }

    function formatPrice(amount) {
        return "₹" + (Number(amount) || 0).toLocaleString("en-IN");
    }

    function normalizeStatus(status) {
        return String(status || "Order Placed")
            .trim()
            .toLowerCase();
    }

    function getOrderKey(order) {
        return String(
            order.orderId ||
            order.id ||
            order.createdAt ||
            order.orderDate ||
            ""
        );
    }

    function formatDate(dateValue) {
        if (!dateValue) return "Date unavailable";

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getDeliveryDate(order) {
        return (
            order.deliveredAt ||
            order.deliveryDate ||
            order.deliveredDate ||
            order.actualDeliveryDate ||
            null
        );
    }

    function getReturnDeadline(order) {
        const deliveryDate = getDeliveryDate(order);

        if (!deliveryDate) return null;

        const date = new Date(deliveryDate);

        if (isNaN(date.getTime())) return null;

        date.setDate(date.getDate() + 14);
        date.setHours(23, 59, 59, 999);

        return date;
    }

    function isReturnEligible(order) {
        const status = normalizeStatus(order.status);
        const deadline = getReturnDeadline(order);

        if (status !== "delivered" || !deadline) {
            return false;
        }

        return new Date() <= deadline;
    }

    function hasOpenRequest(order, type) {
        return getRequests().some(function (request) {
            return (
                String(request.orderId) === getOrderKey(order) &&
                request.type === type &&
                ["Pending", "Approved", "Processing"].includes(request.status)
            );
        });
    }

    function getCustomerOrders() {
        const user = getCurrentUser();
        const email = getCurrentUserEmail(user);

        if (!email) return [];

        return getOrders().filter(function (order) {
            const orderEmail = String(
                order.email ||
                order.customerEmail ||
                order.userEmail ||
                ""
            ).trim().toLowerCase();

            return orderEmail === email;
        });
    }

    // =====================================
    // 4. EMPTY STATE
    // =====================================

    function showEmptyState(title, message, showShoppingLink) {
        ordersList.innerHTML = "";

        const box = createElement("div", "empty-orders");
        box.appendChild(createElement("h2", "", title));
        box.appendChild(createElement("p", "", message));

        if (showShoppingLink) {
            const link = createElement("a", "", "START SHOPPING");
            link.href = "categories.html?category=ALL";
            box.appendChild(link);
        }

        ordersList.appendChild(box);
    }

    // =====================================
    // 5. REQUEST FORM
    // =====================================

    function closeRequestModal() {
        const modal = document.getElementById("velora-request-modal");
        if (modal) modal.remove();
    }

    function openRequestModal(order, type) {
        closeRequestModal();

        const items = Array.isArray(order.items) ? order.items : [];

        if (!items.length) {
            alert("No order items were found.");
            return;
        }

        const modal = createElement("div", "velora-request-overlay");
        modal.id = "velora-request-modal";

        const panel = createElement("div", "velora-request-modal");

        const heading = type === "Return"
            ? "Request a Return"
            : "Request an Exchange";

        panel.appendChild(
            createElement("h2", "", heading)
        );

        panel.appendChild(
            createElement(
                "p",
                "velora-request-description",
                "Order " + (order.orderId || "N/A") +
                " · Please provide the details below."
            )
        );

        const form = createElement("form", "velora-request-form");

        const itemLabel = createElement("label", "", "Select product");

        const itemSelect = createElement("select");
        itemSelect.required = true;
        itemSelect.name = "itemIndex";

        items.forEach(function (item, index) {
            const option = document.createElement("option");

            option.value = String(index);
            option.textContent =
                (item.productName || item.name || item.title || "Product") +
                " (Qty: " + (Number(item.quantity) || 1) + ")";

            itemSelect.appendChild(option);
        });

        itemLabel.appendChild(itemSelect);

        const reasonLabel = createElement("label", "", "Reason");

        const reasonSelect = createElement("select");
        reasonSelect.required = true;
        reasonSelect.name = "reason";

        const reasons = type === "Return"
            ? [
                "Select a reason",
                "Wrong product received",
                "Damaged or defective product",
                "Size or fit issue",
                "Product looks different",
                "Quality not as expected",
                "Other"
            ]
            : [
                "Select a reason",
                "Size is too small",
                "Size is too large",
                "Want a different size",
                "Want a different product",
                "Damaged or defective product",
                "Other"
            ];

        reasons.forEach(function (reason, index) {
            const option = document.createElement("option");
            option.value = index === 0 ? "" : reason;
            option.textContent = reason;
            reasonSelect.appendChild(option);
        });

        reasonLabel.appendChild(reasonSelect);

        const noteLabel = createElement(
            "label",
            "",
            "Additional details (optional)"
        );

        const note = createElement("textarea");
        note.name = "note";
        note.rows = 3;
        note.maxLength = 500;
        note.placeholder = "Tell us more about your request...";

        noteLabel.appendChild(note);

        const actions = createElement("div", "velora-request-actions");

        const cancelButton = createElement(
            "button",
            "velora-request-cancel",
            "GO BACK"
        );

        cancelButton.type = "button";

        const submitButton = createElement(
            "button",
            "velora-request-submit",
            "SUBMIT REQUEST"
        );

        submitButton.type = "submit";

        actions.append(cancelButton, submitButton);

        form.append(itemLabel, reasonLabel, noteLabel, actions);
        panel.appendChild(form);
        modal.appendChild(panel);

        document.body.appendChild(modal);

        cancelButton.addEventListener("click", closeRequestModal);

        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeRequestModal();
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const selectedItemIndex = Number(itemSelect.value);
            const reason = reasonSelect.value;

            if (!reason) {
                alert("Please select a reason.");
                return;
            }

            const selectedItem = items[selectedItemIndex];

            const requests = getRequests();

            const request = {
                requestId: "VLR" + Date.now(),
                orderId: getOrderKey(order),
                displayOrderId: order.orderId || "N/A",
                customerName: order.customerName || "",
                customerEmail: order.email || order.customerEmail || "",
                type: type,
                productName:
                    selectedItem.productName ||
                    selectedItem.name ||
                    selectedItem.title ||
                    "Product",
                productIndex: selectedItemIndex,
                quantity: Number(selectedItem.quantity) || 1,
                reason: reason,
                note: note.value.trim(),
                status: "Pending",
                requestDate: new Date().toISOString()
            };

            requests.push(request);
            saveRequests(requests);

            closeRequestModal();
            renderOrders();

            alert(
                type + " request submitted successfully!\n\n" +
                "Request ID: " + request.requestId +
                "\nYou can track its status in My Orders."
            );
        });
    }

    // =====================================
    // 6. CANCEL ORDER
    // =====================================

    function cancelOrder(order) {
        const status = normalizeStatus(order.status);

        const cannotCancel = [
            "shipped",
            "out for delivery",
            "delivered",
            "cancelled",
            "canceled"
        ];

        if (cannotCancel.includes(status)) {
            alert("This order can no longer be cancelled.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to cancel order " +
            (order.orderId || "") + "?"
        );

        if (!confirmed) return;

        const orders = getOrders();

        const index = orders.findIndex(function (item) {
            return getOrderKey(item) === getOrderKey(order);
        });

        if (index === -1) {
            alert("Order could not be found.");
            return;
        }

        orders[index].status = "Cancelled";
        orders[index].cancelledAt = new Date().toISOString();

        saveOrders(orders);

        const requests = getRequests();

        requests.push({
            requestId: "VLC" + Date.now(),
            orderId: getOrderKey(order),
            displayOrderId: order.orderId || "N/A",
            customerName: order.customerName || "",
            customerEmail: order.email || order.customerEmail || "",
            type: "Cancellation",
            reason: "Cancelled by customer",
            status: "Pending",
            requestDate: new Date().toISOString()
        });

        saveRequests(requests);

        renderOrders();

        alert("Your cancellation request has been recorded.");
    }

    // =====================================
    // 7. DISPLAY REQUEST HISTORY
    // =====================================

   
function renderRequestHistory(order) {
    const matchingRequests = getRequests().filter(function (request) {
        return String(request.orderId) === getOrderKey(order);
    });

    if (!matchingRequests.length) return null;

    const section = createElement("details", "velora-request-history");

    const summary = createElement(
        "summary",
        "velora-request-dropdown",
        "ORDER UPDATES (" + matchingRequests.length + ")"
    );

    section.appendChild(summary);

    const content = createElement("div", "velora-request-history-content");

    matchingRequests.slice().reverse().forEach(function (request) {
        const row = createElement("div", "velora-request-row");

        row.appendChild(
            createElement(
                "strong",
                "",
                request.type + " · " + request.status
            )
        );

        row.appendChild(
            createElement("p", "", "Request ID: " + request.requestId)
        );

        if (request.reason) {
            row.appendChild(
                createElement("p", "", "Reason: " + request.reason)
            );
        }

        content.appendChild(row);
    });

    section.appendChild(content);

    return section;
}


    // =====================================
    // 8. BUILD ORDER CARD
    // =====================================

    function buildOrderCard(order) {
        const card = createElement("article", "customer-order-card");

        const top = createElement("div", "customer-order-top");

        const idSection = createElement("div");
        idSection.appendChild(createElement("span", "", "ORDER ID"));
        idSection.appendChild(
            createElement("h3", "", order.orderId || "N/A")
        );

        const statusSection = createElement("div");
        statusSection.appendChild(createElement("span", "", "ORDER STATUS"));

       let currentStatus = order.status || "Order Placed";

if (
    currentStatus.toLowerCase() === "shipped" ||
    currentStatus.toLowerCase() === "in transit" ||
    currentStatus.toLowerCase() === "out for delivery"
) {
    currentStatus = "In Transit";
}

const status = createElement(
    "h3",
    "customer-order-status",
    currentStatus
);

        status.classList.add(
            "status-" + normalizeStatus(currentStatus).replace(/[^a-z0-9]+/g, "-")
        );

        statusSection.appendChild(status);
        top.append(idSection, statusSection);

        const date = createElement(
            "p",
            "customer-order-date",
            "Order Date: " + formatDate(order.orderDate || order.createdAt)
        );

        const products = createElement("div", "customer-order-products");
        products.appendChild(createElement("h4", "", "ORDER ITEMS"));

        const items = Array.isArray(order.items) ? order.items : [];

        items.forEach(function (item) {
            const row = createElement("div", "customer-order-product");

            if (item.image) {
                const image = createElement("img");
                image.src = item.image;
                image.alt = item.productName || item.name || "Product";
                image.className = "customer-order-product-image";

                image.onerror = function () {
                    this.style.display = "none";
                };

                row.appendChild(image);
            }

            const info = createElement(
                "div",
                "customer-order-product-info"
            );

            info.appendChild(
                createElement(
                    "strong",
                    "",
                    item.productName || item.name || item.title || "Product"
                )
            );

            let details = "Quantity: " + (Number(item.quantity) || 1);

            if (item.size) details += " | Size: " + item.size;
            if (item.category) details += " | " + item.category;

            info.appendChild(createElement("p", "", details));

            const price =
                (Number(item.price) || 0) *
                (Number(item.quantity) || 1);

            info.appendChild(
                createElement(
                    "strong",
                    "customer-order-product-price",
                    formatPrice(price)
                )
            );

            row.appendChild(info);
            products.appendChild(row);
        });

        const details = createElement("div", "customer-order-details");

        const detailRows = [
            ["Payment Method:", order.paymentMethod || "N/A"],
            [
                "Shipping Address:",
                [
                    order.address,
                    order.city,
                    order.state,
                    order.pincode
                ].filter(Boolean).join(", ") || "N/A"
            ],
            ["Subtotal:", formatPrice(order.subtotal)],
            [
                "Shipping:",
                Number(order.shipping) === 0
                    ? "FREE"
                    : formatPrice(order.shipping)
            ],
            ["Total Amount:", formatPrice(order.total)]
        ];

        detailRows.forEach(function (detail) {
            const paragraph = document.createElement("p");
            const label = createElement("strong", "", detail[0] + " ");

            paragraph.append(label, document.createTextNode(detail[1]));
            details.appendChild(paragraph);
        });

        const actions = createElement("div", "customer-order-actions");
        const orderStatus = normalizeStatus(order.status);

        const cancelStatuses = [
            "order placed",
            "pending",
            "processing",
            "confirmed"
        ];

        if (cancelStatuses.includes(orderStatus)) {
            const cancelButton = createElement(
                "button",
                "order-action-button cancel-order-button",
                "CANCEL ORDER"
            );

            cancelButton.type = "button";
            cancelButton.dataset.action = "cancel";
            actions.appendChild(cancelButton);
        }

        if (orderStatus === "delivered") {
            const deadline = getReturnDeadline(order);

            if (isReturnEligible(order)) {
                const returnButton = createElement(
                    "button",
                    "order-action-button return-order-button",
                    "RETURN ORDER"
                );

                returnButton.type = "button";
                returnButton.dataset.action = "return";
                actions.appendChild(returnButton);

                const exchangeButton = createElement(
                    "button",
                    "order-action-button exchange-order-button",
                    "EXCHANGE ITEM"
                );

                exchangeButton.type = "button";
                exchangeButton.dataset.action = "exchange";
                actions.appendChild(exchangeButton);

                actions.appendChild(
                    createElement(
                        "p",
                        "return-deadline-note",
                        "Return / exchange available until " +
                        formatDate(deadline)
                    )
                );
            } else if (!deadline) {
                actions.appendChild(
                    createElement(
                        "p",
                        "return-deadline-note",
                        "Delivery date not recorded. Please contact support for return assistance."
                    )
                );
            } else {
                actions.appendChild(
                    createElement(
                        "p",
                        "return-expired-note",
                        "The 14-day return and exchange period has ended."
                    )
                );
            }
        }

        if (hasOpenRequest(order, "Return")) {
            actions.appendChild(
                createElement("p", "request-notice", "A return request is already active.")
            );
        }

        if (hasOpenRequest(order, "Exchange")) {
            actions.appendChild(
                createElement("p", "request-notice", "An exchange request is already active.")
            );
        }

        const supportLink = createElement(
            "a",
            "customer-order-support",
            "NEED HELP WITH THIS ORDER?"
        );

        supportLink.href = "support.html";

        card.append(top, date, products, details, actions);

        const requestHistory = renderRequestHistory(order);

        if (requestHistory) {
            card.appendChild(requestHistory);
        }

        card.appendChild(supportLink);

        return card;
    }

    // =====================================
    // 9. RENDER ALL CUSTOMER ORDERS
    // =====================================

    function renderOrders() {
        const currentUserEmail = getCurrentUserEmail(getCurrentUser());
        const allOrders = getCustomerOrders();

        ordersList.innerHTML = "";

        if (!currentUserEmail) {
            showEmptyState(
                "Please log in",
                "Log in to your VÊLORA account to view your order history.",
                false
            );

            return;
        }

        if (!allOrders.length) {
            showEmptyState(
                "No orders yet!",
                "Your VÊLORA shopping journey starts here.",
                true
            );

            return;
        }

        allOrders.sort(function (a, b) {
            const dateA = new Date(a.createdAt || a.orderDate || 0).getTime();
            const dateB = new Date(b.createdAt || b.orderDate || 0).getTime();

            return (isNaN(dateB) ? 0 : dateB) -
                   (isNaN(dateA) ? 0 : dateA);
        });

        allOrders.forEach(function (order) {
            ordersList.appendChild(buildOrderCard(order));
        });
    }

    // =====================================
    // 10. BUTTON ACTIONS
    // =====================================

    
    ordersList.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const card = button.closest(".customer-order-card");
        if (!card) return;

        const orderIdElement = card.querySelector(".customer-order-top h3");
        if (!orderIdElement) return;

        const displayedOrderId = orderIdElement.textContent.trim();

        const order = getCustomerOrders().find(function (item) {
            return String(item.orderId || "N/A") === displayedOrderId;
        });

        if (!order) {
            alert("Order not found. Please refresh the page.");
            return;
        }

        const action = button.dataset.action;
        const currentStatus = normalizeStatus(order.status);

        // STRICT DELIVERY CHECK
        if (action === "return" || action === "exchange") {

            if (currentStatus !== "delivered") {
                alert("Return and Exchange are available only after your order has been delivered.");
                renderOrders();
                return;
            }

            if (!isReturnEligible(order)) {
                alert("Return and Exchange are available only within 14 days of delivery.");
                renderOrders();
                return;
            }

            if (action === "return") {
                if (hasOpenRequest(order, "Return")) {
                    alert("You already have an active return request.");
                    return;
                }

                openRequestModal(order, "Return");
                return;
            }

            if (action === "exchange") {
                if (hasOpenRequest(order, "Exchange")) {
                    alert("You already have an active exchange request.");
                    return;
                }

                openRequestModal(order, "Exchange");
                return;
            }
        }

        if (action === "cancel") {
            cancelOrder(order);
        }
    });


    // =====================================
    // 11. INITIAL LOAD AND LIVE REFRESH
    // =====================================

    renderOrders();

    window.addEventListener("storage", function (event) {
        if (
            event.key === STORAGE_KEY ||
            event.key === REQUEST_KEY
        ) {
            renderOrders();
        }
    });

});
