
document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // 1. VÊLORA AI DESIGN
    // =========================================

    const style = document.createElement("style");

    style.textContent = `
        #velora-ai-button {
            position: fixed;
            right: 25px;
            bottom: 25px;
            z-index: 99999;
            background: #29231e;
            color: white;
            border: 1px solid #c6a66b;
            border-radius: 50px;
            padding: 15px 22px;
            cursor: pointer;
            font-size: 14px;
            letter-spacing: 1px;
            box-shadow: 0 5px 25px #0002;
        }

        #velora-ai-window {
            display: none;
            flex-direction: column;
            position: fixed;
            right: 25px;
            bottom: 90px;
            width: 380px;
            max-width: calc(100vw - 30px);
            height: 570px;
            max-height: calc(100vh - 120px);
            background: #fffdf9;
            border: 1px solid #d5c19d;
            border-radius: 18px;
            z-index: 99999;
            overflow: hidden;
            box-shadow: 0 10px 40px #0003;
            font-family: Arial, sans-serif;
        }

        #velora-ai-header {
            flex-shrink: 0;
            background: #29231e;
            color: white;
            padding: 17px 19px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #velora-ai-header strong {
            color: #e4c995;
            letter-spacing: 2px;
        }

        #velora-ai-close {
            background: none;
            border: none;
            color: white;
            font-size: 25px;
            cursor: pointer;
        }

        #velora-ai-features {
            flex-shrink: 0;
            display: flex;
            gap: 6px;
            padding: 10px;
            background: #f4eee4;
        }

        .velora-ai-tab {
            flex: 1;
            padding: 10px 3px;
            border: 1px solid #d7c6a9;
            background: transparent;
            color: #554536;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            border-radius: 6px;
        }

        .velora-ai-tab.active {
            background: #29231e;
            color: white;
        }

        /* SUPPORT HELP CENTRE */

        #velora-support-panel {
            display: none;
            flex-shrink: 0;
            padding: 13px;
            background: #fffaf2;
            border-bottom: 1px solid #eadfce;
        }

        .velora-support-heading {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #49382d;
            margin: 0 0 4px;
        }

        .velora-support-description {
            font-size: 10px;
            color: #887a6e;
            margin: 0 0 10px;
        }

        .velora-support-select {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            margin-bottom: 8px;
            border: 1px solid #d7c6a9;
            border-radius: 7px;
            background: white;
            color: #49382d;
            font-size: 12px;
            outline: none;
        }

        #velora-human-support {
            width: 100%;
            padding: 11px;
            background: #49382d;
            color: white;
            border: 0;
            border-radius: 7px;
            cursor: pointer;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        #velora-human-support:disabled {
            opacity: .6;
            cursor: not-allowed;
        }

        /* CHAT MESSAGES */

        #velora-ai-messages {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 15px;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: #c6b394 transparent;
        }

        .velora-ai-message {
            padding: 11px 13px;
            border-radius: 12px;
            margin-bottom: 12px;
            font-size: 13px;
            line-height: 1.6;
            max-width: 88%;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .velora-ai-bot {
            background: #f1eadf;
            color: #30271f;
        }

        .velora-ai-user {
            background: #29231e;
            color: white;
            margin-left: auto;
        }

        /* INPUT AREA */

        #velora-ai-input-area {
            position: relative;
            flex-shrink: 0;
            display: flex;
            gap: 8px;
            padding: 12px;
            background: #fffdf9;
            border-top: 1px solid #eadfce;
        }

        #velora-ai-input {
            flex: 1;
            min-width: 0;
            border: 1px solid #d7c6a9;
            border-radius: 25px;
            padding: 12px;
            outline: none;
            font-size: 13px;
        }

        #velora-ai-send {
            flex-shrink: 0;
            background: #29231e;
            color: white;
            border: none;
            border-radius: 50%;
            width: 42px;
            height: 42px;
            cursor: pointer;
        }

        #velora-ai-send:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        /* PRODUCT CARDS */

        .velora-ai-products {
            display: grid;
            grid-template-columns: 1fr;
            gap: 13px;
            margin: 5px 0 15px;
        }

        .velora-ai-product-card {
            background: white;
            border: 1px solid #e4d7c4;
            border-radius: 12px;
            overflow: hidden;
            color: #30271f;
        }

        .velora-ai-product-image {
            width: 100%;
            height: 175px;
            object-fit: contain;
            background: #f7f3ed;
            display: block;
        }

        .velora-ai-product-info {
            padding: 12px;
        }

        .velora-ai-product-category {
            color: #987a53;
            font-size: 10px;
            letter-spacing: 1.5px;
            margin: 0 0 5px;
        }

        .velora-ai-product-name {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 8px;
        }

        .velora-ai-product-price {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 5px;
        }

        .velora-ai-product-original {
            color: #999;
            font-size: 12px;
            text-decoration: line-through;
            margin-left: 6px;
            font-weight: normal;
        }

        .velora-ai-product-material {
            font-size: 11px;
            color: #777;
            margin: 0 0 12px;
        }

        .velora-ai-product-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
        }

        .velora-ai-product-actions a {
            text-decoration: none;
            text-align: center;
            padding: 10px 5px;
            font-size: 9px;
            border-radius: 5px;
            font-weight: bold;
        }

        .velora-ai-view {
            grid-column: 1 / -1;
            background: #f4eee4;
            color: #443426;
            border: 1px solid #d7c6a9;
        }

        .velora-ai-add {
            background: #29231e;
            color: white;
        }

        .velora-ai-buy {
            background: #b18a55;
            color: white;
        }

        .velora-ai-product-note {
            font-size: 10px;
            color: #888;
            line-height: 1.4;
            margin: 9px 0 0;
        }

        @media(max-width: 480px) {
            #velora-ai-window {
                right: 10px;
                bottom: 80px;
                width: calc(100vw - 20px);
                max-height: calc(100dvh - 100px);
            }

            #velora-ai-button {
                right: 15px;
                bottom: 15px;
            }
        }
    `;

    document.head.appendChild(style);


    // =========================================
    // 2. CREATE AI WINDOW
    // =========================================

    const button = document.createElement("button");
    button.id = "velora-ai-button";
    button.textContent = "✦ VÊLORA AI";

    const chat = document.createElement("div");
    chat.id = "velora-ai-window";

    chat.innerHTML = `
        <div id="velora-ai-header">
            <div>
                <strong>VÊLORA AI</strong>
                <div style="font-size:10px;margin-top:5px;color:#e5d9c5;">
                    YOUR PERSONAL FASHION ASSISTANT
                </div>
            </div>
            <button id="velora-ai-close" aria-label="Close chat">×</button>
        </div>

        <div id="velora-ai-features">
            <button class="velora-ai-tab active" data-feature="fashion">FASHION</button>
            <button class="velora-ai-tab" data-feature="products">PRODUCTS</button>
            <button class="velora-ai-tab" data-feature="support">SUPPORT</button>
        </div>

        <div id="velora-support-panel">
            <p class="velora-support-heading">VÊLORA HELP CENTRE</p>
            <p class="velora-support-description">
                Tell us what you need help with.
            </p>

            <select id="velora-support-topic" class="velora-support-select">
                <option value="">Choose a help topic</option>
                <option>My Orders</option>
                <option>Delivery Issues</option>
                <option>Returns & Refunds</option>
                <option>Payments</option>
                <option>Product Issues</option>
                <option>Other Issues</option>
            </select>

            <select id="velora-support-order" class="velora-support-select">
                <option value="">Select an order (optional)</option>
            </select>

            <button id="velora-human-support">
                REQUEST A SUPPORT EXECUTIVE
            </button>
        </div>

        <div id="velora-ai-messages"></div>

        <div id="velora-ai-input-area">
            <input id="velora-ai-input"
                type="text"
                placeholder="Ask VÊLORA AI..."
                autocomplete="off">

            <button id="velora-ai-send" aria-label="Send message">➤</button>
        </div>
    `;

    document.body.append(button, chat);

    const messages = document.getElementById("velora-ai-messages");
    const input = document.getElementById("velora-ai-input");
    const sendButton = document.getElementById("velora-ai-send");

    const supportPanel = document.getElementById("velora-support-panel");
    const supportTopic = document.getElementById("velora-support-topic");
    const supportOrder = document.getElementById("velora-support-order");
    const humanButton = document.getElementById("velora-human-support");

    let currentFeature = "fashion";
    let supportConversation = [];
    let supportRequestSubmitted = false;


    // =========================================
    // 3. OPEN AND CLOSE CHAT
    // =========================================

    button.addEventListener("click", () => {
        const isOpen = chat.style.display === "flex";

        chat.style.display = isOpen ? "none" : "flex";

        if (!isOpen) {
            messages.scrollTop = messages.scrollHeight;
        }
    });

    document.getElementById("velora-ai-close")
        .addEventListener("click", () => {
            chat.style.display = "none";
        });


    // =========================================
    // 4. CHAT MESSAGE FUNCTION
    // =========================================

    function addMessage(message, type) {
        const element = document.createElement("div");

        element.className = `velora-ai-message velora-ai-${type}`;
        element.textContent = message;

        messages.appendChild(element);

        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
        });

        return element;
    }

    function clearMessages() {
        messages.innerHTML = "";
    }


    // =========================================
    // 5. CUSTOMER DETAILS AND ORDERS
    // =========================================

    function getSupportCustomer() {
        try {
            const user = JSON.parse(
                localStorage.getItem("veloraCurrentUser") || "null"
            );

            if (typeof user === "string") {
                return { email: user, name: user };
            }

            return user || {};

        } catch (error) {
            return {};
        }
    }

    function getSupportEmail(user) {
        return String(
            user.email ||
            user.customerEmail ||
            user.userEmail ||
            (user.user && user.user.email) ||
            ""
        ).trim().toLowerCase();
    }

    function getCustomerOrders() {
        const user = getSupportCustomer();
        const email = getSupportEmail(user);

        if (!email) return [];

        try {
            const orders = JSON.parse(
                localStorage.getItem("veloraOrders") || "[]"
            );

            return orders.filter(order => {
                const orderEmail = String(
                    order.email ||
                    order.customerEmail ||
                    order.userEmail ||
                    ""
                ).trim().toLowerCase();

                return orderEmail === email;
            });

        } catch (error) {
            console.error("Could not load customer orders:", error);
            return [];
        }
    }

    function loadSupportOrders() {
        supportOrder.innerHTML =
            '<option value="">Select an order (optional)</option>';

        getCustomerOrders().forEach(order => {
            const orderId = String(
                order.orderId || order.id || ""
            );

            if (!orderId) return;

            const option = document.createElement("option");

            option.value = orderId;
            option.textContent =
                orderId + " · " + (order.status || "Order Placed");

            supportOrder.appendChild(option);
        });
    }


    // =========================================
    // 6. PRODUCT CATALOGUE
    // =========================================

    function getVeloraProducts() {
        try {
            let products = [];

            if (typeof window.veloraGetAllProducts === "function") {
                products = window.veloraGetAllProducts();
            } else {
                const cached = localStorage.getItem("veloraAICatalogue");

                if (cached) {
                    products = JSON.parse(cached);
                }

                if (!Array.isArray(products) || products.length === 0) {
                    products = JSON.parse(
                        localStorage.getItem("veloraProducts") || "[]"
                    );
                }
            }

            if (!Array.isArray(products)) return [];

            const cleanProducts = products.slice(0, 60).map(product => ({
                name: product.name || product.title || "Unnamed product",
                category: product.category || "",
                price: product.price ?? product.sellingPrice ?? "",
                originalPrice: product.originalPrice ?? "",
                material: product.material || "",
                sizes: product.availableSizes || product.sizes || [
                    "XS", "S", "M", "L", "XL", "XXL"
                ],
                deliveryDays: product.deliveryDays || "",
                image: product.image || product.imageUrl || "",
                fallbackImage: product.fallbackImage || ""
            }));

            if (cleanProducts.length) {
                localStorage.setItem(
                    "veloraAICatalogue",
                    JSON.stringify(cleanProducts)
                );
            }

            return cleanProducts;

        } catch (error) {
            console.error("Could not read VÊLORA products:", error);
            return [];
        }
    }


    // =========================================
    // 7. PRODUCT DISPLAY HELPERS
    // =========================================

    function formatPrice(price) {
        const amount = Number(
            String(price).replace(/[^\d.]/g, "")
        );

        return "₹" + amount.toLocaleString("en-IN");
    }

    function getImagePath(path) {
        if (!path) return "";

        if (/^(https?:|data:|blob:)/i.test(path)) {
            return path;
        }

        if (path.startsWith("../images/")) {
            return path.replace("../images/", "/images/");
        }

        if (path.startsWith("images/")) {
            return "/" + path;
        }

        return path;
    }

    function getProductDetailsLink(product) {
        const params = new URLSearchParams();

        params.set("name", product.name);
        params.set("price", product.price);
        params.set(
            "originalPrice",
            product.originalPrice || product.price
        );
        params.set("category", product.category);
        params.set("image", product.image || "");
        params.set("material", product.material || "");
        params.set("deliveryDays", product.deliveryDays || "5");

        const sizes = Array.isArray(product.sizes)
            ? product.sizes
            : ["XS", "S", "M", "L", "XL", "XXL"];

        params.set("sizes", sizes.join(","));

        return "/customer/product-details.html?" + params.toString();
    }

    function findRecommendedProducts(reply, products) {
        const replyText = String(reply || "").toLowerCase();

        return products.filter(product => {
            const productName = String(product.name || "").toLowerCase();

            return productName.length > 0 &&
                replyText.includes(productName);
        });
    }


    // =========================================
    // 8. PRODUCT CARDS
    // =========================================

    function displayProductCards(reply, products) {
        const recommendedProducts =
            findRecommendedProducts(reply, products);

        if (!recommendedProducts.length) return;

        const container = document.createElement("div");
        container.className = "velora-ai-products";

        recommendedProducts.slice(0, 3).forEach(product => {
            const card = document.createElement("div");
            card.className = "velora-ai-product-card";

            const image = document.createElement("img");
            image.className = "velora-ai-product-image";
            image.src = getImagePath(product.image);
            image.alt = product.name;
            image.loading = "lazy";

            image.addEventListener("error", () => {
                if (product.fallbackImage) {
                    image.src = getImagePath(product.fallbackImage);
                    product.fallbackImage = "";
                } else {
                    image.src =
                        "https://placehold.co/500x400/f5f0e9/8b684d?text=VELORA";
                }
            });

            const info = document.createElement("div");
            info.className = "velora-ai-product-info";

            const category = document.createElement("p");
            category.className = "velora-ai-product-category";
            category.textContent = product.category;

            const name = document.createElement("h3");
            name.className = "velora-ai-product-name";
            name.textContent = product.name;

            const price = document.createElement("p");
            price.className = "velora-ai-product-price";
            price.textContent = formatPrice(product.price);

            if (
                product.originalPrice &&
                Number(product.originalPrice) > Number(product.price)
            ) {
                const original = document.createElement("span");
                original.className = "velora-ai-product-original";
                original.textContent = formatPrice(product.originalPrice);
                price.appendChild(original);
            }

            const material = document.createElement("p");
            material.className = "velora-ai-product-material";
            material.textContent = product.material
                ? "Material: " + product.material
                : "Explore this VÊLORA style";

            const detailsLink = getProductDetailsLink(product);

            const actions = document.createElement("div");
            actions.className = "velora-ai-product-actions";

            const viewButton = document.createElement("a");
            viewButton.className = "velora-ai-view";
            viewButton.href = detailsLink;
            viewButton.textContent = "VIEW DETAILS";

            const addButton = document.createElement("a");
            addButton.className = "velora-ai-add";
            addButton.href = detailsLink;
            addButton.textContent = "ADD TO BAG";

            const buyButton = document.createElement("a");
            buyButton.className = "velora-ai-buy";
            buyButton.href = detailsLink;
            buyButton.textContent = "BUY NOW";

            const note = document.createElement("p");
            note.className = "velora-ai-product-note";
            note.textContent =
                "Choose your size on the product page to add this item or buy now.";

            actions.append(viewButton, addButton, buyButton);

            info.append(
                category,
                name,
                price,
                material,
                actions,
                note
            );

            card.append(image, info);
            container.appendChild(card);
        });

        messages.appendChild(container);

        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
        });
    }


    // =========================================
    // 9. SWITCH BETWEEN AI FEATURES
    // =========================================

    function showFeatureWelcome(feature) {
        clearMessages();

        if (feature === "fashion") {
            addMessage(
                "Welcome to VÊLORA! ✨\n\nI can help you discover styles, plan outfits and find the perfect look for every occasion.\n\nWhat would you like to explore?",
                "bot"
            );

            input.placeholder = "Ask for fashion advice...";

        } else if (feature === "products") {
            addMessage(
                "Welcome to VÊLORA Products! ✨\n\nI can help you find products from our actual collection based on category, budget, material and style.\n\nWhat are you looking for?",
                "bot"
            );

            input.placeholder = "Search our collection...";

        } else {
            addMessage(
                "Welcome to VÊLORA Customer Support! ✨\n\nI'm here to help with your orders, delivery, returns, payments and product concerns.\n\nChoose a help topic above and tell me how I can assist you. You can request a support executive whenever you need one.",
                "bot"
            );

            input.placeholder = "Describe your issue...";
        }
    }

    document.querySelectorAll(".velora-ai-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".velora-ai-tab").forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            currentFeature = tab.dataset.feature;

            supportPanel.style.display =
                currentFeature === "support" ? "block" : "none";

            if (currentFeature === "support") {
                loadSupportOrders();
            }

            if (currentFeature !== "support") {
                supportRequestSubmitted = false;
                humanButton.disabled = false;
                humanButton.textContent = "REQUEST A SUPPORT EXECUTIVE";
                supportConversation = [];
                supportTopic.value = "";
                supportOrder.value = "";
            }

            showFeatureWelcome(currentFeature);
        });
    });


    // =========================================
    // 10. REQUEST A SUPPORT EXECUTIVE
    // =========================================

    humanButton.addEventListener("click", () => {
        const user = getSupportCustomer();
        const email = getSupportEmail(user);
        const topic = supportTopic.value;

        if (!email) {
            addMessage(
                "Please log in to your VÊLORA account before requesting a support executive.",
                "bot"
            );
            return;
        }

        if (!topic) {
            addMessage(
                "Please choose a help topic before submitting your request.",
                "bot"
            );
            return;
        }

        if (supportRequestSubmitted) {
            addMessage(
                "Your support request has already been submitted. Thank you!",
                "bot"
            );
            return;
        }

        const selectedOrder = supportOrder.value;
        const orders = getCustomerOrders();

        const order = orders.find(item =>
            String(item.orderId || item.id || "") === selectedOrder
        );

        let requests = [];

        try {
            requests = JSON.parse(
                localStorage.getItem("veloraSupportRequests") || "[]"
            );

            if (!Array.isArray(requests)) requests = [];

        } catch (error) {
            requests = [];
        }

        const conversationText = supportConversation
            .map(item => item.role.toUpperCase() + ": " + item.message)
            .join("\n\n");

        const request = {
            requestId: "VLS" + Date.now(),
            customerName: user.name || user.customerName || "",
            customerEmail: email,
            topic: topic,
            orderId: selectedOrder || "",
            orderStatus: order ? order.status || "" : "",
            description: conversationText ||
                "Customer requested a support executive.",
            status: "Pending",
            requestDate: new Date().toISOString()
        };

        requests.push(request);

        localStorage.setItem(
            "veloraSupportRequests",
            JSON.stringify(requests)
        );

        supportRequestSubmitted = true;
        humanButton.disabled = true;
        humanButton.textContent = "REQUEST SUBMITTED";

        addMessage(
            "Your support request has been submitted successfully! ✨\n\n" +
            "Request ID: " + request.requestId +
            "\nOur VÊLORA support team can review your request in the Admin Panel.",
            "bot"
        );
    });


    // =========================================
    // 11. SEND MESSAGE TO AI
    // =========================================

    async function sendMessage() {
        const message = input.value.trim();

        if (!message || sendButton.disabled) return;

        if (currentFeature === "support" && !supportTopic.value) {
            addMessage(
                "Please choose a help topic above before describing your issue.",
                "bot"
            );
            return;
        }

        addMessage(message, "user");
        input.value = "";
        sendButton.disabled = true;

        if (currentFeature === "support") {
            supportConversation.push({
                role: "customer",
                message: message
            });
        }

        const loading = addMessage(
            currentFeature === "support"
                ? "VÊLORA Support is thinking..."
                : "VÊLORA AI is thinking...",
            "bot"
        );

        try {
            const products = getVeloraProducts();

            let requestMessage = message;

            if (currentFeature === "support") {
                requestMessage =
                    "Customer support topic: " + supportTopic.value +
                    ". Selected order ID: " + (supportOrder.value || "Not selected") +
                    ". Customer question: " + message +
                    ". Give clear, polite and practical guidance. " +
                    "Do not claim to access or change actual order records. " +
                    "Do not invent store policies. " +
                    "Tell the customer they can request a support executive using the button.";
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: requestMessage,
                    feature: currentFeature,
                    products: currentFeature === "support" ? [] : products
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.reply || "AI request failed");
            }

            const reply =
                data.reply || "I couldn't generate a reply. Please try again.";

            loading.textContent = reply;

            if (currentFeature === "support") {
                supportConversation.push({
                    role: "support",
                    message: reply
                });
            }

            if (
                currentFeature === "products" ||
                currentFeature === "fashion"
            ) {
                displayProductCards(reply, products);
            }

        } catch (error) {
            loading.textContent =
                "Sorry! VÊLORA AI is temporarily unavailable. Please try again.";

            console.error("VÊLORA AI error:", error);

        } finally {
            sendButton.disabled = false;
            input.focus();

            requestAnimationFrame(() => {
                messages.scrollTop = messages.scrollHeight;
            });
        }
    }

    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });


    // =========================================
    // 12. PREVENT WEBSITE SCROLL WHEN CHAT SCROLLS
    // =========================================

    [messages, supportPanel].forEach(area => {
        area.addEventListener("wheel", event => {
            const canScroll =
                area.scrollHeight > area.clientHeight;

            if (canScroll) {
                event.stopPropagation();
            }
        }, { passive: true });
    });

    // Initial greeting
    showFeatureWelcome("fashion");

});
