/**
 * Playwright Global Setup
 * Ensures the application server is ready before running tests
 */

import { test as setup } from '@playwright/test';

setup('verify application is accessible', async ({ page }) => {
  // Go to the application
  await page.goto('/');
  
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  
  // Verify basic page elements are present
  const body = page.locator('body');
  await body.waitFor({ state: 'visible' });
  
  console.log('✅ Application setup verification complete');
});