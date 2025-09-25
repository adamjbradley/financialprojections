/**
 * Playwright E2E Tests for APAC Revenue Projections System
 * Multi-browser testing with improved stability over Puppeteer
 */

import { test, expect } from '@playwright/test';

test.describe('APAC Revenue Projections System', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should load application successfully', async ({ page, browserName }) => {
    console.log(`Testing on: ${browserName}`);
    
    // Check page title
    await expect(page).toHaveTitle(/Revenue Projection Tool/);
    
    // Look for main heading or content indicators
    const hasMainHeading = await page.locator('h1').count() > 0;
    if (hasMainHeading) {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      const headingText = await heading.textContent();
      console.log(`✅ Main heading: "${headingText}"`);
      
      // Check for APAC-specific content
      await expect(heading).toContainText(/APAC|Revenue|Projection/i);
    }
    
    // Count interactive elements
    const buttons = page.locator('button');
    const inputs = page.locator('input');
    const selects = page.locator('select');
    
    const buttonCount = await buttons.count();
    const inputCount = await inputs.count();
    const selectCount = await selects.count();
    
    console.log(`✅ Found ${buttonCount} buttons, ${inputCount} inputs, ${selectCount} selects`);
    
    // Verify we have interactive elements
    expect(buttonCount).toBeGreaterThan(0);
    expect(inputCount).toBeGreaterThan(0);
    
    // Check for APAC-specific content in page body
    const bodyText = await page.textContent('body');
    const hasApacContent = /APAC|Revenue|Projection|India|Singapore/i.test(bodyText);
    expect(hasApacContent).toBe(true);
  });

  test('should handle basic interactions', async ({ page }) => {
    // Test button interaction if buttons exist
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      
      // Click first button and verify no JavaScript errors
      await firstButton.click();
      
      // Wait a moment for any effects
      await page.waitForTimeout(1000);
      
      console.log('✅ Button interaction successful');
    }
  });

  test('should handle form inputs', async ({ page }) => {
    // Test form input if inputs exist
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible();
      
      // Get input type to handle correctly
      const inputType = await firstInput.getAttribute('type') || 'text';
      
      // Test typing in input based on type
      if (inputType === 'number') {
        await firstInput.fill('123');
        const value = await firstInput.inputValue();
        expect(value).toBe('123');
      } else {
        await firstInput.fill('test123');
        const value = await firstInput.inputValue();
        expect(value).toContain('test');
      }
      
      console.log('✅ Form input successful');
    }
  });

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ Page load time: ${loadTime}ms`);
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should be responsive on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for responsive behavior (content should not overflow)
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375);
    
    console.log('✅ Mobile responsive test passed');
  });

});