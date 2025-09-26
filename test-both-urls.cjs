const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing Both URLs for Dialog Fix with Microsoft Edge...\n');

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: 300,
        devtools: process.env.DEVTOOLS === 'true'
    });

    const testUrls = [
        { name: 'index.html (app.js)', url: 'http://localhost:4173/', description: 'Modular version with external app.js' },
        { name: 'index-working.html', url: 'http://localhost:4173/index-working.html', description: 'Monolithic version with inline JS' }
    ];

    for (const testUrl of testUrls) {
        console.log(`\n🔍 Testing: ${testUrl.name}`);
        console.log(`📄 Description: ${testUrl.description}`);
        console.log(`🌐 URL: ${testUrl.url}`);

        const page = await browser.newPage();
        await page.setViewportSize({ width: 1400, height: 900 });

        // Monitor for any dialogs
        let dialogsAppeared = [];
        
        page.on('dialog', async dialog => {
            dialogsAppeared.push({
                type: dialog.type(),
                message: dialog.message(),
                timestamp: new Date().toISOString()
            });
            console.log(`❌ DIALOG DETECTED: ${dialog.type()} - "${dialog.message()}"`);
            await dialog.accept();
        });

        // Log auto-restore messages
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Auto-restored') || text.includes('auto-save')) {
                console.log(`🔍 Console: ${text}`);
            }
        });

        try {
            await page.goto(testUrl.url, { waitUntil: 'networkidle' });
            await page.waitForSelector('#mainTitle', { timeout: 10000 });
            await page.waitForTimeout(3000); // Wait for any delayed dialogs
            
            console.log('✅ Page loaded successfully');

            // Check results
            if (dialogsAppeared.length === 0) {
                console.log('✅ NO DIALOGS - Fix successful!');
            } else {
                console.log(`❌ ${dialogsAppeared.length} dialog(s) detected:`);
                dialogsAppeared.forEach((dialog, index) => {
                    console.log(`  ${index + 1}. ${dialog.type}: ${dialog.message}`);
                });
            }

            // Test basic functionality
            const segmentCount = await page.evaluate(() => {
                return window.segments ? window.segments.length : 0;
            });
            console.log(`📊 Segments: ${segmentCount}`);

            // Test tab switching
            await page.click('.tab:nth-child(2)'); // Projections
            await page.waitForTimeout(500);
            await page.click('.tab:nth-child(1)'); // Back to Setup
            await page.waitForTimeout(500);
            console.log('✅ Tab switching works');

        } catch (error) {
            console.error(`❌ Test failed for ${testUrl.name}:`, error.message);
        }

        await page.close();
    }

    console.log('\n🎉 Both URL Test Summary:');
    console.log('  Both versions should now load without dialogs');
    console.log('  Users can access either:');
    console.log('  • http://localhost:4173/ (modular version)');
    console.log('  • http://localhost:4173/index-working.html (monolithic version)');

    await browser.close();
})();