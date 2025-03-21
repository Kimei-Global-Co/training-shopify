const wishlistElement = document.getElementById("wishlist-list");
let domainApi = wishlistElement.getAttribute("data-domain-generate-api");
let confirm_remove = wishlistElement.getAttribute("data-confirm-remove");
let removeWishItem = wishlistElement.getAttribute("data-remove-wishlist");
let addToCartButton = wishlistElement.getAttribute("data-add-to-cart");
let soldOut = wishlistElement.getAttribute("data-sold-out");

function confirmRemoveWishlistItem(event) {
  event.preventDefault();

  if (confirm(confirm_remove)) {
    removeWishlistItem(event);
  }
}

function removeWishlistItem(event) {
  const wishlistItemId = event.target.getAttribute('data-id');
  const removeWishlistItemUrl = `${domainApi}/api/shopify/wishlists/customers/${customerId}/delete/${wishlistItemId}`;
  fetch(removeWishlistItemUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Shop-Domain': shopDomain,
    },
  })
    .then((response) => response.json())
    .then(() => {
      fetchWishlist();
      event.target.closest('li').remove();
      const ul = document.querySelector('ul#wishlist-list');
      if (ul.querySelectorAll('li').length === 0) {
        ul.style.display = 'none';
        document.querySelector('#no-data-wishlist').style.display = 'block';
      }
    })
    .catch((error) => {
      console.error('Error removing wishlist item:', error);
    });
}

// Get wishlist with details
const getWishlistUrl = `${domainApi}/api/shopify/wishlists/customers/${customerId}`;
fetch(getWishlistUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Shop-Domain': shopDomain,
  },
})
  .then((response) => response.json())
  .then((data) => {
    document.querySelector('.loading-data').style.display = 'none';
    if (Array.isArray(data) && data.length > 0) {
      const wishlistItems = data;
      const wishlistContainer = document.querySelector('#wishlist-list');

      // Ensure container is visible
      wishlistContainer.style.display = 'block';
      document.querySelector('#no-data-wishlist').style.display = 'none';

      // Clear previous items
      wishlistContainer.innerHTML = '';

      wishlistItems.forEach((item) => {
        let formattedPrice;

        switch (item.currencyCode) {
          case 'VND':
            formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price);
            break;

          case 'USD':
            formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price);
            break;

          case 'JPY':
          default:
            formattedPrice = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(item.price);
            break;
        }
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <a class="block-wishlist-item" style="box-shadow: none;" href="${item.url}">
            <img src="${item.img_url}" alt="${item.title}" width="50">
            <span>
              ${item.title}<br>
              ${formattedPrice}
            </span>
          </a>
          <div class="block-button-wishlist">
            <button class="add-to-cart" data-id="${item.id}"
              ${item.inventory_quantity == 0
            ? 'disabled style="opacity: 0.5; cursor: not-allowed; background-color: gray;"'
            : `onclick="addToCart(${item.id})"`
          }>
              ${item.inventory_quantity == 0 ? soldOut : addToCartButton}
            </button>
            <button class="remove-wishlist-item" data-id="${item.id}" onclick="confirmRemoveWishlistItem(event)">
              ${removeWishItem}
            </button>
          </div>
        `;

        // Append to the wishlist container
        wishlistContainer.appendChild(listItem);
      });
    } else {
      document.querySelector('#no-data-wishlist').style.display = 'block';
    }
  })
  .catch((error) => {
    console.error('Error fetching wishlist:', error);
  });

// Add product to cart
const addToCart = async (variantId, quantity = 1) => {
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    });

    const data = await response.json();
    if (data) {
      window.location.href = '/cart';
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};