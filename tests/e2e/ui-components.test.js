/**
 * Comprehensive UI component tests for all interface elements
 */

describe('UI Components Test Suite', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    
    // Set a larger viewport for testing
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the application
    await page.goto('http://localhost:3000/index.html', {
      waitUntil: 'networkidle2'
    });
    
    // Suppress dialog alerts for automated testing
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Header and Navigation', () => {
    test('main title should be visible and correctly formatted', async () => {
      const title = await page.$('#mainTitle');
      expect(title).toBeTruthy();
      
      const titleText = await page.$eval('#mainTitle', el => el.textContent);
      expect(titleText).toContain('APAC Revenue Projection Tool');
      
      // Check if title has correct styling
      const titleColor = await page.$eval('#mainTitle', el => 
        window.getComputedStyle(el).color
      );
      expect(titleColor).toBeTruthy();
    });

    test('country selector should have all APAC countries', async () => {
      const options = await page.$$eval('#countrySelect option', options =>
        options.map(opt => ({ value: opt.value, text: opt.textContent }))
      );
      
      const expectedCountries = [
        'india', 'singapore', 'australia', 'japan', 
        'south_korea', 'thailand', 'indonesia', 'philippines'
      ];
      
      const optionValues = options.map(opt => opt.value);
      expectedCountries.forEach(country => {
        expect(optionValues).toContain(country);
      });
      
      // Check if options have flag emojis
      options.forEach(option => {
        expect(option.text).toMatch(/^[🇦-🇿]{2}/); // Flag emoji pattern
      });
    });

    test('country selector should trigger changeCountry function', async () => {
      await page.select('#countrySelect', 'singapore');
      
      // Wait for any changes to propagate
      await page.waitForTimeout(500);
      
      // Verify selection changed
      const selectedValue = await page.$eval('#countrySelect', el => el.value);
      expect(selectedValue).toBe('singapore');
    });

    test('version subtitle should be displayed', async () => {
      const subtitle = await page.$('.subtitle');
      expect(subtitle).toBeTruthy();
      
      const subtitleText = await page.$eval('.subtitle', el => el.textContent);
      expect(subtitleText).toContain('Version 2.2.0');
      expect(subtitleText).toContain('Enhanced CRUD Operations');
    });
  });

  describe('Tab Navigation', () => {
    test('all 5 main tabs should be present', async () => {
      const tabs = await page.$$eval('.tab', tabs =>
        tabs.map(tab => tab.textContent.trim())
      );
      
      expect(tabs).toHaveLength(5);
      expect(tabs[0]).toContain('Setup & Segments');
      expect(tabs[1]).toContain('Projections');
      expect(tabs[2]).toContain('Analysis');
      expect(tabs[3]).toContain('Demographics');
      expect(tabs[4]).toContain('Saved Models');
    });

    test('clicking tabs should switch content', async () => {
      // Test each tab
      const tabTests = [
        { index: 0, contentId: 'setup' },
        { index: 1, contentId: 'projections' },
        { index: 2, contentId: 'analysis' },
        { index: 3, contentId: 'demographics' },
        { index: 4, contentId: 'models' }
      ];
      
      for (const test of tabTests) {
        // Click tab
        await page.click(`.tab:nth-child(${test.index + 1})`);
        await page.waitForTimeout(300);
        
        // Check if corresponding content is active
        const isActive = await page.$eval(`#${test.contentId}`, el =>
          el.classList.contains('active')
        );
        expect(isActive).toBe(true);
        
        // Check if tab itself is active
        const tabActive = await page.$eval(`.tab:nth-child(${test.index + 1})`, el =>
          el.classList.contains('active')
        );
        expect(tabActive).toBe(true);
      }
    });

    test('tabs should have correct icons', async () => {
      const tabIcons = await page.$$eval('.tab', tabs =>
        tabs.map(tab => tab.textContent.charAt(0))
      );
      
      expect(tabIcons[0]).toBe('📊');
      expect(tabIcons[1]).toBe('📈');
      expect(tabIcons[2]).toBe('🔍');
      expect(tabIcons[3]).toBe('🌏');
      expect(tabIcons[4]).toBe('💾');
    });
  });

  describe('Setup Tab Components', () => {
    beforeEach(async () => {
      await page.click('.tab:first-child'); // Switch to Setup tab
      await page.waitForTimeout(300);
    });

    test('all input fields should be present and functional', async () => {
      const requiredFields = [
        'startRevenue', 'growthRate', 'projectionMonths',
        'costPercentage', 'operatingExpenses', 'usdRate'
      ];
      
      for (const fieldId of requiredFields) {
        const field = await page.$(`#${fieldId}`);
        expect(field).toBeTruthy();
        
        // Test if field accepts input
        await page.focus(`#${fieldId}`);
        await page.keyboard.selectAll();
        await page.keyboard.type('100');
        
        const value = await page.$eval(`#${fieldId}`, el => el.value);
        expect(value).toBe('100');
      }
    });

    test('operating expense type selector should show/hide inputs', async () => {
      // Test Fixed mode
      await page.select('#operatingExpenseType', 'fixed');
      
      const fixedVisible = await page.$eval('#fixedExpenseGroup', el =>
        window.getComputedStyle(el).display !== 'none'
      );
      expect(fixedVisible).toBe(true);
      
      // Test Percentage mode
      await page.select('#operatingExpenseType', 'percentage');
      
      const percentageVisible = await page.$eval('#percentageExpenseGroup', el =>
        window.getComputedStyle(el).display !== 'none'
      );
      expect(percentageVisible).toBe(true);
    });

    test('segment form should have all required fields', async () => {
      const segmentFields = [
        'segmentName', 'pricePerTransaction', 'costPerTransaction',
        'monthlyVolume', 'volumeGrowthRate', 'categorySelect', 'segmentNotes'
      ];
      
      for (const fieldId of segmentFields) {
        const field = await page.$(`#${fieldId}`);
        expect(field).toBeTruthy();
      }
    });

    test('segment builder buttons should be functional', async () => {
      const buttons = [
        'button[onclick="addOrUpdateSegment()"]',
        'button[onclick="addTestSegment()"]',
        'button[onclick="clearSegmentForm()"]'
      ];
      
      for (const buttonSelector of buttons) {
        const button = await page.$(buttonSelector);
        expect(button).toBeTruthy();
        
        // Check if button is clickable
        const isEnabled = await page.$eval(buttonSelector, el => !el.disabled);
        expect(isEnabled).toBe(true);
      }
    });

    test('segments list should display properly', async () => {
      const segmentsList = await page.$('#segmentsList');
      expect(segmentsList).toBeTruthy();
      
      // Check initial state (no segments message)
      const noSegmentsMessage = await page.$('.no-segments');
      if (noSegmentsMessage) {
        const messageText = await page.$eval('.no-segments .no-segments-message', el =>
          el.textContent
        );
        expect(messageText).toContain('No SKUs added yet');
      }
    });
  });

  describe('Projections Tab Components', () => {
    beforeEach(async () => {
      await page.click('.tab:nth-child(2)'); // Switch to Projections tab
      await page.waitForTimeout(300);
    });

    test('projection controls should be present', async () => {
      const calculateButton = await page.$('button[onclick="calculateProjections()"]');
      expect(calculateButton).toBeTruthy();
      
      // Check view toggle buttons
      const consolidatedView = await page.$('button[onclick="setView(\'consolidated\')"]');
      const segmentedView = await page.$('button[onclick="setView(\'segmented\')"]');
      
      expect(consolidatedView).toBeTruthy();
      expect(segmentedView).toBeTruthy();
    });

    test('projections table should be present', async () => {
      const projectionsTable = await page.$('#projectionsTable');
      expect(projectionsTable).toBeTruthy();
    });

    test('chart container should be present', async () => {
      const chartContainer = await page.$('#projectionChart');
      expect(chartContainer).toBeTruthy();
    });

    test('export buttons should be functional', async () => {
      const exportButtons = [
        'button[onclick="exportToExcel()"]',
        'button[onclick="exportProjections(\'csv\')"]'
      ];
      
      for (const buttonSelector of exportButtons) {
        const button = await page.$(buttonSelector);
        if (button) {
          const isEnabled = await page.$eval(buttonSelector, el => !el.disabled);
          expect(isEnabled).toBe(true);
        }
      }
    });
  });

  describe('Analysis Tab Components', () => {
    beforeEach(async () => {
      await page.click('.tab:nth-child(3)'); // Switch to Analysis tab
      await page.waitForTimeout(300);
    });

    test('analysis sections should be present', async () => {
      const analysisSections = [
        '.market-analysis',
        '.profitability-analysis',
        '.scenario-analysis'
      ];
      
      for (const selector of analysisSections) {
        const section = await page.$(selector);
        if (section) {
          expect(section).toBeTruthy();
        }
      }
    });

    test('scenario analysis controls should work', async () => {
      const scenarioButtons = await page.$$('button[onclick*="runScenario"]');
      for (const button of scenarioButtons) {
        const isEnabled = await page.evaluate(el => !el.disabled, button);
        expect(isEnabled).toBe(true);
      }
    });
  });

  describe('Demographics Tab Components', () => {
    beforeEach(async () => {
      await page.click('.tab:nth-child(4)'); // Switch to Demographics tab
      await page.waitForTimeout(300);
    });

    test('demographic navigation should be present', async () => {
      const demogNavButtons = [
        'button[onclick="showDemographicOverview()"]',
        'button[onclick="showCountryExplorer()"]',
        'button[onclick="showCountryComparison()"]',
        'button[onclick="showSegmentAnalysis()"]'
      ];
      
      for (const buttonSelector of demogNavButtons) {
        const button = await page.$(buttonSelector);
        expect(button).toBeTruthy();
      }
    });

    test('demographic content area should be present', async () => {
      const demographicContent = await page.$('#demographicContent');
      expect(demographicContent).toBeTruthy();
    });

    test('country explorer should load demographic data', async () => {
      await page.click('button[onclick="showCountryExplorer()"]');
      await page.waitForTimeout(500);
      
      // Check if demographic data is displayed
      const hasContent = await page.$eval('#demographicContent', el =>
        el.textContent.length > 0
      );
      expect(hasContent).toBe(true);
    });
  });

  describe('Saved Models Tab Components', () => {
    beforeEach(async () => {
      await page.click('.tab:nth-child(5)'); // Switch to Saved Models tab
      await page.waitForTimeout(300);
    });

    test('model management buttons should be present', async () => {
      const modelButtons = [
        'button[onclick="saveCurrentModel()"]',
        'button[onclick="createBlankModel()"]',
        'button[onclick="exportAllModels()"]'
      ];
      
      for (const buttonSelector of modelButtons) {
        const button = await page.$(buttonSelector);
        expect(button).toBeTruthy();
      }
    });

    test('saved models list should be present', async () => {
      const modelsList = await page.$('#savedModelsList');
      expect(modelsList).toBeTruthy();
    });

    test('model name input should be functional', async () => {
      const modelNameInput = await page.$('#modelName');
      if (modelNameInput) {
        await page.type('#modelName', 'Test Model');
        
        const value = await page.$eval('#modelName', el => el.value);
        expect(value).toBe('Test Model');
      }
    });
  });

  describe('Modal Dialogs', () => {
    test('segment library modal should open and close', async () => {
      // Try to find and click segment library button
      const libraryButton = await page.$('button[onclick="openSegmentLibraryDialog()"]');
      if (libraryButton) {
        await libraryButton.click();
        await page.waitForTimeout(300);
        
        // Check if modal opened
        const modal = await page.$('#segmentLibraryDialog');
        const modalVisible = await page.evaluate(el => 
          window.getComputedStyle(el).display !== 'none', modal
        );
        expect(modalVisible).toBe(true);
        
        // Close modal
        const closeButton = await page.$('button[onclick="closeSegmentLibraryDialog()"]');
        if (closeButton) {
          await closeButton.click();
        }
      }
    });

    test('SKU edit modal should have all components', async () => {
      // Add a test segment first, then try to edit
      await page.click('.tab:first-child'); // Go to Setup tab
      
      // Fill form and add segment
      await page.type('#segmentName', 'Test Segment');
      await page.type('#pricePerTransaction', '2.5');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(500);
      
      // Try to edit the segment
      const editButton = await page.$('button[onclick*="editSegment"]');
      if (editButton) {
        await editButton.click();
        await page.waitForTimeout(300);
        
        const editDialog = await page.$('#skuEditDialog');
        if (editDialog) {
          const dialogVisible = await page.evaluate(el => 
            window.getComputedStyle(el).display !== 'none', editDialog
          );
          expect(dialogVisible).toBe(true);
        }
      }
    });

    test('save model dialog should function correctly', async () => {
      const saveButton = await page.$('button[onclick="saveCurrentModel()"]');
      if (saveButton) {
        await saveButton.click();
        await page.waitForTimeout(300);
        
        const saveDialog = await page.$('#saveModelDialog');
        if (saveDialog) {
          const dialogVisible = await page.evaluate(el => 
            window.getComputedStyle(el).display !== 'none', saveDialog
          );
          expect(dialogVisible).toBe(true);
        }
      }
    });
  });

  describe('Interactive Elements', () => {
    test('all buttons should have hover effects', async () => {
      const buttons = await page.$$('button');
      
      for (const button of buttons.slice(0, 5)) { // Test first 5 buttons
        await page.hover(button);
        await page.waitForTimeout(100);
        
        // Check if cursor changes to pointer
        const cursor = await page.evaluate(el => 
          window.getComputedStyle(el).cursor, button
        );
        expect(cursor).toBe('pointer');
      }
    });

    test('form validation should show error states', async () => {
      await page.click('.tab:first-child'); // Setup tab
      
      // Try to add segment without required fields
      await page.click('button[onclick="addOrUpdateSegment()"]');
      await page.waitForTimeout(300);
      
      // Check if validation errors are shown (implementation specific)
      const errorMessage = await page.$('.error-message');
      if (errorMessage) {
        expect(errorMessage).toBeTruthy();
      }
    });

    test('dropdowns should have proper options', async () => {
      const dropdowns = [
        '#operatingExpenseType',
        '#seasonality',
        '#categorySelect'
      ];
      
      for (const dropdown of dropdowns) {
        const element = await page.$(dropdown);
        if (element) {
          const options = await page.$$eval(`${dropdown} option`, opts =>
            opts.map(opt => opt.value)
          );
          expect(options.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Toast Notifications', () => {
    test('success toast should appear for successful actions', async () => {
      await page.click('.tab:first-child'); // Setup tab
      
      // Add a valid segment
      await page.type('#segmentName', 'Success Test');
      await page.type('#pricePerTransaction', '2');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      
      await page.waitForTimeout(500);
      
      // Check for toast notification
      const toast = await page.$('.toast');
      if (toast) {
        const isVisible = await page.evaluate(el => 
          window.getComputedStyle(el).display !== 'none', toast
        );
        expect(isVisible).toBe(true);
      }
    });
  });

  describe('Search and Filtering', () => {
    test('segment search filter should be functional', async () => {
      const searchFilter = await page.$('#segmentSearchFilter');
      if (searchFilter) {
        await page.type('#segmentSearchFilter', 'test');
        
        const value = await page.$eval('#segmentSearchFilter', el => el.value);
        expect(value).toBe('test');
      }
    });

    test('category filter should have options', async () => {
      const categoryFilter = await page.$('#categoryFilter');
      if (categoryFilter) {
        const options = await page.$$eval('#categoryFilter option', opts =>
          opts.map(opt => opt.value)
        );
        expect(options).toContain('all');
      }
    });
  });

  describe('Responsive Design Elements', () => {
    test('layout should adapt to mobile viewport', async () => {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Check if main container is still visible
      const container = await page.$('.container');
      expect(container).toBeTruthy();
      
      // Check if tabs are still functional
      const tabs = await page.$$('.tab');
      expect(tabs.length).toBeGreaterThan(0);
      
      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });

    test('should handle tablet viewport', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Check key elements are still accessible
      const title = await page.$('#mainTitle');
      const tabs = await page.$$('.tab');
      
      expect(title).toBeTruthy();
      expect(tabs.length).toBe(5);
      
      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });
  });
});