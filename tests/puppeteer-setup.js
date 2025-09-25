/**
 * Puppeteer-specific setup for E2E tests
 * Configures browser options based on environment variables
 */

const puppeteer = require('puppeteer');

// Global setup for Puppeteer tests
beforeAll(async () => {
  // Check if browser is already launched by jest-puppeteer
  if (!global.browser) {
    const isHeadless = process.env.HEADLESS !== 'false';
    const slowMo = process.env.SLOWMO ? parseInt(process.env.SLOWMO) : (isHeadless ? 0 : 50);
    
    global.browser = await puppeteer.launch({
      headless: isHeadless,
      slowMo: slowMo,
      devtools: process.env.DEVTOOLS === 'true',
      defaultViewport: {
        width: 1280,
        height: 800
      },
      args: isHeadless ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ] : [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  // Create a new page for each test suite
  global.page = await global.browser.newPage();
  
  // Set default viewport
  await global.page.setViewport({
    width: 1280,
    height: 800
  });

  // Configure page settings for better testing
  await global.page.setDefaultNavigationTimeout(30000);
  await global.page.setDefaultTimeout(10000);
  
  // Log console messages in visible mode for debugging
  if (process.env.HEADLESS === 'false' && process.env.DEBUG_LOGS === 'true') {
    global.page.on('console', msg => {
      console.log(`[BROWSER LOG]: ${msg.text()}`);
    });
    
    global.page.on('pageerror', error => {
      console.log(`[BROWSER ERROR]: ${error.message}`);
    });
  }
});

// Cleanup after each test
afterEach(async () => {
  // Add delay in visible mode to see results
  if (process.env.HEADLESS === 'false' && process.env.PAUSE_AFTER_EACH === 'true') {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
});

// Global cleanup
afterAll(async () => {
  try {
    if (global.page && !global.page.isClosed()) {
      await global.page.close();
    }
  } catch (error) {
    console.log('Page cleanup error (ignoring):', error.message);
  }
  
  try {
    // Always close browser unless explicitly kept open AND in visible mode
    if (global.browser && process.env.KEEP_OPEN !== 'true') {
      await global.browser.close();
    }
  } catch (error) {
    console.log('Browser cleanup error (ignoring):', error.message);
  }
});

// Increase max listeners to prevent warnings
require('events').EventEmitter.defaultMaxListeners = 15;

// Track if we've already set up process listeners to avoid duplicates
if (!global.processListenersSetup) {
  global.processListenersSetup = true;
  
  // Emergency cleanup on process exit
  process.once('exit', () => {
    // Force kill any remaining Chrome processes on exit
    require('child_process').exec('pkill -f "Chrome.*testing" || pkill -f chromium', (error) => {
      // Ignore errors, this is emergency cleanup
    });
  });

  process.once('SIGINT', async () => {
    try {
      if (global.browser) {
        await global.browser.close();
      }
    } catch (error) {
      // Force exit if browser won't close
    }
    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    try {
      if (global.browser) {
        await global.browser.close();
      }
    } catch (error) {
      // Force exit if browser won't close  
    }
    process.exit(0);
  });
}

// Helper function to wait for elements with better error messages
global.waitForSelectorWithTimeout = async (selector, timeout = 5000) => {
  try {
    await global.page.waitForSelector(selector, { timeout });
  } catch (error) {
    const url = global.page.url();
    throw new Error(`Selector "${selector}" not found within ${timeout}ms on page: ${url}`);
  }
};

// Helper function to add debug breakpoints in visible mode
global.debugBreakpoint = async (message = '') => {
  if (process.env.HEADLESS === 'false' && process.env.DEBUG_BREAKPOINTS === 'true') {
    console.log(`🔍 DEBUG BREAKPOINT: ${message}`);
    console.log('⏸️  Test execution paused. Press Enter to continue...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }
};

module.exports = {};