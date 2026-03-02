// Preloader logic — use DOMContentLoaded (fires immediately after HTML is parsed,
// does NOT wait for images/fonts to download which caused product page to get stuck)
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 300);
        }, 400);
    }
});

// Safety fallback: if for any reason the above doesn't fire, force-hide after 2s
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader && preloader.style.display !== 'none') {
        preloader.style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Medical devices array. We need 12 pills.
    // To make them suddenly loop from left when they vanish on the right,
    // we distribute them within an active top-arc span (e.g. 105 degrees to -105 degrees).
    const pillsData = [
        { text: "MRI Scanners", img: "images/mri.webp" },
        { text: "CT Scanners", img: "images/ct.webp" },
        { text: "Ultrasound", img: "images/ultrasound.webp" },
        { text: "X-Ray Systems", img: "images/x-ray.webp" },

        { text: "Patient Monitors", img: "images/patient-monitor.webp" },
        { text: "Surgical Lasers", img: "images/surgical-laser.webp" },
        { text: "Ventilators", img: "images/ventilator.webp" },
        { text: "Defibrillators", img: "images/defibrillator.webp" },

        { text: "Infusion Pumps", img: "images/infusion-pump.webp" },
        { text: "Anesthesia Machines", img: "images/anesthesia-machine.webp" },
        { text: "EKG Systems", img: "images/ekg.webp" },
        { text: "Incubators", img: "images/incubator.webp" }
    ];

    const ARC_START = 105;  // Hidden far left
    const ARC_END = -105;   // Hidden far right
    const ARC_SPAN = ARC_START - ARC_END; // 210 degrees active span

    // Calculate dynamic base angles so they perfectly fill the designated arc span
    pillsData.forEach((p, index) => {
        p.baseAngle = ARC_START - (index * (ARC_SPAN / pillsData.length));
    });

    const container = document.getElementById("arcContainer");
    let pillElements = [];
    let currentRotationOffset = 0;
    let animationId = null;
    let isHovered = false;
    let radius = 0;

    function initPills() {
        container.innerHTML = '';
        pillElements = [];

        pillsData.forEach((p, index) => {
            const pill = document.createElement("div");
            // Determine the true side on initial load based on the base angle
            const isLeft = p.baseAngle >= 0;
            pill.className = `treatment-pill ${isLeft ? 'left' : 'right'}`;

            const imgHTML = `<div class="pill-icon" style="background-image: url('${p.img}')"></div>`;
            const textHTML = `<span>${p.text}</span>`;

            // Apply correct initial HTML structure based on starting angle side
            pill.innerHTML = isLeft ? imgHTML + textHTML : textHTML + imgHTML;
            pill.addEventListener('mouseenter', () => isHovered = true);
            pill.addEventListener('mouseleave', () => isHovered = false);

            container.appendChild(pill);
            pillElements.push({ el: pill, data: p });
        });

        updateRadius();
    }

    function updateRadius() {
        // Keep radius fairly large on mobile so pills don't bunch up/overlap
        // The CSS will handle the actual visual shrinking via transform: scale()
        radius = window.innerWidth >= 1024 ? 420 : 320;
    }

    function animatePills() {
        // Increment the global offset slowly. Pause if hovered.
        if (!isHovered) {
            currentRotationOffset -= 0.05; // Negative to rotate left-to-right clockwise over the arc
        }

        pillElements.forEach(item => {
            // Apply the global offset to the pill's base angle
            let rawAngle = item.data.baseAngle + currentRotationOffset;

            // Wrap the angle precisely back to the start side to create the instantaneous loop effect.
            // As soon as rawAngle drops below ARC_END (-105), it wraps to ARC_START (105).
            let currentAngle = ARC_END + (((rawAngle - ARC_END) % ARC_SPAN + ARC_SPAN) % ARC_SPAN);

            // Determine side dynamically based on current angle to flip layout
            // If angle is > 0, it's on the left side of the arc. If < 0, right side.
            const isLeft = currentAngle >= 0;

            // Update class and HTML structure if it crosses the center point (to keep avatar on outside edge)
            // CRITICAL FIX: Only modify the DOM/innerHTML if the state actually changes to avoid destroying 
            // image rendering every frame and causing them to vanish/minimize.
            if (isLeft && item.el.classList.contains('right')) {
                item.el.classList.remove('right');
                item.el.classList.add('left');
                const imgHTML = `<div class="pill-icon" style="background-image: url('${item.data.img}')"></div>`;
                const textHTML = `<span>${item.data.text}</span>`;
                item.el.innerHTML = imgHTML + textHTML;
            } else if (!isLeft && item.el.classList.contains('left')) {
                item.el.classList.remove('left');
                item.el.classList.add('right');
                const imgHTML = `<div class="pill-icon" style="background-image: url('${item.data.img}')"></div>`;
                const textHTML = `<span>${item.data.text}</span>`;
                item.el.innerHTML = textHTML + imgHTML;
            }

            // Convert angle to radians for coordinates
            const rad = currentAngle * (Math.PI / 180);
            const x = -radius * Math.sin(rad);
            const y = radius * Math.cos(rad);

            // Calculate rotation to make pill tangent to circle
            const rot = isLeft ? 90 - currentAngle : Math.abs(currentAngle) - 90;

            // Prevent pill flashing behind elements by enforcing Z-index or opacity depending on if it's "above ground"
            const absAngle = Math.abs(currentAngle);
            if (absAngle > 95) { // When it hits 95 degrees horizontally (below the line)
                item.el.style.opacity = 0;
                item.el.style.pointerEvents = 'none';
            } else if (absAngle > 85) {
                // Map 85-95 degrees to opacity 1-0 for a small fade zone right at the edge
                const opacity = Math.max(0, 1 - (absAngle - 85) / 10);
                item.el.style.opacity = opacity;
                item.el.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
            } else {
                // Fully visible top half
                item.el.style.opacity = 1;
                item.el.style.pointerEvents = 'auto';
            }

            item.el.style.setProperty('--tx', `calc(-50% + ${x}px)`);
            item.el.style.setProperty('--ty', `calc(-50% - ${y}px)`);
            item.el.style.setProperty('--rot', `${rot}deg`);

            item.el.style.transform = `translate(var(--tx), var(--ty)) rotate(var(--rot))`;
        });

        animationId = requestAnimationFrame(animatePills);
    }

    // Initialize
    if (container) {
        initPills();
        animationId = requestAnimationFrame(animatePills);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        updateRadius();
    });

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const toggleIcon = mobileMenuToggle.querySelector("i");

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");

            // Toggle icon between hamburger and close (X)
            if (navLinks.classList.contains("active")) {
                toggleIcon.classList.remove("fa-bars");
                toggleIcon.classList.add("fa-xmark");
            } else {
                toggleIcon.classList.remove("fa-xmark");
                toggleIcon.classList.add("fa-bars");
            }
        });
    }
    // Mental Health Services Interactive Rows
    const serviceRows = document.querySelectorAll('.mh-service-row');
    serviceRows.forEach(row => {
        row.addEventListener('click', () => {
            const serviceName = row.getAttribute('data-service');
            console.log(`Navigating to ${serviceName} details...`);
            // Here you would typically navigate: window.location.href = `/${serviceName}`;
        });
    });

    // Fade-up Animation Observer
    const fadeObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    const fadeElements = document.querySelectorAll('.fade-up-element');
    fadeElements.forEach(el => fadeObserver.observe(el));

    // Stats Counter Animation
    const statsObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numberEls = entry.target.querySelectorAll('.stat-number');
                numberEls.forEach(el => {
                    const target = parseInt(el.getAttribute('data-target'));
                    const duration = 2000; // ms
                    const start = performance.now();

                    const updateCounter = (currentTime) => {
                        const elapsed = currentTime - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Easing function: easeOutQuart
                        const easeOut = 1 - Math.pow(1 - progress, 4);
                        const currentVal = Math.floor(easeOut * target);

                        el.innerText = currentVal;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            el.innerText = target;
                        }
                    };

                    requestAnimationFrame(updateCounter);
                });
                observer.unobserve(entry.target);
            }
        });
    }, statsObserverOptions);

    const statsSection = document.querySelector('.premium-impact-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // Architecture Text Entry Animations
    const entryObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before it hits the bottom
        threshold: 0.15
    };

    const entryObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, entryObserverOptions);

    const entryElements = document.querySelectorAll('.animate-entry');
    entryElements.forEach(el => entryObserver.observe(el));

    // Infinite Scrolling Marquee Duplication
    const marqueeContent = document.getElementById('marquee-content');
    if (marqueeContent) {
        // Clone the content to ensure seamless scrolling
        // By duplicating it once, we double the width.
        // CSS animation moves by -50% to create a perfect loop.
        const originalHTML = marqueeContent.innerHTML;
        marqueeContent.innerHTML = originalHTML + originalHTML;
    }
});

// --- Architecture Showcase Scene ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    gestureDirection: "vertical",
    smoothTouch: true,
    touchMultiplier: 2
});

function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Set z-index for images
document.querySelectorAll(".arch__right .img-wrapper").forEach((element) => {
    const order = element.getAttribute("data-index");
    if (order !== null) {
        element.style.zIndex = order;
    }
});

// The layout is natively handled by CSS now (mobile column-reverse)
// so we no longer need to dynamically re-order DOM nodes via Javascript.

const archImgs = gsap.utils.toArray(".img-wrapper img");
const archBgColors = ["#EDF9FF", "#FFECF2", "#FFE8DB", "#F3E8FF", "#FFF3E0", "#f9ffe7"]; // 6 colors for 6 elements

// GSAP Animation applied universally across all viewports
ScrollTrigger.matchMedia({
    "all": function () {
        const mainTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".arch",
                start: "top top",
                end: "bottom bottom",
                pin: ".arch__right",
                scrub: true
            }
        });

        gsap.set(archImgs, {
            clipPath: "inset(0)",
            objectPosition: "0px 0%"
        });

        archImgs.forEach((_, index) => {
            const currentImage = archImgs[index];
            const nextImage = archImgs[index + 1] ? archImgs[index + 1] : null;

            const sectionTimeline = gsap.timeline();

            if (nextImage) {
                sectionTimeline
                    .to(
                        currentImage,
                        {
                            clipPath: "inset(0px 0px 100%)",
                            objectPosition: "0px 60%",
                            duration: 1.5,
                            ease: "none"
                        },
                        0
                    )
                    .to(
                        nextImage,
                        {
                            objectPosition: "0px 40%",
                            duration: 1.5,
                            ease: "none"
                        },
                        0
                    );
            }

            mainTimeline.add(sectionTimeline);
        });
    }
});

// --- E-Commerce Cart Logic (From Snippet) ---
// State Management
const state = {
    shopItems: [],
    cartItems: []
};

// DOM Elements
const shopContainer = document.getElementById('shop-items-container');
const cartContainer = document.getElementById('cart-items-container');
const noContentEl = document.getElementById('no-content');
const cartScreen = document.getElementById('cart-screen');

// Initialize App
async function initCartApp() {
    if (!shopContainer || !cartContainer) return; // Only run on index2.html

    // Local Medical Device Catalog
    const medicalDevices = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            name: "Advanced MRI Scanner",
            description: "State-of-the-art magnetic resonance imaging system with ultra-fast scanning capabilities.",
            price: 1250000,
            color: "#E8D8CF" // Matches Theme
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
            name: "ICU Patient Monitor",
            description: "Continuous vital signs monitoring system with predictive analytics and smart alarms.",
            price: 8500,
            color: "#E8D8CF" // Matches Theme
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1581561584988-cb97fcac2c6b?w=800&q=80",
            name: "Portable Defibrillator",
            description: "Lightweight, easy-to-use automated external defibrillator for emergency response.",
            price: 1200,
            color: "#E8D8CF" // Matches Theme
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
            name: "Digital Ultrasound",
            description: "High-resolution portable ultrasound machine for point-of-care diagnostics.",
            price: 24000,
            color: "#E8D8CF" // Matches Theme
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
            name: "Surgical Robot System",
            description: "Precision robotic-assisted surgical platform for minimally invasive procedures.",
            price: 1800000,
            color: "#E8D8CF" // Matches Theme
        }
    ];

    try {
        // Set initial `inCart` property
        state.shopItems = medicalDevices.map(device => ({ ...device, inCart: false }));
        renderShopItems();
        updateCartUI();
    } catch (error) {
        console.error("Error loading product catalog:", error);
    }
}

// Render Shop Left Screen
function renderShopItems() {
    shopContainer.innerHTML = '';

    state.shopItems.forEach(item => {
        const block = document.createElement('div');
        block.className = 'item-block';

        block.innerHTML = `
      <a href="product.html" style="text-decoration: none; color: inherit; display: block;">
        <div class="image-area" style="background-color: ${item.color}">
          <img class="image" src="${item.image}" alt="${item.name}">
        </div>
        <div class="name">${item.name}</div>
      </a>
      <div class="description">${item.description}</div>
      <div class="bottom-area">
        <div class="price">$${item.price.toLocaleString()}</div>
        <div class="button ${item.inCart ? '-active' : ''}" id="add-btn-${item.id}" ${item.inCart ? `style="background-color: #3BC177; color: #fff;"` : ''}>
           ${item.inCart ? `<p>ADDED ✓</p>` : `<p>ADD TO CART</p>`}
        </div>
      </div>
    `;

        // Attach event listener directly to avoid inline HTML handlers
        const btn = block.querySelector('.button');
        btn.addEventListener('click', () => addToCart(item.id));

        shopContainer.appendChild(block);
    });
}

// Add Item to Cart
function addToCart(itemId) {
    const shopItem = state.shopItems.find(i => i.id === itemId);

    if (!shopItem.inCart) {
        shopItem.inCart = true;
        state.cartItems.push({ ...shopItem, count: 1 });

        // Animate Button via GSAP
        const btn = document.getElementById(`add-btn-${itemId}`);
        btn.classList.add('-active');
        btn.innerHTML = `<p>ADDED ✓</p>`;

        gsap.to(btn, {
            backgroundColor: "#3BC177",
            color: "#fff",
            duration: 0.3,
            ease: "power2.out"
        });

        updateCartUI();

        // Scroll to bottom of cart
        setTimeout(() => {
            cartScreen.scrollTop = cartScreen.scrollHeight;
        }, 50);
    }
}

// Increment Cart Item Count
function increment(itemId) {
    const cartItem = state.cartItems.find(i => i.id === itemId);
    cartItem.count++;
    updateCartUI();
}

// Decrement Cart Item Count
function decrement(itemId) {
    const cartItemIndex = state.cartItems.findIndex(i => i.id === itemId);
    const cartItem = state.cartItems[cartItemIndex];

    cartItem.count--;

    if (cartItem.count === 0) {
        // Remove from cart array
        state.cartItems.splice(cartItemIndex, 1);

        // Update Shop Item state
        const shopItem = state.shopItems.find(i => i.id === itemId);
        shopItem.inCart = false;

        // Revert Button Animation
        const btn = document.getElementById(`add-btn-${itemId}`);
        btn.classList.remove('-active');
        btn.innerHTML = `<p>ADD TO CART</p>`;

        gsap.to(btn, {
            backgroundColor: "#3F322D", // Match var(--color-text-dark)
            color: "#FFFFFF", // Match var(--color-white)
            duration: 0.3,
            ease: "power2.out"
        });
    }

    updateCartUI();
}

// Render Cart Right Screen
function updateCartUI() {
    // Toggle empty state message and checkout button
    const checkoutPane = document.getElementById('checkout-pane');
    if (state.cartItems.length === 0) {
        noContentEl.classList.add('active');
        if (checkoutPane) checkoutPane.style.display = 'none';
    } else {
        noContentEl.classList.remove('active');
        if (checkoutPane) checkoutPane.style.display = 'block';
    }

    cartContainer.innerHTML = '';

    state.cartItems.forEach(item => {
        const cartEl = document.createElement('div');
        cartEl.className = 'cart-item';

        cartEl.innerHTML = `
      <div class="left">
        <div class="cart-image" style="background-color: ${item.color}">
          <div class="image-wrapper">
            <img class="image" src="${item.image}" alt="${item.name}">
          </div>
        </div>
      </div>
      <div class="right">
        <div class="name">${item.name}</div>
        <div class="price">$${(item.price * item.count).toLocaleString()}</div>
        <div class="count">
          <div class="button btn-dec"><</div>
          <div class="number">${item.count}</div>
          <div class="button btn-inc">></div>
        </div>
      </div>
    `;

        // Attach click listeners for increment/decrement
        cartEl.querySelector('.btn-dec').addEventListener('click', () => decrement(item.id));
        cartEl.querySelector('.btn-inc').addEventListener('click', () => increment(item.id));

        cartContainer.appendChild(cartEl);
    });

    // Update Checkout Pane Total Price
    const cartTotalEl = document.getElementById('cart-total');
    if (cartTotalEl) {
        const totalSum = state.cartItems.reduce((acc, item) => acc + (item.price * item.count), 0);
        cartTotalEl.innerText = `$${totalSum.toLocaleString()}`;
    }
}


// Boot up
document.addEventListener("DOMContentLoaded", () => {
    initCartApp();
});

// ---------------------------------------------------------------
// Global interceptor: any href="#" link → navigate to 404.html
// (Gives "under construction" feedback for placeholder buttons)
// ---------------------------------------------------------------
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === '#') {
        e.preventDefault();
        window.location.href = '404.html';
    }
}, true);
