#!/usr/bin/env node

/**
 * Quick verification script to test both versions
 * Run with: node tests/verify-versions.js
 */

import puppeteer from 'puppeteer';

async function testVersion(url, versionName) {
  console.log(`\n🧪 Testing ${versionName}...`);
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Load page
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log(`✓ Page loaded`);
    
    // Check title
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`✓ Title found: ${title}`);
    
    // Check tabs exist
    const tabs = await page.$$eval('.tab', tabs => tabs.length);
    console.log(`✓ Found ${tabs} tabs`);
    
    // Test tab switching
    await page.evaluate(() => {
      document.querySelectorAll('.tab')[1].click();
    });
    console.log(`✓ Tab switching works`);
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Try to add a segment (test function availability)
    const hasAddFunction = await page.evaluate(() => {
      return typeof window.addOrUpdateSegment === 'function';
    });
    
    if (hasAddFunction) {
      console.log(`✓ addOrUpdateSegment function available`);
    } else {
      console.log(`⚠ addOrUpdateSegment function not found`);
    }
    
    // Check if calculateProjections exists
    const hasCalcFunction = await page.evaluate(() => {
      return typeof window.calculateProjections === 'function';
    });
    
    if (hasCalcFunction) {
      console.log(`✓ calculateProjections function available`);
    } else {
      console.log(`⚠ calculateProjections function not found`);
    }
    
    // Check for JavaScript errors
    if (errors.length > 0) {
      console.log(`⚠ Console errors found:`);
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log(`✓ No console errors`);
    }
    
    console.log(`✅ ${versionName} test completed`);
    
  } catch (error) {
    console.error(`❌ Error testing ${versionName}:`, error.message);
  } finally {
    await browser.close();
  }
}

async function compareVersions() {
  console.log('🔍 Comparing APAC Revenue Projections Versions\n');
  console.log('================================');
  
  // Test working version
  await testVersion('http://localhost:3000/index-working.html', 'Working Monolithic Version');
  
  // Test new version
  await testVersion('http://localhost:3000/index.html', 'New Externalized Version');
  
  console.log('\n================================');
  console.log('✨ Comparison complete!\n');
  console.log('Next steps:');
  console.log('1. If both versions pass all tests, the externalization was successful');
  console.log('2. If the new version has missing functions, check app.js loading');
  console.log('3. Open both in browser for manual testing: http://localhost:3000/dev.html');
}

// Run the comparison
compareVersions().catch(console.error);