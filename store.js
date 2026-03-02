// Preloader — dismiss as soon as HTML is parsed (don't wait for images)
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


    // 1. Expanded Store Data Catalog
    const storeProducts = [
        {
            id: 1,
            name: "Patient Monitoring System",
            category: "Monitoring",
            price: 4500,
            image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
            description: "Continuous physiological tracking with integrated vitals display.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 2,
            name: "Advanced MRI Scanner",
            category: "Imaging",
            price: 1250000,
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            description: "High-resolution 3.0T magnetic resonance imaging system.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 3,
            name: "Portable Defibrillator",
            category: "Emergency",
            price: 2100,
            image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&q=80",
            description: "Automated external defibrillator (AED) for emergency response.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 4,
            name: "Surgical Microscope",
            category: "Surgical",
            price: 85000,
            image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
            description: "High-magnification optical system for neuro and micro-surgery.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 5,
            name: "Anesthesia Workstation",
            category: "Surgical",
            price: 45000,
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            description: "Comprehensive ventilation and agent delivery system.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 6,
            name: "Fetal Monitor",
            category: "Monitoring",
            price: 3200,
            image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
            description: "Advanced obstetric monitoring for maternal and fetal heartbeat.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 7,
            name: "Mobile Digital X-Ray",
            category: "Imaging",
            price: 65000,
            image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
            description: "Motorized portable radiography system for point-of-care imaging.",
            color: "#E8D8CF",
            inCart: false
        },
        {
            id: 8,
            name: "Emergency Transport Ventilator",
            category: "Emergency",
            price: 12000,
            image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&q=80",
            description: "Ruggedized, lightweight ventilator for pre-hospital and transport.",
            color: "#E8D8CF",
            inCart: false
        }
    ];

    let cartState = {
        items: []
    };

    // DOM Elements
    const gridContainer = document.getElementById('store-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cartTrigger = document.getElementById('cart-drawer-trigger');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');

    const cartItemsContainer = document.getElementById('cart-items-container');
    const noContentMsg = document.getElementById('no-content');
    const checkoutPane = document.getElementById('checkout-pane');
    const cartTotalEl = document.getElementById('cart-total');
    const globalCartCount = document.getElementById('global-cart-count');


    // 2. Render Grid Function
    function renderGrid(filterCategory = 'all') {
        gridContainer.innerHTML = '';

        const filteredProducts = filterCategory === 'all'
            ? storeProducts
            : storeProducts.filter(p => p.category === filterCategory);

        filteredProducts.forEach(item => {
            const inCart = cartState.items.some(cartItem => cartItem.id === item.id);
            const block = document.createElement('div');
            block.className = 'item-block';

            block.innerHTML = `
                <a href="product.html" style="text-decoration: none; color: inherit; display: block;">
                    <div class="image-area" style="background-color: ${item.color}; display: flex; justify-content: center; align-items: center; overflow: hidden;">
                        <img class="image" src="${item.image}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="name" style="font-family: var(--font-heading); font-weight: 600;">${item.name}</div>
                </a>
                <div class="description" style="opacity: 0.7; font-size: 0.9rem; margin-bottom: 1rem;">${item.description}</div>
                <div class="bottom-area" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="price" style="font-size: 1.5rem; font-weight: bold;">$${item.price.toLocaleString()}</div>
                    <div class="button ${inCart ? '-active' : ''}" id="store-add-btn-${item.id}" 
                         style="background-color: ${inCart ? '#3BC177' : 'var(--color-text-dark)'}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: background-color 0.3s; font-size: 0.9rem;">
                       ${inCart ? 'ADDED ✓' : 'ADD TO CART'}
                    </div>
                </div>
            `;

            // Attach event listener
            const btn = block.querySelector('.button');
            btn.addEventListener('click', () => addToCart(item.id));

            gridContainer.appendChild(block);
        });

        // Small reveal animation
        gsap.fromTo('.item-block',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
    }

    // 3. Filter Buttons Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Render
            const category = btn.getAttribute('data-filter');
            renderGrid(category);
        });
    });

    // 4. Cart Drawer Toggle Logic
    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartTrigger.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);


    // 5. Add to Cart Logic
    function addToCart(itemId) {
        const product = storeProducts.find(i => i.id === itemId);
        const exists = cartState.items.find(i => i.id === itemId);

        if (!exists) {
            cartState.items.push({ ...product, count: 1 });

            // Update Grid Button Visually
            const btn = document.getElementById(`store-add-btn-${itemId}`);
            if (btn) {
                btn.classList.add('-active');
                btn.style.backgroundColor = '#3BC177';
                btn.innerHTML = 'ADDED ✓';
            }

            // Immediately open drawer to show success
            openCart();
            updateCartUI();
        }
    }


    // 6. Update Drawer UI
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';

        const cartCount = cartState.items.length;
        globalCartCount.textContent = cartCount;

        if (cartCount === 0) {
            noContentMsg.style.display = 'block';
            checkoutPane.style.display = 'none';
        } else {
            noContentMsg.style.display = 'none';
            checkoutPane.style.display = 'block';

            let grandTotal = 0;

            cartState.items.forEach((item, index) => {
                grandTotal += (item.price * item.count);

                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.style.display = 'flex';
                cartItemEl.style.alignItems = 'flex-start';
                cartItemEl.style.gap = '16px';
                cartItemEl.style.padding = '16px 0';
                cartItemEl.style.borderBottom = '1px solid rgba(0,0,0,0.05)';

                cartItemEl.innerHTML = `
                    <div class="left item-image-wrapper" style="width: 80px; height: 80px; background-color: ${item.color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                        <img src="${item.image}" alt="${item.name}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
                    </div>
                    <div class="right" style="flex-grow: 1;">
                        <div class="name" style="font-weight: 600; font-family: var(--font-heading); font-size: 1.1rem; line-height: 1.2; margin-bottom: 6px;">${item.name}</div>
                        <div class="price" style="font-weight: 700; color: var(--color-primary); margin-bottom: 12px;">$${(item.price * item.count).toLocaleString()}</div>
                        
                        <div class="actions" style="display: flex; align-items: center; gap: 15px;">
                            <div class="quantity" style="display: flex; align-items: center; background: #f5f5f5; border-radius: 50px; padding: 2px;">
                                <button class="minus" data-index="${index}" style="width: 28px; height: 28px; border-radius: 50%; border: none; background: white; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-minus"></i></button>
                                <span class="count" style="width: 30px; text-align: center; font-size: 0.9rem; font-weight: 600;">${item.count}</span>
                                <button class="plus" data-index="${index}" style="width: 28px; height: 28px; border-radius: 50%; border: none; background: white; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                `;

                // Add Listeners
                cartItemEl.querySelector('.minus').addEventListener('click', (e) => decrement(e.currentTarget.dataset.index));
                cartItemEl.querySelector('.plus').addEventListener('click', (e) => increment(e.currentTarget.dataset.index));

                cartItemsContainer.appendChild(cartItemEl);
            });

            // Update Total
            cartTotalEl.textContent = `$${grandTotal.toLocaleString()}`;
        }
    }

    // 7. Increment/Decrement Logic
    function increment(index) {
        cartState.items[index].count++;
        updateCartUI();
    }

    function decrement(index) {
        if (cartState.items[index].count > 1) {
            cartState.items[index].count--;
            updateCartUI();
        } else {
            // Remove completely
            const removedItem = cartState.items[index];
            cartState.items.splice(index, 1);

            // Revert grid button
            const btn = document.getElementById(`store-add-btn-${removedItem.id}`);
            if (btn) {
                btn.classList.remove('-active');
                btn.style.backgroundColor = 'var(--color-text-dark)';
                btn.innerText = 'ADD TO CART';
            }

            updateCartUI();
        }
    }

    // Initialize Store
    renderGrid('all');
});
