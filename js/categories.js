
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // DEFAULT CUSTOMER PRODUCTS
    // =====================================

    const defaultProducts = [
        {
            name: "Classic Casual Shirt",
            category: "MEN",
            price: 799,
            originalPrice: 1199,
            material: "COTTON",
            deliveryDays: 2,
            newest: 12,
            image: "../images/shirt1.jpg"
        },
        {
            name: "Premium Denim Jacket",
            category: "MEN",
            price: 1499,
            originalPrice: 2499,
            material: "DENIM",
            deliveryDays: 5,
            newest: 11,
            image: "../images/premium-denim-jacket.jpg",
            fallbackImage: "../images/premium-denim-jacket-product.jpg"
        },
        {
            name: "Casual Elegant Coat",
            category: "MEN",
            price: 3999,
            originalPrice: 4999,
            material: "WOOL BLEND",
            deliveryDays: 5,
            newest: 10,
            image: "../images/coat1.jpg",
            sizes: ["S", "M", "L", "XL", "XXL"]
        },

        // WOMEN COLLECTION

        {
            name: "Elegant Satin Midi Dress",
            category: "WOMEN",
            price: 1799,
            originalPrice: 2499,
            material: "SATIN",
            deliveryDays: 3,
            newest: 15,
            image: "../images/satin1.png",
            sizes: ["S", "M", "L", "XL", "XXL"]
        },
        {
            name: "Floral Summer Dress",
            category: "WOMEN",
            price: 1499,
            originalPrice: 2299,
            material: "COTTON BLEND",
            deliveryDays: 2,
            newest: 14,
            image: "../images/floral1.png",
            sizes: ["S", "M", "L", "XL", "XXL"]
        },
        {
            name: "Classic Party Dress",
            category: "WOMEN",
            price: 2199,
            originalPrice: 2999,
            material: "NET WITH STONE WORK",
            deliveryDays: 4,
            newest: 13,
            image: "../images/gown1.png",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colourImages: {
                "Blue": "../images/gown1.png"
            }
        },

        // KIDS COLLECTION

        {
            name: "Little Trendsetter Outfit",
            category: "KIDS",
            price: 499,
            originalPrice: 799,
            material: "COTTON",
            deliveryDays: 2,
            newest: 6,
            image: "../images/kid1.jpg"
        },
        {
            name: "Kids Traditional Sherwani",
            category: "KIDS",
            price: 699,
            originalPrice: 1099,
            material: "PREMIUM ETHNIC FABRIC",
            deliveryDays: 5,
            newest: 5,
            image: "../images/kid2.jpg"
        },
        {
            name: "Punjabi Lehenga",
            category: "KIDS",
            price: 899,
            originalPrice: 1399,
            material: "TRADITIONAL FABRIC",
            deliveryDays: 7,
            newest: 4,
            image: "../images/kid3.jpg"
        },

        // NEW MATERNITY COLLECTION

        {
            name: "Maternity Everyday Dress",
            category: "MATERNITY",
            price: 1299,
            originalPrice: 1899,
            material: "MATERNITY FABRIC",
            deliveryDays: 3,
            newest: 9,
            image: "../images/maternity1.jpg",
            sizes: ["S", "M", "L", "XL", "XXL"]
        },
        {
            name: "Maternity Comfort Dress",
            category: "MATERNITY",
            price: 1599,
            originalPrice: 2299,
            material: "MATERNITY FABRIC",
            deliveryDays: 4,
            newest: 8,
            image: "../images/maternity2.jpg",
            sizes: ["S", "M", "L", "XL", "XXL"]
        },
        {
            name: "Maternity Elegant Dress",
            category: "MATERNITY",
            price: 1899,
            originalPrice: 2799,
            material: "MATERNITY FABRIC",
            deliveryDays: 5,
            newest: 7,
            image: "../images/maternity3.jpg",
            sizes: ["S", "M", "L", "XL", "XXL"]
        }
    ];


    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

    // OLD MATERNITY PRODUCTS TO EXCLUDE

    const retiredMaternityProductNames = [
        "Comfort Maternity Style",
        "Maternity Cotton Dress",
        "Elegant Maternity Wear"
    ];


    // =====================================
    // LOAD CUSTOMER CATEGORIES FROM ADMIN
    // =====================================

    const defaultCategoryNames = ["MEN", "WOMEN", "KIDS", "MATERNITY"];

    function getCustomerCategoryEntries() {

        let savedCategories = [];

        try {
            const saved = JSON.parse(
                localStorage.getItem("veloraCategories")
            );

            if (Array.isArray(saved)) {
                savedCategories = saved
                    .map(function (item) {
                        return typeof item === "string"
                            ? item.trim()
                            : String(item.name || item.category || "").trim();
                    })
                    .filter(Boolean);
            }

        } catch (error) {
            console.error("Could not load customer categories:", error);
        }

        if (savedCategories.length === 0) {
            savedCategories = ["Men", "Women", "Kids", "Maternity"];
        }

        const normalizedNames = savedCategories.map(function (name) {
            return name.toUpperCase();
        });

        const missingDefaults = defaultCategoryNames.filter(function (name) {
            return !normalizedNames.includes(name);
        });

        const renamedNames = savedCategories.filter(function (name) {
            return !defaultCategoryNames.includes(name.toUpperCase());
        });

        return savedCategories.map(function (name) {

            const normalized = name.toUpperCase();

            if (defaultCategoryNames.includes(normalized)) {
                return {
                    label: name,
                    key: normalized
                };
            }

            const renamedIndex = renamedNames.findIndex(function (item) {
                return item === name;
            });

            const matchingDefault = missingDefaults[renamedIndex];

            return {
                label: name,
                key: matchingDefault || normalized
            };
        });
    }

    const customerCategoryEntries = getCustomerCategoryEntries();


    // CREATE CUSTOMER NAVIGATION LINKS

    function renderCustomerCategoryNavigation() {

        const navigation = document.getElementById(
            "customer-category-links"
        );

        if (!navigation) return;

        navigation.innerHTML = `
            <a href="../index.html">HOME</a>
            <a href="categories.html?category=ALL">SHOP</a>
        `;

        customerCategoryEntries.forEach(function (category) {

            const link = document.createElement("a");

            link.textContent = category.label.toUpperCase();

            link.href =
                "categories.html?category=" +
                encodeURIComponent(category.label);

            navigation.appendChild(link);
        });
    }

    renderCustomerCategoryNavigation();


    // =====================================
    // PRODUCT STYLE AND SIZE HELPERS
    // =====================================

    function getProductStyle(product) {

        const savedStyle = String(product.style || "")
            .trim()
            .toUpperCase();

        if (savedStyle === "ETHNIC" || savedStyle === "WESTERN") {
            return savedStyle;
        }

        const productName = String(product.name || "").toLowerCase();

        const ethnicWords = [
            "kurta", "kurti", "saree", "sari",
            "ethnic", "traditional", "anarkali",
            "lehenga", "sherwani", "dhoti"
        ];

        return ethnicWords.some(function (word) {
            return productName.includes(word);
        }) ? "ETHNIC" : "WESTERN";
    }


    function getProductSizes(product) {

        let sizes = product.sizes || product.availableSizes || [];

        if (typeof sizes === "string") {
            sizes = sizes.split(",").map(function (size) {
                return size.trim().toUpperCase();
            });
        }

        if (!Array.isArray(sizes) || sizes.length === 0) {
            return availableSizes;
        }

        return sizes.map(function (size) {
            return String(size).trim().toUpperCase();
        });
    }


    // =====================================
    // SAFELY LOAD ADMIN PRODUCTS
    // =====================================

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


    // =====================================
    // CONVERT ADMIN PRODUCTS
    // =====================================

    function prepareAdminProducts() {

        return getAdminProducts()
            .filter(function (product) {

                if (
                    !product ||
                    !product.name ||
                    Number(product.price) <= 0 ||
                    !product.category
                ) {
                    return false;
                }

                const category = String(product.category)
                    .trim()
                    .toUpperCase();

                const name = String(product.name)
                    .trim()
                    .toLowerCase();

                // Exclude the three retired Maternity products.

                if (
                    category === "MATERNITY" &&
                    retiredMaternityProductNames.some(function (oldName) {
                        return oldName.toLowerCase() === name;
                    })
                ) {
                    return false;
                }

                return true;

            })
            .map(function (product, index) {

                return {
                    id: product.id || "ADMIN-" + index,
                    name: String(product.name).trim(),
                    category: String(product.category).trim().toUpperCase(),
                    price: Number(product.price),
                    originalPrice: Number(product.originalPrice || product.price),
                    material: String(product.material || "OTHER").trim().toUpperCase(),
                    deliveryDays: Math.max(
                        1,
                        Number(product.deliveryDays || product.delivery) || 5
                    ),
                    style: getProductStyle(product),
                    sizes: getProductSizes(product),
                    newest: 1000 + index,
                    image: product.image || "",
                    colourImages: product.colourImages || product.colorImages || null
                };

            });
    }


    // =====================================
    // COMBINE ALL PRODUCTS
    // =====================================

    function getAllProducts() {

        const adminProducts = prepareAdminProducts();
        const combinedProducts = [...adminProducts];

        defaultProducts.forEach(function (product) {

            const alreadyExists = adminProducts.some(function (adminProduct) {

                return adminProduct.name.toLowerCase() ===
                    product.name.toLowerCase() &&
                    adminProduct.category === product.category;

            });

            if (!alreadyExists) {
                combinedProducts.push(product);
            }

        });

      return combinedProducts;

}

// Make the complete product catalogue available to VÊLORA AI.
window.veloraGetAllProducts = getAllProducts;

    // =====================================
    // PAGE ELEMENTS AND URL PARAMETERS
    // =====================================

    const params = new URLSearchParams(window.location.search);

    const requestedCategory = (
        params.get("category") || "ALL"
    ).trim();

    const selectedCategoryEntry = customerCategoryEntries.find(
        function (category) {
            return category.label.toUpperCase() ===
                requestedCategory.toUpperCase();
        }
    );

    let currentCategory = requestedCategory.toUpperCase() === "ALL"
        ? "ALL"
        : selectedCategoryEntry
            ? selectedCategoryEntry.key
            : "ALL";

    let currentCategoryLabel = selectedCategoryEntry
        ? selectedCategoryEntry.label.toUpperCase()
        : currentCategory;

    const searchTerm = (params.get("search") || "").trim();
    const normalizedSearch = searchTerm.toLowerCase();

    const heading = document.getElementById("category-heading");
    const container = document.getElementById("category-products");
    const noProducts = document.getElementById("no-products");
    const productCount = document.getElementById("product-count");

    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");

    const materialFilter = document.getElementById("filter-material");
    const deliveryFilter = document.getElementById("filter-delivery");
    const styleFilter = document.getElementById("filter-style");
    const sizeFilter = document.getElementById("filter-size");

    const sortFilter = document.getElementById("sort-products");

    const clearButton = document.getElementById("clear-filters");
    const applyButton = document.getElementById("apply-filters");

    const openFilterButton = document.getElementById("open-filter");
    const closeFilterButton = document.getElementById("close-filter");

    const filterDrawer = document.getElementById("filter-drawer");
    const filterOverlay = document.getElementById("filter-overlay");

    if (!heading || !container || !noProducts || !productCount) {
        return;
    }


    // =====================================
    // OPEN AND CLOSE FILTER DRAWER
    // =====================================

    function openFilterDrawer() {

        if (!filterDrawer || !filterOverlay) return;

        filterDrawer.classList.add("active");
        filterOverlay.classList.add("active");

        filterDrawer.setAttribute("aria-hidden", "false");

        document.body.classList.add("filter-open");

        if (closeFilterButton) {
            closeFilterButton.focus();
        }
    }


    function closeFilterDrawer() {

        if (!filterDrawer || !filterOverlay) return;

        filterDrawer.classList.remove("active");
        filterOverlay.classList.remove("active");

        filterDrawer.setAttribute("aria-hidden", "true");

        document.body.classList.remove("filter-open");

        if (openFilterButton) {
            openFilterButton.focus();
        }
    }


    if (openFilterButton) {
        openFilterButton.addEventListener("click", openFilterDrawer);
    }

    if (closeFilterButton) {
        closeFilterButton.addEventListener("click", closeFilterDrawer);
    }

    if (filterOverlay) {
        filterOverlay.addEventListener("click", closeFilterDrawer);
    }

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeFilterDrawer();
        }

    });


    // =====================================
    // LOAD WISHLIST SAFELY
    // =====================================

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


    // =====================================
    // UPDATE PAGE HEADING
    // =====================================

    function updateHeading() {

        if (searchTerm) {
            heading.textContent = 'SEARCH RESULTS FOR "' + searchTerm + '"';
        } else {
            heading.textContent = currentCategory === "ALL"
                ? "NEW ARRIVALS"
                : currentCategoryLabel + " COLLECTION";
        }
    }


    // =====================================
    // DISPLAY AND FILTER PRODUCTS
    // =====================================

    function displayProducts() {

        const products = getAllProducts().map(function (product) {

            if (
                String(product.name).toLowerCase() === "classic party dress" &&
                product.category === "WOMEN"
            ) {

                return {
                    ...product,
                    material: "NET WITH STONE WORK",
                    image: "../images/gown1.png",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    colourImages: {
                        "Blue": "../images/gown1.png"
                    }
                };
            }

            return product;
        });


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

        const selectedStyle = styleFilter
            ? styleFilter.value
            : "ALL";

        const selectedSize = sizeFilter
            ? sizeFilter.value
            : "ALL";


        // =====================================
        // SEARCH + FILTER PRODUCTS
        // =====================================

        let filteredProducts = products.filter(function (product) {

            const matchesCategory =
                currentCategory === "ALL" ||
                String(product.category).trim().toUpperCase() === currentCategory ||
                String(product.category).trim().toUpperCase() === currentCategoryLabel;

            const matchesPrice =
                product.price >= minimum &&
                product.price <= maximum;

            const matchesMaterial =
                selectedMaterial === "ALL" ||
                product.material === selectedMaterial;

            const matchesDelivery =
                selectedDelivery === "ALL" ||
                product.deliveryDays <= Number(selectedDelivery);

            const matchesStyle =
                selectedStyle === "ALL" ||
                getProductStyle(product) === selectedStyle;

            const matchesSize =
                selectedSize === "ALL" ||
                getProductSizes(product).includes(selectedSize);

            const searchableText = [
                product.name,
                product.category,
                product.material,
                getProductStyle(product)
            ].join(" ").toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                searchableText.includes(normalizedSearch);

            return matchesCategory &&
                matchesPrice &&
                matchesMaterial &&
                matchesDelivery &&
                matchesStyle &&
                matchesSize &&
                matchesSearch;

        });


        // =====================================
        // SORT PRODUCTS
        // =====================================

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


        // =====================================
        // UPDATE PRODUCT COUNT
        // =====================================

        productCount.textContent =
            "Showing " + filteredProducts.length + " products";

        container.innerHTML = "";

        noProducts.hidden = filteredProducts.length !== 0;

        const wishlist = getWishlist();


        // =====================================
        // CREATE PRODUCT CARDS
        // =====================================

        filteredProducts.forEach(function (product) {

            const card = document.createElement("div");
            card.className = "product-card";

            // PRODUCT IMAGE

            const imageBox = document.createElement("div");
            imageBox.className = "product-image";

            const image = document.createElement("img");

            const isFloralDress =
                product.name === "Floral Summer Dress" &&
                product.category === "WOMEN";

            const isPartyDress =
                String(product.name).toLowerCase() === "classic party dress" &&
                product.category === "WOMEN";

            const productImagePath = isFloralDress
                ? "../images/floral1.png"
                : isPartyDress
                    ? "../images/gown1.png"
                    : product.image;

            image.src = productImagePath ||
                "https://placehold.co/600x750/f5f0e9/8b684d?text=VELORA";

            image.alt = product.name;
            image.loading = "lazy";
            image.style.cursor = "pointer";

            image.addEventListener("error", function () {

                const fallback = product.fallbackImage;

                if (fallback) {

                    const fallbackURL = new URL(
                        fallback,
                        window.location.href
                    ).href;

                    if (image.src !== fallbackURL) {
                        image.src = fallback;
                        return;
                    }
                }

                image.src =
                    "https://placehold.co/600x750/f5f0e9/8b684d?text=VELORA";
            });


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
                alreadyWishlisted ? "Remove from wishlist" : "Add to wishlist"
            );

            if (alreadyWishlisted) {
                heart.classList.add("active");
            }


            // TOGGLE WISHLIST

            heart.addEventListener("click", function (event) {

                event.stopPropagation();

                const currentWishlist = getWishlist();

                const existingIndex = currentWishlist.findIndex(function (item) {

                    if (typeof item === "string") {
                        return item === product.name;
                    }

                    return item &&
                        (item.productName === product.name ||
                            item.name === product.name);
                });

                if (existingIndex !== -1) {

                    currentWishlist.splice(existingIndex, 1);

                    heart.textContent = "♡";
                    heart.classList.remove("active");

                } else {

                    currentWishlist.push({
                        productName: product.name,
                        name: product.name,
                        price: product.price,
                        image: productImagePath,
                        category: product.category
                    });

                    heart.textContent = "♥";
                    heart.classList.add("active");
                }

                localStorage.setItem(
                    "veloraWishlist",
                    JSON.stringify(currentWishlist)
                );
            });


            // PRICE AND DISCOUNT

            const sellingPrice = Number(product.price);
            const originalPrice = Number(product.originalPrice || product.price);

            const discount = originalPrice > sellingPrice
                ? Math.round(
                    ((originalPrice - sellingPrice) / originalPrice) * 100
                )
                : 0;


            // DISCOUNT BADGE

            const discountBadge = document.createElement("span");
            discountBadge.className = "discount-badge";

            if (discount > 0) {
                discountBadge.textContent = discount + "% OFF";
            }

            imageBox.append(image, heart);

            if (discount > 0) {
                imageBox.appendChild(discountBadge);
            }


            // PRODUCT INFORMATION

            const brand = document.createElement("p");
            brand.className = "product-brand";
            brand.textContent = "VÊLORA";

            const name = document.createElement("h3");
            name.textContent = product.name;

            const categoryText = document.createElement("p");
            categoryText.className = "product-category";
            categoryText.textContent = product.category;


            // PRICE

            const price = document.createElement("p");
            price.className = "price";

            price.innerHTML = `
                <span class="selling-price">
                    ₹${sellingPrice.toLocaleString("en-IN")}
                </span>

                ${discount > 0 ? `
                    <span class="original-price">
                        ₹${originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span class="discount-percent">
                        (${discount}% OFF)
                    </span>
                ` : ""}
            `;


            // MATERIAL

            const material = document.createElement("p");
            material.className = "product-material";
            material.textContent =
                product.material || "Premium quality fabric";


            // DELIVERY

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

            productParams.set(
                "originalPrice",
                product.originalPrice || product.price
            );

            productParams.set("category", product.category);
            productParams.set("image", productImagePath || "");
            productParams.set("material", product.material || "");
            productParams.set("deliveryDays", product.deliveryDays);
            productParams.set("style", getProductStyle(product));
            productParams.set("sizes", getProductSizes(product).join(","));


            // SEND COLOUR OPTIONS TO DETAILS PAGE

            if (product.colourImages) {

                productParams.set(
                    "colourImages",
                    JSON.stringify(product.colourImages)
                );
            }

            details.href =
                "product-details.html?" + productParams.toString();


            // OPEN DETAILS WHEN IMAGE IS CLICKED

            image.addEventListener("click", function () {
                window.location.href = details.href;
            });


            // ADD EVERYTHING TO CARD

            card.append(
                imageBox,
                brand,
                name,
                categoryText,
                price,
                material,
                delivery,
                details
            );

            container.appendChild(card);

        });

    }


    // =====================================
    // FILTER EVENT LISTENERS
    // =====================================

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

    if (styleFilter) {
        styleFilter.addEventListener("change", displayProducts);
    }

    if (sizeFilter) {
        sizeFilter.addEventListener("change", displayProducts);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", displayProducts);
    }


    // =====================================
    // APPLY FILTERS
    // =====================================

    if (applyButton) {

        applyButton.addEventListener("click", function () {

            displayProducts();
            closeFilterDrawer();

        });
    }


    // =====================================
    // CLEAR ALL FILTERS
    // =====================================

    if (clearButton) {

        clearButton.addEventListener("click", function () {

            if (minPrice) minPrice.value = "";
            if (maxPrice) maxPrice.value = "";

            if (materialFilter) materialFilter.value = "ALL";
            if (deliveryFilter) deliveryFilter.value = "ALL";
            if (styleFilter) styleFilter.value = "ALL";
            if (sizeFilter) sizeFilter.value = "ALL";

            if (sortFilter) sortFilter.value = "default";

            displayProducts();
        });
    }


    // =====================================
    // INITIAL DISPLAY
    // =====================================

    updateHeading();
    displayProducts();

});
