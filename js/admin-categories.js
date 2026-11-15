
document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // VÊLORA CATEGORY MANAGEMENT
    // =========================================

    const STORAGE_KEY = "veloraCategories";
    const PRODUCTS_KEY = "veloraProducts";

    const categoryForm = document.getElementById("category-form");
    const formPanel = document.getElementById("category-form-panel");
    const categoryInput = document.getElementById("new-category");
    const categoryList = document.getElementById("admin-category-list");
    const searchInput = document.getElementById("category-search");
    const message = document.getElementById("category-message");

    const totalCount = document.getElementById("category-total-count");
    const totalProducts = document.getElementById("category-total-products");
    const activeCount = document.getElementById("category-active-count");

    const showFormButton = document.getElementById("show-category-form");
    const cancelButton = document.getElementById("cancel-category");
    const cancelSecondary = document.getElementById("cancel-category-secondary");

    const formTitle = document.getElementById("category-form-title");
    const saveButton = document.getElementById("save-category-btn");
    const emptyState = document.getElementById("category-empty-state");

    if (!categoryForm || !categoryList) return;

    const DEFAULT_CATEGORIES = [
        "Men",
        "Women",
        "Kids",
        "Maternity"
    ];

    let categories = [];
    let products = [];
    let editingCategory = null;

    // =========================================
    // SAFE STORAGE FUNCTIONS
    // =========================================

    function readStorage(key) {

        try {
            const saved = localStorage.getItem(key);

            if (!saved) return [];

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {
            console.error("Storage error:", key, error);
            return [];
        }
    }

    function saveCategories() {

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(categories)
            );

            return true;

        } catch (error) {
            console.error("Could not save categories:", error);
            showMessage("Unable to save. Please check your browser storage.", "error");
            return false;
        }
    }

    function saveProducts() {

        try {
            localStorage.setItem(
                PRODUCTS_KEY,
                JSON.stringify(products)
            );

            return true;

        } catch (error) {
            console.error("Could not save products:", error);
            showMessage("Category renamed, but product updates could not be saved.", "error");
            return false;
        }
    }

    // =========================================
    // LOAD DATA
    // =========================================

    function normalizeCategory(item) {

        if (typeof item === "string") {
            return item.trim();
        }

        if (item && typeof item === "object") {
            return String(item.name || item.category || "").trim();
        }

        return "";
    }

    function loadData() {

        const savedCategories = readStorage(STORAGE_KEY);

        categories = savedCategories
            .map(normalizeCategory)
            .filter(Boolean);

        if (categories.length === 0) {
            categories = [...DEFAULT_CATEGORIES];
            saveCategories();
        }

        // Remove duplicate names
        categories = categories.filter(function (category, index) {
            return categories.findIndex(function (item) {
                return item.toLowerCase() === category.toLowerCase();
            }) === index;
        });

        products = readStorage(PRODUCTS_KEY);

        saveCategories();
    }

    // =========================================
    // CATEGORY HELPERS
    // =========================================

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function getCategoryIcon(category) {

        const name = category.toLowerCase();

        if (name.includes("women")) return "✧";
        if (name.includes("men")) return "◇";
        if (name.includes("kid")) return "♧";
        if (name.includes("maternity")) return "♡";
        if (name.includes("accessor")) return "✦";
        if (name.includes("footwear") || name.includes("shoe")) return "⌁";
        if (name.includes("beauty")) return "❀";

        return "✧";
    }

    function getCategoryClass(index) {
        return [
            "category-tone-gold",
            "category-tone-sage",
            "category-tone-lavender",
            "category-tone-rose",
            "category-tone-blue"
        ][index % 5];
    }

    function getProductCount(category) {

        return products.filter(function (product) {

            return String(product.category || "").trim().toLowerCase()
                === category.trim().toLowerCase();

        }).length;
    }

    function showMessage(text, type) {

        if (!message) return;

        message.textContent = text;
        message.className = "velora-category-message " + (type || "");

    }

    function clearMessage() {

        if (!message) return;

        message.textContent = "";
        message.className = "velora-category-message";

    }

    // =========================================
    // UPDATE OVERVIEW
    // =========================================

    function updateOverview() {

        if (totalCount) {
            totalCount.textContent = categories.length;
        }

        if (activeCount) {
            activeCount.textContent = categories.length;
        }

        if (totalProducts) {
            totalProducts.textContent = products.length;
        }

    }

    // =========================================
    // RENDER CATEGORY CARDS
    // =========================================

    function renderCategories() {

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const filteredCategories = categories.filter(function (category) {
            return category.toLowerCase().includes(searchTerm);
        });

        categoryList.innerHTML = "";

        if (filteredCategories.length === 0) {

            if (emptyState) {
                emptyState.hidden = false;
            }

            updateOverview();
            return;
        }

        if (emptyState) {
            emptyState.hidden = true;
        }

        filteredCategories.forEach(function (category) {

            const originalIndex = categories.findIndex(function (item) {
                return item.toLowerCase() === category.toLowerCase();
            });

            const productCount = getCategoryCount(category);

            const card = document.createElement("article");

            card.className =
                "velora-category-card " + getCategoryClass(originalIndex);

            card.innerHTML = `
                <div class="velora-category-card-top">

                    <div class="velora-category-icon">
                        ${getCategoryIcon(category)}
                    </div>

                    <span class="velora-category-number">
                        COLLECTION ${String(originalIndex + 1).padStart(2, "0")}
                    </span>

                </div>

                <div class="velora-category-card-content">

                    <h3>${escapeHTML(category)}</h3>

                    <p>
                        ${productCount}
                        ${productCount === 1 ? "product" : "products"}
                        in this collection
                    </p>

                </div>

                <div class="velora-category-card-actions">

                    <button
                        type="button"
                        class="velora-edit-category"
                        data-category="${escapeHTML(category)}">
                        EDIT CATEGORY
                    </button>

                    <button
                        type="button"
                        class="velora-delete-category"
                        data-category="${escapeHTML(category)}"
                        aria-label="Delete ${escapeHTML(category)}">
                        DELETE
                    </button>

                </div>
            `;

            categoryList.appendChild(card);

        });

        updateOverview();

    }

    function getCategoryCount(category) {
        return getProductCount(category);
    }

    // =========================================
    // OPEN AND CLOSE FORM
    // =========================================

    function openForm(category) {

        editingCategory = category || null;

        categoryForm.reset();
        clearMessage();

        if (editingCategory) {

            categoryInput.value = editingCategory;

            if (formTitle) {
                formTitle.textContent = "Edit Category";
            }

            if (saveButton) {
                saveButton.textContent = "Update Category";
            }

        } else {

            if (formTitle) {
                formTitle.textContent = "Create a New Category";
            }

            if (saveButton) {
                saveButton.textContent = "Save Category";
            }

        }

        formPanel.hidden = false;

        formPanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        setTimeout(function () {
            categoryInput.focus();
        }, 150);

    }

    function closeForm() {

        formPanel.hidden = true;
        categoryForm.reset();

        editingCategory = null;
        clearMessage();

    }

    // =========================================
    // ADD / EDIT CATEGORY
    // =========================================

    categoryForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const newName = categoryInput.value.trim();

        clearMessage();

        if (!newName) {
            showMessage("Please enter a category name.", "error");
            categoryInput.focus();
            return;
        }

        if (newName.length < 2) {
            showMessage("Category name must contain at least 2 characters.", "error");
            categoryInput.focus();
            return;
        }

        const duplicate = categories.some(function (category) {

            return category.toLowerCase() === newName.toLowerCase()
                && (
                    !editingCategory ||
                    category.toLowerCase() !== editingCategory.toLowerCase()
                );

        });

        if (duplicate) {
            showMessage("This category already exists.", "error");
            categoryInput.focus();
            return;
        }

        if (editingCategory) {

            const index = categories.findIndex(function (category) {
                return category.toLowerCase() === editingCategory.toLowerCase();
            });

            if (index === -1) {
                showMessage("Category could not be found. Please refresh the page.", "error");
                return;
            }

            const oldName = categories[index];

            categories[index] = newName;

            // Update matching product category names too
            products.forEach(function (product) {

                if (
                    String(product.category || "").trim().toLowerCase()
                    === oldName.toLowerCase()
                ) {
                    product.category = newName;
                }

            });

            if (!saveCategories()) return;

            saveProducts();

            showMessage("Category updated successfully!", "success");

        } else {

            categories.push(newName);

            if (!saveCategories()) {
                categories.pop();
                return;
            }

            showMessage("New category added successfully!", "success");

        }

        renderCategories();

        // Close form after a successful save
        setTimeout(function () {
            closeForm();
            renderCategories();
        }, 700);

    });

    // =========================================
    // EDIT / DELETE BUTTON ACTIONS
    // =========================================

    categoryList.addEventListener("click", function (event) {

        const editButton = event.target.closest(".velora-edit-category");
        const deleteButton = event.target.closest(".velora-delete-category");

        if (editButton) {

            openForm(editButton.dataset.category);
            return;

        }

        if (deleteButton) {

            const category = deleteButton.dataset.category;
            const count = getProductCount(category);

            if (count > 0) {

                alert(
                    `This category contains ${count} product(s).\n\nPlease move or remove those products before deleting this category.`
                );

                return;
            }

            const confirmed = confirm(
                `Are you sure you want to delete "${category}"?\n\nThis action cannot be undone.`
            );

            if (!confirmed) return;

            categories = categories.filter(function (item) {
                return item.toLowerCase() !== category.toLowerCase();
            });

            if (!saveCategories()) {
                loadData();
                renderCategories();
                return;
            }

            renderCategories();

            showMessage(
                `"${category}" has been deleted successfully.`,
                "success"
            );

        }

    });

    // =========================================
    // SEARCH
    // =========================================

    if (searchInput) {
        searchInput.addEventListener("input", renderCategories);
    }

    // =========================================
    // FORM BUTTONS
    // =========================================

    if (showFormButton) {
        showFormButton.addEventListener("click", function () {
            openForm(null);
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeForm);
    }

    if (cancelSecondary) {
        cancelSecondary.addEventListener("click", closeForm);
    }

    // =========================================
    // REFRESH WHEN OTHER PAGES CHANGE DATA
    // =========================================

    window.addEventListener("storage", function (event) {

        if (
            event.key === STORAGE_KEY ||
            event.key === PRODUCTS_KEY
        ) {
            loadData();
            renderCategories();
        }

    });

    // =========================================
    // INITIALISE
    // =========================================

    loadData();
    renderCategories();

});
