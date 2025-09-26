const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing Tab Switching Functionality...\n');

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: 500,
        devtools: process.env.DEVTOOLS === 'true'
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1400, height: 900 });

    // Log console messages to catch any errors
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
    });

    try {
        console.log('📱 Loading application...');
        await page.goto('http://localhost:4174/index-working.html');
        await page.waitForSelector('#mainTitle', { timeout: 10000 });
        console.log('✅ Application loaded successfully');

        // Check if switchTab function exists
        const switchTabExists = await page.evaluate(() => {
            return typeof window.switchTab === 'function';
        });
        console.log(`🔧 switchTab function exists: ${switchTabExists ? 'Yes' : 'No'}`);

        if (!switchTabExists) {
            console.log('❌ switchTab function is missing - this is the problem!');
        }

        // Test clicking each tab
        const tabs = ['setup', 'projections', 'analysis', 'demographics', 'models'];
        console.log('\n🔧 Testing tab switching...');
        
        for (let i = 0; i < tabs.length; i++) {
            const tabName = tabs[i];
            console.log(`\n📋 Testing ${tabName} tab...`);
            
            try {
                // Click the tab
                await page.click(`.tab:nth-child(${i + 1})`);
                await page.waitForTimeout(500);
                
                // Check if it became active
                const isActive = await page.evaluate((index) => {
                    const tab = document.querySelector(`.tab:nth-child(${index + 1})`);
                    return tab && tab.classList.contains('active');
                }, i);
                
                console.log(`✅ ${tabName} tab ${isActive ? 'activated successfully' : 'failed to activate'}`);
                
                // Check if content is visible
                const contentVisible = await page.evaluate((tabName) => {
                    const content = document.getElementById(tabName);
                    return content && content.classList.contains('active');
                }, tabName);
                
                console.log(`📄 ${tabName} content ${contentVisible ? 'visible' : 'not visible'}`);
                
            } catch (error) {
                console.log(`❌ Error clicking ${tabName} tab: ${error.message}`);
            }
        }

        // Check for JavaScript errors
        console.log('\n🔍 JavaScript Error Check:');
        if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log(`❌ ${errors.length} JavaScript errors found:`);
            errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        // Test manual switchTab function call
        console.log('\n🧪 Testing manual switchTab calls...');
        const testResults = await page.evaluate(() => {
            const results = [];
            const tabs = ['setup', 'projections', 'analysis', 'demographics', 'models'];
            
            for (const tab of tabs) {
                try {
                    if (typeof window.switchTab === 'function') {
                        window.switchTab(tab);
                        results.push(`${tab}: SUCCESS`);
                    } else {
                        results.push(`${tab}: FUNCTION MISSING`);
                    }
                } catch (error) {
                    results.push(`${tab}: ERROR - ${error.message}`);
                }
            }
            return results;
        });
        
        testResults.forEach(result => console.log(`  ${result}`));

        console.log('\n🎉 Tab Switching Test Summary:');
        console.log(`  switchTab function exists: ${switchTabExists ? 'Yes' : 'No'}`);
        console.log(`  JavaScript errors: ${errors.length}`);
        
        if (process.env.KEEP_OPEN === 'true') {
            console.log('\n🌐 Browser staying open for manual inspection...');
            await page.waitForTimeout(15000);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (process.env.KEEP_OPEN !== 'true') {
            await browser.close();
        }
    }
})();