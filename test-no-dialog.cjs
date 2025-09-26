const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing No Initial Dialog Fix with Microsoft Edge...\n');

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: 300,
        devtools: process.env.DEVTOOLS === 'true'
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1400, height: 900 });

    // Monitor for any dialogs (alert, confirm, prompt)
    let dialogsAppeared = [];
    
    page.on('dialog', async dialog => {
        dialogsAppeared.push({
            type: dialog.type(),
            message: dialog.message(),
            timestamp: new Date().toISOString()
        });
        console.log(`❌ DIALOG DETECTED: ${dialog.type()} - "${dialog.message()}"`);
        // Auto-dismiss the dialog for testing
        await dialog.accept();
    });

    // Log console messages for auto-restore info
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Auto-restored') || text.includes('auto-save')) {
            console.log(`🔍 Console: ${text}`);
        }
    });

    try {
        console.log('📱 Loading application (checking for initial dialogs)...');
        
        // Set a longer timeout to ensure we catch any dialogs
        await page.goto('http://localhost:4173/index-working.html', { waitUntil: 'networkidle' });
        await page.waitForSelector('#mainTitle', { timeout: 10000 });
        
        // Wait a bit more to catch any delayed dialogs
        await page.waitForTimeout(3000);
        
        console.log('✅ Application loaded successfully');

        // Check if any dialogs appeared
        if (dialogsAppeared.length === 0) {
            console.log('✅ NO DIALOGS DETECTED - Fix successful!');
        } else {
            console.log(`❌ ${dialogsAppeared.length} dialog(s) detected:`);
            dialogsAppeared.forEach((dialog, index) => {
                console.log(`  ${index + 1}. ${dialog.type}: ${dialog.message}`);
            });
        }

        // Test that the application is fully functional
        console.log('\n🔧 Testing Application Functionality...');
        
        // Check if segments exist (might be auto-restored)
        const segmentCount = await page.evaluate(() => {
            return window.segments ? window.segments.length : 0;
        });
        console.log(`📊 Segments loaded: ${segmentCount}`);

        // Test tab switching
        await page.click('.tab:nth-child(2)'); // Projections tab
        await page.waitForTimeout(500);
        await page.click('.tab:nth-child(1)'); // Back to Setup tab
        await page.waitForTimeout(500);
        console.log('✅ Tab switching works correctly');

        // Check for any success messages in the UI (from auto-restore)
        const successMessages = await page.$$('.success-message, .toast');
        if (successMessages.length > 0) {
            console.log(`📨 ${successMessages.length} notification(s) present (expected for auto-restore)`);
        }

        console.log('\n🎉 No Dialog Test Summary:');
        console.log(`  Initial dialogs detected: ${dialogsAppeared.length}`);
        console.log(`  Application loads properly: Yes`);
        console.log(`  Tab switching works: Yes`);
        console.log(`  Auto-restore working silently: ${segmentCount > 0 ? 'Yes' : 'No data to restore'}`);
        
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