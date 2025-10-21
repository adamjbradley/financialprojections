/**
 * Playwright Test: Currency Exchange Rate Updates
 *
 * Tests that the USD Exchange Rate field and label update correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Currency Exchange Rate Updates', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4173/index-working.html');
        // Wait for page to fully initialize
        await page.waitForTimeout(2000);
    });

    test('should display correct exchange rate on initial page load (India)', async ({ page }) => {
        // Check the exchange rate input value
        const exchangeRateInput = page.locator('#usdRate');
        const exchangeRateValue = await exchangeRateInput.inputValue();
        console.log('✅ Initial exchange rate value:', exchangeRateValue);

        // Should be India's rate (83.5 or close to it)
        const rate = parseFloat(exchangeRateValue);
        expect(rate).toBeGreaterThan(80);
        expect(rate).toBeLessThan(90);

        // Check the label shows Indian Rupee symbol
        const label = page.locator('label[for="usdRate"]');
        const labelText = await label.textContent();
        console.log('✅ Exchange rate label:', labelText);

        expect(labelText).toContain('₹');
        expect(labelText).toContain('USD');
    });

    test('should update exchange rate value when switching to Singapore', async ({ page }) => {
        // Get initial value (India)
        const exchangeRateInput = page.locator('#usdRate');
        const initialValue = await exchangeRateInput.inputValue();
        console.log('📊 Initial value (India):', initialValue);

        // Switch to Singapore
        const countrySelect = page.locator('#countrySelect');
        await countrySelect.selectOption('singapore');

        // Wait for update
        await page.waitForTimeout(1500);

        // Get new value
        const newValue = await exchangeRateInput.inputValue();
        console.log('📊 New value (Singapore):', newValue);

        // Singapore rate should be around 1.35 SGD/USD (much lower than India's 83.5)
        const singaporeRate = parseFloat(newValue);
        expect(singaporeRate).toBeGreaterThan(1);
        expect(singaporeRate).toBeLessThan(2);

        // Values should be different
        expect(newValue).not.toBe(initialValue);
        console.log('✅ Exchange rate value updated successfully');
    });

    test('should update exchange rate label when switching to Singapore', async ({ page }) => {
        // Get initial label (India)
        const label = page.locator('label[for="usdRate"]');
        const initialLabel = await label.textContent();
        console.log('🏷️  Initial label (India):', initialLabel);
        expect(initialLabel).toContain('₹/USD');

        // Switch to Singapore
        const countrySelect = page.locator('#countrySelect');
        await countrySelect.selectOption('singapore');

        // Wait for update
        await page.waitForTimeout(1500);

        // Get new label
        const newLabel = await label.textContent();
        console.log('🏷️  New label (Singapore):', newLabel);

        // Should show Singapore Dollar symbol
        expect(newLabel).toContain('S$/USD');

        // Labels should be different
        expect(newLabel).not.toBe(initialLabel);
        console.log('✅ Exchange rate label updated successfully');
    });

    test('should update exchange rate for Australia', async ({ page }) => {
        // Switch to Australia
        const countrySelect = page.locator('#countrySelect');
        await countrySelect.selectOption('australia');

        // Wait for update
        await page.waitForTimeout(1500);

        // Get value
        const exchangeRateInput = page.locator('#usdRate');
        const australiaValue = await exchangeRateInput.inputValue();
        console.log('🦘 Australia exchange rate:', australiaValue);

        // Australia rate should be around 1.55 AUD/USD
        const australiaRate = parseFloat(australiaValue);
        expect(australiaRate).toBeGreaterThan(1.3);
        expect(australiaRate).toBeLessThan(1.8);

        // Check label
        const label = page.locator('label[for="usdRate"]');
        const australiaLabel = await label.textContent();
        console.log('🦘 Australia label:', australiaLabel);
        expect(australiaLabel).toContain('A$/USD');
        console.log('✅ Australia exchange rate correct');
    });

    test('should update exchange rate for Japan (high value currency)', async ({ page }) => {
        // Switch to Japan
        const countrySelect = page.locator('#countrySelect');
        await countrySelect.selectOption('japan');

        // Wait for update
        await page.waitForTimeout(1500);

        // Get value
        const exchangeRateInput = page.locator('#usdRate');
        const japanValue = await exchangeRateInput.inputValue();
        console.log('🗾 Japan exchange rate:', japanValue);

        // Japan rate should be around 149.5 JPY/USD
        const japanRate = parseFloat(japanValue);
        expect(japanRate).toBeGreaterThan(140);
        expect(japanRate).toBeLessThan(160);

        // Check label
        const label = page.locator('label[for="usdRate"]');
        const japanLabel = await label.textContent();
        console.log('🗾 Japan label:', japanLabel);
        expect(japanLabel).toContain('¥/USD');
        console.log('✅ Japan exchange rate correct');
    });

    test('should show toast notification when switching countries', async ({ page }) => {
        // Switch to Singapore
        const countrySelect = page.locator('#countrySelect');
        await countrySelect.selectOption('singapore');

        // Wait a bit for toast
        await page.waitForTimeout(500);

        // Look for success message (toast)
        const toast = page.locator('div').filter({ hasText: 'Switched to' }).first();
        const toastVisible = await toast.isVisible().catch(() => false);

        console.log('🍞 Toast notification visible:', toastVisible);
        expect(toastVisible).toBe(true);
        console.log('✅ Toast notification shown');
    });

    test('should test all APAC countries exchange rate updates', async ({ page }) => {
        const countries = [
            { code: 'singapore', min: 1, max: 2, symbol: 'S$' },
            { code: 'australia', min: 1.3, max: 1.8, symbol: 'A$' },
            { code: 'japan', min: 140, max: 160, symbol: '¥' },
            { code: 'south_korea', min: 1300, max: 1400, symbol: '₩' },
            { code: 'thailand', min: 30, max: 40, symbol: '฿' },
            { code: 'indonesia', min: 15000, max: 16000, symbol: 'Rp' },
            { code: 'philippines', min: 50, max: 60, symbol: '₱' },
        ];

        const countrySelect = page.locator('#countrySelect');
        const exchangeRateInput = page.locator('#usdRate');
        const label = page.locator('label[for="usdRate"]');

        for (const country of countries) {
            await countrySelect.selectOption(country.code);
            await page.waitForTimeout(1500);

            const value = await exchangeRateInput.inputValue();
            const rate = parseFloat(value);
            const labelText = await label.textContent();

            console.log(`${country.code}: rate=${rate}, label="${labelText}"`);

            expect(rate).toBeGreaterThan(country.min);
            expect(rate).toBeLessThan(country.max);
            expect(labelText).toContain(country.symbol);
        }

        console.log('✅ All APAC countries tested successfully');
    });
});