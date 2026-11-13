
document.addEventListener("DOMContentLoaded", function () {

    // PAGE ELEMENTS
    const showFormButton = document.getElementById("show-product-form");
    const productForm = document.getElementById("admin-product-form");
    const productList = document.getElementById("admin-products-list");
    const cancelButton = document.getElementById("cancel-product-form");
    const message = document.getElementById("admin-product-message");

    const categoryElement = document.getElementById(
        "admin-product-category"
    );

    // DEFAULT PRODUCTS
    const defaultProducts = [
        {
            id: 1,
            name: "Classic Men's Shirt",
            price: 799,
            category: "Men",
            material: "Cotton",
            image: "",
            delivery: 5,
            deliveryDays: 5
        },
        {
            id: 2,
            name: "Elegant Women's Dress",
            price: 999,
            category: "Women",
            material: "Polyester",
            image: "",
            delivery: 5,
            deliveryDays: 5
        },
        {
            id: 3,
            name: "Kids Casual Outfit",
            price: 499,
            category: "Kids",
            material: "Cotton",
            image: "",
            delivery: 4,
            deliveryDays: 4
        },
        {
            id: 4,
            name: "Maternity Comfort Wear",
            price: 1299,
            category: "Maternity",
            material: "Cotton",
            image: "",
            delivery: 6,
            deliveryDays: 6
        }
    ];

    // LOAD PRODUCTS
    function loadProducts() {

        try {

            const saved = JSON.parse(
                localStorage.getItem("veloraProducts")
            );

            if (Array.isArray(saved)) {
                return saved;
            }

        } catch (error) {

            console.error("Could not load products:", error);

        }

        return defaultProducts.map(function (product) {
            return { ...product };
        });

    }

    let products = loadProducts();

    // LOAD ADMIN CATEGORIES
    function getCategories() {

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

            if (Array.isArray(saved)) {

                const validCategories = saved
                    .filter(function (category) {
                        return typeof category === "string";
                    })
                    .map(function (category) {
                        return category.trim();
                    })
                    .filter(function (category) {
                        return category !== "";
                    });

                return [...new Set(validCategories)];

            }

        } catch (error) {

            console.error("Could not load categories:", error);

        }

        return defaultCategories;

    }

    // UPDATE CATEGORY DROPDOWN
    function updateCategoryDropdown(selectedCategory) {

        if (!categoryElement) return;

        const categories = getCategories();

        // Keep an existing product category available while editing
        if (
            selectedCategory &&
            !categories.some(function (category) {
                return category.toLowerCase() ===
                    selectedCategory.toLowerCase();
            })
        ) {
            categories.push(selectedCategory);
        }

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
                category.toLowerCase() === selectedCategory.toLowerCase()
            ) {
                option.selected = true;
            }

            categoryElement.appendChild(option);

        });

    }

    // SHOW MESSAGE
    function showMessage(text, color) {

        if (!message) return;

        message.textContent = text;
        message.style.color = color || "#8b684d";

    }

    // SAVE PRODUCTS
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
                "Unable to save products. Please try again.",
                "#c0392b"
            );

            return false;

        }

    }

    // GET DELIVERY DAYS
    function getDeliveryDays(product) {

        return Number(
            product.deliveryDays || product.delivery || 5
        );

    }

    // DISPLAY PRODUCTS
    function displayProducts() {

        if (!productList) return;

        productList.innerHTML = "";

        if (products.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No products available.";

            row.appendChild(cell);
            productList.appendChild(row);

            return;

        }

        products.forEach(function (product) {

            const row = document.createElement("tr");

            const values = [
                product.name || "Unnamed Product",
                product.category || "Uncategorized",
                "₹" + (Number(product.price) || 0).toLocaleString("en-IN"),
                product.material || "N/A"
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            // ACTION BUTTONS
            const actions = document.createElement("td");

            const editButton = document.createElement("button");

            editButton.textContent = "EDIT";
            editButton.type = "button";
            editButton.className = "admin-action-button";

            editButton.addEventListener("click", function () {
                editProduct(product.id);
            });

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "DELETE";
            deleteButton.type = "button";
            deleteButton.className = "admin-action-button";

            deleteButton.addEventListener("click", function () {
                deleteProduct(product.id);
            });

            actions.append(editButton, deleteButton);

            row.appendChild(actions);

            productList.appendChild(row);

        });

    }

    // EDIT PRODUCT
    function editProduct(id) {

        const product = products.find(function (item) {
            return String(item.id) === String(id);
        });

        if (!product || !productForm) return;

        const title = document.getElementById("product-form-title");
        const editId = document.getElementById("edit-product-id");

        const nameElement = document.getElementById("admin-product-name");
        const priceElement = document.getElementById("admin-product-price");
        const materialElement = document.getElementById("admin-product-material");
        const imageElement = document.getElementById("admin-product-image");
        const deliveryElement = document.getElementById("admin-product-delivery");

        if (
            !title ||
            !editId ||
            !nameElement ||
            !priceElement ||
            !materialElement ||
            !imageElement ||
            !deliveryElement
        ) {
            return;
        }

        title.textContent = "EDIT PRODUCT";

        editId.value = product.id;

        nameElement.value = product.name;
        priceElement.value = product.price;

        updateCategoryDropdown(product.category);

        materialElement.value = product.material || "";
        imageElement.value = product.image || "";
        deliveryElement.value = getDeliveryDays(product);

        productForm.hidden = false;

        productForm.scrollIntoView({
            behavior: "smooth"
        });

    }

    // DELETE PRODUCT
    function deleteProduct(id) {

        const confirmed = confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        const previousProducts = [...products];

        products = products.filter(function (product) {
            return String(product.id) !== String(id);
        });

        if (!saveProducts()) {

            products = previousProducts;
            return;

        }

        displayProducts();

        showMessage("Product deleted successfully!", "green");

    }

    // SHOW ADD PRODUCT FORM
    if (showFormButton && productForm) {

        showFormButton.addEventListener("click", function () {

            productForm.reset();

            const title = document.getElementById("product-form-title");
            const editId = document.getElementById("edit-product-id");

            if (title) {
                title.textContent = "ADD NEW PRODUCT";
            }

            if (editId) {
                editId.value = "";
            }

            updateCategoryDropdown();

            productForm.hidden = false;

            productForm.scrollIntoView({
                behavior: "smooth"
            });

        });

    }

    // CANCEL FORM
    if (cancelButton && productForm) {

        cancelButton.addEventListener("click", function () {

            productForm.reset();
            productForm.hidden = true;

            updateCategoryDropdown();

            showMessage("");

        });

    }

    // ADD OR UPDATE PRODUCT
    if (productForm) {

        productForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const editIdElement = document.getElementById("edit-product-id");

            const idValue = editIdElement
                ? editIdElement.value
                : "";

            const nameElement = document.getElementById("admin-product-name");
            const priceElement = document.getElementById("admin-product-price");
            const materialElement = document.getElementById("admin-product-material");
            const imageElement = document.getElementById("admin-product-image");
            const deliveryElement = document.getElementById("admin-product-delivery");

            if (
                !nameElement ||
                !priceElement ||
                !categoryElement ||
                !materialElement ||
                !imageElement ||
                !deliveryElement
            ) {

                showMessage(
                    "Some product form fields are missing.",
                    "#c0392b"
                );

                return;

            }

            const product = {

                id: idValue
                    ? idValue
                    : Date.now(),

                name: nameElement.value.trim(),

                price: Number(priceElement.value),

                category: categoryElement.value.trim(),

                material: materialElement.value.trim(),

                image: imageElement.value.trim(),

                delivery: Number(deliveryElement.value),

                deliveryDays: Number(deliveryElement.value)

            };

            // VALIDATION
            if (
                !product.name ||
                !product.category ||
                !product.material ||
                !Number.isFinite(product.price) ||
                product.price <= 0 ||
                !Number.isInteger(product.deliveryDays) ||
                product.deliveryDays < 1
            ) {

                showMessage(
                    "Please enter valid product details. Price must be positive and delivery days must be at least 1.",
                    "#c0392b"
                );

                return;

            }

            const previousProducts = [...products];

            // UPDATE EXISTING PRODUCT
            if (idValue) {

                const productExists = products.some(function (item) {
                    return String(item.id) === String(idValue);
                });

                if (!productExists) {

                    showMessage(
                        "Product could not be found.",
                        "#c0392b"
                    );

                    return;

                }

                products = products.map(function (item) {

                    return String(item.id) === String(idValue)
                        ? product
                        : item;

                });

            } else {

                // ADD NEW PRODUCT
                products.push(product);

            }

            if (!saveProducts()) {

                products = previousProducts;
                return;

            }

            displayProducts();

            productForm.reset();
            productForm.hidden = true;

            updateCategoryDropdown();

            showMessage(
                idValue
                    ? "Product updated successfully!"
                    : "Product added successfully!",
                "green"
            );

        });

    }

    // INITIAL DISPLAY
    updateCategoryDropdown();

    if (saveProducts()) {
        displayProducts();
    }

});
