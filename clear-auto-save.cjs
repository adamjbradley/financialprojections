const { chromium } = require('playwright');

(async () => {
    console.log('🧹 Clearing Auto-Save Data...\n');

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    try {
        await page.goto('http://localhost:4173/index-working.html');
        await page.waitForSelector('#mainTitle', { timeout: 10000 });
        
        // Clear auto-save data from localStorage
        const cleared = await page.evaluate(() => {
            const hadAutoSave = localStorage.getItem('autoSaveData') !== null;
            localStorage.removeItem('autoSaveData');
            return hadAutoSave;
        });
        
        console.log(`🗑️  Auto-save data ${cleared ? 'cleared' : 'was already empty'}`);
        console.log('✅ Clean state achieved for future users');
        
    } catch (error) {
        console.error('❌ Clear operation failed:', error.message);
    } finally {
        await browser.close();
    }
})();