
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. GET PRODUCT INFORMATION FROM URL
    // =====================================

    const params = new URLSearchParams(window.location.search);

    const productName = params.get("name") || "VÊLORA Fashion";
    const productPrice = Number(params.get("price")) || 0;
    const originalPrice = Number(params.get("originalPrice")) || productPrice;
    const productCategory = params.get("category") || "COLLECTION";
    const productImage = params.get("image") || "../images/default-product.jpg";
    const productMaterial = params.get("material") || "Premium Fabric";
    const deliveryDays = Number(params.get("deliveryDays")) || 5;

    const availableSizes = params.get("sizes")
        ? params.get("sizes").split(",").map(function (size) {
            return size.trim();
        })
        : ["S", "M", "L", "XL"];


    // =====================================
    // 2. PRODUCT COLOUR IMAGES
    // =====================================

    const shirtColourImages = {
        Black: "../images/shirt1.jpg",
        White: "../images/shirt2.jpg",
        Beige: "../images/shirt3.jpg",
        Brown: "../images/shirt4.jpg"
    };

    const coatColourImages = {
        Black: "../images/coat1.jpg",
        Beige: "../images/coat2.jpg",
        "Dark Brown": "../images/coat3.jpg",
        "Charcoal Grey": "../images/coat4.jpg"
    };

    // Classic Party Dress currently has one image.
    const partyColourImages = {
        Blue: "../images/gown1.png"
    };


    // =====================================
    // 3. IDENTIFY PRODUCTS
    // =====================================

    const normalizedName = productName.trim().toLowerCase();
    const normalizedCategory = productCategory.trim().toUpperCase();

    const hasShirtVariants =
        normalizedName === "classic casual shirt" &&
        normalizedCategory === "MEN";

    const hasCoatVariants =
        normalizedName === "casual elegant coat" &&
        normalizedCategory === "MEN";

    // Satin uses two images, not colour options.
    const hasSatinGallery =
        normalizedName === "elegant satin midi dress" &&
        normalizedCategory === "WOMEN";

    // Floral Summer Dress has only one image.
    const hasFloralVariants = false;

    const hasPartyVariants =
        normalizedName === "classic party dress" &&
        normalizedCategory === "WOMEN";

    const isFloralDress =
        normalizedName === "floral summer dress" &&
        normalizedCategory === "WOMEN";


    // =====================================
    // 4. SELECT COLOUR VARIANTS
    // =====================================

    const hasColourVariants =
        hasShirtVariants ||
        hasCoatVariants ||
        hasFloralVariants ||
        hasPartyVariants;

    let colourImages = {};

    if (hasShirtVariants) {

        colourImages = shirtColourImages;

    } else if (hasCoatVariants) {

        colourImages = coatColourImages;

    } else if (hasPartyVariants) {

        colourImages = partyColourImages;

    }

    const colourNames = Object.keys(colourImages);

    let selectedColour = hasColourVariants
        ? colourNames[0]
        : "";


    // =====================================
    // 5. PRODUCT IMAGE GALLERY
    // =====================================

    const galleryImages = hasSatinGallery
        ? ["../images/satin1.png", "../images/satin2.png"]
        : [];

    let currentProductImage = isFloralDress
        ? "../images/floral1.png"
        : hasSatinGallery
            ? galleryImages[0]
            : hasColourVariants
                ? colourImages[selectedColour]
                : productImage;


    // =====================================
    // 6. GET PAGE ELEMENTS
    // =====================================

    const productImageElement = document.getElementById("detail-image");
    const thumbnailsContainer = document.getElementById("detail-thumbnails");

    const nameElement = document.getElementById("detail-name");
    const priceElement = document.getElementById("detail-price");
    const categoryElement = document.getElementById("detail-category");

    const materialElement = document.getElementById("detail-material");
    const collectionElement = document.getElementById("detail-collection");
    const deliveryElement = document.getElementById("detail-delivery");

    const messageElement = document.getElementById("detail-message");
    const sizeSelect = document.getElementById("detail-size");
    const quantityInput = document.getElementById("detail-quantity");

    const addCartButton = document.getElementById("detail-add-cart");
    const buyNowButton = document.getElementById("detail-buy-now");
    const wishlistButton = document.getElementById("detail-wishlist");

    const colourContainer = document.getElementById("detail-colours");
    const selectedColourText = document.getElementById("selected-colour");


    // =====================================
    // 7. HELPER FUNCTIONS
    // =====================================

    function showMessage(message, success = false) {

        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.style.color = success ? "green" : "red";

    }


    function getStorageData(key) {

        try {

            const saved = JSON.parse(localStorage.getItem(key));

            return Array.isArray(saved) ? saved : [];

        } catch (error) {

            return [];

        }

    }


    function formatPrice(price) {

        return "₹" + Number(price).toLocaleString("en-IN");

    }


    function updateProductImage(imagePath) {

        currentProductImage = imagePath;

        if (productImageElement) {

            productImageElement.onerror = function () {

                this.onerror = null;
                this.src = productImage;

            };

            productImageElement.src = imagePath;

        }

    }


    // =====================================
    // 8. DISPLAY PRODUCT INFORMATION
    // =====================================

    if (nameElement) {
        nameElement.textContent = productName;
    }

    if (priceElement) {
        priceElement.textContent = formatPrice(productPrice);
    }

    if (categoryElement) {
        categoryElement.textContent = productCategory;
    }

    if (materialElement) {
        materialElement.textContent = productMaterial;
    }

    if (collectionElement) {

        collectionElement.textContent =
            "VÊLORA " + productCategory + " Collection";

    }

    if (deliveryElement) {

        deliveryElement.textContent =
            "Estimated " + deliveryDays + " business days";

    }

    if (productImageElement) {

        productImageElement.onerror = function () {

            this.onerror = null;
            this.src = productImage;

        };

        productImageElement.src = currentProductImage;

    }


    // =====================================
    // 9. RENDER SATIN IMAGE THUMBNAILS
    // =====================================

    if (thumbnailsContainer) {

        thumbnailsContainer.innerHTML = "";

        if (hasSatinGallery) {

            galleryImages.forEach(function (imagePath, index) {

                const thumbnailButton = document.createElement("button");

                thumbnailButton.type = "button";
                thumbnailButton.className = "product-thumbnail";

                thumbnailButton.setAttribute(
                    "aria-label",
                    "Product image " + (index + 1)
                );

                if (index === 0) {

                    thumbnailButton.classList.add("active");

                }

                const thumbnailImage = document.createElement("img");

                thumbnailImage.src = imagePath;

                thumbnailImage.alt =
                    productName + " image " + (index + 1);

                thumbnailImage.onerror = function () {

                    this.onerror = null;
                    this.src = productImage;

                };

                thumbnailButton.appendChild(thumbnailImage);

                thumbnailButton.addEventListener("click", function () {

                    updateProductImage(imagePath);

                    thumbnailsContainer
                        .querySelectorAll(".product-thumbnail")
                        .forEach(function (thumbnail) {

                            thumbnail.classList.remove("active");

                        });

                    thumbnailButton.classList.add("active");

                });

                thumbnailsContainer.appendChild(thumbnailButton);

            });

        }

    }


    // =====================================
    // 10. COLOUR SELECTION
    // =====================================

    if (hasColourVariants && colourContainer) {

        colourContainer.hidden = false;
        colourContainer.style.display = "";

        if (selectedColourText) {

            selectedColourText.hidden = false;
            selectedColourText.style.display = "";

        }

        const colourStyles = {

            Black: "#222222",
            White: "#f5f1e8",
            Beige: "#c9ad8a",
            Brown: "#754c35",

            "Dark Brown": "#4b2e20",
            "Charcoal Grey": "#454545",

            Blue: "#234b83"

        };

        colourContainer.innerHTML = "";

        colourNames.forEach(function (colour, index) {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "colour-swatch";

            if (index === 0) {

                button.classList.add("selected");

            }

            button.dataset.colour = colour;

            button.setAttribute("aria-label", colour);

            button.title = colour;

            button.style.backgroundColor =
                colourStyles[colour] || "#cccccc";

            button.addEventListener("click", function () {

                selectedColour = colour;

                updateProductImage(colourImages[colour]);

                colourContainer
                    .querySelectorAll(".colour-swatch")
                    .forEach(function (swatch) {

                        swatch.classList.remove("selected");

                    });

                button.classList.add("selected");

                if (selectedColourText) {

                    selectedColourText.textContent =
                        "Selected colour: " + colour;

                }

            });

            colourContainer.appendChild(button);

        });

        if (selectedColourText) {

            selectedColourText.textContent =
                "Selected colour: " + selectedColour;

        }

        updateProductImage(colourImages[selectedColour]);

    } else {

        if (colourContainer) {

            colourContainer.innerHTML = "";
            colourContainer.hidden = true;
            colourContainer.style.display = "none";

        }

        if (selectedColourText) {

            selectedColourText.textContent = "";
            selectedColourText.hidden = true;
            selectedColourText.style.display = "none";

        }

    }


    // =====================================
    // 11. DISPLAY AVAILABLE SIZES
    // =====================================

    if (sizeSelect) {

        sizeSelect.innerHTML =
            '<option value="">Choose your size</option>';

        availableSizes.forEach(function (size) {

            const option = document.createElement("option");

            option.value = size;
            option.textContent = size;

            sizeSelect.appendChild(option);

        });

    }

    const sizeGuide = document.querySelector(".size-guide-note");

    if (sizeGuide) {

        sizeGuide.textContent =
            "Available sizes: " + availableSizes.join(", ");

    }


    // =====================================
    // 12. GET SELECTED PRODUCT
    // =====================================

    function getSelectedProduct() {

        const selectedSize = sizeSelect ? sizeSelect.value : "";

        const quantity = Number(
            quantityInput ? quantityInput.value : 1
        );

        if (!selectedSize) {

            showMessage("Please select a size.");
            return null;

        }

        if (!availableSizes.includes(selectedSize)) {

            showMessage("Please select a valid size.");
            return null;

        }

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {

            showMessage("Please enter a quantity between 1 and 10.");
            return null;

        }

        if (productPrice <= 0) {

            showMessage("Product price is invalid.");
            return null;

        }

        const product = {

            name: productName,
            price: productPrice,
            originalPrice: originalPrice,
            category: productCategory,
            image: currentProductImage,
            material: productMaterial,
            size: selectedSize,
            quantity: quantity

        };

        if (hasColourVariants) {

            product.colour = selectedColour;

        }

        return product;

    }


    // =====================================
    // 13. UPDATE CART COUNT
    // =====================================

    function updateCartCount() {

        const cart = getStorageData("veloraCart");

        const totalItems = cart.reduce(function (total, item) {

            return total + Number(item.quantity || 1);

        }, 0);

        const cartCount = document.getElementById("cart-count");

        if (cartCount) {

            cartCount.textContent = totalItems;

        }

    }

    updateCartCount();


    // =====================================
    // 14. ADD TO BAG
    // =====================================

    if (addCartButton) {

        addCartButton.addEventListener("click", function () {

            const product = getSelectedProduct();

            if (!product) return;

            const cart = getStorageData("veloraCart");

            const existingItem = cart.find(function (item) {

                return (
                    item.name === product.name &&
                    item.size === product.size &&
                    (item.colour || "") === (product.colour || "")
                );

            });

            if (existingItem) {

                existingItem.quantity =
                    Number(existingItem.quantity || 1) + product.quantity;

            } else {

                cart.push(product);

            }

            localStorage.setItem(
                "veloraCart",
                JSON.stringify(cart)
            );

            updateCartCount();

            showMessage(
                "Product added to your bag successfully!",
                true
            );

        });

    }


    // =====================================
    // 15. BUY NOW
    // =====================================

    if (buyNowButton) {

        buyNowButton.addEventListener("click", function () {

            const product = getSelectedProduct();

            if (!product) return;

            localStorage.setItem(
                "veloraBuyNow",
                JSON.stringify([product])
            );

            window.location.href = "checkout.html?mode=buy-now";

        });

    }


    // =====================================
    // 16. ADD TO WISHLIST
    // =====================================

    if (wishlistButton) {

        wishlistButton.addEventListener("click", function () {

            const wishlist = getStorageData("veloraWishlist");

            const alreadyExists = wishlist.some(function (item) {

                if (typeof item === "string") {

                    return item === productName;

                }

                return item && item.name === productName;

            });

            if (!alreadyExists) {

                const wishlistProduct = {

                    name: productName,
                    price: productPrice,
                    image: currentProductImage,
                    category: productCategory

                };

                if (hasColourVariants) {

                    wishlistProduct.colour = selectedColour;

                }

                wishlist.push(wishlistProduct);

                localStorage.setItem(
                    "veloraWishlist",
                    JSON.stringify(wishlist)
                );

                showMessage(
                    "Product added to your wishlist!",
                    true
                );

            } else {

                showMessage(
                    "This product is already in your wishlist."
                );

            }

        });

    }

});
