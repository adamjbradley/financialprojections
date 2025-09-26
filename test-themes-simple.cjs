const { chromium } = require('playwright');

async function testThemes() {
    console.log('🎨 Testing Theme System (Simple)...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to the application
        await page.goto('http://localhost:3000');
        console.log('✅ Application loaded');
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // Check if theme selector exists
        const themeSelect = await page.$('#themeSelect');
        if (themeSelect) {
            console.log('✅ Theme selector found');
            
            // Test one theme change
            await page.selectOption('#themeSelect', 'mastercard');
            await page.waitForTimeout(2000);
            
            const dataTheme = await page.getAttribute('html', 'data-theme');
            console.log(`Theme applied: ${dataTheme}`);
            
            // Test title change
            const titleText = await page.textContent('#mainTitle');
            console.log(`Title: ${titleText}`);
            
            // Keep browser open to manually test other themes
            console.log('Browser will stay open for manual testing...');
            await page.waitForTimeout(30000);
            
        } else {
            console.log('❌ Theme selector not found');
        }
        
    } catch (error) {
        console.error('❌ Theme test failed:', error);
    } finally {
        await browser.close();
    }
}

testThemes().catch(console.error);