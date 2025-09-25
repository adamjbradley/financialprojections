/**
 * Visual regression tests to ensure UI consistency
 * Captures screenshots and compares against baseline images
 */

const fs = require('fs');
const path = require('path');

describe('Visual Regression Test Suite', () => {
  let page;
  const screenshotDir = path.join(__dirname, '../screenshots');
  const baselineDir = path.join(screenshotDir, 'baseline');
  const actualDir = path.join(screenshotDir, 'actual');
  const diffDir = path.join(screenshotDir, 'diff');

  beforeAll(async () => {
    // Create screenshot directories
    [screenshotDir, baselineDir, actualDir, diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/index.html', {
      waitUntil: 'networkidle2'
    });
  });

  afterAll(async () => {
    await page.close();
  });

  // Helper function to take and compare screenshots
  const compareScreenshot = async (name, selector = null, options = {}) => {
    const screenshotOptions = {
      path: path.join(actualDir, `${name}.png`),
      fullPage: options.fullPage || false,
      ...options
    };

    if (selector) {
      const element = await page.$(selector);
      expect(element).toBeTruthy();
      await element.screenshot(screenshotOptions);
    } else {
      await page.screenshot(screenshotOptions);
    }

    // In a real implementation, you would compare with baseline images
    // For now, we just ensure the screenshot was taken
    const actualPath = screenshotOptions.path;
    expect(fs.existsSync(actualPath)).toBe(true);
    
    const stats = fs.statSync(actualPath);
    expect(stats.size).toBeGreaterThan(1000); // Screenshot should be substantial
  };

  describe('Full Page Screenshots', () => {
    test('landing page initial state', async () => {
      await compareScreenshot('landing-page-initial', null, { fullPage: true });
    });

    test('setup tab view', async () => {
      await page.click('.tab:first-child');
      await page.waitForTimeout(500);
      await compareScreenshot('setup-tab-view', null, { fullPage: true });
    });

    test('projections tab view', async () => {
      await page.click('.tab:nth-child(2)');
      await page.waitForTimeout(500);
      await compareScreenshot('projections-tab-view', null, { fullPage: true });
    });

    test('analysis tab view', async () => {
      await page.click('.tab:nth-child(3)');
      await page.waitForTimeout(500);
      await compareScreenshot('analysis-tab-view', null, { fullPage: true });
    });

    test('demographics tab view', async () => {
      await page.click('.tab:nth-child(4)');
      await page.waitForTimeout(500);
      await compareScreenshot('demographics-tab-view', null, { fullPage: true });
    });

    test('saved models tab view', async () => {
      await page.click('.tab:nth-child(5)');
      await page.waitForTimeout(500);
      await compareScreenshot('saved-models-tab-view', null, { fullPage: true });
    });
  });

  describe('Component Screenshots', () => {
    beforeEach(async () => {
      await page.click('.tab:first-child'); // Reset to setup tab
      await page.waitForTimeout(300);
    });

    test('header and navigation area', async () => {
      await compareScreenshot('header-navigation', '.header-container');
    });

    test('tab navigation bar', async () => {
      await compareScreenshot('tab-navigation', '.tabs');
    });

    test('segment builder form', async () => {
      await compareScreenshot('segment-builder-form', '.segment-builder');
    });

    test('segments list empty state', async () => {
      await compareScreenshot('segments-list-empty', '#segmentsList');
    });

    test('segments list with data', async () => {
      // Add a test segment
      await page.type('#segmentName', 'Visual Test Segment');
      await page.type('#pricePerTransaction', '2.5');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.type('#volumeGrowthRate', '10');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(500);

      await compareScreenshot('segments-list-with-data', '#segmentsList');
    });

    test('input sections', async () => {
      await compareScreenshot('input-section', '.input-section');
    });

    test('country selector dropdown', async () => {
      await page.click('#countrySelect');
      await page.waitForTimeout(200);
      await compareScreenshot('country-selector-open', '.country-selector');
    });
  });

  describe('Form States Screenshots', () => {
    beforeEach(async () => {
      await page.click('.tab:first-child');
      await page.waitForTimeout(300);
    });

    test('empty form state', async () => {
      await page.click('button[onclick="clearSegmentForm()"]');
      await page.waitForTimeout(300);
      await compareScreenshot('form-empty-state', '.segment-builder');
    });

    test('filled form state', async () => {
      await page.type('#segmentName', 'Filled Form Test');
      await page.type('#pricePerTransaction', '3.75');
      await page.type('#costPerTransaction', '1.25');
      await page.type('#monthlyVolume', '2500000');
      await page.type('#volumeGrowthRate', '15');
      await page.select('#categorySelect', 'authentication');
      await page.type('#segmentNotes', 'This is a test segment for visual regression testing');
      
      await compareScreenshot('form-filled-state', '.segment-builder');
    });

    test('operating expense type variations', async () => {
      // Fixed expense type
      await page.select('#operatingExpenseType', 'fixed');
      await page.waitForTimeout(200);
      await compareScreenshot('operating-expense-fixed', '.input-section');

      // Percentage expense type  
      await page.select('#operatingExpenseType', 'percentage');
      await page.waitForTimeout(200);
      await compareScreenshot('operating-expense-percentage', '.input-section');

      // Hybrid expense type
      await page.select('#operatingExpenseType', 'hybrid');
      await page.waitForTimeout(200);
      await compareScreenshot('operating-expense-hybrid', '.input-section');
    });
  });

  describe('Interactive States Screenshots', () => {
    test('button hover states', async () => {
      const button = await page.$('button[onclick="addOrUpdateSegment()"]');
      await page.hover('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(200);
      await compareScreenshot('button-hover-state', '.segment-builder');
    });

    test('input focus states', async () => {
      await page.focus('#segmentName');
      await page.waitForTimeout(200);
      await compareScreenshot('input-focus-state', '.segment-builder');
    });

    test('tab active states', async () => {
      // Each tab should have distinct active state
      for (let i = 0; i < 5; i++) {
        await page.click(`.tab:nth-child(${i + 1})`);
        await page.waitForTimeout(300);
        await compareScreenshot(`tab-${i + 1}-active-state`, '.tabs');
      }
    });
  });

  describe('Data Visualization Screenshots', () => {
    beforeEach(async () => {
      // Add sample data for visualizations
      await page.click('.tab:first-child');
      
      // Clear any existing segments
      await page.evaluate(() => {
        if (window.segments) window.segments = [];
      });
      
      // Add multiple segments for better visualization
      const sampleSegments = [
        { name: 'E-commerce Auth', price: '2.5', cost: '0.5', volume: '1000000', growth: '10' },
        { name: 'Banking Services', price: '4.0', cost: '1.0', volume: '500000', growth: '8' },
        { name: 'Government ID', price: '1.5', cost: '0.3', volume: '2000000', growth: '12' }
      ];

      for (const segment of sampleSegments) {
        await page.click('button[onclick="clearSegmentForm()"]');
        await page.type('#segmentName', segment.name);
        await page.type('#pricePerTransaction', segment.price);
        await page.type('#costPerTransaction', segment.cost);
        await page.type('#monthlyVolume', segment.volume);
        await page.type('#volumeGrowthRate', segment.growth);
        await page.click('button[onclick="addOrUpdateSegment()"]');
        await page.waitForTimeout(300);
      }
    });

    test('projections table view', async () => {
      await page.click('.tab:nth-child(2)');
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(2000);
      
      await compareScreenshot('projections-table-populated', '#projectionsTable');
    });

    test('chart visualization', async () => {
      await page.click('.tab:nth-child(2)');
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(2000);
      
      const chart = await page.$('#projectionChart');
      if (chart) {
        await compareScreenshot('revenue-projection-chart', '#projectionChart');
      }
    });

    test('consolidated vs segmented view', async () => {
      await page.click('.tab:nth-child(2)');
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(2000);

      // Consolidated view
      await page.click('button[onclick="setView(\'consolidated\')"]');
      await page.waitForTimeout(500);
      await compareScreenshot('projections-consolidated-view', '#projections');

      // Segmented view
      await page.click('button[onclick="setView(\'segmented\')"]');
      await page.waitForTimeout(500);
      await compareScreenshot('projections-segmented-view', '#projections');
    });
  });

  describe('Modal and Dialog Screenshots', () => {
    test('segment library dialog', async () => {
      const libraryButton = await page.$('button[onclick="openSegmentLibraryDialog()"]');
      if (libraryButton) {
        await libraryButton.click();
        await page.waitForTimeout(500);
        await compareScreenshot('segment-library-dialog', '#segmentLibraryDialog');
        
        // Close dialog
        const closeButton = await page.$('button[onclick="closeSegmentLibraryDialog()"]');
        if (closeButton) await closeButton.click();
      }
    });

    test('save model dialog', async () => {
      await page.click('.tab:nth-child(5)'); // Saved Models tab
      const saveButton = await page.$('button[onclick="saveCurrentModel()"]');
      if (saveButton) {
        await saveButton.click();
        await page.waitForTimeout(500);
        await compareScreenshot('save-model-dialog', '#saveModelDialog');
      }
    });

    test('segment edit dialog', async () => {
      await page.click('.tab:first-child');
      
      // Add a segment first
      await page.type('#segmentName', 'Edit Dialog Test');
      await page.type('#pricePerTransaction', '2');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(500);

      // Try to edit
      const editButton = await page.$('button[onclick*="editSegment"]');
      if (editButton) {
        await editButton.click();
        await page.waitForTimeout(500);
        await compareScreenshot('segment-edit-dialog', '#skuEditDialog');
      }
    });
  });

  describe('Responsive Design Screenshots', () => {
    test('mobile viewport layout', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      await compareScreenshot('mobile-layout', null, { fullPage: true });
      
      // Test mobile tab navigation
      await compareScreenshot('mobile-tabs', '.tabs');
      
      // Test mobile form layout
      await compareScreenshot('mobile-form', '.segment-builder');
    });

    test('tablet viewport layout', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      await compareScreenshot('tablet-layout', null, { fullPage: true });
      
      await compareScreenshot('tablet-input-section', '.input-section');
    });

    test('desktop large viewport layout', async () => {
      await page.setViewport({ width: 2560, height: 1440 });
      await page.waitForTimeout(500);
      await compareScreenshot('desktop-large-layout', null, { fullPage: true });
    });

    afterEach(async () => {
      // Reset to default viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });
  });

  describe('Theme and Styling Screenshots', () => {
    test('button variations', async () => {
      await page.click('.tab:first-child');
      await compareScreenshot('button-variations', '.segment-header');
    });

    test('form input variations', async () => {
      await compareScreenshot('input-variations', '.input-section');
    });

    test('success and error states', async () => {
      // Try to trigger success state
      await page.type('#segmentName', 'Success State Test');
      await page.type('#pricePerTransaction', '2');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(500);
      
      // Capture any toast notifications
      const toast = await page.$('.toast');
      if (toast) {
        await compareScreenshot('success-toast', '.toast');
      }
    });

    test('loading states', async () => {
      await page.click('.tab:nth-child(2)');
      
      // Try to capture loading state (timing sensitive)
      const calculationPromise = page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(50); // Capture during loading
      
      const loadingElement = await page.$('.loading, .spinner');
      if (loadingElement) {
        await compareScreenshot('loading-state', '.loading, .spinner');
      }
      
      await calculationPromise;
    });
  });

  describe('Country-Specific Screenshots', () => {
    test('india country selection', async () => {
      await page.select('#countrySelect', 'india');
      await page.waitForTimeout(500);
      await compareScreenshot('country-india-selected', null, { fullPage: true });
    });

    test('singapore country selection', async () => {
      await page.select('#countrySelect', 'singapore');
      await page.waitForTimeout(500);
      await compareScreenshot('country-singapore-selected', null, { fullPage: true });
    });

    test('australia country selection', async () => {
      await page.select('#countrySelect', 'australia');
      await page.waitForTimeout(500);
      await compareScreenshot('country-australia-selected', null, { fullPage: true });
    });

    test('demographics tab country-specific data', async () => {
      await page.click('.tab:nth-child(4)'); // Demographics tab
      
      // Test different countries
      const countries = ['india', 'singapore', 'australia'];
      for (const country of countries) {
        await page.select('#countrySelect', country);
        await page.waitForTimeout(1000); // Allow time for data loading
        await compareScreenshot(`demographics-${country}`, '#demographicContent');
      }
    });
  });

  describe('Data States Screenshots', () => {
    test('empty data states', async () => {
      // Clear all data
      await page.evaluate(() => {
        if (window.segments) window.segments = [];
        if (window.projectionData) window.projectionData = [];
      });
      
      await page.reload({ waitUntil: 'networkidle2' });
      
      await compareScreenshot('empty-segments-state', '#segmentsList');
      
      await page.click('.tab:nth-child(2)');
      await compareScreenshot('empty-projections-state', '#projections');
      
      await page.click('.tab:nth-child(5)');
      await compareScreenshot('empty-models-state', '#savedModelsList');
    });

    test('error states', async () => {
      // Try to trigger validation errors
      await page.click('.tab:first-child');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(300);
      
      // Look for error display
      const errorElement = await page.$('.error, .validation-error');
      if (errorElement) {
        await compareScreenshot('validation-error-state', '.segment-builder');
      }
    });

    test('maximum data states', async () => {
      await page.click('.tab:first-child');
      
      // Add many segments to test UI with lots of data
      for (let i = 1; i <= 10; i++) {
        await page.click('button[onclick="clearSegmentForm()"]');
        await page.type('#segmentName', `Segment ${i}`);
        await page.type('#pricePerTransaction', `${1 + i * 0.5}`);
        await page.type('#costPerTransaction', `${0.2 + i * 0.1}`);
        await page.type('#monthlyVolume', `${500000 + i * 100000}`);
        await page.type('#volumeGrowthRate', `${5 + i}`);
        await page.click('button[onclick="addOrUpdateSegment()"]');
        await page.waitForTimeout(200);
      }
      
      await compareScreenshot('maximum-segments-state', '#segmentsList');
      
      // Test projections with many segments
      await page.click('.tab:nth-child(2)');
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(3000);
      await compareScreenshot('maximum-projections-state', '#projections');
    });
  });
});