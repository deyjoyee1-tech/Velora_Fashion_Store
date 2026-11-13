
document.addEventListener("DOMContentLoaded", function () {

    // ORIGINAL CUSTOMER PRODUCTS
    const defaultProducts = [
        {
            name: "Classic Casual Shirt",
            category: "MEN",
            price: 799,
            material: "COTTON",
            deliveryDays: 2,
            newest: 12,
            image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600"
        },
        {
            name: "Premium Denim Jacket",
            category: "MEN",
            price: 1499,
            material: "DENIM",
            deliveryDays: 5,
            newest: 11,
            image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600"
        },
        {
            name: "Linen Casual Shirt",
            category: "MEN",
            price: 1099,
            material: "LINEN",
            deliveryDays: 7,
            newest: 10,
            image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600"
        },
        {
            name: "Elegant Everyday Outfit",
            category: "WOMEN",
            price: 999,
            material: "LINEN",
            deliveryDays: 5,
            newest: 9,
            image: "https://images.unsplash.com/photo-1583391733956-6c78276477e9?w=600"
        },
        {
            name: "Floral Summer Dress",
            category: "WOMEN",
            price: 1499,
            material: "POLYESTER",
            deliveryDays: 2,
            newest: 8,
            image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600"
        },
        {
            name: "Classic Party Dress",
            category: "WOMEN",
            price: 1999,
            material: "SILK",
            deliveryDays: 7,
            newest: 7,
            image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600"
        },
        {
            name: "Little Trendsetter Outfit",
            category: "KIDS",
            price: 499,
            material: "COTTON",
            deliveryDays: 2,
            newest: 6,
            image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600"
        },
        {
            name: "Kids Casual Wear",
            category: "KIDS",
            price: 699,
            material: "COTTON",
            deliveryDays: 5,
            newest: 5,
            image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600"
        },
        {
            name: "Kids Denim Style",
            category: "KIDS",
            price: 899,
            material: "DENIM",
            deliveryDays: 7,
            newest: 4,
            image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600"
        },
        {
            name: "Comfort Maternity Style",
            category: "MATERNITY",
            price: 1299,
            material: "POLYESTER",
            deliveryDays: 7,
            newest: 3,
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"
        },
        {
            name: "Maternity Cotton Dress",
            category: "MATERNITY",
            price: 1599,
            material: "COTTON",
            deliveryDays: 5,
            newest: 2,
            image: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=600"
        },
        {
            name: "Elegant Maternity Wear",
            category: "MATERNITY",
            price: 1899,
            material: "LINEN",
            deliveryDays: 2,
            newest: 1,
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
        }
    ];

    // LOAD ADMIN CATEGORIES
    function getAvailableCategories() {

        const defaultCategories = [
            "Men",
            "Women",
            "Kids",
            "Maternity"
        ];

        try {

            const saved = JSON.parse(
                localStorage.getItem("veloraCategories")
            );

            const categories = Array.isArray(saved)
                ? saved
                : defaultCategories;

            const cleanedCategories = categories
                .filter(function (category) {
                    return typeof category === "string";
                })
                .map(function (category) {
                    return category.trim().toUpperCase();
                })
                .filter(function (category) {
                    return category !== "";
                });

            return [
                "ALL",
                ...new Set(cleanedCategories)
            ];

        } catch (error) {

            return [
                "ALL",
                "MEN",
                "WOMEN",
                "KIDS",
                "MATERNITY"
            ];

        }

    }

    // LOAD ADMIN PRODUCTS
    function getAdminProducts() {

        try {

            const saved = JSON.parse(
                localStorage.getItem("veloraProducts")
            );

            return Array.isArray(saved) ? saved : [];

        } catch (error) {

            console.error("Could not load admin products:", error);
            return [];

        }

    }

    // CONVERT ADMIN PRODUCTS
    function prepareAdminProducts() {

        return getAdminProducts()
            .filter(function (product) {

                return product &&
                    product.name &&
                    Number(product.price) > 0 &&
                    product.category;

            })
            .map(function (product, index) {

                return {
                    id: product.id || "ADMIN-" + index,
                    name: String(product.name).trim(),
                    category: String(product.category).trim().toUpperCase(),
                    price: Number(product.price),
                    material: String(product.material || "OTHER").trim().toUpperCase(),
                    deliveryDays: Math.max(
                        1,
                        Number(product.deliveryDays) || 5
                    ),
                    newest: 1000 + index,
                    image: product.image || ""
                };

            });

    }

    // COMBINE ADMIN AND ORIGINAL PRODUCTS
    function getAllProducts() {

        const adminProducts = prepareAdminProducts();

        const combinedProducts = [...adminProducts];

        defaultProducts.forEach(function (defaultProduct) {

            const alreadyExists = adminProducts.some(function (adminProduct) {

                return adminProduct.name.toLowerCase() ===
                    defaultProduct.name.toLowerCase() &&
                    adminProduct.category === defaultProduct.category;

            });

            if (!alreadyExists) {
                combinedProducts.push(defaultProduct);
            }

        });

        return combinedProducts;

    }

    // PAGE ELEMENTS
    const params = new URLSearchParams(window.location.search);

    const validCategories = getAvailableCategories();

    const requestedCategory = (
        params.get("category") || "ALL"
    ).trim().toUpperCase();

    let currentCategory = validCategories.includes(requestedCategory)
        ? requestedCategory
        : "ALL";

    const heading = document.getElementById("category-heading");
    const container = document.getElementById("category-products");
    const noProducts = document.getElementById("no-products");
    const productCount = document.getElementById("product-count");

    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");
    const materialFilter = document.getElementById("filter-material");
    const deliveryFilter = document.getElementById("filter-delivery");
    const sortFilter = document.getElementById("sort-products");
    const clearButton = document.getElementById("clear-filters");

    if (!heading || !container || !noProducts || !productCount) {
        return;
    }

    // LOAD WISHLIST
    function getWishlist() {

        try {

            const saved = JSON.parse(
                localStorage.getItem("veloraWishlist")
            );

            return Array.isArray(saved) ? saved : [];

        } catch (error) {

            return [];

        }

    }

    // CHECK WISHLIST
    function isInWishlist(productName, wishlist) {

        return wishlist.some(function (item) {

            if (typeof item === "string") {
                return item === productName;
            }

            return item &&
                (item.productName === productName ||
                    item.name === productName);

        });

    }

    // UPDATE PAGE HEADING
    function updateHeading() {

        heading.textContent = currentCategory === "ALL"
            ? "NEW ARRIVALS"
            : currentCategory + " COLLECTION";

    }

    // DISPLAY PRODUCTS
    function displayProducts() {

        const products = getAllProducts();

        const minimum = minPrice && minPrice.value !== ""
            ? Math.max(0, Number(minPrice.value))
            : 0;

        const maximum = maxPrice && maxPrice.value !== ""
            ? Number(maxPrice.value)
            : Infinity;

        const selectedMaterial = materialFilter
            ? materialFilter.value
            : "ALL";

        const selectedDelivery = deliveryFilter
            ? deliveryFilter.value
            : "ALL";

        // FILTER PRODUCTS
        let filteredProducts = products.filter(function (product) {

            const matchesCategory =
                currentCategory === "ALL" ||
                product.category === currentCategory;

            const matchesPrice =
                product.price >= minimum &&
                product.price <= maximum;

            const matchesMaterial =
                selectedMaterial === "ALL" ||
                product.material === selectedMaterial;

            const matchesDelivery =
                selectedDelivery === "ALL" ||
                product.deliveryDays <= Number(selectedDelivery);

            return matchesCategory &&
                matchesPrice &&
                matchesMaterial &&
                matchesDelivery;

        });

        // SORT PRODUCTS
        if (sortFilter && sortFilter.value === "low-high") {

            filteredProducts.sort(function (a, b) {
                return a.price - b.price;
            });

        } else if (sortFilter && sortFilter.value === "high-low") {

            filteredProducts.sort(function (a, b) {
                return b.price - a.price;
            });

        } else if (sortFilter && sortFilter.value === "newest") {

            filteredProducts.sort(function (a, b) {
                return b.newest - a.newest;
            });

        }

        // UPDATE PRODUCT COUNT
        productCount.textContent =
            "Showing " + filteredProducts.length + " products";

        container.innerHTML = "";

        noProducts.hidden = filteredProducts.length !== 0;

        const wishlist = getWishlist();

        // CREATE PRODUCT CARDS
        filteredProducts.forEach(function (product) {

            const card = document.createElement("div");
            card.className = "product-card";

            // PRODUCT IMAGE
            const imageBox = document.createElement("div");
            imageBox.className = "product-image";

            const image = document.createElement("img");

            image.src = product.image ||
                "https://placehold.co/600x750/f5f0e9/8b684d?text=VELORA";

            image.alt = product.name;
            image.loading = "lazy";

            image.addEventListener("error", function () {

                image.src =
                    "https://placehold.co/600x750/f5f0e9/8b684d?text=VELORA";

            }, { once: true });

            // WISHLIST BUTTON
            const heart = document.createElement("button");

            heart.className = "wishlist-heart";
            heart.type = "button";

            const alreadyWishlisted = isInWishlist(
                product.name,
                wishlist
            );

            heart.textContent = alreadyWishlisted ? "♥" : "♡";

            heart.setAttribute(
                "aria-label",
                alreadyWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
            );

            if (alreadyWishlisted) {
                heart.classList.add("active");
            }

            imageBox.append(heart, image);

            // PRODUCT CATEGORY
            const categoryText = document.createElement("p");

            categoryText.className = "product-category";
            categoryText.textContent = product.category;

            // PRODUCT NAME
            const name = document.createElement("h3");
            name.textContent = product.name;

            // PRODUCT PRICE
            const price = document.createElement("p");

            price.className = "price";

            price.textContent =
                "₹" + product.price.toLocaleString("en-IN");

            // PRODUCT MATERIAL
            const material = document.createElement("p");

            material.className = "product-material";

            material.textContent =
                "Material: " + product.material;

            // DELIVERY INFORMATION
            const delivery = document.createElement("p");

            delivery.className = "product-delivery";

            delivery.textContent =
                "Delivery in " + product.deliveryDays + " days";

            // VIEW DETAILS LINK
            const details = document.createElement("a");

            details.className = "product-button";
            details.textContent = "VIEW DETAILS";

            const productParams = new URLSearchParams();

            productParams.set("name", product.name);
            productParams.set("price", product.price);
            productParams.set("category", product.category);
            productParams.set("image", product.image || "");
            productParams.set("material", product.material);
            productParams.set("deliveryDays", product.deliveryDays);

            details.href =
                "product-details.html?" + productParams.toString();

            // ADD EVERYTHING TO CARD
            card.append(
                imageBox,
                categoryText,
                name,
                price,
                material,
                delivery,
                details
            );

            container.appendChild(card);

        });

    }

    // FILTER EVENT LISTENERS
    if (minPrice) {
        minPrice.addEventListener("input", displayProducts);
    }

    if (maxPrice) {
        maxPrice.addEventListener("input", displayProducts);
    }

    if (materialFilter) {
        materialFilter.addEventListener("change", displayProducts);
    }

    if (deliveryFilter) {
        deliveryFilter.addEventListener("change", displayProducts);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", displayProducts);
    }

    // CLEAR FILTERS
    if (clearButton) {

        clearButton.addEventListener("click", function () {

            if (minPrice) minPrice.value = "";
            if (maxPrice) maxPrice.value = "";

            if (materialFilter) materialFilter.value = "ALL";
            if (deliveryFilter) deliveryFilter.value = "ALL";
            if (sortFilter) sortFilter.value = "default";

            updateHeading();
            displayProducts();

        });

    }

    // INITIAL DISPLAY
    updateHeading();
    displayProducts();

});
