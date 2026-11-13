
document.addEventListener("DOMContentLoaded", function () {

    const wishlistContainer = document.getElementById("wishlist-items");
    const emptyMessage = document.getElementById("empty-wishlist");

    if (!wishlistContainer || !emptyMessage) return;

    // Load wishlist safely
    let wishlist = [];

    try {
        const savedWishlist = JSON.parse(
            localStorage.getItem("veloraWishlist")
        );

        wishlist = Array.isArray(savedWishlist) ? savedWishlist : [];

    } catch (error) {
        wishlist = [];
    }

    function saveWishlist() {
        try {
            localStorage.setItem(
                "veloraWishlist",
                JSON.stringify(wishlist)
            );

            displayWishlist();

        } catch (error) {
            alert("Unable to update your wishlist. Please try again.");
        }
    }

    function displayWishlist() {

        wishlistContainer.innerHTML = "";

        if (wishlist.length === 0) {

            emptyMessage.hidden = false;

            return;
        }

        emptyMessage.hidden = true;

        wishlist.forEach(function (item, index) {

            const productCard = document.createElement("div");
            productCard.className = "wishlist-item";

            const productName =
                typeof item === "string"
                    ? item
                    : item.productName || item.name || item.title || "Product";

            // Product image
            if (typeof item === "object" && item.image) {

                const image = document.createElement("img");

                image.src = item.image;
                image.alt = productName;
                image.className = "wishlist-product-image";

                productCard.appendChild(image);
            }

            // Product name
            const name = document.createElement("h3");
            name.textContent = productName;

            productCard.appendChild(name);

            // Product price
            if (typeof item === "object" && item.price !== undefined) {

                const price = document.createElement("p");

                price.textContent =
                    "₹" + Number(
                        String(item.price).replace(/[^\d.]/g, "")
                    ).toLocaleString("en-IN");

                productCard.appendChild(price);
            }

            // Remove button
            const removeButton = document.createElement("button");

            removeButton.textContent = "REMOVE FROM WISHLIST";
            removeButton.type = "button";
            removeButton.className = "remove-wishlist-button";

            removeButton.addEventListener("click", function () {

                wishlist.splice(index, 1);

                saveWishlist();
            });

            productCard.appendChild(removeButton);

            wishlistContainer.appendChild(productCard);

        });
    }

    displayWishlist();

});
