/**
 * Simple standalone Puppeteer test to verify browser functionality
 * This bypasses jest-puppeteer's complex setup that was causing WebSocket issues
 */

const puppeteer = require('puppeteer');

async function testApp() {
  console.log('🚀 Starting simple browser test...');
  
  // Launch browser with more conservative settings
  const browser = await puppeteer.launch({
    headless: true,  // Revert to working headless mode
    defaultViewport: {
      width: 1280,
      height: 800
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    ignoreHTTPSErrors: true,
    timeout: 60000,
    slowMo: 100  // Slow down for visibility
  });

  try {
    console.log('📄 Opening new page...');
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to application...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('🔍 Waiting for main elements...');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('📋 Checking page title...');
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    
    console.log('🎯 Checking main heading...');
    const heading = await page.$eval('h1', el => el.textContent);
    console.log(`✅ Main heading: ${heading}`);
    
    console.log('🔘 Testing button functionality...');
    const buttons = await page.$$('button');
    console.log(`✅ Found ${buttons.length} buttons`);
    
    // Test the India market tab - this should be reliable
    console.log('🇮🇳 Testing India market tab...');
    const indiaTab = await page.$('#indiaTab');
    if (indiaTab) {
      await indiaTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ India tab clicked successfully');
    }
    
    // Keep browser open for 5 seconds to see results
    console.log('⏳ Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('⚡ Checking if development server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Development server is not running!');
    console.log('💡 Please run "npm run dev" in another terminal first');
    process.exit(1);
  }
  
  console.log('✅ Server is running, starting test...');
  await testApp();
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});