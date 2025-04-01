document.addEventListener('DOMContentLoaded', async function () {
    const wishlistElement = document.getElementById("wishlist-data");
    if (wishlistElement) {
        domainApi = wishlistElement.getAttribute("data-domain-generate-api");
        customerId = wishlistElement.getAttribute("data-customer-id");
        shopDomain = wishlistElement.getAttribute("data-shop-domain");
        iconHeartEmpty = wishlistElement.getAttribute("data-icon-heart-empty");
        iconHeartBlack = wishlistElement.getAttribute("data-icon-heart-black");
        wishlistTitle = wishlistElement.getAttribute("data-wishlist-title");
        loginRequired = wishlistElement.getAttribute("data-login-required");
        getWishlistUrl = `${domainApi}/api/shopify/wishlists/short/customers/${customerId}`;
        wishlistAdded = wishlistElement.getAttribute("data-wishlist-added");
        productListPage = wishlistElement.getAttribute("data-wishlist-page") == 'PLP' ? true : false;
    }

    document.addEventListener("facetRenderComplete", async () => {
        await initializeWishlist();
    });

    if (productListPage) {
        await initializeWishlist();
    }

    if (productListPage === false) {
        if (customerId) {
            fetchWishlistPDP();
        }
        const variantInput = document.querySelector('.product-variant-id');
        const wishlistButton = document.querySelector('.wishlist-button');

        updateWishlistButtonPDP();

        if (variantInput && wishlistButton) {
            const observer = new MutationObserver(() => {
                if (customerId) {
                    fetchWishlistPDP();
                }
                updateWishlistButtonPDP();
            });
            observer.observe(variantInput, { attributes: true, attributeFilter: ['value'] });
        }
    }
});

// Init wishlist in product list
async function initializeWishlist() {
    await loadDataWishlist();

    // Update wishlist icons
    document.querySelectorAll('.wishlist-icon-plp').forEach(wishlistButton => {
        wishlistButton.name = 'add_wishlist';
        wishlistButton.innerHTML = `<span class="svg-wrapper pr-2"><img src="${iconHeartEmpty}" alt="Wishlist Icon"></span>`;
    });

    if (data.length > 0) {
        updateWishlistButtons();
    }

    // Optimize event delegation for radio button changes
    document.body.addEventListener("change", function (e) {
        if (e.target.matches(`input[type="radio"][data-section-id]`)) {
            var sectionId = e.target.getAttribute("data-section-id");
            var card = e.target.closest(`.card-product-custom-div[data-section-id="${sectionId}"]`);
            var variantId = e.target.getAttribute("data-variant-id");

            if (card) {
                var wishlistButton = card.querySelector(".wishlist-icon-plp");
                if (wishlistButton) {
                    wishlistButton.setAttribute("data-variant-id", variantId);
                    updateWishlistButton(wishlistButton, variantId);
                }
            }
        }
    });
}

// Fetch and apply button in PDP
function fetchWishlistPDP() {
    fetch(getWishlistUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Shop-Domain': shopDomain,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const variantValue = document.querySelector('.product-variant-id').value;
            const wishlistButton = document.querySelector('.wishlist-button');
            wishlistButton.style.display = 'flex';
            wishlistButton['name'] = 'add_wishlist';
            wishlistButton.innerHTML = `<span class="svg-wrapper pr-2"><img src="${iconHeartEmpty}" alt="Wishlist Icon" width="20"></span> &nbsp; ${wishlistTitle}`;
            if (data.length > 0) {
                for (const wishlist of data) {
                    if (wishlist.product_variant_id == variantValue) {
                        wishlistButton['name'] = 'remove_wishlist';
                        wishlistButton.innerHTML = `<span class="svg-wrapper pr-2"><img src="${iconHeartBlack}" alt="Wishlist Icon" width="20"></span> &nbsp; ${wishlistTitle}`;
                        break;
                    }
                }
            } else {
                wishlistButton['name'] = 'add_wishlist';
                wishlistButton.innerHTML = `<span class="svg-wrapper pr-2"><img src="${iconHeartEmpty}" alt="Wishlist Icon" width="20"></span> &nbsp; ${wishlistTitle}`;
            }
        })
        .catch((error) => console.error('Error fetching wishlist:', error));
}

// Update wishlist icon in PLP
function updateWishlistButton(wishlistButton, variantId) {
    wishlistButton.name = 'add_wishlist';
    wishlistButton.innerHTML = `<span class="svg-wrapper pr-2"><img src="${iconHeartEmpty}" alt="Wishlist Icon"></span>`;
    if (data.length > 0) {
        let isInWishlist = data.some(wishlist => wishlist.product_variant_id == variantId);
        if (isInWishlist) {
            wishlistButton.name = 'remove_wishlist';
            wishlistButton.innerHTML = `<span class="svg-wrapper pr-2"><img src="${iconHeartBlack}" alt="Wishlist Icon"></span>`;
        }
    }
}

// Function to update all wishlist buttons when page loads
function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-icon-plp').forEach(wishlistButton => {
        let variantId = wishlistButton.getAttribute("data-variant-id");
        updateWishlistButton(wishlistButton, variantId);
    });
}

// Load all wishlist
async function loadDataWishlist() {
    if (!customerId) {
        return data = {};
    }
    try {
        const response = await fetch(getWishlistUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Shop-Domain": shopDomain,
            },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        return data = await response.json();
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return data = {};
    }
}

// Handle add or remove wishlist
async function handleWishlist(button) {
    const variantId = button.value;

    if (!variantId) {
        console.error("Variant ID is missing.");
        return;
    }

    const isRemoving = button.name === "remove_wishlist";
    const url = isRemoving
        ? `${domainApi}/api/shopify/wishlists/customers/${customerId}/delete/${variantId}`
        : `${domainApi}/api/shopify/wishlists/customers/${customerId}`;

    try {
        const response = await fetch(url, {
            method: isRemoving ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Shop-Domain": shopDomain,
            },
            ...(isRemoving === false && {
                body: JSON.stringify({
                    product_variant_id: button.value,
                }),
            }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        button.name = isRemoving ? "add_wishlist" : "remove_wishlist";
        if (productListPage) {
            button.innerHTML = `<span class="svg-wrapper pr-2"><img src="${isRemoving ? iconHeartEmpty : iconHeartBlack}" alt="Wishlist Icon"></span>`;
            await loadDataWishlist();
        } else {
            button.innerHTML = `<span class="svg-wrapper pr-2"><img src="${isRemoving ? iconHeartEmpty : iconHeartBlack}" alt="Wishlist Icon"></span> &nbsp; ${wishlistTitle}`;
        }
        setTimeout(fetchWishlist, 100);
        if (isRemoving === false) {
            alert(wishlistAdded);
        }
    } catch (error) {
        console.error("Error updating wishlist:", error);
    }
}

// Update the wishlist button value
function updateWishlistButtonPDP() {
    const wishlistButton = document.querySelector('.wishlist-button');
    if (wishlistButton) {
        wishlistButton.value = document.querySelector('.product-variant-id')?.value || '';
    }
}