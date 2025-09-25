/**
 * Performance benchmarking and load testing
 * Tests application performance under various conditions
 */

describe('Performance Benchmarks', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Page Load Performance', () => {
    test('initial page load should complete within performance budget', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds on local environment
      expect(loadTime).toBeLessThan(3000);
      
      // Verify critical content is visible
      const title = await page.$('#mainTitle');
      expect(title).toBeTruthy();
    });

    test('page should be interactive quickly', async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'domcontentloaded'
      });
      
      const startTime = Date.now();
      
      // Test basic interactivity
      await page.click('.tab:nth-child(2)');
      await page.waitForSelector('#projections', { visible: true });
      
      const interactiveTime = Date.now() - startTime;
      
      // Should become interactive within 1 second
      expect(interactiveTime).toBeLessThan(1000);
    });

    test('stylesheets and scripts should load efficiently', async () => {
      const resourceTimings = [];
      
      page.on('response', response => {
        const url = response.url();
        const timing = response.timing();
        
        if (url.includes('.css') || url.includes('.js')) {
          resourceTimings.push({
            url,
            status: response.status(),
            timing
          });
        }
      });
      
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      // All critical resources should load successfully
      resourceTimings.forEach(resource => {
        expect(resource.status).toBe(200);
      });
      
      // Should have loaded CSS and JS files
      const cssResources = resourceTimings.filter(r => r.url.includes('.css'));
      const jsResources = resourceTimings.filter(r => r.url.includes('.js'));
      
      expect(cssResources.length).toBeGreaterThan(0);
      expect(jsResources.length).toBeGreaterThan(0);
    });

    test('large viewport should not impact load performance', async () => {
      await page.setViewport({ width: 2560, height: 1440 });
      
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      const loadTime = Date.now() - startTime;
      
      // Should still load quickly on large screens
      expect(loadTime).toBeLessThan(4000);
      
      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });
  });

  describe('JavaScript Execution Performance', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
    });

    test('segment addition should be fast', async () => {
      await page.click('.tab:first-child');
      
      const startTime = Date.now();
      
      // Add a single segment
      await page.type('#segmentName', 'Performance Test Segment');
      await page.type('#pricePerTransaction', '2.5');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      await page.type('#volumeGrowthRate', '10');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      
      await page.waitForTimeout(100); // Allow processing
      
      const executionTime = Date.now() - startTime;
      
      // Segment addition should complete within 500ms
      expect(executionTime).toBeLessThan(500);
    });

    test('bulk segment operations should be efficient', async () => {
      await page.click('.tab:first-child');
      
      const startTime = Date.now();
      
      // Add multiple segments quickly
      for (let i = 1; i <= 20; i++) {
        await page.evaluate((index) => {
          if (window.segments) {
            window.segments.push({
              id: Date.now() + index,
              name: `Bulk Segment ${index}`,
              type: 'sku',
              pricePerTransaction: 2 + index * 0.1,
              costPerTransaction: 0.5,
              monthlyVolume: 1000000,
              volumeGrowth: 10
            });
          }
        }, i);
      }
      
      // Trigger UI refresh
      await page.evaluate(() => {
        if (typeof renderSegments === 'function') {
          renderSegments();
        }
      });
      
      const executionTime = Date.now() - startTime;
      
      // Bulk operations should complete within 2 seconds
      expect(executionTime).toBeLessThan(2000);
    });

    test('projection calculations should be performant', async () => {
      await page.click('.tab:first-child');
      
      // Add test segments
      await page.evaluate(() => {
        window.segments = [];
        for (let i = 1; i <= 50; i++) {
          window.segments.push({
            id: i,
            name: `Perf Segment ${i}`,
            type: 'sku',
            pricePerTransaction: 2,
            costPerTransaction: 0.5,
            monthlyVolume: 1000000,
            volumeGrowth: 10
          });
        }
      });
      
      await page.click('.tab:nth-child(2)');
      
      const startTime = Date.now();
      
      // Calculate projections with many segments
      await page.click('button[onclick="calculateProjections()"]');
      
      // Wait for calculations to complete
      await page.waitForTimeout(100);
      await page.waitForSelector('#projectionsTable', { timeout: 5000 });
      
      const calculationTime = Date.now() - startTime;
      
      // Complex calculations should complete within 3 seconds
      expect(calculationTime).toBeLessThan(3000);
    });

    test('chart rendering should be fast', async () => {
      await page.click('.tab:nth-child(2)');
      
      // Add sample data
      await page.evaluate(() => {
        window.projectionData = [];
        for (let i = 0; i < 12; i++) {
          window.projectionData.push({
            month: `2025-${String(i + 1).padStart(2, '0')}`,
            revenue: 1000000 * (1.1 ** i),
            costs: 400000 * (1.1 ** i),
            profit: 600000 * (1.1 ** i)
          });
        }
      });
      
      const startTime = Date.now();
      
      // Trigger chart update
      await page.evaluate(() => {
        if (typeof updateChart === 'function') {
          updateChart();
        }
      });
      
      await page.waitForTimeout(500); // Allow chart rendering
      
      const renderTime = Date.now() - startTime;
      
      // Chart rendering should complete within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    test('form validation should be instant', async () => {
      await page.click('.tab:first-child');
      
      const iterations = 10;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        // Trigger validation
        await page.focus('#pricePerTransaction');
        await page.keyboard.type('invalid');
        await page.blur('#pricePerTransaction');
        
        const validationTime = Date.now() - startTime;
        times.push(validationTime);
        
        // Clear for next iteration
        await page.evaluate(() => {
          document.getElementById('pricePerTransaction').value = '';
        });
      }
      
      const averageTime = times.reduce((a, b) => a + b) / times.length;
      
      // Validation should be nearly instant
      expect(averageTime).toBeLessThan(50);
    });
  });

  describe('Memory Usage Performance', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
    });

    test('memory usage should remain stable with many segments', async () => {
      await page.click('.tab:first-child');
      
      const initialMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      // Add many segments
      await page.evaluate(() => {
        window.segments = [];
        for (let i = 1; i <= 1000; i++) {
          window.segments.push({
            id: i,
            name: `Memory Test ${i}`,
            type: 'sku',
            pricePerTransaction: Math.random() * 5,
            costPerTransaction: Math.random() * 2,
            monthlyVolume: Math.floor(Math.random() * 5000000),
            volumeGrowth: Math.random() * 20,
            category: 'authentication',
            notes: 'Memory usage test segment'
          });
        }
      });
      
      // Force garbage collection if available
      if (page.evaluate(() => typeof gc !== 'undefined')) {
        await page.evaluate(() => gc());
      }
      
      const finalMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });

    test('should clean up event listeners properly', async () => {
      const initialListenerCount = await page.evaluate(() => {
        // Count event listeners (simplified check)
        let count = 0;
        document.querySelectorAll('*').forEach(el => {
          if (el.onclick) count++;
        });
        return count;
      });
      
      // Simulate navigation between tabs multiple times
      for (let i = 0; i < 10; i++) {
        await page.click('.tab:nth-child(1)');
        await page.click('.tab:nth-child(2)');
        await page.click('.tab:nth-child(3)');
        await page.click('.tab:nth-child(4)');
        await page.click('.tab:nth-child(5)');
        await page.waitForTimeout(50);
      }
      
      const finalListenerCount = await page.evaluate(() => {
        let count = 0;
        document.querySelectorAll('*').forEach(el => {
          if (el.onclick) count++;
        });
        return count;
      });
      
      // Listener count shouldn't grow significantly
      const listenerIncrease = finalListenerCount - initialListenerCount;
      expect(listenerIncrease).toBeLessThan(50);
    });
  });

  describe('UI Responsiveness Performance', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
    });

    test('tab switching should be immediate', async () => {
      const switchTimes = [];
      const tabs = [1, 2, 3, 4, 5];
      
      for (const tabIndex of tabs) {
        const startTime = Date.now();
        
        await page.click(`.tab:nth-child(${tabIndex})`);
        await page.waitForSelector(`.tab:nth-child(${tabIndex}).active`, { visible: true });
        
        const switchTime = Date.now() - startTime;
        switchTimes.push(switchTime);
      }
      
      const averageSwitchTime = switchTimes.reduce((a, b) => a + b) / switchTimes.length;
      const maxSwitchTime = Math.max(...switchTimes);
      
      // Average switch time should be very fast
      expect(averageSwitchTime).toBeLessThan(100);
      
      // No single switch should take more than 300ms
      expect(maxSwitchTime).toBeLessThan(300);
    });

    test('form inputs should respond immediately to user input', async () => {
      await page.click('.tab:first-child');
      
      const inputs = ['#segmentName', '#pricePerTransaction', '#monthlyVolume'];
      const responseTimes = [];
      
      for (const inputSelector of inputs) {
        const startTime = Date.now();
        
        await page.focus(inputSelector);
        await page.keyboard.type('test');
        
        // Wait for value to be updated
        await page.waitForFunction(
          (selector) => document.querySelector(selector).value === 'test',
          {},
          inputSelector
        );
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        // Clear for next test
        await page.evaluate(selector => {
          document.querySelector(selector).value = '';
        }, inputSelector);
      }
      
      const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      
      // Input response should be nearly instant
      expect(averageResponseTime).toBeLessThan(50);
    });

    test('dropdown interactions should be smooth', async () => {
      const startTime = Date.now();
      
      // Test country selector
      await page.click('#countrySelect');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      
      const interactionTime = Date.now() - startTime;
      
      // Dropdown interaction should be quick
      expect(interactionTime).toBeLessThan(300);
    });

    test('scrolling should be smooth with large datasets', async () => {
      await page.click('.tab:first-child');
      
      // Create large dataset
      await page.evaluate(() => {
        const container = document.getElementById('segmentsList');
        if (container) {
          let html = '';
          for (let i = 1; i <= 100; i++) {
            html += `<div class="segment-item">Segment ${i}</div>`;
          }
          container.innerHTML = html;
        }
      });
      
      const startTime = Date.now();
      
      // Simulate scrolling
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 100);
        });
        await page.waitForTimeout(10);
      }
      
      const scrollTime = Date.now() - startTime;
      
      // Scrolling should be smooth
      expect(scrollTime).toBeLessThan(500);
    });
  });

  describe('Network Performance', () => {
    test('should handle slow network conditions gracefully', async () => {
      // Simulate slow 3G
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5Mbps
        uploadThroughput: 750 * 1024 / 8, // 750kbps
        latency: 40
      });
      
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      const loadTime = Date.now() - startTime;
      
      // Should still load within reasonable time on slow network
      expect(loadTime).toBeLessThan(8000);
      
      // Reset network conditions
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
    });

    test('should work offline with cached resources', async () => {
      // First load to cache resources
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      // Go offline
      await page.setOfflineMode(true);
      
      // Reload page
      await page.reload({ waitUntil: 'domcontentloaded' });
      
      // Check if basic functionality works
      const title = await page.$('#mainTitle');
      expect(title).toBeTruthy();
      
      // Test basic interactions
      await page.click('.tab:nth-child(2)');
      const projectionsTab = await page.$('#projections');
      expect(projectionsTab).toBeTruthy();
      
      // Reset online mode
      await page.setOfflineMode(false);
    });
  });

  describe('Resource Usage Performance', () => {
    beforeEach(async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
    });

    test('CPU usage should remain reasonable during calculations', async () => {
      await page.click('.tab:first-child');
      
      // Add many segments for heavy calculation
      await page.evaluate(() => {
        window.segments = [];
        for (let i = 1; i <= 100; i++) {
          window.segments.push({
            id: i,
            name: `CPU Test ${i}`,
            type: 'sku',
            pricePerTransaction: 2 + Math.random(),
            costPerTransaction: 0.5 + Math.random(),
            monthlyVolume: 1000000 + Math.random() * 1000000,
            volumeGrowth: 5 + Math.random() * 15
          });
        }
      });
      
      await page.click('.tab:nth-child(2)');
      
      const startTime = Date.now();
      
      // Perform heavy calculation
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForSelector('#projectionsTable', { timeout: 10000 });
      
      const calculationTime = Date.now() - startTime;
      
      // Even with 100 segments, calculation should complete within 5 seconds
      expect(calculationTime).toBeLessThan(5000);
    });

    test('should handle rapid user interactions without blocking', async () => {
      await page.click('.tab:first-child');
      
      const startTime = Date.now();
      
      // Rapid interaction sequence
      await page.type('#segmentName', 'Rapid Test');
      await page.type('#pricePerTransaction', '2.5');
      await page.click('.tab:nth-child(2)');
      await page.click('.tab:nth-child(3)');
      await page.click('.tab:first-child');
      await page.focus('#costPerTransaction');
      await page.keyboard.type('0.5');
      await page.click('button[onclick="addOrUpdateSegment()"]');
      
      const interactionTime = Date.now() - startTime;
      
      // Rapid interactions should not cause significant delays
      expect(interactionTime).toBeLessThan(2000);
    });

    test('memory should be released after clearing data', async () => {
      const initialMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      // Create large dataset
      await page.evaluate(() => {
        window.segments = [];
        window.projectionData = [];
        
        for (let i = 1; i <= 1000; i++) {
          window.segments.push({
            id: i,
            name: `Memory Test ${i}`,
            data: new Array(1000).fill(`data-${i}`)
          });
          
          window.projectionData.push({
            month: i,
            revenue: Math.random() * 1000000,
            costs: Math.random() * 500000,
            data: new Array(100).fill(`proj-${i}`)
          });
        }
      });
      
      // Clear data
      await page.evaluate(() => {
        window.segments = [];
        window.projectionData = [];
      });
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (typeof gc !== 'undefined') {
          gc();
        }
      });
      
      await page.waitForTimeout(1000); // Allow cleanup
      
      const finalMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryDifference = Math.abs(finalMemory - initialMemory);
        
        // Memory usage should return close to initial levels
        expect(memoryDifference).toBeLessThan(20 * 1024 * 1024); // 20MB tolerance
      }
    });
  });

  describe('Stress Testing', () => {
    test('should handle maximum realistic dataset', async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      const startTime = Date.now();
      
      // Create maximum realistic dataset (1000 segments, 60 months projection)
      await page.evaluate(() => {
        window.segments = [];
        for (let i = 1; i <= 1000; i++) {
          window.segments.push({
            id: i,
            name: `Stress Test Segment ${i}`,
            type: 'sku',
            pricePerTransaction: 1 + Math.random() * 10,
            costPerTransaction: 0.1 + Math.random() * 2,
            monthlyVolume: 10000 + Math.random() * 5000000,
            volumeGrowth: -10 + Math.random() * 30,
            category: ['authentication', 'payment', 'identity'][i % 3],
            notes: `Stress test notes for segment ${i}`
          });
        }
      });
      
      await page.click('.tab:nth-child(2)');
      
      // Set maximum projection period
      await page.evaluate(() => {
        const monthsInput = document.getElementById('projectionMonths');
        if (monthsInput) monthsInput.value = '60';
      });
      
      // Perform calculation
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForSelector('#projectionsTable', { timeout: 30000 });
      
      const totalTime = Date.now() - startTime;
      
      // Should handle maximum load within 30 seconds
      expect(totalTime).toBeLessThan(30000);
      
      // Verify UI is still responsive
      await page.click('.tab:nth-child(3)');
      const analysisTab = await page.$('#analysis');
      expect(analysisTab).toBeTruthy();
    });

    test('should recover from errors gracefully', async () => {
      await page.goto('http://localhost:3000/index.html', {
        waitUntil: 'networkidle2'
      });
      
      // Intentionally cause errors
      await page.evaluate(() => {
        // Corrupt data
        window.segments = [
          { id: 1, pricePerTransaction: 'invalid' },
          { id: 2, monthlyVolume: -1 },
          null,
          undefined,
          { id: 3, name: null }
        ];
      });
      
      // Try to perform operations
      await page.click('.tab:nth-child(2)');
      await page.click('button[onclick="calculateProjections()"]');
      await page.waitForTimeout(2000);
      
      // Application should not crash
      const title = await page.$('#mainTitle');
      expect(title).toBeTruthy();
      
      // Should still be able to navigate
      await page.click('.tab:first-child');
      const setupTab = await page.$('#setup');
      expect(setupTab).toBeTruthy();
      
      // Should be able to add new valid data
      await page.type('#segmentName', 'Recovery Test');
      await page.type('#pricePerTransaction', '2');
      await page.type('#costPerTransaction', '0.5');
      await page.type('#monthlyVolume', '1000000');
      
      const nameValue = await page.$eval('#segmentName', el => el.value);
      expect(nameValue).toBe('Recovery Test');
    });
  });
});