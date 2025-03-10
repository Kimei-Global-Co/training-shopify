document.addEventListener('DOMContentLoaded', function() {
    function waitForVariantData(callback) {
        let attempts = 0;
        let interval = setInterval(() => {
            if (window.variantDataMap && Object.keys(window.variantDataMap).length > 0) {
                clearInterval(interval);
                callback();
            }
            attempts++;
            if (attempts > 10) { // Dừng sau 10 lần kiểm tra (mỗi 500ms)
                clearInterval(interval);
                console.error("variantDataMap vẫn chưa có dữ liệu sau 5 giây!");
            }
        }, 500); // Kiểm tra mỗi 500ms
    }

    waitForVariantData(() => {
        console.log("variantDataMap is ready:", window.variantDataMap);
        initProductGrid(); // Gọi function xử lý logic sản phẩm
    });

    function initProductGrid() {
        var productGrids = document.querySelectorAll('.grid.product-grid');
        productGrids.forEach(function(productGrid) {
            var sectionId = productGrid.getAttribute('data-section-id');
            var variantDataMap = window['variantDataMap'];

            productGrid.addEventListener('change', function(e) {
                if (e.target.matches('input[type="radio"][data-section-id="' + sectionId + '"]')) {
                    var card = e.target.closest(`.card-product-custom-div[data-section-id="${sectionId}"]`);
                    var variantId = e.target.getAttribute('data-variant-id');
                    var variantData = variantDataMap[variantId];
                    if (!variantData) {
                        console.warn("No data found for variant:", variantId);
                        return;
                    }
                    
                    var productImageElement = card.querySelector('.card__media img');
                    if (productImageElement) {
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

                    var productLinks = card.querySelectorAll('a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"]');
                    productLinks.forEach(function(link) {
                        link.href = variantData.productUrl;
                    });
                }
            });
        });
    }
});
