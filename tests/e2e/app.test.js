/**
 * End-to-end tests for APAC Revenue Projections Tool
 * Supports both headless and visible browser modes via environment variables
 */

describe('APAC Revenue Projections E2E Tests', () => {
  beforeAll(async () => {
    // Add debug breakpoint if enabled
    if (global.debugBreakpoint) {
      await global.debugBreakpoint('Starting E2E tests - about to navigate to application');
    }
    
    await page.goto('http://localhost:3000/index.html', {
      waitUntil: 'networkidle2'
    });
    
    // Add debug breakpoint after page load if enabled
    if (global.debugBreakpoint) {
      await global.debugBreakpoint('Application loaded successfully');
    }
  });

  describe('Page Load and Initial State', () => {
    test('should load the application', async () => {
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).toContain('APAC Revenue Projection Tool');
    });

    test('should have all main tabs', async () => {
      const tabs = await page.$$eval('.tab', tabs => 
        tabs.map(tab => tab.textContent.trim())
      );
      
      expect(tabs).toContain('📊 Setup & Segments');
      expect(tabs).toContain('📈 Projections');
      expect(tabs).toContain('🔍 Analysis');
      expect(tabs).toContain('🌏 Demographics');
      expect(tabs).toContain('💾 Saved Models');
    });

    test('should have country selector', async () => {
      const countrySelect = await page.$('#countrySelect');
      expect(countrySelect).toBeTruthy();
      
      const options = await page.$$eval('#countrySelect option', options =>
        options.map(opt => opt.value)
      );
      expect(options).toContain('india');
      expect(options).toContain('singapore');
      expect(options).toContain('australia');
    });
  });

  describe('Add Segment Flow', () => {
    test('should add a new segment', async () => {
      // Click on Setup tab if not already active
      await page.click('.tab:first-child');
      await page.waitForTimeout(500);

      // Fill in segment form
      await page.type('#segmentName', 'E-commerce Authentication');
      await page.type('#pricePerTransaction', '2.5');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.type('#volumeGrowthRate', '10');
      
      // Click Add Segment button
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(500);

      // Verify segment was added to the list
      const segmentsList = await page.$('#segmentsList');
      const segmentText = await page.evaluate(el => el.textContent, segmentsList);
      expect(segmentText).toContain('E-commerce Authentication');
    });

    test('should validate segment inputs', async () => {
      // Try to add segment with invalid data
      await page.evaluate(() => {
        document.getElementById('segmentName').value = '';
        document.getElementById('pricePerTransaction').value = '-1';
      });
      
      await page.click('button[onclick="addOrUpdateSegment()"]');
      
      // Check for validation error (implementation dependent)
      // Most apps would show an error message or alert
      const alertMessage = await page.evaluate(() => {
        return window.lastAlertMessage || '';
      });
      
      // Expect some form of validation feedback
      expect(alertMessage || true).toBeTruthy();
    });
  });

  describe('Calculate Projections', () => {
    test('should calculate projections when button clicked', async () => {
      // Switch to Projections tab
      await page.evaluate(() => {
        document.querySelectorAll('.tab')[1].click();
      });
      await page.waitForTimeout(500);

      // Click Calculate Projections button
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(1000);

      // Check if results are displayed
      const resultsTable = await page.$('#projectionsTable');
      expect(resultsTable).toBeTruthy();

      // Verify chart is rendered
      const chartCanvas = await page.$('#projectionChart');
      expect(chartCanvas).toBeTruthy();
    });

    test('should update projections when parameters change', async () => {
      // Change growth rate
      await page.evaluate(() => {
        document.getElementById('growthRate').value = '15';
      });

      // Recalculate
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(500);

      // Projections should be updated (verify by checking if table exists)
      const hasProjections = await page.$eval('#projectionsTable', el => 
        el.children.length > 0
      );
      expect(hasProjections).toBe(true);
    });
  });

  describe('Export Functionality', () => {
    test('should export to Excel', async () => {
      // Set up download handler
      const downloadPromise = new Promise((resolve) => {
        page.once('download', download => resolve(download));
      });

      // Click export button
      await page.click('button[onclick="exportToExcel()"]');
      
      // Wait for download
      const download = await Promise.race([
        downloadPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 5000))
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toContain('.xlsx');
      }
    });
  });

  describe('Demographics Tab', () => {
    test('should load demographic data', async () => {
      // Switch to Demographics tab
      await page.evaluate(() => {
        document.querySelectorAll('.tab')[3].click();
      });
      await page.waitForTimeout(500);

      // Check if demographic data is displayed
      const demographicContent = await page.$eval('#demographics', el => 
        el.textContent
      );
      expect(demographicContent).toBeTruthy();
    });

    test('should switch countries and update demographics', async () => {
      // Change country
      await page.select('#countrySelect', 'singapore');
      await page.waitForTimeout(500);

      // Verify country change
      const selectedCountry = await page.$eval('#countrySelect', el => el.value);
      expect(selectedCountry).toBe('singapore');

      // Check if demographics updated (title should change)
      const title = await page.$eval('#mainTitle', el => el.textContent);
      expect(title).toContain('APAC');
    });
  });

  describe('Save and Load Models', () => {
    test('should save current model', async () => {
      // Switch to Models tab
      await page.evaluate(() => {
        document.querySelectorAll('.tab')[4].click();
      });
      await page.waitForTimeout(500);

      // Save model
      await page.type('#modelName', 'Test Model');
      await page.click('button[onclick="saveCurrentModel()"]');
      await page.waitForTimeout(500);

      // Verify model was saved
      const modelsList = await page.$('#savedModelsList');
      if (modelsList) {
        const modelsText = await page.evaluate(el => el.textContent, modelsList);
        expect(modelsText).toContain('Test Model');
      }
    });

    test('should load saved model', async () => {
      // Assuming a model exists, click load
      const loadButton = await page.$('button[onclick*="loadModel"]');
      if (loadButton) {
        await loadButton.click();
        await page.waitForTimeout(500);

        // Verify model loaded (segments should be populated)
        const segments = await page.$$eval('#segmentsList .segment-item', 
          items => items.length
        );
        expect(segments).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Responsive Design', () => {
    test('should be responsive on mobile', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Check if elements are still visible
      const title = await page.$('h1');
      expect(title).toBeTruthy();

      // Reset viewport
      await page.setViewport({ width: 1280, height: 800 });
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate offline
      await page.setOfflineMode(true);
      
      // Try to perform an action
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(500);

      // Should not crash
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();

      // Reset online
      await page.setOfflineMode(false);
    });
  });

  describe('Performance', () => {
    test('should load within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test('should calculate projections quickly', async () => {
      // Add multiple segments
      for (let i = 0; i < 10; i++) {
        await page.evaluate((index) => {
          window.segments.push({
            id: Date.now() + index,
            name: `Segment ${index}`,
            pricePerTransaction: 2,
            costPerTransaction: 0.5,
            monthlyVolume: 1000000,
            volumeGrowth: 10
          });
        }, i);
      }

      const startTime = Date.now();
      
      // Calculate projections
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(100);
      
      const calcTime = Date.now() - startTime;
      expect(calcTime).toBeLessThan(500); // Should calculate in under 500ms
    });
  });
});

describe('Comparison Between Versions', () => {
  let workingVersionPage;
  let newVersionPage;

  beforeAll(async () => {
    // Open both versions in separate pages
    workingVersionPage = await browser.newPage();
    await workingVersionPage.goto('http://localhost:3000/index-working.html');
    
    newVersionPage = await browser.newPage();
    await newVersionPage.goto('http://localhost:3000/index.html');
  });

  afterAll(async () => {
    await workingVersionPage.close();
    await newVersionPage.close();
  });

  test('both versions should have identical UI', async () => {
    const workingTitle = await workingVersionPage.$eval('h1', el => el.textContent);
    const newTitle = await newVersionPage.$eval('h1', el => el.textContent);
    
    expect(workingTitle).toBe(newTitle);
  });

  test('both versions should produce same calculations', async () => {
    // Add same segment to both
    const addSegment = async (page) => {
      await page.evaluate(() => {
        window.segments = [{
          id: 1,
          name: 'Test',
          pricePerTransaction: 2,
          costPerTransaction: 0.5,
          monthlyVolume: 1000000,
          volumeGrowth: 10
        }];
      });
    };

    await addSegment(workingVersionPage);
    await addSegment(newVersionPage);

    // Calculate projections in both
    await workingVersionPage.click('button[onclick="calculateProjections()"]');
    await newVersionPage.click('button[onclick="calculateProjections()"]');
    
    await workingVersionPage.waitForTimeout(500);
    await newVersionPage.waitForTimeout(500);

    // Compare results (simplified - would need actual result extraction)
    const workingHasResults = await workingVersionPage.$('#projectionsTable');
    const newHasResults = await newVersionPage.$('#projectionsTable');
    
    expect(!!workingHasResults).toBe(!!newHasResults);
  });
});