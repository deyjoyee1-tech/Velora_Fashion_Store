
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // PAGE ELEMENTS
    // =====================================

    const cartContainer = document.getElementById("cart-items");
    const emptyCart = document.getElementById("empty-cart");
    const summary = document.getElementById("cart-summary");

    const subtotalElement = document.getElementById("cart-subtotal");
    const totalElement = document.getElementById("cart-total");
    const mrpElement = document.getElementById("cart-mrp");
    const discountElement = document.getElementById("cart-discount");

    if (!cartContainer || !emptyCart || !summary) return;


    // =====================================
    // LOAD CART SAFELY
    // =====================================

    function getCart() {

        try {

            const savedCart = JSON.parse(
                localStorage.getItem("veloraCart")
            );

            return Array.isArray(savedCart) ? savedCart : [];

        } catch (error) {

            return [];

        }

    }

    let cart = getCart();


    // =====================================
    // FORMAT PRICE
    // =====================================

    function getPrice(priceValue) {

        const price = Number(
            String(priceValue).replace(/[^\d.]/g, "")
        );

        return Number.isFinite(price) ? price : 0;

    }

    function formatPrice(amount) {

        return "₹" + amount.toLocaleString("en-IN");

    }


    // =====================================
    // SAVE CART
    // =====================================

    function saveCart() {

        try {

            localStorage.setItem(
                "veloraCart",
                JSON.stringify(cart)
            );

            if (typeof window.updateCartCount === "function") {
                window.updateCartCount();
            }

            renderCart();

        } catch (error) {

            alert("Unable to save your cart. Please try again.");

        }

    }


    // =====================================
    // CREATE HTML ELEMENTS
    // =====================================

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


    // =====================================
    // RENDER CART
    // =====================================

    function renderCart() {

        cartContainer.innerHTML = "";

        // EMPTY CART

        if (cart.length === 0) {

            emptyCart.hidden = false;
            summary.style.display = "none";

            if (subtotalElement) {
                subtotalElement.textContent = "₹0";
            }

            if (totalElement) {
                totalElement.textContent = "₹0";
            }

            if (mrpElement) {
                mrpElement.textContent = "₹0";
            }

            if (discountElement) {
                discountElement.textContent = "−₹0";
            }

            const shippingElement = document.getElementById(
                "cart-shipping"
            );

            if (shippingElement) {
                shippingElement.textContent = "₹0";
            }

            if (typeof window.updateCartCount === "function") {
                window.updateCartCount();
            }

            return;

        }


        emptyCart.hidden = true;
        summary.style.display = "block";


        // TOTAL CALCULATIONS

        let subtotal = 0;
        let totalMRP = 0;
        let totalDiscount = 0;


        // =====================================
        // DISPLAY EACH PRODUCT
        // =====================================

        cart.forEach(function (item, index) {

            const price = getPrice(item.price);

            const quantity = Math.min(
                10,
                Math.max(1, Number(item.quantity) || 1)
            );

            item.quantity = quantity;

            const itemTotal = price * quantity;

            // ORIGINAL PRICE

            const originalPrice = Math.max(
                price,
                getPrice(item.originalPrice)
            );

            // CALCULATE MRP AND DISCOUNT

            totalMRP += originalPrice * quantity;

            totalDiscount +=
                (originalPrice - price) * quantity;

            subtotal += itemTotal;


            // =====================================
            // PRODUCT ROW
            // =====================================

            const row = createElement("div", "cart-item");


            // PRODUCT IMAGE

            if (item.image) {

                const image = createElement("img");

                image.src = item.image;

                image.alt =
                    item.productName || item.name || "Product";

                image.className = "cart-product-image";

                image.onerror = function () {
                    this.style.display = "none";
                };

                row.appendChild(image);

            }


            // =====================================
            // PRODUCT DETAILS
            // =====================================

            const details = createElement(
                "div",
                "cart-item-details"
            );

            const name = createElement(
                "h3",
                "",
                item.productName || item.name || item.title || "Product"
            );

            details.appendChild(name);


            // CATEGORY

            const category = item.category || "Fashion";

            const categoryText = createElement(
                "p",
                "cart-item-category",
                category
            );

            details.appendChild(categoryText);


            // SIZE

            if (item.size) {

                const size = createElement(
                    "p",
                    "",
                    "Size: " + item.size
                );

                details.appendChild(size);

            }


            // MATERIAL

            if (item.material) {

                const material = createElement(
                    "p",
                    "",
                    "Material: " + item.material
                );

                details.appendChild(material);

            }
// COLOUR

const colour = createElement(
    "p",
    "",
    "Colour: " + (item.colour || "Black")
);

details.appendChild(colour);

            // =====================================
            // PRODUCT PRICE DISPLAY
            // =====================================

            const priceText = createElement(
                "p",
                "cart-item-price"
            );

            // SELLING PRICE

            const sellingPrice = createElement(
                "strong",
                "cart-selling-price",
                formatPrice(price)
            );

            priceText.appendChild(sellingPrice);


            // ORIGINAL PRICE AND DISCOUNT

            if (originalPrice > price) {

                const oldPrice = createElement(
                    "del",
                    "cart-original-price",
                    formatPrice(originalPrice)
                );

                const discountPercentage = Math.round(
                    ((originalPrice - price) / originalPrice) * 100
                );

                const discountText = createElement(
                    "span",
                    "cart-discount",
                    discountPercentage + "% OFF"
                );

                priceText.append(oldPrice, discountText);

            }


            // EACH PRICE LABEL

            const eachText = createElement(
                "span",
                "cart-each-text",
                "each"
            );

            priceText.appendChild(eachText);

            details.appendChild(priceText);

            row.appendChild(details);


            // =====================================
            // QUANTITY CONTROLS
            // =====================================

            const controls = createElement(
                "div",
                "quantity-controls"
            );


            // DECREASE QUANTITY

            const minus = createElement(
                "button",
                "",
                "−"
            );

            minus.type = "button";

            minus.setAttribute(
                "aria-label",
                "Decrease quantity"
            );

            minus.addEventListener("click", function () {

                if (quantity > 1) {

                    cart[index].quantity = quantity - 1;

                } else {

                    cart.splice(index, 1);

                }

                saveCart();

            });


            // CURRENT QUANTITY

            const quantityText = createElement(
                "span",
                "",
                String(quantity)
            );


            // INCREASE QUANTITY

            const plus = createElement(
                "button",
                "",
                "+"
            );

            plus.type = "button";

            plus.disabled = quantity >= 10;

            plus.setAttribute(
                "aria-label",
                "Increase quantity"
            );

            plus.addEventListener("click", function () {

                if (quantity < 10) {

                    cart[index].quantity = quantity + 1;

                    saveCart();

                }

            });


            controls.append(minus, quantityText, plus);

            row.appendChild(controls);


            // =====================================
            // ITEM TOTAL
            // =====================================

            const itemTotalText = createElement(
                "strong",
                "cart-item-total",
                formatPrice(itemTotal)
            );

            row.appendChild(itemTotalText);


            // =====================================
            // REMOVE BUTTON
            // =====================================

            const remove = createElement(
                "button",
                "remove-item",
                "REMOVE"
            );

            remove.type = "button";

            remove.addEventListener("click", function () {

                cart.splice(index, 1);

                saveCart();

            });

            row.appendChild(remove);

            cartContainer.appendChild(row);

        });


        // =====================================
        // UPDATE MRP AND DISCOUNT
        // =====================================

        if (mrpElement) {

            mrpElement.textContent =
                formatPrice(totalMRP);

        }

        if (discountElement) {

            discountElement.textContent =
                "−" + formatPrice(totalDiscount);

        }


        // =====================================
        // SHIPPING CALCULATION
        // =====================================

        const shipping = subtotal >= 1999 ? 0 : 99;

        const total = subtotal + shipping;


        // =====================================
        // UPDATE SUBTOTAL
        // =====================================

        if (subtotalElement) {

            subtotalElement.textContent =
                formatPrice(subtotal);

        }


        // =====================================
        // UPDATE TOTAL
        // =====================================

        if (totalElement) {

            totalElement.textContent =
                formatPrice(total);

        }


        // =====================================
        // UPDATE SHIPPING DISPLAY
        // =====================================

        const shippingElement = document.getElementById(
            "cart-shipping"
        );

        if (shippingElement) {

            shippingElement.textContent =
                shipping === 0 ? "FREE" : formatPrice(shipping);

        }


        // =====================================
        // UPDATE CART COUNT
        // =====================================

        if (typeof window.updateCartCount === "function") {
            window.updateCartCount();
        }

    }


    // =====================================
    // INITIAL DISPLAY
    // =====================================

    renderCart();

});
