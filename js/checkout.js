
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. CHECKOUT ELEMENTS
    // =====================================

    const checkoutForm = document.getElementById("checkout-form");
    const checkoutItemsContainer = document.getElementById("checkout-items");
    const subtotalElement = document.getElementById("checkout-subtotal");
    const shippingElement = document.getElementById("checkout-shipping");
    const totalElement = document.getElementById("checkout-total");
    const checkoutMessage = document.getElementById("checkout-message");
    const placeOrderButton = document.querySelector(".place-order-button");

    if (
        !checkoutForm ||
        !checkoutItemsContainer ||
        !subtotalElement ||
        !shippingElement ||
        !totalElement
    ) return;


    // =====================================
    // 2. CHECKOUT MODE
    // =====================================

    const params = new URLSearchParams(window.location.search);
    const isBuyNow = params.get("mode") === "buy-now";

    function getStorageData(key) {

        try {

            const data = JSON.parse(localStorage.getItem(key));

            return Array.isArray(data) ? data : [];

        } catch (error) {

            return [];

        }
    }

    // BUY NOW uses its own temporary product.
    // Normal checkout uses the shopping bag.

    let checkoutItems = isBuyNow
        ? getStorageData("veloraBuyNow")
        : getStorageData("veloraCart");

    let subtotal = 0;
    let isPlacingOrder = false;


    // =====================================
    // 3. HELPER FUNCTIONS
    // =====================================

    function formatPrice(amount) {
        return "₹" + amount.toLocaleString("en-IN");
    }

    function getPrice(priceValue) {

        const price = Number(
            String(priceValue).replace(/[^\d.]/g, "")
        );

        return Number.isFinite(price) ? price : 0;
    }

    function getQuantity(item) {

        return Math.min(
            10,
            Math.max(1, Number(item.quantity) || 1)
        );

    }

    function calculateShipping() {

        if (subtotal === 0 || subtotal >= 1999) {
            return 0;
        }

        return 99;

    }

    function showMessage(message, color) {

        if (!checkoutMessage) return;

        checkoutMessage.textContent = message;
        checkoutMessage.style.color = color;

    }


    // =====================================
    // 4. DISPLAY CHECKOUT PRODUCTS
    // =====================================

    function displayCheckoutItems() {

        checkoutItemsContainer.innerHTML = "";
        subtotal = 0;

        if (checkoutItems.length === 0) {

            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "Your bag is empty. ";

            const link = document.createElement("a");
            link.href = "categories.html?category=ALL";
            link.textContent = "Continue shopping";

            emptyMessage.appendChild(link);
            checkoutItemsContainer.appendChild(emptyMessage);

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
                placeOrderButton.textContent = "YOUR BAG IS EMPTY";
            }

        } else {

            if (placeOrderButton && !isPlacingOrder) {
                placeOrderButton.disabled = false;
                placeOrderButton.textContent = "PLACE ORDER";
            }

            checkoutItems.forEach(function (item) {

                const price = getPrice(item.price);
                const quantity = getQuantity(item);
                const itemTotal = price * quantity;

                subtotal += itemTotal;

                const itemElement = document.createElement("div");
                itemElement.className = "checkout-item";

                const name = document.createElement("strong");

                name.textContent =
                    item.productName || item.name || item.title || "Product";

                const details = document.createElement("p");

                details.textContent = "Quantity: " + quantity;

                if (item.size) {
                    details.textContent += " | Size: " + item.size;
                }

                if (item.colour) {
                    details.textContent += " | Colour: " + item.colour;
                }

                if (item.material) {
                    details.textContent += " | Material: " + item.material;
                }

                const priceText = document.createElement("span");
                priceText.textContent = formatPrice(itemTotal);

                itemElement.append(name, details, priceText);
                checkoutItemsContainer.appendChild(itemElement);

            });

        }

        // UPDATE ORDER SUMMARY

        const shipping = calculateShipping();
        const total = subtotal + shipping;

        subtotalElement.textContent = formatPrice(subtotal);

        shippingElement.textContent =
            shipping === 0 ? "FREE" : formatPrice(shipping);

        totalElement.textContent = formatPrice(total);

    }


    // =====================================
    // 5. PLACE ORDER
    // =====================================

    checkoutForm.addEventListener("submit", function (event) {

        event.preventDefault();

        if (isPlacingOrder) return;

        if (checkoutItems.length === 0) {

            showMessage(
                "Your bag is empty. Please add products first.",
                "#c0392b"
            );

            return;

        }

        if (!checkoutForm.reportValidity()) return;


        // CHECK PRODUCT PRICES

        const hasInvalidPrice = checkoutItems.some(function (item) {
            return getPrice(item.price) <= 0;
        });

        if (hasInvalidPrice) {

            showMessage(
                "One or more products have an invalid price. Please check your bag.",
                "#c0392b"
            );

            return;

        }


        // GET PAYMENT METHOD

        const selectedPayment = checkoutForm.querySelector(
            'input[name="payment"]:checked'
        );

        if (!selectedPayment) {

            showMessage("Please select a payment method.", "#c0392b");

            return;

        }


        // CALCULATE FINAL AMOUNT

        const shipping = calculateShipping();
        const total = subtotal + shipping;


        // CREATE ORDER

        const order = {

            orderId: "VEL" + Date.now(),

            customerName: document.getElementById("customer-name").value.trim(),
            email: document.getElementById("customer-email").value.trim(),
            phone: document.getElementById("customer-phone").value.trim(),

            address: document.getElementById("customer-address").value.trim(),
            city: document.getElementById("customer-city").value.trim(),
            state: document.getElementById("customer-state").value.trim(),
            pincode: document.getElementById("customer-pincode").value.trim(),

            paymentMethod: selectedPayment.value,

            items: checkoutItems.map(function (item) {

                return {

                    productName:
                        item.productName || item.name || item.title || "Product",

                    price: getPrice(item.price),
                    originalPrice: getPrice(item.originalPrice),
                    quantity: getQuantity(item),

                    size: item.size || "",
                    colour: item.colour || "",
                    category: item.category || "",
                    material: item.material || "",
                    image: item.image || ""

                };

            }),

            subtotal: subtotal,
            shipping: shipping,
            total: total,

            status: "Order Placed",

            orderDate: new Date().toLocaleString("en-IN"),
            createdAt: new Date().toISOString(),

            purchaseMode: isBuyNow ? "Buy Now" : "Shopping Bag"

        };


        // =====================================
        // 6. SAVE ORDER
        // =====================================

        isPlacingOrder = true;

        if (placeOrderButton) {
            placeOrderButton.disabled = true;
            placeOrderButton.textContent = "PLACING ORDER...";
        }

        try {

            let orders = [];

            const savedOrders = localStorage.getItem("veloraOrders");

            if (savedOrders) {

                const parsedOrders = JSON.parse(savedOrders);

                if (!Array.isArray(parsedOrders)) {
                    throw new Error("Invalid order storage.");
                }

                orders = parsedOrders;

            }

            orders.push(order);

            localStorage.setItem(
                "veloraOrders",
                JSON.stringify(orders)
            );


            // =====================================
            // 7. CLEAR ONLY THE PURCHASED SOURCE
            // =====================================

            if (isBuyNow) {

                // Preserve the customer's existing shopping bag.
                localStorage.removeItem("veloraBuyNow");

            } else {

                // Normal checkout clears the shopping bag.
                localStorage.removeItem("veloraCart");

            }

            checkoutItems = [];


            // UPDATE BAG COUNT

            if (typeof window.updateCartCount === "function") {
                window.updateCartCount();
            }


            // SUCCESS MESSAGE

            showMessage(
                "Thank you! Your order " + order.orderId +
                " has been placed successfully.",
                "green"
            );

            checkoutForm.reset();

            displayCheckoutItems();

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
                placeOrderButton.textContent = "ORDER PLACED";
            }

        } catch (error) {

            isPlacingOrder = false;

            showMessage(
                "Unable to save your order. Please try again.",
                "#c0392b"
            );

            if (placeOrderButton) {
                placeOrderButton.disabled = false;
                placeOrderButton.textContent = "PLACE ORDER";
            }

        }

    });


    // =====================================
    // 8. INITIAL DISPLAY
    // =====================================

    displayCheckoutItems();

});
