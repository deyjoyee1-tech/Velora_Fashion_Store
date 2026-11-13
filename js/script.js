
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. NOTIFICATION MESSAGE
    // =====================================

    const toast = document.createElement("div");
    toast.className = "velora-toast";
    document.body.appendChild(toast);

    let toastTimer;

    function showMessage(message) {
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 2500);
    }


    // =====================================
    // 2. LOCAL STORAGE FUNCTIONS
    // =====================================

    function getStorageData(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveStorageData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            showMessage("Unable to save changes. Please try again.");
            return false;
        }
    }


    // =====================================
    // 3. UPDATE SHOPPING BAG COUNT
    // =====================================

    function updateCartCount() {
        const cart = getStorageData("veloraCart");

        const count = cart.reduce(function (total, item) {
            return total + Math.max(
                0,
                Number(item.quantity) || 1
            );
        }, 0);

        const counter = document.getElementById("cart-count");

        if (counter) {
            counter.textContent = count;
        }
    }

    window.updateCartCount = updateCartCount;
    updateCartCount();


    // =====================================
    // 4. MYNTRA STYLE PRODUCT SEARCH
    // =====================================

    const searchForm = document.getElementById("velora-search-form");
    const searchInput = document.getElementById("velora-search-input");
    const suggestionsBox = document.getElementById("velora-search-suggestions");

    // Get products saved by the website and Admin panel
    function getSearchProducts() {
        const products = getStorageData("veloraProducts");

        return products.filter(function (product) {
            return product && (
                product.name ||
                product.title
            );
        });
    }

    // Get searchable product information
    function getProductName(product) {
        return product.name || product.title || "Unnamed Product";
    }

    function getProductCategory(product) {
        return product.category || "";
    }

    function getProductMaterial(product) {
        return product.material || "";
    }

    // Open the product collection with the search term
    function openSearchResults(searchTerm) {
        const term = searchTerm.trim();

        if (!term) {
            showMessage("Please enter something to search.");
            return;
        }

        window.location.href =
            "customer/categories.html?category=ALL&search=" +
            encodeURIComponent(term);
    }

    // Display live suggestions
    function showSearchSuggestions(searchTerm) {
        if (!suggestionsBox) return;

        suggestionsBox.innerHTML = "";

        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            suggestionsBox.style.display = "none";
            return;
        }

        const products = getSearchProducts();

        const matches = products.filter(function (product) {
            const searchableText = (
                getProductName(product) + " " +
                getProductCategory(product) + " " +
                getProductMaterial(product)
            ).toLowerCase();

            return searchableText.includes(term);
        }).slice(0, 6);

        if (matches.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "search-no-results";
            emptyMessage.textContent = "No matching products found.";

            suggestionsBox.appendChild(emptyMessage);
            suggestionsBox.style.display = "block";
            return;
        }

        matches.forEach(function (product) {
            const suggestion = document.createElement("button");

            suggestion.type = "button";
            suggestion.className = "search-suggestion";

            const productName = document.createElement("span");
            productName.className = "search-suggestion-name";
            productName.textContent = getProductName(product);

            const productCategory = document.createElement("small");
            productCategory.className = "search-suggestion-category";
            productCategory.textContent =
                getProductCategory(product) || "VÊLORA Collection";

            suggestion.appendChild(productName);
            suggestion.appendChild(productCategory);

            suggestion.addEventListener("click", function () {
                openSearchResults(getProductName(product));
            });

            suggestionsBox.appendChild(suggestion);
        });

        const viewAll = document.createElement("button");
        viewAll.type = "button";
        viewAll.className = "search-view-all";
        viewAll.textContent = "VIEW ALL SEARCH RESULTS";

        viewAll.addEventListener("click", function () {
            openSearchResults(term);
        });

        suggestionsBox.appendChild(viewAll);
        suggestionsBox.style.display = "block";
    }

    if (searchInput && searchForm && suggestionsBox) {

        // Show suggestions as the customer types
        searchInput.addEventListener("input", function () {
            showSearchSuggestions(searchInput.value);
        });

        // Submit search when Enter or search icon is clicked
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            openSearchResults(searchInput.value);
        });

        // Hide suggestions when clicking outside the search area
        document.addEventListener("click", function (event) {
            if (!event.target.closest(".velora-search")) {
                suggestionsBox.style.display = "none";
            }
        });

        // Hide suggestions when Escape is pressed
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                suggestionsBox.style.display = "none";
                searchInput.blur();
            }
        });
    }


    // =====================================
    // 5. ADD TO CART
    // =====================================

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".product-button");

        if (!button) return;

        // Do not intercept View Details links
        if (button.tagName === "A") return;

        event.preventDefault();

        const productCard = button.closest(".product-card");

        if (!productCard) return;

        const productName =
            productCard.querySelector("h3")?.textContent.trim() ||
            "Selected product";

        const productPrice =
            productCard.querySelector(".price")?.textContent.trim() ||
            "₹0";

        const cart = getStorageData("veloraCart");

        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });

        if (!saveStorageData("veloraCart", cart)) {
            return;
        }

        updateCartCount();

        showMessage(productName + " added to your bag!");

        const originalText = button.textContent;

        button.textContent = "ADDED ✓";
        button.disabled = true;

        setTimeout(function () {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);

    });


    // =====================================
    // 6. WISHLIST FUNCTIONALITY
    // =====================================

    document.addEventListener("click", function (event) {

        const heart = event.target.closest(".wishlist-heart");

        if (!heart) return;

        event.preventDefault();
        event.stopPropagation();

        const productCard = heart.closest(".product-card");

        if (!productCard) return;

        const productName =
            productCard.querySelector("h3")?.textContent.trim();

        if (!productName) return;

        let wishlist = getStorageData("veloraWishlist");

        if (wishlist.includes(productName)) {

            wishlist = wishlist.filter(function (item) {
                return item !== productName;
            });

            if (!saveStorageData("veloraWishlist", wishlist)) {
                return;
            }

            heart.classList.remove("active");
            heart.textContent = "♡";
            heart.setAttribute("aria-label", "Add to wishlist");

            showMessage("Removed from your wishlist");

        } else {

            wishlist.push(productName);

            if (!saveStorageData("veloraWishlist", wishlist)) {
                return;
            }

            heart.classList.add("active");
            heart.textContent = "♥";
            heart.setAttribute("aria-label", "Remove from wishlist");

            showMessage("Added to your wishlist ❤️");

        }

    });


    // =====================================
    // 7. SHOW SAVED WISHLIST HEARTS
    // =====================================

    function updateWishlistHearts() {

        const wishlist = getStorageData("veloraWishlist");

        document.querySelectorAll(".product-card").forEach(function (card) {

            const heart = card.querySelector(".wishlist-heart");

            const productName =
                card.querySelector("h3")?.textContent.trim();

            if (!heart || !productName) return;

            const isSaved = wishlist.includes(productName);

            heart.classList.toggle("active", isSaved);

            heart.textContent = isSaved ? "♥" : "♡";

            heart.setAttribute(
                "aria-label",
                isSaved ? "Remove from wishlist" : "Add to wishlist"
            );

        });

    }

    updateWishlistHearts();


    // =====================================
    // 8. CATEGORY CLICK ANIMATION
    // =====================================

    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach(function (card) {

        card.addEventListener("click", function () {

            categoryCards.forEach(function (item) {
                item.classList.remove("selected");
            });

            card.classList.add("selected");

        });

    });

});
