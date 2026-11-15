
document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. PAGE ELEMENTS
    // =========================================

    const showFormButton = document.getElementById("show-product-form");
    const productForm = document.getElementById("admin-product-form");
    const formPanel = document.getElementById("product-form-panel");
    const productList = document.getElementById("admin-products-list");

    const cancelButton = document.getElementById("cancel-product-form");
    const cancelSecondaryButton = document.getElementById("cancel-product-form-secondary");

    const message = document.getElementById("admin-product-message");

    const nameElement = document.getElementById("admin-product-name");
    const priceElement = document.getElementById("admin-product-price");
    const originalPriceElement = document.getElementById("admin-product-original-price");
    const categoryElement = document.getElementById("admin-product-category");
    const materialElement = document.getElementById("admin-product-material");
    const stockElement = document.getElementById("admin-product-stock");
    const deliveryElement = document.getElementById("admin-product-delivery");
    const styleElement = document.getElementById("admin-product-style");
    const sizesElement = document.getElementById("admin-product-sizes");
    const imageElement = document.getElementById("admin-product-image");
    const imageFileElement = document.getElementById("admin-product-image-file");

    const editIdElement = document.getElementById("edit-product-id");
    const formTitle = document.getElementById("product-form-title");
    const saveButton = document.getElementById("save-product-button");

    const imagePreview = document.getElementById("admin-product-image-preview");
    const imagePlaceholder = document.getElementById("admin-product-image-placeholder");

    const searchInput = document.getElementById("product-search");
    const categoryFilter = document.getElementById("product-category-filter");
    const stockFilter = document.getElementById("product-stock-filter");
    const sortFilter = document.getElementById("product-sort-filter");

    const emptyState = document.getElementById("product-empty-state");

    // Summary counters
    const totalCount = document.getElementById("product-total-count");
    const categoryCount = document.getElementById("product-category-count");
    const inStockCount = document.getElementById("product-instock-count");
    const lowStockCount = document.getElementById("product-lowstock-count");
    const resultsCount = document.getElementById("product-results-count");


    // =========================================
    // 2. DEFAULT DEMO PRODUCTS
    // =========================================

    const defaultProducts = [
        {
            id: "VELORA-DEFAULT-1",
            name: "Classic Men's Shirt",
            price: 799,
            originalPrice: 1199,
            category: "Men",
            material: "COTTON",
            image: "",
            delivery: 5,
            deliveryDays: 5,
            stock: 10,
            style: "WESTERN",
            sizes: ["S", "M", "L", "XL"]
        },
        {
            id: "VELORA-DEFAULT-2",
            name: "Elegant Women's Dress",
            price: 999,
            originalPrice: 1499,
            category: "Women",
            material: "POLYESTER",
            image: "",
            delivery: 5,
            deliveryDays: 5,
            stock: 10,
            style: "WESTERN",
            sizes: ["S", "M", "L", "XL"]
        },
        {
            id: "VELORA-DEFAULT-3",
            name: "Kids Casual Outfit",
            price: 499,
            originalPrice: 799,
            category: "Kids",
            material: "COTTON",
            image: "",
            delivery: 4,
            deliveryDays: 4,
            stock: 10,
            style: "WESTERN",
            sizes: ["S", "M", "L"]
        },
        {
            id: "VELORA-DEFAULT-4",
            name: "Maternity Comfort Wear",
            price: 1299,
            originalPrice: 1899,
            category: "Maternity",
            material: "COTTON",
            image: "",
            delivery: 6,
            deliveryDays: 6,
            stock: 10,
            style: "WESTERN",
            sizes: ["M", "L", "XL", "XXL"]
        }
    ];


    // =========================================
    // 3. SAFE STORAGE
    // =========================================

    function readStorage(key, fallback) {

        try {

            const saved = localStorage.getItem(key);

            if (!saved) return fallback;

            const parsed = JSON.parse(saved);

            return parsed;

        } catch (error) {

            console.error("Could not read " + key, error);

            return fallback;
        }
    }

function loadProducts() {
    if (typeof window.veloraGetAllProducts === "function") {
        return window.veloraGetAllProducts().map(function (product, index) {
            return {
                ...product,
                id: product.id || "VELORA-" + index,
                stock: product.stock ?? 10,
                delivery: product.delivery || product.deliveryDays || 5,
                sizes: product.sizes || product.availableSizes || []
            };
        });
    }

    const saved = readStorage("veloraProducts", null);

    if (Array.isArray(saved)) {
        return saved;
    }

    return defaultProducts.map(function (product) {
        return { ...product };
    });
}


    let products = loadProducts();

    // An existing product without a stock field is treated as 10 units.
    function getStock(product) {

        if (
            product.stock === undefined ||
            product.stock === null ||
            product.stock === ""
        ) {
            return 10;
        }

        const stock = Number(product.stock);

        return Number.isFinite(stock) && stock >= 0
            ? stock
            : 0;
    }


    function saveProducts() {

        try {

            localStorage.setItem(
                "veloraProducts",
                JSON.stringify(products)
            );

            return true;

        } catch (error) {

            console.error("Could not save products:", error);

            showMessage(
                "Unable to save. The browser may be out of storage space. Try a smaller image.",
                "error"
            );

            return false;
        }
    }


    // =========================================
    // 4. MESSAGES
    // =========================================

    function showMessage(text, type) {

        if (!message) return;

        message.textContent = text;

        if (type === "error") {
            message.style.color = "#b04444";
        } else if (type === "success") {
            message.style.color = "#527b61";
        } else {
            message.style.color = "#8b684d";
        }
    }


    // =========================================
    // 5. CATEGORY MANAGEMENT
    // =========================================

    function getCategories() {

        const saved = readStorage("veloraCategories", []);

        let categories = [];

        if (Array.isArray(saved)) {

            categories = saved.map(function (item) {

                if (typeof item === "string") {
                    return item.trim();
                }

                if (item && (item.name || item.category)) {
                    return String(item.name || item.category).trim();
                }

                return "";

            }).filter(Boolean);
        }

        if (categories.length === 0) {
            categories = ["Men", "Women", "Kids", "Maternity"];
        }

        return [...new Set(categories)];
    }


    function updateCategoryDropdown(selectedCategory) {

        const categories = getCategories();

        // Preserve a category already used by a product being edited.
        if (
            selectedCategory &&
            !categories.some(function (category) {
                return category.toLowerCase() ===
                    String(selectedCategory).toLowerCase();
            })
        ) {
            categories.push(selectedCategory);
        }

        if (categoryElement) {

            categoryElement.innerHTML = "";

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select Category";

            categoryElement.appendChild(placeholder);

            categories.forEach(function (category) {

                const option = document.createElement("option");

                option.value = category;
                option.textContent = category;

                if (
                    selectedCategory &&
                    category.toLowerCase() ===
                        String(selectedCategory).toLowerCase()
                ) {
                    option.selected = true;
                }

                categoryElement.appendChild(option);
            });
        }

        if (categoryFilter) {

            const currentValue = categoryFilter.value;

            categoryFilter.innerHTML = "";

            const allOption = document.createElement("option");
            allOption.value = "ALL";
            allOption.textContent = "All Categories";

            categoryFilter.appendChild(allOption);

            categories.forEach(function (category) {

                const option = document.createElement("option");

                option.value = category;
                option.textContent = category;

                categoryFilter.appendChild(option);
            });

            if (
                currentValue === "ALL" ||
                categories.includes(currentValue)
            ) {
                categoryFilter.value = currentValue;
            }
        }
    }


    // =========================================
    // 6. IMAGE PREVIEW AND UPLOAD
    // =========================================

    let uploadedImageData = "";

    function showImagePreview(source) {

        if (!imagePreview || !imagePlaceholder) return;

        if (!source) {

            imagePreview.removeAttribute("src");
            imagePreview.hidden = true;
            imagePlaceholder.hidden = false;

            return;
        }

        imagePreview.onload = function () {
            imagePreview.hidden = false;
            imagePlaceholder.hidden = true;
        };

        imagePreview.onerror = function () {

            imagePreview.hidden = true;
            imagePlaceholder.hidden = false;
            imagePlaceholder.textContent =
                "Image could not be loaded. Check the image URL.";
        };

        imagePreview.src = source;
    }


    if (imageElement) {

        imageElement.addEventListener("input", function () {

            uploadedImageData = "";

            if (imageFileElement) {
                imageFileElement.value = "";
            }

            showImagePreview(imageElement.value.trim());
        });
    }


    if (imageFileElement) {

        imageFileElement.addEventListener("change", function () {

            const file = imageFileElement.files[0];

            if (!file) return;

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {

                showMessage(
                    "Please select a JPG, PNG or WebP image.",
                    "error"
                );

                imageFileElement.value = "";
                return;
            }

            // Keep the image small enough for browser LocalStorage.
            const maximumSize = 1.5 * 1024 * 1024;

            if (file.size > maximumSize) {

                showMessage(
                    "Please choose an image smaller than 1.5 MB.",
                    "error"
                );

                imageFileElement.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {

                uploadedImageData = event.target.result;

                if (imageElement) {
                    imageElement.value = "";
                }

                showImagePreview(uploadedImageData);

                showMessage(
                    "Image uploaded and previewed successfully.",
                    "success"
                );
            };

            reader.onerror = function () {

                showMessage(
                    "Could not read this image. Please try another.",
                    "error"
                );
            };

            reader.readAsDataURL(file);
        });
    }


    // =========================================
    // 7. FORM RESET AND OPEN/CLOSE
    // =========================================

    function resetProductForm() {

        if (!productForm) return;

        productForm.reset();

        if (editIdElement) {
            editIdElement.value = "";
        }

        uploadedImageData = "";

        if (formTitle) {
            formTitle.textContent = "Add New Product";
        }

        if (saveButton) {
            saveButton.textContent = "SAVE PRODUCT";
            saveButton.disabled = false;
        }

        updateCategoryDropdown();

        showImagePreview("");

        if (formPanel) {
            formPanel.hidden = true;
        }
    }


    function openProductForm() {

        if (!productForm || !formPanel) return;

        resetProductForm();

        formTitle.textContent = "Add New Product";

        formPanel.hidden = false;

        formPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        setTimeout(function () {

            if (nameElement) {
                nameElement.focus();
            }

        }, 350);
    }


    if (showFormButton) {
        showFormButton.addEventListener("click", openProductForm);
    }


    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            resetProductForm();
            showMessage("");
        });
    }


    if (cancelSecondaryButton) {
        cancelSecondaryButton.addEventListener("click", function () {
            resetProductForm();
            showMessage("");
        });
    }


    // =========================================
    // 8. PRODUCT STOCK STATUS
    // =========================================

    function getStockStatus(product) {

        const stock = getStock(product);

        if (stock === 0) {
            return {
                label: "OUT OF STOCK",
                className: "out"
            };
        }

        if (stock <= 5) {
            return {
                label: "LOW STOCK",
                className: "low"
            };
        }

        return {
            label: "IN STOCK",
            className: "in"
        };
    }


    // =========================================
    // 9. UPDATE INVENTORY SUMMARY
    // =========================================

    function updateSummary() {

        const categories = getCategories();

        const inStock = products.filter(function (product) {
            return getStock(product) > 5;
        }).length;

        const lowStock = products.filter(function (product) {
            return getStock(product) > 0 &&
                getStock(product) <= 5;
        }).length;

        if (totalCount) {
            totalCount.textContent = products.length;
        }

        if (categoryCount) {
            categoryCount.textContent = categories.length;
        }

        if (inStockCount) {
            inStockCount.textContent = inStock;
        }

        if (lowStockCount) {
            lowStockCount.textContent = lowStock;
        }
    }


    // =========================================
    // 10. CREATE TABLE CELL
    // =========================================

    function createCell(text, className) {

        const cell = document.createElement("td");

        cell.textContent = text;

        if (className) {
            cell.className = className;
        }

        return cell;
    }


    // =========================================
    // 11. EDIT PRODUCT
    // =========================================

    function editProduct(id) {

        const product = products.find(function (item) {
            return String(item.id) === String(id);
        });

        if (!product || !productForm || !formPanel) return;

        resetProductForm();

        if (formTitle) {
            formTitle.textContent = "Edit Product";
        }

        if (editIdElement) {
            editIdElement.value = product.id;
        }

        if (nameElement) {
            nameElement.value = product.name || "";
        }

        if (priceElement) {
            priceElement.value = product.price || "";
        }

        if (originalPriceElement) {
            originalPriceElement.value =
                product.originalPrice || product.price || "";
        }

        updateCategoryDropdown(product.category);

        if (materialElement) {
            materialElement.value =
                String(product.material || "OTHER").toUpperCase();
        }

        if (stockElement) {
            stockElement.value = getStock(product);
        }

        if (deliveryElement) {
            deliveryElement.value =
                String(product.deliveryDays || product.delivery || 5);
        }

        if (styleElement) {
            styleElement.value =
                String(product.style || "WESTERN").toUpperCase();
        }

        if (sizesElement) {

            const sizes = product.sizes || product.availableSizes || [];

            sizesElement.value = Array.isArray(sizes)
                ? sizes.join(", ")
                : String(sizes);
        }

        if (product.image) {

            if (String(product.image).startsWith("data:image/")) {

                uploadedImageData = product.image;

                showImagePreview(uploadedImageData);

            } else {

                if (imageElement) {
                    imageElement.value = product.image;
                }

                showImagePreview(product.image);
            }
        }

        if (saveButton) {
            saveButton.textContent = "UPDATE PRODUCT";
        }

        formPanel.hidden = false;

        formPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    // =========================================
    // 12. DELETE PRODUCT
    // =========================================

    function deleteProduct(id) {

        const product = products.find(function (item) {
            return String(item.id) === String(id);
        });

        if (!product) return;

        const confirmed = confirm(
            'Delete "' + product.name + '" from your inventory?'
        );

        if (!confirmed) return;

        const previousProducts = [...products];

        products = products.filter(function (item) {
            return String(item.id) !== String(id);
        });

        if (!saveProducts()) {

            products = previousProducts;
            return;
        }

        displayProducts();

        showMessage(
            "Product deleted successfully.",
            "success"
        );
    }


    // =========================================
    // 13. SEARCH, FILTER AND SORT
    // =========================================

    function getFilteredProducts() {

        let filtered = [...products];

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "ALL";

        const selectedStock = stockFilter
            ? stockFilter.value
            : "ALL";

        filtered = filtered.filter(function (product) {

            const searchable = [
                product.name,
                product.category,
                product.material,
                product.style
            ].join(" ").toLowerCase();

            const matchesSearch =
                !searchTerm || searchable.includes(searchTerm);

            const matchesCategory =
                selectedCategory === "ALL" ||
                String(product.category).toLowerCase() ===
                    selectedCategory.toLowerCase();

            const stock = getStock(product);

            let matchesStock = true;

            if (selectedStock === "IN_STOCK") {
                matchesStock = stock > 5;
            } else if (selectedStock === "LOW_STOCK") {
                matchesStock = stock > 0 && stock <= 5;
            } else if (selectedStock === "OUT_OF_STOCK") {
                matchesStock = stock === 0;
            }

            return matchesSearch &&
                matchesCategory &&
                matchesStock;
        });


        const sortValue = sortFilter
            ? sortFilter.value
            : "newest";

        if (sortValue === "name") {

            filtered.sort(function (a, b) {
                return String(a.name).localeCompare(String(b.name));
            });

        } else if (sortValue === "price-low") {

            filtered.sort(function (a, b) {
                return Number(a.price) - Number(b.price);
            });

        } else if (sortValue === "price-high") {

            filtered.sort(function (a, b) {
                return Number(b.price) - Number(a.price);
            });

        } else if (sortValue === "stock-low") {

            filtered.sort(function (a, b) {
                return getStock(a) - getStock(b);
            });

        } else {

            filtered.sort(function (a, b) {

                return Number(b.createdAt || b.id || 0) -
                    Number(a.createdAt || a.id || 0);
            });
        }

        return filtered;
    }


    // =========================================
    // 14. DISPLAY PRODUCTS
    // =========================================

    function displayProducts() {

        if (!productList) return;

        productList.innerHTML = "";

        updateSummary();

        const filteredProducts = getFilteredProducts();

        if (resultsCount) {

            resultsCount.textContent =
                "Showing " + filteredProducts.length +
                " of " + products.length + " products";
        }

        if (emptyState) {
            emptyState.hidden = filteredProducts.length !== 0;
        }

        if (filteredProducts.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.className = "velora-loading-cell";
            cell.textContent = products.length === 0
                ? "No products have been added yet."
                : "No products match your search or filters.";

            row.appendChild(cell);
            productList.appendChild(row);

            return;
        }


        filteredProducts.forEach(function (product) {

            const row = document.createElement("tr");

            // PRODUCT IMAGE AND NAME
            const productCell = document.createElement("td");

            const productInfo = document.createElement("div");
            productInfo.className = "velora-product-table-info";

            const thumbnail = document.createElement("img");

            thumbnail.className = "velora-product-thumbnail";
            thumbnail.alt = product.name || "Product";

            if (product.image) {
                thumbnail.src = product.image;
            } else {
                thumbnail.src =
                    "https://placehold.co/100x120/f3eee7/8b684d?text=VELORA";
            }

            thumbnail.onerror = function () {
                thumbnail.src =
                    "https://placehold.co/100x120/f3eee7/8b684d?text=VELORA";
            };

            const productDetails = document.createElement("div");

            const productName = document.createElement("strong");
            productName.textContent = product.name || "Unnamed Product";

            const productMaterial = document.createElement("small");
            productMaterial.textContent =
                String(product.material || "OTHER").toUpperCase();

            productDetails.append(productName, productMaterial);

            productInfo.append(thumbnail, productDetails);
            productCell.appendChild(productInfo);

            row.appendChild(productCell);


            // CATEGORY
            row.appendChild(
                createCell(product.category || "Uncategorized")
            );


            // PRICE
            const priceCell = document.createElement("td");

            const sellingPrice = Number(product.price) || 0;
            const originalPrice = Number(
                product.originalPrice || product.price
            );

            const selling = document.createElement("strong");

            selling.textContent =
                "₹" + sellingPrice.toLocaleString("en-IN");

            priceCell.appendChild(selling);

            if (originalPrice > sellingPrice) {

                const original = document.createElement("small");

                original.className = "velora-original-table-price";

                original.textContent =
                    "₹" + originalPrice.toLocaleString("en-IN");

                priceCell.appendChild(original);
            }

            row.appendChild(priceCell);


            // STOCK
            const stock = getStock(product);

            row.appendChild(
                createCell(stock + " units")
            );


            // STOCK STATUS
            const statusCell = document.createElement("td");

            const status = getStockStatus(product);

            const statusBadge = document.createElement("span");

            statusBadge.className =
                "velora-stock-badge " + status.className;

            statusBadge.textContent = status.label;

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);


            // ACTIONS
            const actionsCell = document.createElement("td");

            const actionsWrapper = document.createElement("div");

            actionsWrapper.className = "velora-product-actions";

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.textContent = "EDIT";
            editButton.className = "velora-edit-product";

            editButton.addEventListener("click", function () {
                editProduct(product.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "DELETE";
            deleteButton.className = "velora-delete-product";

            deleteButton.addEventListener("click", function () {
                deleteProduct(product.id);
            });

            actionsWrapper.append(editButton, deleteButton);
            actionsCell.appendChild(actionsWrapper);

            row.appendChild(actionsCell);

            productList.appendChild(row);
        });
    }


    // =========================================
    // 15. SAVE NEW OR UPDATED PRODUCT
    // =========================================

    if (productForm) {

        productForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const idValue = editIdElement
                ? editIdElement.value
                : "";

            const name = nameElement.value.trim();
            const price = Number(priceElement.value);

            const originalPrice = originalPriceElement.value === ""
                ? price
                : Number(originalPriceElement.value);

            const category = categoryElement.value.trim();
            const material = materialElement.value.trim().toUpperCase();

            const stock = Number(stockElement.value);
            const deliveryDays = Number(deliveryElement.value);

            const style = styleElement.value.toUpperCase();

            const sizes = sizesElement.value
                .split(",")
                .map(function (size) {
                    return size.trim().toUpperCase();
                })
                .filter(Boolean);

            const existingProduct = idValue
                ? products.find(function (item) {
                    return String(item.id) === String(idValue);
                })
                : null;

            const image = uploadedImageData ||
                imageElement.value.trim() ||
                (existingProduct ? existingProduct.image || "" : "");


            // VALIDATION
            if (!name || !category || !material) {

                showMessage(
                    "Please complete all required product details.",
                    "error"
                );

                return;
            }

            if (!Number.isFinite(price) || price <= 0) {

                showMessage(
                    "Enter a valid selling price greater than zero.",
                    "error"
                );

                return;
            }

            if (
                !Number.isFinite(originalPrice) ||
                originalPrice < price
            ) {

                showMessage(
                    "Original price must be equal to or greater than selling price.",
                    "error"
                );

                return;
            }

            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                showMessage(
                    "Stock must be a whole number and cannot be negative.",
                    "error"
                );

                return;
            }

            if (
                !Number.isInteger(deliveryDays) ||
                deliveryDays < 1
            ) {

                showMessage(
                    "Please select a valid delivery time.",
                    "error"
                );

                return;
            }


            const newProduct = {

                ...(existingProduct || {}),

                id: existingProduct
                    ? existingProduct.id
                    : "VELORA-" + Date.now(),

                name: name,

                price: price,

                originalPrice: originalPrice,

                category: category,

                material: material,

                image: image,

                delivery: deliveryDays,

                deliveryDays: deliveryDays,

                stock: stock,

                style: style,

                sizes: sizes,

                createdAt: existingProduct
                    ? existingProduct.createdAt || Date.now()
                    : Date.now()
            };


            const previousProducts = [...products];

            if (idValue) {

                if (!existingProduct) {

                    showMessage(
                        "This product could not be found. Refresh and try again.",
                        "error"
                    );

                    return;
                }

                products = products.map(function (item) {

                    return String(item.id) === String(idValue)
                        ? newProduct
                        : item;
                });

            } else {

                products.push(newProduct);
            }


            if (!saveProducts()) {

                products = previousProducts;
                return;
            }


            displayProducts();

            resetProductForm();

            showMessage(
                idValue
                    ? "Product updated successfully!"
                    : "New product added successfully!",
                "success"
            );
        });
    }


    // =========================================
    // 16. SEARCH AND FILTER EVENTS
    // =========================================

    if (searchInput) {
        searchInput.addEventListener("input", displayProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", displayProducts);
    }

    if (stockFilter) {
        stockFilter.addEventListener("change", displayProducts);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", displayProducts);
    }


    // =========================================
    // 17. UPDATE WHEN CATEGORIES CHANGE
    // =========================================

    window.addEventListener("storage", function (event) {

        if (event.key === "veloraCategories") {
            updateCategoryDropdown();
            displayProducts();
        }
    });


    // =========================================
    // 18. INITIAL PAGE LOAD
    // =========================================

    updateCategoryDropdown();

    displayProducts();

});
