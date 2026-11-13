
document.addEventListener("DOMContentLoaded", function () {

    const ordersList = document.getElementById("customer-orders-list");

    if (!ordersList) return;

    // LOAD ORDERS SAFELY
    function getOrders() {
        try {
            const savedOrders = JSON.parse(
                localStorage.getItem("veloraOrders")
            );

            return Array.isArray(savedOrders) ? savedOrders : [];

        } catch (error) {
            return [];
        }
    }

    // LOAD CURRENT CUSTOMER
    function getCurrentUser() {
        try {
            return JSON.parse(
                localStorage.getItem("veloraCurrentUser")
            );
        } catch (error) {
            return null;
        }
    }

    const currentUser = getCurrentUser();
    let orders = getOrders();

    // FILTER ORDERS BY CUSTOMER EMAIL
    if (currentUser && currentUser.email) {

        orders = orders.filter(function (order) {
            return (
                (order.email || "").toLowerCase() ===
                currentUser.email.toLowerCase()
            );
        });

    } else {
        orders = [];
    }

    ordersList.innerHTML = "";

    // FORMAT PRICE
    function formatPrice(amount) {
        return "₹" + (Number(amount) || 0).toLocaleString("en-IN");
    }

    // CREATE ELEMENT
    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    // EMPTY ORDERS MESSAGE
    if (orders.length === 0) {

        const emptyMessage = createElement("div", "empty-orders");

        const heading = createElement("h2", "", "No orders yet!");

        const paragraph = createElement(
            "p",
            "",
            "Your VÊLORA shopping journey starts here."
        );

        const shoppingLink = createElement(
            "a",
            "",
            "START SHOPPING"
        );

        shoppingLink.href = "categories.html?category=ALL";

        emptyMessage.append(heading, paragraph, shoppingLink);
        ordersList.appendChild(emptyMessage);

        return;
    }

    // LATEST ORDERS FIRST
    const latestOrders = [...orders].reverse();

    latestOrders.forEach(function (order) {

        const orderCard = createElement("div", "customer-order-card");

        // ORDER HEADER
        const orderTop = createElement("div", "customer-order-top");

        const orderIdSection = document.createElement("div");

        orderIdSection.appendChild(
            createElement("span", "", "ORDER ID")
        );

        orderIdSection.appendChild(
            createElement("h3", "", order.orderId || "N/A")
        );

        const statusSection = document.createElement("div");

        statusSection.appendChild(
            createElement("span", "", "ORDER STATUS")
        );

        const status = createElement(
            "h3",
            "customer-order-status",
            order.status || "Order Placed"
        );

        const statusClass = String(order.status || "order-placed")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        status.classList.add("status-" + statusClass);

        statusSection.appendChild(status);

        orderTop.append(orderIdSection, statusSection);

        // ORDER DATE
        const dateText = createElement(
            "p",
            "customer-order-date",
            "Order Date: " + (order.orderDate || "N/A")
        );

        // PRODUCT SECTION
        const productsSection = createElement(
            "div",
            "customer-order-products"
        );

        const productsHeading = createElement(
            "h4",
            "",
            "ORDER ITEMS"
        );

        productsSection.appendChild(productsHeading);

        const items = Array.isArray(order.items) ? order.items : [];

        items.forEach(function (item) {

            const productRow = createElement(
                "div",
                "customer-order-product"
            );

            if (item.image) {
                const image = createElement("img");

                image.src = item.image;
                image.alt = item.productName || "Product";
                image.className = "customer-order-product-image";

                image.onerror = function () {
                    this.style.display = "none";
                };

                productRow.appendChild(image);
            }

            const productInfo = createElement(
                "div",
                "customer-order-product-info"
            );

            productInfo.appendChild(
                createElement(
                    "strong",
                    "",
                    item.productName || item.name || item.title || "Product"
                )
            );

            let productDetails =
                "Quantity: " + (Number(item.quantity) || 1);

            if (item.size) {
                productDetails += " | Size: " + item.size;
            }

            if (item.category) {
                productDetails += " | " + item.category;
            }

            productInfo.appendChild(
                createElement("p", "", productDetails)
            );

            const itemPrice =
                (Number(item.price) || 0) *
                (Number(item.quantity) || 1);

            productInfo.appendChild(
                createElement("strong", "customer-order-product-price",
                    formatPrice(itemPrice))
            );

            productRow.appendChild(productInfo);
            productsSection.appendChild(productRow);
        });

        // ORDER INFORMATION
        const orderDetails = createElement(
            "div",
            "customer-order-details"
        );

        const detailRows = [
            ["Payment Method:", order.paymentMethod || "N/A"],
            ["Shipping Address:",
                [
                    order.address,
                    order.city,
                    order.state,
                    order.pincode
                ].filter(Boolean).join(", ") || "N/A"],
            ["Subtotal:", formatPrice(order.subtotal)],
            ["Shipping:", Number(order.shipping) === 0
                ? "FREE"
                : formatPrice(order.shipping)],
            ["Total Amount:", formatPrice(order.total)]
        ];

        detailRows.forEach(function (detail) {

            const paragraph = document.createElement("p");

            const label = createElement("strong", "", detail[0] + " ");
            const value = document.createTextNode(detail[1]);

            paragraph.append(label, value);
            orderDetails.appendChild(paragraph);
        });

        // SUPPORT LINK
        const supportLink = createElement(
            "a",
            "customer-order-support",
            "NEED HELP WITH THIS ORDER?"
        );

        supportLink.href = "support.html";

        // BUILD ORDER CARD
        orderCard.append(
            orderTop,
            dateText,
            productsSection,
            orderDetails,
            supportLink
        );

        ordersList.appendChild(orderCard);

    });

});
