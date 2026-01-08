#!/usr/bin/env node
/**
 * Local Button Functionality Test
 *
 * Usage:
 *   1. Start dev server: npm run dev
 *   2. Run this test: node test-buttons-local.cjs
 *
 * For visible browser mode:
 *   HEADLESS=false node test-buttons-local.cjs
 */

const puppeteer = require('puppeteer');

const HEADLESS = process.env.HEADLESS !== 'false';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runTests() {
    console.log('🚀 Starting Button Functionality Tests');
    console.log(`   Mode: ${HEADLESS ? 'Headless' : 'Visible Browser'}`);
    console.log(`   URL: ${BASE_URL}/index-working.html\n`);

    let browser;
    const results = {
        passed: 0,
        failed: 0,
        errors: [],
        warnings: []
    };

    try {
        browser = await puppeteer.launch({
            headless: HEADLESS ? 'new' : false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            slowMo: HEADLESS ? 0 : 50
        });

        const page = await browser.newPage();

        // Collect console messages
        page.on('console', msg => {
            if (msg.type() === 'error') {
                results.errors.push(msg.text());
            } else if (msg.type() === 'warning') {
                results.warnings.push(msg.text());
            }
        });

        page.on('pageerror', err => {
            results.errors.push(`Page Error: ${err.message}`);
        });

        // Navigate to page
        console.log('📄 Loading page...');
        await page.goto(`${BASE_URL}/index-working.html`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await page.waitForTimeout(2000);

        // ============================================
        // Test 1: Check critical functions exist
        // ============================================
        console.log('\n📋 Test 1: Checking critical functions...');
        const functions = await page.evaluate(() => {
            const checks = {
                calculateProjections: typeof window.calculateProjections === 'function',
                addOrUpdateSegment: typeof window.addOrUpdateSegment === 'function',
                renderSegments: typeof window.renderSegments === 'function',
                switchTab: typeof window.switchTab === 'function',
                changeTheme: typeof window.changeTheme === 'function',
                saveModel: typeof window.saveModel === 'function',
                exportToExcel: typeof window.exportToExcel === 'function',
                APACUtils: typeof window.APACUtils === 'object',
                segments: Array.isArray(window.segments),
            };
            return checks;
        });

        let allFunctionsExist = true;
        for (const [name, exists] of Object.entries(functions)) {
            const status = exists ? '✅' : '❌';
            console.log(`   ${status} ${name}: ${exists}`);
            if (!exists) allFunctionsExist = false;
        }

        if (allFunctionsExist) {
            console.log('   ✅ All critical functions exist');
            results.passed++;
        } else {
            console.log('   ❌ Some functions missing!');
            results.failed++;
        }

        // ============================================
        // Test 2: Count and verify buttons
        // ============================================
        console.log('\n📋 Test 2: Checking buttons...');
        const buttonInfo = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            const clickableButtons = Array.from(buttons).filter(b => {
                const style = window.getComputedStyle(b);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });

            return {
                total: buttons.length,
                visible: clickableButtons.length,
                withOnclick: Array.from(buttons).filter(b => b.onclick || b.getAttribute('onclick')).length,
                samples: clickableButtons.slice(0, 5).map(b => ({
                    text: b.textContent.trim().substring(0, 30),
                    hasHandler: !!(b.onclick || b.getAttribute('onclick'))
                }))
            };
        });

        console.log(`   Total buttons: ${buttonInfo.total}`);
        console.log(`   Visible buttons: ${buttonInfo.visible}`);
        console.log(`   Buttons with onclick: ${buttonInfo.withOnclick}`);
        console.log('   Sample buttons:');
        buttonInfo.samples.forEach(b => {
            console.log(`      - "${b.text}" (handler: ${b.hasHandler ? 'yes' : 'no'})`);
        });

        if (buttonInfo.visible > 0) {
            results.passed++;
        } else {
            results.failed++;
        }

        // ============================================
        // Test 3: Click Calculate Projections
        // ============================================
        console.log('\n📋 Test 3: Testing Calculate Projections button...');
        try {
            const calcBtn = await page.$('button.btn-primary');
            if (calcBtn) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                console.log('   ✅ Calculate button clicked successfully');
                results.passed++;
            } else {
                console.log('   ⚠️ Calculate button not found');
                results.warnings.push('Calculate button not found');
            }
        } catch (e) {
            console.log(`   ❌ Error clicking calculate: ${e.message}`);
            results.failed++;
        }

        // ============================================
        // Test 4: Test tab switching
        // ============================================
        console.log('\n📋 Test 4: Testing tab navigation...');
        try {
            const tabs = await page.$$('.tab-btn, [onclick*="switchTab"]');
            console.log(`   Found ${tabs.length} tab buttons`);

            if (tabs.length > 0) {
                for (let i = 0; i < Math.min(3, tabs.length); i++) {
                    await tabs[i].click();
                    await page.waitForTimeout(300);
                    const tabText = await page.evaluate(el => el.textContent, tabs[i]);
                    console.log(`   ✅ Clicked tab: "${tabText.trim()}"`);
                }
                results.passed++;
            }
        } catch (e) {
            console.log(`   ❌ Tab switching error: ${e.message}`);
            results.failed++;
        }

        // ============================================
        // Test 5: Test theme change
        // ============================================
        console.log('\n📋 Test 5: Testing theme selector...');
        try {
            const themeSelect = await page.$('#themeSelect');
            if (themeSelect) {
                await themeSelect.select('mastercard');
                await page.waitForTimeout(500);
                console.log('   ✅ Theme changed to Mastercard');
                results.passed++;
            } else {
                console.log('   ⚠️ Theme selector not found');
            }
        } catch (e) {
            console.log(`   ❌ Theme change error: ${e.message}`);
            results.failed++;
        }

        // ============================================
        // Test 6: Test input fields
        // ============================================
        console.log('\n📋 Test 6: Testing input fields...');
        try {
            const inputTests = [
                { selector: '#growthRate', value: '10', name: 'Growth Rate' },
                { selector: '#costPercentage', value: '40', name: 'Cost Percentage' },
            ];

            for (const test of inputTests) {
                const input = await page.$(test.selector);
                if (input) {
                    await input.click({ clickCount: 3 }); // Select all
                    await input.type(test.value);
                    console.log(`   ✅ ${test.name} input works`);
                }
            }
            results.passed++;
        } catch (e) {
            console.log(`   ❌ Input test error: ${e.message}`);
            results.failed++;
        }

        // ============================================
        // Summary
        // ============================================
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`   ✅ Passed: ${results.passed}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        console.log(`   ⚠️ Warnings: ${results.warnings.length}`);
        console.log(`   🔴 JS Errors: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('\n🔴 JavaScript Errors Detected:');
            results.errors.forEach(e => console.log(`   - ${e}`));
        }

        if (results.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            results.warnings.slice(0, 5).forEach(w => console.log(`   - ${w}`));
        }

        console.log('\n' + '='.repeat(50));

        if (results.failed === 0 && results.errors.length === 0) {
            console.log('🎉 ALL TESTS PASSED! Buttons are working correctly.');
        } else {
            console.log('⚠️ Some issues detected. Check errors above.');
        }

        // Keep browser open in visible mode for inspection
        if (!HEADLESS) {
            console.log('\n👀 Browser will stay open for 30 seconds for inspection...');
            await page.waitForTimeout(30000);
        }

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        results.failed++;
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // Exit with error code if tests failed
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
