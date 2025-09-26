const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing Model Loading Confirmation Prompt...\n');

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        slowMo: 500,
        devtools: process.env.DEVTOOLS === 'true'
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1400, height: 900 });

    // Track dialogs and confirmations
    const dialogs = [];
    page.on('dialog', async dialog => {
        dialogs.push({
            type: dialog.type(),
            message: dialog.message(),
            timestamp: new Date().toISOString()
        });
        console.log(`📋 DIALOG: ${dialog.type()} - "${dialog.message().substring(0, 100)}..."`);
        
        // Accept confirmation dialogs for testing
        if (dialog.type() === 'confirm') {
            await dialog.accept();
        } else {
            await dialog.dismiss();
        }
    });

    try {
        console.log('📱 Loading application...');
        await page.goto('http://localhost:4174/index-working.html', { waitUntil: 'networkidle' });
        await page.waitForSelector('#mainTitle', { timeout: 10000 });
        console.log('✅ Application loaded successfully');

        // Step 1: Create and save a test model first
        console.log('\n🔧 Step 1: Creating a test model...');
        
        // Add a segment
        await page.click('#addSegment');
        await page.waitForTimeout(500);
        
        await page.fill('input[placeholder="Enter segment name"]', 'Test Model Confirmation');
        await page.fill('input[placeholder="Price per transaction (₹)"]', '1.75');
        await page.fill('input[placeholder="Monthly volume"]', '2500000');
        
        // Save the model
        await page.click('#saveModel');
        await page.waitForTimeout(1000);
        
        // Fill model name if prompted
        const modelNameInput = await page.$('#modelNameInput');
        if (modelNameInput) {
            await page.fill('#modelNameInput', 'Test Confirmation Model');
            await page.click('#saveModelDialog .btn-primary');
            await page.waitForTimeout(1000);
        }
        
        console.log('✅ Test model created and saved');

        // Step 2: Navigate to Saved Models tab
        console.log('\n📂 Step 2: Navigating to Saved Models tab...');
        await page.click('.tab:nth-child(5)'); // Models tab
        await page.waitForTimeout(1500);
        
        console.log('✅ Models tab loaded');

        // Step 3: Check if our test model exists
        const modelCards = await page.$$('.model-card');
        console.log(`📊 Found ${modelCards.length} saved model(s)`);

        if (modelCards.length === 0) {
            console.log('⚠️  No models found, creating a default model first...');
            // Go back to setup and create a model
            await page.click('.tab:nth-child(1)'); // Setup tab
            await page.waitForTimeout(500);
            
            // Save current state as a model
            await page.evaluate(() => {
                if (typeof window.saveModel === 'function') {
                    window.saveModel('Confirmation Test Model');
                }
            });
            
            await page.waitForTimeout(1000);
            
            // Go back to models tab
            await page.click('.tab:nth-child(5)');
            await page.waitForTimeout(1000);
        }

        // Step 4: Test loading confirmation
        console.log('\n🔍 Step 3: Testing model loading confirmation...');
        
        const loadButtons = await page.$$('.model-action-btn.load');
        console.log(`🔲 Found ${loadButtons.length} load button(s)`);

        if (loadButtons.length > 0) {
            console.log('📋 Clicking load button to trigger confirmation...');
            await loadButtons[0].click();
            await page.waitForTimeout(2000); // Wait for dialog
            
            // Check if confirmation dialog appeared
            const confirmationDialog = dialogs.find(d => d.type === 'confirm' && d.message.includes('Load Model'));
            
            if (confirmationDialog) {
                console.log('✅ Confirmation dialog appeared successfully!');
                console.log(`📝 Dialog message preview: "${confirmationDialog.message.substring(0, 150)}..."`);
                
                // Check if dialog contains expected information
                const hasModelInfo = confirmationDialog.message.includes('segment(s)') &&
                                   confirmationDialog.message.includes('Country:') &&
                                   confirmationDialog.message.includes('Last updated:') &&
                                   confirmationDialog.message.includes('Version:');
                
                if (hasModelInfo) {
                    console.log('✅ Confirmation dialog contains all expected model information');
                } else {
                    console.log('⚠️  Confirmation dialog missing some model information');
                }
            } else {
                console.log('❌ No confirmation dialog detected');
            }
        } else {
            console.log('❌ No load buttons found');
        }

        // Step 5: Verify model loading behavior
        console.log('\n🚀 Step 4: Verifying model loading behavior...');
        
        // Check if we're on setup tab (indicates successful load)
        const setupTabActive = await page.evaluate(() => {
            const setupTab = document.querySelector('.tab:nth-child(1)');
            return setupTab && setupTab.classList.contains('active');
        });

        if (setupTabActive) {
            console.log('✅ Successfully switched to setup tab after model load');
        } else {
            console.log('⚠️  Did not switch to setup tab - checking current tab');
            const activeTab = await page.evaluate(() => {
                const activeTabs = document.querySelectorAll('.tab.active');
                return activeTabs.length > 0 ? activeTabs[0].textContent.trim() : 'None';
            });
            console.log(`📍 Current active tab: ${activeTab}`);
        }

        // Check for success message
        const successToast = await page.$('.toast.success');
        if (successToast) {
            const toastText = await successToast.textContent();
            console.log(`✅ Success toast displayed: "${toastText}"`);
        }

        // Step 6: Final validation
        console.log('\n🎉 Model Loading Confirmation Test Summary:');
        console.log(`  Dialogs detected: ${dialogs.length}`);
        console.log(`  Confirmation dialogs: ${dialogs.filter(d => d.type === 'confirm').length}`);
        console.log(`  Load model dialogs: ${dialogs.filter(d => d.message.includes('Load Model')).length}`);
        console.log(`  Setup tab active: ${setupTabActive ? 'Yes' : 'No'}`);
        console.log(`  Load buttons found: ${loadButtons ? loadButtons.length : 0}`);

        if (dialogs.some(d => d.type === 'confirm' && d.message.includes('Load Model'))) {
            console.log('🎯 SUCCESS: Model loading confirmation is working!');
        } else {
            console.log('❌ ISSUE: No model loading confirmation detected');
        }

        if (process.env.KEEP_OPEN === 'true') {
            console.log('\n🌐 Browser staying open for manual inspection...');
            await page.waitForTimeout(30000);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (process.env.KEEP_OPEN !== 'true') {
            await browser.close();
        }
    }
})();