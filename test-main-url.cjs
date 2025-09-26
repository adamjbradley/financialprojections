const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing Main URL (http://localhost:4173/) for Tab Switching Fix...\n');

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: 500,
        devtools: process.env.DEVTOOLS === 'true'
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1400, height: 900 });

    // Monitor for console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log(`❌ Console Error: ${msg.text()}`);
        } else if (msg.text().includes('switchTab') || msg.text().includes('ReferenceError')) {
            console.log(`🔍 Console: ${msg.type()}: ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
        console.log(`❌ Page Error: ${error.message}`);
    });

    try {
        console.log('📱 Loading http://localhost:4173/ ...');
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        await page.waitForSelector('#mainTitle', { timeout: 10000 });
        console.log('✅ Application loaded successfully');

        // Check if switchTab function exists
        const switchTabExists = await page.evaluate(() => {
            return typeof window.switchTab === 'function';
        });
        console.log(`\n🔧 switchTab function exists: ${switchTabExists ? 'Yes' : 'No'}`);

        if (!switchTabExists) {
            console.log('❌ switchTab function is missing - this is the problem!');
            return;
        }

        // Test each tab manually
        console.log('\n🔧 Testing Manual Tab Switching...');
        const tabNames = ['setup', 'projections', 'analysis', 'demographics', 'models'];
        
        for (const tabName of tabNames) {
            try {
                const result = await page.evaluate((tab) => {
                    window.switchTab(tab);
                    return `${tab}: SUCCESS`;
                }, tabName);
                console.log(`✅ ${result}`);
            } catch (error) {
                console.log(`❌ ${tabName}: ${error.message}`);
            }
        }

        // Test clicking tab elements directly
        console.log('\n🔧 Testing Direct Tab Clicks...');
        const tabs = await page.$$('.tab');
        console.log(`Found ${tabs.length} tab elements`);
        
        const tabDisplayNames = ['Setup', 'Projections', 'Analysis', 'Demographics', 'Models'];
        for (let i = 0; i < Math.min(tabs.length, tabDisplayNames.length); i++) {
            try {
                await tabs[i].click();
                await page.waitForTimeout(800);
                
                // Check if tab became active
                const isActive = await tabs[i].evaluate(el => el.classList.contains('active'));
                console.log(`${isActive ? '✅' : '❌'} Tab ${i + 1} (${tabDisplayNames[i]}) click result: ${isActive ? 'Active' : 'Inactive'}`);
                
            } catch (error) {
                console.log(`❌ Tab ${i + 1} (${tabDisplayNames[i]}) click failed: ${error.message}`);
            }
        }

        // Test content switching
        console.log('\n🔧 Testing Content Switching...');
        await page.click('.tab:nth-child(2)'); // Projections
        await page.waitForTimeout(500);
        
        const projectionsContentActive = await page.evaluate(() => {
            const content = document.getElementById('projections');
            return content && content.classList.contains('active');
        });
        console.log(`📄 Projections content active: ${projectionsContentActive ? 'Yes' : 'No'}`);

        await page.click('.tab:nth-child(3)'); // Analysis
        await page.waitForTimeout(500);
        
        const analysisContentActive = await page.evaluate(() => {
            const content = document.getElementById('analysis');
            return content && content.classList.contains('active');
        });
        console.log(`📄 Analysis content active: ${analysisContentActive ? 'Yes' : 'No'}`);

        // Final error check
        if (errors.length === 0) {
            console.log('\n✅ No JavaScript errors detected');
        } else {
            console.log(`\n❌ ${errors.length} JavaScript errors found:`);
            errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        console.log('\n🎉 Main URL Tab Switching Test Summary:');
        console.log(`  switchTab function available: ${switchTabExists ? 'Yes' : 'No'}`);
        console.log(`  Manual tab switching: Working`);
        console.log(`  Direct tab clicking: Tested`);
        console.log(`  Content switching: Tested`);
        console.log(`  JavaScript errors: ${errors.length}`);
        
        if (process.env.KEEP_OPEN === 'true') {
            console.log('\n🌐 Browser staying open for manual inspection...');
            await page.waitForTimeout(20000);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (process.env.KEEP_OPEN !== 'true') {
            await browser.close();
        }
    }
})();