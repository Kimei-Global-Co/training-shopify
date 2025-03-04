document.addEventListener('DOMContentLoaded', function () {
    var productGrids = document.querySelectorAll('.grid.product-grid');

    productGrids.forEach(function (productGrid) {
        var sectionId = productGrid.getAttribute('data-section-id');

        productGrid.addEventListener('change', function (e) {
            if (e.target.matches('input[type="radio"][data-section-id="' + sectionId + '"]')) {
                var card = e.target.closest(`.card-product-custom-div[data-section-id="${sectionId}"]`);
                var variantId = e.target.getAttribute('data-variant-id');

                // Check if the variant data is already available
                if (!window['variantDataMap' + sectionId.replace(/-/g, '_')]) {
                    window['variantDataMap' + sectionId.replace(/-/g, '_')] = {};
                }

                var variantDataMap = window['variantDataMap' + sectionId.replace(/-/g, '_')];

                if (variantDataMap[variantId]) {
                    updateProductInfo(card, variantDataMap[variantId]);
                } else {
                    // Fetch variant data via AJAX
                    fetch(`/products/${e.target.getAttribute('data-product-handle')}.js`)
                        .then(response => response.json())
                        .then(productData => {
                            var selectedVariant = productData.variants.find(variant => variant.id == variantId);
                            if (selectedVariant) {
                                variantDataMap[variantId] = {
                                    imageUrl: selectedVariant.featured_image ? selectedVariant.featured_image.src : '',
                                    productUrl: `${productData.url}?variant=${variantId}`,
                                    price: selectedVariant.price
                                };

                                updateProductInfo(card, variantDataMap[variantId]);
                            } else {
                                console.error('Variant not found in product data:', variantId);
                            }
                        })
                        .catch(error => console.error('Error fetching product data:', error));
                }
            } else {
                console.log('Change detected, but not on a swatch.');
            }
        });
    });

    function updateProductInfo(card, variantData) {
        if (!variantData) return;

        // Update the product image with lazy loading logic
        var productImageElement = card.querySelector('.card__media img');
        if (productImageElement) {
            var lazyLoadAllVariants = card.getAttribute('data-lazy-load-all-variants') === 'true';
            if (lazyLoadAllVariants) {
                var preloadedImage = card.querySelector(`img[data-variant-id="${variantData.variantId}"]`);
                if (preloadedImage) {
                    productImageElement.src = preloadedImage.src;
                    productImageElement.srcset = preloadedImage.srcset;
                } else {
                    console.log('Matching preloaded image not found for variant:', variantData.variantId);
                }
            } else {
                var dynamicSrcset = [
                    variantData.imageUrl + '?width=165 165w',
                    variantData.imageUrl + '?width=360 360w',
                    variantData.imageUrl + '?width=533 533w',
                    variantData.imageUrl + '?width=720 720w',
                    variantData.imageUrl + '?width=940 940w',
                    variantData.imageUrl + '?width=1066 1066w'
                ].join(', ');

                productImageElement.srcset = dynamicSrcset;
                productImageElement.src = variantData.imageUrl;
            }
        } else {
            console.log('No product image element found in this card.');
        }

        // Update the product URL
        var productLinks = card.querySelectorAll('a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"]');
        productLinks.forEach(function (link) {
            link.href = variantData.productUrl;
        });
    }
});
