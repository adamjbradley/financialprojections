/**
 * E2E Test: Currency Exchange Rate Updates
 *
 * Tests that the USD Exchange Rate field and label update correctly:
 * 1. On initial page load (should show India's rate: 83.5 INR/USD)
 * 2. When switching countries (should update value and label)
 * 3. Label should show correct currency symbol
 */

const puppeteer = require('puppeteer');

describe('Currency Exchange Rate Updates', () => {
    let browser;
    let page;
    const baseURL = 'http://localhost:3000/index-working.html';

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: process.env.HEADLESS !== 'false',
            slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
            devtools: process.env.DEVTOOLS === 'true',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.goto(baseURL, { waitUntil: 'networkidle0', timeout: 30000 });
    });

    afterEach(async () => {
        if (page) {
            await page.close();
        }
    });

    test('should display correct exchange rate on initial page load (India)', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Check the exchange rate input value
        const exchangeRateValue = await page.$eval('#usdRate', el => el.value);
        console.log('Initial exchange rate value:', exchangeRateValue);

        // Should be India's rate (83.5 or close to it)
        const rate = parseFloat(exchangeRateValue);
        expect(rate).toBeGreaterThan(80);
        expect(rate).toBeLessThan(90);

        // Check the label shows Indian Rupee symbol
        const labelText = await page.$eval('label[for="usdRate"]', el => el.textContent);
        console.log('Exchange rate label:', labelText);

        expect(labelText).toContain('₹');
        expect(labelText).toContain('USD');
    });

    test('should update exchange rate value when switching to Singapore', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Get initial value (India)
        const initialValue = await page.$eval('#usdRate', el => el.value);
        console.log('Initial value (India):', initialValue);

        // Switch to Singapore
        await page.select('#countrySelect', 'singapore');

        // Wait for update
        await page.waitForTimeout(1000);

        // Get new value
        const newValue = await page.$eval('#usdRate', el => el.value);
        console.log('New value (Singapore):', newValue);

        // Singapore rate should be around 1.35 SGD/USD (much lower than India's 83.5)
        const singaporeRate = parseFloat(newValue);
        expect(singaporeRate).toBeGreaterThan(1);
        expect(singaporeRate).toBeLessThan(2);

        // Values should be different
        expect(newValue).not.toBe(initialValue);
    });

    test('should update exchange rate label when switching to Singapore', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Get initial label (India)
        const initialLabel = await page.$eval('label[for="usdRate"]', el => el.textContent);
        console.log('Initial label (India):', initialLabel);
        expect(initialLabel).toContain('₹/USD');

        // Switch to Singapore
        await page.select('#countrySelect', 'singapore');

        // Wait for update
        await page.waitForTimeout(1000);

        // Get new label
        const newLabel = await page.$eval('label[for="usdRate"]', el => el.textContent);
        console.log('New label (Singapore):', newLabel);

        // Should show Singapore Dollar symbol
        expect(newLabel).toContain('S$/USD');

        // Labels should be different
        expect(newLabel).not.toBe(initialLabel);
    });

    test('should update exchange rate for Australia', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Switch to Australia
        await page.select('#countrySelect', 'australia');

        // Wait for update
        await page.waitForTimeout(1000);

        // Get value
        const australiaValue = await page.$eval('#usdRate', el => el.value);
        console.log('Australia exchange rate:', australiaValue);

        // Australia rate should be around 1.55 AUD/USD
        const australiaRate = parseFloat(australiaValue);
        expect(australiaRate).toBeGreaterThan(1.3);
        expect(australiaRate).toBeLessThan(1.8);

        // Check label
        const australiaLabel = await page.$eval('label[for="usdRate"]', el => el.textContent);
        console.log('Australia label:', australiaLabel);
        expect(australiaLabel).toContain('A$/USD');
    });

    test('should update exchange rate for Japan (high value currency)', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Switch to Japan
        await page.select('#countrySelect', 'japan');

        // Wait for update
        await page.waitForTimeout(1000);

        // Get value
        const japanValue = await page.$eval('#usdRate', el => el.value);
        console.log('Japan exchange rate:', japanValue);

        // Japan rate should be around 149.5 JPY/USD
        const japanRate = parseFloat(japanValue);
        expect(japanRate).toBeGreaterThan(140);
        expect(japanRate).toBeLessThan(160);

        // Check label
        const japanLabel = await page.$eval('label[for="usdRate"]', el => el.textContent);
        console.log('Japan label:', japanLabel);
        expect(japanLabel).toContain('¥/USD');
    });

    test('should show toast notification when switching countries', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Switch to Singapore
        await page.select('#countrySelect', 'singapore');

        // Wait a bit for toast
        await page.waitForTimeout(500);

        // Look for success message (toast)
        const toastVisible = await page.evaluate(() => {
            const toasts = Array.from(document.querySelectorAll('div')).filter(div =>
                div.style.position === 'fixed' &&
                div.textContent.includes('Switched to')
            );
            return toasts.length > 0;
        });

        console.log('Toast notification visible:', toastVisible);
        expect(toastVisible).toBe(true);
    });

    test('should maintain exchange rate after page refresh', async () => {
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);

        // Switch to Singapore
        await page.select('#countrySelect', 'singapore');
        await page.waitForTimeout(1000);

        // Get Singapore value
        const singaporeValue = await page.$eval('#usdRate', el => el.value);
        console.log('Singapore value before refresh:', singaporeValue);

        // Reload page
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForTimeout(2000);

        // Should be back to India (default)
        const afterReloadValue = await page.$eval('#usdRate', el => el.value);
        console.log('Value after reload (back to India):', afterReloadValue);

        const rate = parseFloat(afterReloadValue);
        expect(rate).toBeGreaterThan(80);
        expect(rate).toBeLessThan(90);
    });
});