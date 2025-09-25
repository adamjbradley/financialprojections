/**
 * Simple test to verify Edge browser works with Playwright
 * This test bypasses the complex Playwright Test setup
 */

const { chromium } = require('playwright');

async function testEdgeBrowser() {
  console.log('🚀 Testing Microsoft Edge with Playwright...');
  
  try {
    // Launch Edge browser
    const browser = await chromium.launch({
      channel: 'msedge',
      headless: process.env.HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();
    
    console.log('🌐 Loading APAC application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('✅ Page loaded successfully');
    
    // Basic checks
    const title = await page.title();
    console.log(`✅ Page title: "${title}"`);
    
    // Check for heading
    const heading = await page.locator('h1').first();
    const headingExists = await heading.count() > 0;
    
    if (headingExists) {
      const headingText = await heading.textContent();
      console.log(`✅ Found heading: "${headingText}"`);
    }
    
    // Count elements
    const buttonCount = await page.locator('button').count();
    const inputCount = await page.locator('input').count();
    const selectCount = await page.locator('select').count();
    
    console.log(`✅ Interactive elements: ${buttonCount} buttons, ${inputCount} inputs, ${selectCount} selects`);
    
    // Test interaction if visible mode
    if (process.env.HEADLESS === 'false') {
      console.log('👁️  Running in VISIBLE mode - you should see Edge browser window');
      await page.waitForTimeout(3000);
      
      // Try clicking a button
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        console.log('🔘 Clicking first button...');
        await buttons.first().click();
        await page.waitForTimeout(2000);
        console.log('✅ Button click successful');
      }
    }
    
    console.log('🎉 Edge browser test completed successfully!');
    await browser.close();
    return true;
    
  } catch (error) {
    console.error('❌ Edge browser test failed:', error.message);
    return false;
  }
}

async function main() {
  const mode = process.env.HEADLESS === 'false' ? 'VISIBLE' : 'HEADLESS';
  console.log(`🎭 Testing Edge in ${mode} mode`);
  
  const success = await testEdgeBrowser();
  
  if (success) {
    console.log('\n🏆 SUCCESS: Edge browser automation is working!');
    console.log('This resolves the Chrome WebSocket connection issues.');
  } else {
    console.log('\n💥 FAILED: Edge browser test failed');
    process.exit(1);
  }
}

main().catch(console.error);