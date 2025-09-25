/**
 * Simple test to verify Safari/WebKit browser works with Playwright
 * Native macOS browser testing
 */

const { webkit } = require('playwright');

async function testSafariBrowser() {
  console.log('🚀 Testing Safari/WebKit with Playwright...');
  
  try {
    // Launch WebKit (Safari engine)
    const browser = await webkit.launch({
      headless: process.env.HEADLESS !== 'false'
    });

    const page = await browser.newPage();
    
    console.log('🌐 Loading APAC application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('✅ Page loaded successfully');
    
    // Basic checks
    const title = await page.title();
    console.log(`✅ Page title: "${title}"`);
    
    // Check for heading
    const heading = page.locator('h1').first();
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
      console.log('👁️  Running in VISIBLE mode - you should see Safari browser window');
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
    
    console.log('🎉 Safari/WebKit test completed successfully!');
    await browser.close();
    return true;
    
  } catch (error) {
    console.error('❌ Safari/WebKit test failed:', error.message);
    return false;
  }
}

async function main() {
  const mode = process.env.HEADLESS === 'false' ? 'VISIBLE' : 'HEADLESS';
  console.log(`🎭 Testing Safari/WebKit in ${mode} mode`);
  
  const success = await testSafariBrowser();
  
  if (success) {
    console.log('\n🏆 SUCCESS: Safari/WebKit browser automation is working!');
    console.log('Native macOS browser testing capability confirmed.');
  } else {
    console.log('\n💥 FAILED: Safari/WebKit test failed');
    process.exit(1);
  }
}

main().catch(console.error);