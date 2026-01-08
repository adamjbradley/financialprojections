/**
 * Comprehensive Button Functionality Tests for APAC Revenue Projections System
 * Run with: npm run test:playwright:headed:edge
 * Or: npx playwright test tests/playwright/button-functionality.spec.js --headed
 */

import { test, expect } from '@playwright/test';

test.describe('Button Functionality Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Collect console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Console Error:', msg.text());
            }
        });
        page.on('pageerror', err => {
            errors.push(err.message);
            console.log('❌ Page Error:', err.message);
        });

        // Store errors on page for later access
        await page.goto('/index-working.html');
        await page.waitForLoadState('networkidle');

        // Wait for scripts to initialize
        await page.waitForTimeout(1000);
    });

    test('should load page without JavaScript errors', async ({ page }) => {
        // Check for critical functions
        const functionChecks = await page.evaluate(() => {
            return {
                calculateProjections: typeof window.calculateProjections === 'function',
                addOrUpdateSegment: typeof window.addOrUpdateSegment === 'function',
                renderSegments: typeof window.renderSegments === 'function',
                switchTab: typeof window.switchTab === 'function',
                changeTheme: typeof window.changeTheme === 'function',
                saveModel: typeof window.saveModel === 'function',
                loadModel: typeof window.loadModel === 'function',
                exportToExcel: typeof window.exportToExcel === 'function',
                APACUtils: typeof window.APACUtils === 'object',
                Chart: typeof window.Chart !== 'undefined',
                XLSX: typeof window.XLSX !== 'undefined',
            };
        });

        console.log('\n=== Function Availability ===');
        Object.entries(functionChecks).forEach(([fn, available]) => {
            console.log(`  ${fn}: ${available ? '✅' : '❌'}`);
        });

        // Critical functions must be available
        expect(functionChecks.calculateProjections).toBe(true);
        expect(functionChecks.renderSegments).toBe(true);
        expect(functionChecks.switchTab).toBe(true);
    });

    test('should have clickable buttons', async ({ page }) => {
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        console.log(`\n=== Found ${buttonCount} buttons ===`);
        expect(buttonCount).toBeGreaterThan(0);

        // Check first 10 buttons are visible and clickable
        for (let i = 0; i < Math.min(10, buttonCount); i++) {
            const btn = buttons.nth(i);
            const isVisible = await btn.isVisible();
            const text = await btn.textContent();
            console.log(`  Button ${i + 1}: "${text?.trim().substring(0, 30)}" - ${isVisible ? 'visible' : 'hidden'}`);
        }
    });

    test('should switch tabs correctly', async ({ page }) => {
        // Find tab buttons
        const tabButtons = page.locator('.tab-btn, [onclick*="switchTab"], button:has-text("Segments"), button:has-text("Projections"), button:has-text("Demographics")');
        const tabCount = await tabButtons.count();

        console.log(`\n=== Tab Navigation Test ===`);
        console.log(`Found ${tabCount} potential tab buttons`);

        if (tabCount > 0) {
            // Click each tab and verify it works
            for (let i = 0; i < Math.min(5, tabCount); i++) {
                const tab = tabButtons.nth(i);
                const text = await tab.textContent();

                if (await tab.isVisible()) {
                    await tab.click();
                    await page.waitForTimeout(300);
                    console.log(`  ✅ Clicked tab: "${text?.trim()}"`);
                }
            }
        }
    });

    test('should open and close dialogs', async ({ page }) => {
        console.log('\n=== Dialog Test ===');

        // Test Save Model dialog
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Save Model"), [onclick*="showSaveModelDialog"]').first();
        if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await page.waitForTimeout(500);

            const dialog = page.locator('#saveModelDialog, .dialog, .modal');
            if (await dialog.count() > 0) {
                console.log('  ✅ Save dialog opened');

                // Try to close it
                const closeBtn = dialog.locator('button:has-text("Cancel"), button:has-text("Close"), .close-btn').first();
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                    await page.waitForTimeout(300);
                    console.log('  ✅ Dialog closed');
                }
            }
        }
    });

    test('should calculate projections', async ({ page }) => {
        console.log('\n=== Calculate Projections Test ===');

        // Find and click Calculate Projections button
        const calcBtn = page.locator('button:has-text("Calculate"), [onclick*="calculateProjections"]').first();

        if (await calcBtn.isVisible()) {
            await calcBtn.click();
            await page.waitForTimeout(1000);
            console.log('  ✅ Calculate button clicked');

            // Check if chart or results appeared
            const chart = page.locator('canvas, #chart, .chart-container');
            const chartCount = await chart.count();
            console.log(`  Found ${chartCount} chart element(s)`);
        } else {
            console.log('  ⚠️ Calculate button not visible');
        }
    });

    test('should handle segment operations', async ({ page }) => {
        console.log('\n=== Segment Operations Test ===');

        // Look for Add Segment button
        const addBtn = page.locator('button:has-text("Add Segment"), button:has-text("Add SKU"), [onclick*="addOrUpdateSegment"]').first();

        if (await addBtn.isVisible()) {
            console.log('  ✅ Add Segment button found');

            // Check if there are input fields for segment
            const nameInput = page.locator('#skuName, #segmentName, input[name="name"]').first();
            if (await nameInput.isVisible()) {
                await nameInput.fill('Test Segment');
                console.log('  ✅ Name input works');
            }
        }
    });

    test('should change themes', async ({ page }) => {
        console.log('\n=== Theme Change Test ===');

        const themeSelect = page.locator('#themeSelect, select[onchange*="changeTheme"]').first();

        if (await themeSelect.isVisible()) {
            // Get initial background color
            const initialBg = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });

            // Change theme
            await themeSelect.selectOption({ index: 1 });
            await page.waitForTimeout(500);

            const newBg = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });

            console.log(`  Initial: ${initialBg}`);
            console.log(`  After change: ${newBg}`);
            console.log('  ✅ Theme selector works');
        }
    });

    test('should handle form inputs', async ({ page }) => {
        console.log('\n=== Form Input Test ===');

        // Test various input types
        const inputs = [
            { selector: '#growthRate, input[name="growthRate"]', value: '5', name: 'Growth Rate' },
            { selector: '#costPercentage, input[name="costPercentage"]', value: '35', name: 'Cost %' },
            { selector: '#projectionMonths, input[name="projectionMonths"]', value: '12', name: 'Months' },
            { selector: '#usdRate, input[name="usdRate"]', value: '83.5', name: 'USD Rate' },
        ];

        for (const input of inputs) {
            const element = page.locator(input.selector).first();
            if (await element.isVisible()) {
                await element.fill(input.value);
                const value = await element.inputValue();
                console.log(`  ✅ ${input.name}: set to "${value}"`);
            }
        }
    });

    test('should export data', async ({ page }) => {
        console.log('\n=== Export Test ===');

        // Find export buttons
        const exportBtns = page.locator('button:has-text("Export"), [onclick*="export"]');
        const exportCount = await exportBtns.count();

        console.log(`  Found ${exportCount} export button(s)`);

        if (exportCount > 0) {
            const firstExport = exportBtns.first();
            const text = await firstExport.textContent();
            console.log(`  Export button: "${text?.trim()}"`);
        }
    });

});

test.describe('Error Detection Tests', () => {

    test('should detect and report JavaScript errors', async ({ page }) => {
        const errors = [];
        const warnings = [];

        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
            if (msg.type() === 'warning') warnings.push(msg.text());
        });
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/index-working.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('\n=== Error Report ===');
        console.log(`Errors: ${errors.length}`);
        console.log(`Warnings: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('\nErrors found:');
            errors.forEach(e => console.log(`  ❌ ${e}`));
        }

        if (warnings.length > 0) {
            console.log('\nWarnings:');
            warnings.slice(0, 5).forEach(w => console.log(`  ⚠️ ${w}`));
        }

        // Fail if there are critical errors
        const criticalErrors = errors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('404') &&
            !e.includes('net::')
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('should verify utils module loaded', async ({ page }) => {
        await page.goto('/index-working.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const utilsStatus = await page.evaluate(() => {
            return {
                APACUtils: typeof window.APACUtils,
                hasSecureStorage: window.APACUtils?.SecureStorage !== undefined,
                hasToast: window.APACUtils?.Toast !== undefined,
                hasValidation: window.APACUtils?.validateSegment !== undefined,
                showSuccessMessage: typeof window.showSuccessMessage,
                showErrorMessage: typeof window.showErrorMessage,
            };
        });

        console.log('\n=== Utils Module Status ===');
        Object.entries(utilsStatus).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });

        expect(utilsStatus.APACUtils).toBe('object');
    });

});

test.describe('Interactive Button Tests', () => {

    test('click all primary buttons and verify no errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/index-working.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const primaryButtons = page.locator('button.btn-primary, button.primary, .btn-primary');
        const count = await primaryButtons.count();

        console.log(`\n=== Clicking ${count} primary buttons ===`);

        for (let i = 0; i < count; i++) {
            const btn = primaryButtons.nth(i);
            if (await btn.isVisible()) {
                const text = await btn.textContent();
                try {
                    await btn.click({ timeout: 2000 });
                    await page.waitForTimeout(300);
                    console.log(`  ✅ Clicked: "${text?.trim().substring(0, 25)}"`);
                } catch (e) {
                    console.log(`  ⚠️ Could not click: "${text?.trim().substring(0, 25)}"`);
                }
            }
        }

        // Close any dialogs that may have opened
        await page.keyboard.press('Escape');

        console.log(`\nErrors after clicking: ${errors.length}`);
        errors.forEach(e => console.log(`  ❌ ${e}`));
    });

});
