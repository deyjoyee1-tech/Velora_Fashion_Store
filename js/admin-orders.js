
document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // VÊLORA ADMIN ORDER MANAGEMENT
    // =========================================

    const STORAGE_KEY = "veloraOrders";
    const REQUEST_KEY = "veloraOrderRequests";

    const ordersList = document.getElementById("admin-orders-list");
    const statusFilter = document.getElementById("order-status-filter");
    const searchInput = document.getElementById("order-search");
    const sortFilter = document.getElementById("order-sort-filter");
    const orderMessage = document.getElementById("order-message");
    const emptyState = document.getElementById("order-empty-state");

    const modal = document.getElementById("order-details-modal");
    const modalContent = document.getElementById("order-details-content");
    const closeModalButton = document.getElementById("close-order-modal");
    const closeBackdrop = document.getElementById("close-order-modal-backdrop");

    if (!ordersList) {
        console.error("VÊLORA: admin-orders-list element was not found.");
        return;
    }

    let orders = [];

    // =========================================
    // 1. SAFE STORAGE FUNCTIONS
    // =========================================

    function readArray(key) {
        try {
            const raw = localStorage.getItem(key);

            if (!raw) return [];

            const parsed = JSON.parse(raw);

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {
            console.error("Could not read " + key, error);
            return [];
        }
    }

    function getSavedOrders() {
        return readArray(STORAGE_KEY);
    }

    function saveOrders(savedOrders) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(savedOrders)
            );

            return true;

        } catch (error) {
            console.error("Could not save orders:", error);
            showMessage("Could not save order changes.", "error");
            return false;
        }
    }

    function getRequests() {
        return readArray(REQUEST_KEY);
    }

    function saveRequests(requests) {
        try {
            localStorage.setItem(
                REQUEST_KEY,
                JSON.stringify(requests)
            );

            return true;

        } catch (error) {
            console.error("Could not save requests:", error);
            showMessage("Could not save customer request.", "error");
            return false;
        }
    }

    // =========================================
    // 2. GENERAL HELPERS
    // =========================================

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatCurrency(amount) {
        return "₹" + Number(amount || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    function normalizeStatus(status) {
        const value = String(status || "Order Placed")
            .trim()
            .toLowerCase();

        const statusMap = {
            "order placed": "Pending",
            "pending": "Pending",
            "processing": "Processing",
            "confirmed": "Processing",
            "shipped": "Shipped",
            "out for delivery": "Shipped",
            "delivered": "Delivered",
            "cancelled": "Cancelled",
            "canceled": "Cancelled"
        };

        return statusMap[value] || "Pending";
    }

    function getInitials(name) {
        return String(name || "Customer")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("");
    }

    function getOrderKey(order) {
        return String(
            order.orderId ||
            order.id ||
            order.createdAt ||
            ""
        );
    }

    function getDisplayDate(order) {
        const value = order.date || order.orderDate || order.createdAt;

        if (!value) return "Date unavailable";

        const date = new Date(value);

        if (isNaN(date.getTime())) return String(value);

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getOrderTimestamp(order) {
        const value = order.createdAt || order.date;

        if (!value) return 0;

        const timestamp = new Date(value).getTime();

        return isNaN(timestamp) ? 0 : timestamp;
    }

    function showMessage(message, type) {
        if (!orderMessage) return;

        orderMessage.textContent = message;
        orderMessage.className = "velora-order-message";

        if (type === "success") {
            orderMessage.classList.add("success");
        }

        if (type === "error") {
            orderMessage.classList.add("error");
        }
    }

    // =========================================
    // 3. LOAD AND NORMALIZE CUSTOMER ORDERS
    // =========================================

    function loadOrders() {
        const savedOrders = getSavedOrders();

        return savedOrders.map(function (order, index) {

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

            const totalQuantity = items.reduce(function (total, item) {
                return total + Math.max(
                    0,
                    Number(item.quantity) || 1
                );
            }, 0);

            return {
                id: order.orderId || order.id || "ORDER-" + (index + 1),
                storageId: order.orderId || order.id || null,

                customer: order.customerName || order.customer || "Customer",

                email:
                    order.email ||
                    order.customerEmail ||
                    order.userEmail ||
                    "",

                phone: order.phone || "",

                product: productNames.join(", ") || "Product",
                items: items,
                quantity: totalQuantity,

                amount: Number(order.total) || 0,
                subtotal: Number(order.subtotal) || 0,
                shipping: Number(order.shipping) || 0,

                date: order.orderDate || order.createdAt || "N/A",
                createdAt: order.createdAt || "",

                status: normalizeStatus(order.status),

                address: order.address || "",
                city: order.city || "",
                state: order.state || "",
                pincode: order.pincode || "",

                paymentMethod: order.paymentMethod || "Not specified",

                deliveredAt:
                    order.deliveredAt ||
                    order.deliveryDate ||
                    order.deliveredDate ||
                    "",

                rawOrder: order
            };
        });
    }

    // =========================================
    // 4. FIND ORIGINAL ORDER
    // =========================================

    function findOriginalOrder(order) {
        const savedOrders = getSavedOrders();

        return savedOrders.find(function (item) {
            return getOrderKey(item) === String(order.storageId);
        });
    }

    // =========================================
    // 5. UPDATE ORDER STATUS
    // =========================================

    function saveOrderStatus(order, newStatus) {
        const savedOrders = getSavedOrders();

        const customerOrder = savedOrders.find(function (item) {
            return getOrderKey(item) === String(order.storageId);
        });

        if (!customerOrder) {
            showMessage(
                "Order not found in LocalStorage. No data was changed.",
                "error"
            );

            return false;
        }

        const oldStatus = normalizeStatus(customerOrder.status);

        customerOrder.status = newStatus;

        // Record the actual delivery date when marked delivered.
        if (newStatus === "Delivered" && oldStatus !== "Delivered") {
            customerOrder.deliveredAt = new Date().toISOString();
        }

        if (newStatus !== "Delivered" && oldStatus === "Delivered") {
            delete customerOrder.deliveredAt;
        }

        if (!saveOrders(savedOrders)) return false;

        order.rawOrder = customerOrder;
        order.status = newStatus;
        order.deliveredAt = customerOrder.deliveredAt || "";

        return true;
    }

    // =========================================
    // 6. ORDER STATUS STATS
    // =========================================

    function updateOrderStats() {
        const counts = {
            total: orders.length,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(function (order) {
            const status = order.status.toLowerCase();

            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });

        const elements = {
            "total-orders": counts.total,
            "pending-orders": counts.pending,
            "processing-orders": counts.processing,
            "shipped-orders": counts.shipped,
            "delivered-orders": counts.delivered,
            "cancelled-orders": counts.cancelled
        };

        Object.keys(elements).forEach(function (id) {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    // =========================================
    // 7. STATUS BADGES
    // =========================================

    function getStatusClass(status) {
        const classes = {
            "Pending": "pending",
            "Processing": "processing",
            "Shipped": "shipped",
            "Delivered": "delivered",
            "Cancelled": "cancelled"
        };

        return classes[status] || "pending";
    }

    // =========================================
    // 8. SEARCH, FILTER AND SORT
    // =========================================

    function getFilteredOrders() {
        const selectedStatus = statusFilter
            ? statusFilter.value
            : "ALL";

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        let filtered = orders.filter(function (order) {

            const matchesStatus =
                selectedStatus === "ALL" ||
                order.status === selectedStatus;

            const searchableText = [
                order.id,
                order.customer,
                order.email,
                order.phone,
                order.product,
                order.status
            ].join(" ").toLowerCase();

            const matchesSearch =
                !searchTerm ||
                searchableText.includes(searchTerm);

            return matchesStatus && matchesSearch;
        });

        const sortValue = sortFilter
            ? sortFilter.value
            : "newest";

        filtered.sort(function (a, b) {
            if (sortValue === "highest") {
                return b.amount - a.amount;
            }

            if (sortValue === "lowest") {
                return a.amount - b.amount;
            }

            if (sortValue === "oldest") {
                return getOrderTimestamp(a) - getOrderTimestamp(b);
            }

            return getOrderTimestamp(b) - getOrderTimestamp(a);
        });

        return filtered;
    }

    // =========================================
    // 9. ORDER DETAILS MODAL
    // =========================================

    function openOrderDetails(order) {
        if (!modal || !modalContent) return;

        const itemRows = order.items.map(function (item) {
            const name =
                item.productName ||
                item.name ||
                item.title ||
                "Product";

            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;

            const size = item.size
                ? " · Size: " + escapeHTML(item.size)
                : "";

            return `
                <div class="velora-detail-product">
                    <div>
                        <strong>${escapeHTML(name)}</strong>
                        <span>Qty: ${quantity}${size}</span>
                    </div>
                    <strong>${formatCurrency(price * quantity)}</strong>
                </div>
            `;
        }).join("");

        const fullAddress = [
            order.address,
            order.city,
            order.state,
            order.pincode
        ].filter(Boolean).join(", ");

        modalContent.innerHTML = `
            <div class="velora-detail-overview">
                <div>
                    <span>ORDER NUMBER</span>
                    <strong>${escapeHTML(order.id)}</strong>
                </div>
                <div>
                    <span>ORDER DATE</span>
                    <strong>${escapeHTML(getDisplayDate(order))}</strong>
                </div>
                <div>
                    <span>ORDER STATUS</span>
                    <strong class="velora-detail-status ${getStatusClass(order.status)}">
                        ${escapeHTML(order.status)}
                    </strong>
                </div>
            </div>

            <div class="velora-detail-section">
                <h3>Customer Information</h3>
                <div class="velora-detail-info-grid">
                    <div>
                        <span>Customer Name</span>
                        <strong>${escapeHTML(order.customer)}</strong>
                    </div>
                    <div>
                        <span>Email Address</span>
                        <strong>${escapeHTML(order.email || "Not provided")}</strong>
                    </div>
                    <div>
                        <span>Phone Number</span>
                        <strong>${escapeHTML(order.phone || "Not provided")}</strong>
                    </div>
                    <div>
                        <span>Payment Method</span>
                        <strong>${escapeHTML(order.paymentMethod)}</strong>
                    </div>
                </div>
            </div>

            <div class="velora-detail-section">
                <h3>Delivery Address</h3>
                <p class="velora-detail-address">
                    ${escapeHTML(fullAddress || "Address not available")}
                </p>
            </div>

            <div class="velora-detail-section">
                <h3>Purchased Products</h3>
                <div class="velora-detail-products">
                    ${itemRows || "<p>No product information available.</p>"}
                </div>
            </div>

            <div class="velora-detail-total">
                <div>
                    <span>Subtotal</span>
                    <strong>${formatCurrency(order.subtotal || order.amount)}</strong>
                </div>
                <div>
                    <span>Delivery Charge</span>
                    <strong>${formatCurrency(order.shipping)}</strong>
                </div>
                <div class="velora-detail-grand-total">
                    <span>Order Total</span>
                    <strong>${formatCurrency(order.amount)}</strong>
                </div>
            </div>
        `;

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeOrderDetails() {
        if (!modal) return;

        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (closeModalButton) {
        closeModalButton.addEventListener("click", closeOrderDetails);
    }

    if (closeBackdrop) {
        closeBackdrop.addEventListener("click", closeOrderDetails);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeOrderDetails();
        }
    });

    // =========================================
    // 10. DISPLAY ORDER TABLE
    // =========================================

    function displayOrders() {
        if (!ordersList) return;

        ordersList.innerHTML = "";

        const filteredOrders = getFilteredOrders();

        filteredOrders.forEach(function (order) {
            const row = document.createElement("tr");

            // ORDER ID
            const orderCell = document.createElement("td");

            orderCell.innerHTML = `
                <div class="velora-order-id-cell">
                    <strong>${escapeHTML(order.id)}</strong>
                    <span>Customer purchase</span>
                </div>
            `;

            row.appendChild(orderCell);

            // CUSTOMER
            const customerCell = document.createElement("td");

            customerCell.innerHTML = `
                <div class="velora-order-customer">
                    <span class="velora-customer-avatar">
                        ${escapeHTML(getInitials(order.customer))}
                    </span>
                    <div>
                        <strong>${escapeHTML(order.customer)}</strong>
                        <span>${escapeHTML(order.email || "Email unavailable")}</span>
                    </div>
                </div>
            `;

            row.appendChild(customerCell);

            // PRODUCTS
            const productCell = document.createElement("td");

            productCell.innerHTML = `
                <div class="velora-order-product-cell">
                    <strong>${escapeHTML(order.product)}</strong>
                    <span>${order.items.length} product line(s) · ${order.quantity} item(s)</span>
                </div>
            `;

            row.appendChild(productCell);

            // AMOUNT
            const amountCell = document.createElement("td");

            amountCell.innerHTML = `
                <strong class="velora-order-amount">
                    ${formatCurrency(order.amount)}
                </strong>
            `;

            row.appendChild(amountCell);

            // DATE
            const dateCell = document.createElement("td");
            dateCell.textContent = getDisplayDate(order);
            row.appendChild(dateCell);

            // STATUS
            const statusCell = document.createElement("td");
            const statusWrapper = document.createElement("div");

            statusWrapper.className = "velora-order-status-control";

            const badge = document.createElement("span");

            badge.className =
                "velora-order-status-badge " +
                getStatusClass(order.status);

            badge.textContent = order.status;

            const statusSelect = document.createElement("select");

            statusSelect.className = "velora-order-status-select";
            statusSelect.setAttribute(
                "aria-label",
                "Update status for " + order.id
            );

            const availableStatuses = [
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];

            availableStatuses.forEach(function (status) {
                const option = document.createElement("option");

                option.value = status;
                option.textContent = status;
                option.selected = order.status === status;

                statusSelect.appendChild(option);
            });

            statusSelect.addEventListener("change", function () {
                const newStatus = statusSelect.value;
                const previousStatus = order.status;

                if (newStatus === previousStatus) return;

                if (!saveOrderStatus(order, newStatus)) {
                    statusSelect.value = previousStatus;
                    return;
                }

                showMessage(
                    "Order " + order.id + " updated to " + newStatus + ".",
                    "success"
                );

                refreshAll();
            });

            statusWrapper.append(badge, statusSelect);
            statusCell.appendChild(statusWrapper);
            row.appendChild(statusCell);

            // ACTIONS
            const actionCell = document.createElement("td");
            const viewButton = document.createElement("button");

            viewButton.type = "button";
            viewButton.className = "velora-view-order-btn";
            viewButton.textContent = "VIEW DETAILS";

            viewButton.addEventListener("click", function () {
                openOrderDetails(order);
            });

            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);

            ordersList.appendChild(row);
        });

        // EMPTY STATE
        if (emptyState) {
            emptyState.style.display =
                filteredOrders.length === 0 ? "block" : "none";
        }

        const tableWrapper = ordersList.closest(".admin-table-wrapper");

        if (tableWrapper) {
            tableWrapper.style.display =
                filteredOrders.length === 0 ? "none" : "block";
        }

        const resultsCount = document.getElementById("order-results-count");

        if (resultsCount) {
            resultsCount.textContent =
                "Showing " + filteredOrders.length +
                " of " + orders.length + " orders";
        }

        updateOrderStats();
    }

    // =========================================
    // 11. CUSTOMER REQUEST MANAGEMENT
    // =========================================

    function ensureRequestSection() {
        if (document.getElementById("velora-admin-requests")) return;

        const section = document.createElement("section");

        section.id = "velora-admin-requests";
        section.className = "velora-admin-requests";

        section.innerHTML = `
            <div class="velora-admin-requests-heading">
                <div>
                    <p class="section-subtitle">CUSTOMER SERVICE</p>
                    <h2>Cancellation, Return & Exchange Requests</h2>
                    <p>Review and manage requests submitted by customers.</p>
                </div>
                <span id="velora-request-count">0 REQUESTS</span>
            </div>

            <div id="velora-admin-request-list"></div>
        `;

        const tableWrapper = ordersList.closest(".admin-table-wrapper");

        if (tableWrapper && tableWrapper.parentNode) {
            tableWrapper.parentNode.insertBefore(
                section,
                tableWrapper.nextSibling
            );
        } else {
            ordersList.parentNode.insertBefore(
                section,
                ordersList.nextSibling
            );
        }

        addRequestStyles();
    }

    function addRequestStyles() {
        if (document.getElementById("velora-request-admin-styles")) return;

        const style = document.createElement("style");

        style.id = "velora-request-admin-styles";

        style.textContent = `
            .velora-admin-requests {
                margin: 35px 0;
                padding: 25px;
                background: #fffdf9;
                border: 1px solid #e9dfd3;
                border-radius: 12px;
            }

            .velora-admin-requests-heading {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
                margin-bottom: 22px;
            }

            .velora-admin-requests-heading h2 {
                color: #49382d;
                font-family: Georgia, serif;
                font-size: 24px;
                margin: 7px 0;
            }

            .velora-admin-requests-heading p {
                color: #887a6e;
                font-size: 13px;
            }

            #velora-request-count {
                background: #f1ebe2;
                color: #624d3d;
                padding: 9px 14px;
                font-size: 11px;
                letter-spacing: 1px;
            }

            .velora-admin-request-card {
                padding: 20px;
                margin-bottom: 14px;
                border: 1px solid #e9dfd3;
                background: #fff;
                border-radius: 8px;
            }

            .velora-admin-request-top {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
            }

            .velora-admin-request-top strong {
                color: #49382d;
                font-size: 14px;
            }

            .velora-admin-request-meta {
                margin-top: 10px;
                color: #817469;
                font-size: 12px;
                line-height: 1.8;
            }

            .velora-admin-request-status {
                display: inline-block;
                padding: 6px 10px;
                background: #f2eee6;
                color: #77664f;
                font-size: 10px;
                letter-spacing: .6px;
            }

            .velora-admin-request-status.approved,
            .velora-admin-request-status.completed {
                background: #e8f0e6;
                color: #536d4e;
            }

            .velora-admin-request-status.rejected {
                background: #f7e9e7;
                color: #9b4e48;
            }

            .velora-admin-request-actions {
                display: flex;
                gap: 9px;
                flex-wrap: wrap;
                margin-top: 16px;
            }

            .velora-admin-request-actions button {
                border: 0;
                padding: 10px 15px;
                font-size: 10px;
                letter-spacing: .7px;
                cursor: pointer;
            }

            .velora-approve-request {
                background: #71806b;
                color: #fff;
            }

            .velora-reject-request {
                background: #f3e5e2;
                color: #9b4e48;
            }

            .velora-complete-request {
                background: #49382d;
                color: #fff;
            }

            .velora-no-requests {
                padding: 22px;
                text-align: center;
                color: #8b7d70;
                background: #f8f5f0;
                font-size: 13px;
            }
        `;

        document.head.appendChild(style);
    }

    function updateRequestStatus(requestId, newStatus) {
        const requests = getRequests();

        const index = requests.findIndex(function (request) {
            return String(request.requestId) === String(requestId);
        });

        if (index === -1) {
            showMessage("Request not found.", "error");
            return;
        }

        const request = requests[index];

        if (newStatus === "Rejected" && request.type === "Cancellation") {
            const savedOrders = getSavedOrders();

            const originalOrder = savedOrders.find(function (order) {
                return getOrderKey(order) === String(request.orderId);
            });

            if (originalOrder) {
                // Restore a sensible order status if the cancellation
                // request is rejected.
                originalOrder.status = "Order Placed";
                delete originalOrder.cancelledAt;

                if (!saveOrders(savedOrders)) return;
            }
        }

        request.status = newStatus;
        request.updatedAt = new Date().toISOString();

        if (!saveRequests(requests)) return;

        showMessage(
            request.type + " request " + newStatus.toLowerCase() + ".",
            "success"
        );

        refreshAll();
    }

    function renderRequests() {
        ensureRequestSection();

        const container = document.getElementById(
            "velora-admin-request-list"
        );

        const countElement = document.getElementById(
            "velora-request-count"
        );

        if (!container) return;

        const requests = getRequests().sort(function (a, b) {
            return new Date(b.requestDate || 0) -
                   new Date(a.requestDate || 0);
        });

        if (countElement) {
            countElement.textContent = requests.length + " REQUESTS";
        }

        container.innerHTML = "";

        if (!requests.length) {
            container.innerHTML = `
                <div class="velora-no-requests">
                    No cancellation, return or exchange requests yet.
                </div>
            `;
            return;
        }

        requests.forEach(function (request) {
            const card = document.createElement("div");

            card.className = "velora-admin-request-card";

            const statusClass = String(request.status || "Pending")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");

            const date = request.requestDate
                ? new Date(request.requestDate).toLocaleString("en-IN")
                : "Date unavailable";

            card.innerHTML = `
                <div class="velora-admin-request-top">
                    <strong>
                        ${escapeHTML(request.type || "Customer Request")}
                        · Order ${escapeHTML(request.displayOrderId || request.orderId || "N/A")}
                    </strong>

                    <span class="velora-admin-request-status ${statusClass}">
                        ${escapeHTML(request.status || "Pending")}
                    </span>
                </div>

                <div class="velora-admin-request-meta">
                    <div><strong>Customer:</strong> ${escapeHTML(request.customerName || "Customer")}</div>
                    <div><strong>Email:</strong> ${escapeHTML(request.customerEmail || "Not provided")}</div>
                    <div><strong>Product:</strong> ${escapeHTML(request.productName || "Entire order / Not specified")}</div>
                    <div><strong>Reason:</strong> ${escapeHTML(request.reason || "Not provided")}</div>
                    <div><strong>Additional details:</strong> ${escapeHTML(request.note || "None")}</div>
                    <div><strong>Request date:</strong> ${escapeHTML(date)}</div>
                    <div><strong>Request ID:</strong> ${escapeHTML(request.requestId || "N/A")}</div>
                </div>
            `;

            const actions = document.createElement("div");
            actions.className = "velora-admin-request-actions";

            if (request.status === "Pending") {
                const approve = document.createElement("button");
                approve.type = "button";
                approve.className = "velora-approve-request";
                approve.textContent = "APPROVE";

                approve.addEventListener("click", function () {
                    if (!confirm("Approve this " + request.type + " request?")) {
                        return;
                    }

                    updateRequestStatus(request.requestId, "Approved");
                });

                const reject = document.createElement("button");
                reject.type = "button";
                reject.className = "velora-reject-request";
                reject.textContent = "REJECT";

                reject.addEventListener("click", function () {
                    if (!confirm("Reject this " + request.type + " request?")) {
                        return;
                    }

                    updateRequestStatus(request.requestId, "Rejected");
                });

                actions.append(approve, reject);
            }

            if (request.status === "Approved") {
                const complete = document.createElement("button");
                complete.type = "button";
                complete.className = "velora-complete-request";
                complete.textContent = "MARK COMPLETED";

                complete.addEventListener("click", function () {
                    if (!confirm("Mark this request as completed?")) {
                        return;
                    }

                    updateRequestStatus(request.requestId, "Completed");
                });

                actions.appendChild(complete);
            }

            if (actions.children.length) {
                card.appendChild(actions);
            }

            container.appendChild(card);
        });
    }

    // =========================================
    // 12. SEARCH AND FILTER EVENTS
    // =========================================

    if (statusFilter) {
        statusFilter.addEventListener("change", displayOrders);
    }

    if (searchInput) {
        searchInput.addEventListener("input", displayOrders);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", displayOrders);
    }

    // =========================================
    // 13. REFRESH ALL ADMIN DATA
    // =========================================

    function refreshAll() {
        orders = loadOrders();

        displayOrders();
        renderRequests();
    }

    // =========================================
    // 14. LOCAL STORAGE CHANGE LISTENER
    // =========================================

    window.addEventListener("storage", function (event) {
        if (
            event.key === STORAGE_KEY ||
            event.key === REQUEST_KEY
        ) {
            refreshAll();
        }
    });

    // =========================================
    // 15. INITIAL LOAD
    // =========================================

    refreshAll();

    console.log("VÊLORA Admin Order Management loaded.");
    console.log("Website origin:", location.origin);
    console.log("Orders found:", getSavedOrders().length);
    console.log("Customer requests found:", getRequests().length);

});
