// Preloader — fires on DOMContentLoaded so it doesn't wait for images
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => { preloader.style.display = 'none'; }, 300);
        }, 400);
    }
});

document.addEventListener('DOMContentLoaded', () => {


    // 1. Image Gallery Thumbnail Logic
    const mainImage = document.querySelector('#main-product-img');
    const thumbnails = document.querySelectorAll('.thumb');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Remove active class from all
                thumbnails.forEach(t => t.classList.remove('active'));
                // Add to clicked
                thumb.classList.add('active');

                // Swap main image source
                const newSrc = thumb.getAttribute('data-img');

                // Optional fade effect
                mainImage.style.opacity = 0;
                setTimeout(() => {
                    mainImage.src = newSrc;
                    mainImage.style.opacity = 1;
                }, 150);
            });
        });
    }

    // 2. Quantity Selector Logic
    const qtyInput = document.getElementById('qty-input');
    const btnMinus = document.querySelector('.qty-btn.minus');
    const btnPlus = document.querySelector('.qty-btn.plus');

    if (qtyInput && btnMinus && btnPlus) {
        btnMinus.addEventListener('click', () => {
            let currentVal = parseInt(qtyInput.value);
            if (currentVal > 1) {
                qtyInput.value = currentVal - 1;
            }
        });

        btnPlus.addEventListener('click', () => {
            let currentVal = parseInt(qtyInput.value);
            let maxVal = parseInt(qtyInput.getAttribute('max')) || 10;
            if (currentVal < maxVal) {
                qtyInput.value = currentVal + 1;
            }
        });
    }

    // 3. Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Find target
                const targetId = btn.getAttribute('data-tab');

                // Reset all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Activate clicked
                btn.classList.add('active');
                document.getElementById('tab-' + targetId).classList.add('active');
            });
        });
    }
});
