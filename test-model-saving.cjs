const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 Testing Model Saving Functionality...\n');

    const browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
        devtools: process.env.DEVTOOLS === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    try {
        // Navigate to the application
        console.log('📱 Loading application...');
        await page.goto('http://localhost:3001/index-working.html');
        await page.waitForSelector('#mainTitle', { timeout: 10000 });
        console.log('✅ Application loaded successfully');

        // Clear any existing models
        await page.evaluate(() => {
            localStorage.removeItem('revenueProjectionModels');
            window.savedModels = [];
        });

        // Test 1: Create a new model
        console.log('\n🔧 Test 1: Creating new model...');
        
        // Add a segment first
        await page.click('button[onclick="showSegmentDialog()"]');
        await page.waitForSelector('#segmentName');
        
        await page.type('#segmentName', 'Test Segment');
        await page.type('#pricePerTransaction', '1.50');
        await page.type('#monthlyVolume', '1000000');
        
        await page.click('button[onclick="addOrUpdateSegment()"]');
        await page.waitForTimeout(500);

        // Save the model
        await page.click('button[onclick="showSaveModelDialog()"]');
        await page.waitForSelector('#modelName');
        
        await page.type('#modelName', 'Test Model');
        await page.type('#modelDescription', 'Test model for saving functionality');
        await page.type('#modelTags', 'test,functionality');
        
        await page.click('button[onclick="saveCurrentModel()"]');
        await page.waitForTimeout(1000);

        // Verify model was saved
        const savedModels = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('revenueProjectionModels') || '[]');
        });

        if (savedModels.length === 1 && savedModels[0].name === 'Test Model') {
            console.log('✅ Model creation and saving works correctly');
        } else {
            console.log('❌ Model creation failed');
            console.log('Saved models:', savedModels);
        }

        // Test 2: Duplicate the model
        console.log('\n🔧 Test 2: Duplicating model...');
        
        // Go to Models tab
        await page.click('.tab:nth-child(7)'); // Saved Models tab
        await page.waitForTimeout(1000);

        // Find and duplicate the model
        const duplicateButton = await page.$('.duplicate');
        if (duplicateButton) {
            await duplicateButton.click();
            
            // Handle the prompt dialog
            page.once('dialog', async dialog => {
                console.log('Dialog message:', dialog.message());
                await dialog.accept('Test Model (Duplicate)');
            });
            
            await page.waitForTimeout(2000);

            // Verify duplication
            const updatedModels = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('revenueProjectionModels') || '[]');
            });

            if (updatedModels.length === 2) {
                console.log('✅ Model duplication works correctly');
                console.log('Models:', updatedModels.map(m => m.name));
            } else {
                console.log('❌ Model duplication failed');
                console.log('Updated models:', updatedModels);
            }
        } else {
            console.log('❌ Duplicate button not found');
        }

        // Test 3: Check console for save confirmations
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('Successfully saved') || msg.text().includes('models to localStorage')) {
                logs.push(msg.text());
            }
        });

        await page.waitForTimeout(1000);

        if (logs.length > 0) {
            console.log('✅ Save confirmation logs found:');
            logs.forEach(log => console.log('  📝', log));
        }

        console.log('\n🎉 Model saving functionality test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (process.env.KEEP_OPEN !== 'true') {
            await browser.close();
        } else {
            console.log('\n🌐 Browser staying open for manual inspection...');
        }
    }
})();