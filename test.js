const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));

    const url = 'file://' + path.resolve(__dirname, 'index2.html');
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for preloader to hide
    await page.waitForFunction(() => {
        const p = document.getElementById('preloader');
        if (!p) return true;
        const style = window.getComputedStyle(p);
        return style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none';
    }, { timeout: 10000 });

    // Add item
    await page.evaluate(() => {
        const btn = document.querySelector('.button:not(.-active)');
        if (btn) btn.click();
    });

    // Wait for animation
    await new Promise(r => setTimeout(r, 1000));

    const layoutInfo = await page.evaluate(() => {
        const cartItem = document.querySelector('.cart-item');
        if (!cartItem) return 'No cart item found';

        const cs = getComputedStyle(cartItem);
        const left = cartItem.querySelector('.left');
        const right = cartItem.querySelector('.right');

        const lCs = left ? getComputedStyle(left) : null;
        const rCs = right ? getComputedStyle(right) : null;

        return {
            cartItem: {
                flexDirection: cs.flexDirection,
                display: cs.display,
                width: cartItem.offsetWidth,
                flexWrap: cs.flexWrap
            },
            left: lCs ? {
                width: left.offsetWidth,
                flex: lCs.flex,
                display: lCs.display,
                top: left.getBoundingClientRect().top
            } : null,
            right: rCs ? {
                width: right.offsetWidth,
                flex: rCs.flex,
                display: rCs.display,
                top: right.getBoundingClientRect().top
            } : null,
            html: cartItem.innerHTML.substring(0, 300)
        };
    });

    console.log('Cart layout info:\n', JSON.stringify(layoutInfo, null, 2));

    await browser.close();
})();
