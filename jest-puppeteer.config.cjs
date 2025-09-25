/**
 * Puppeteer configuration for E2E testing
 * Supports both headless and visible browser modes based on environment variables
 */

module.exports = {
  launch: {
    // Headless mode - can be overridden with HEADLESS=false
    headless: process.env.HEADLESS !== 'false',
    
    // Browser window options for visible mode
    defaultViewport: {
      width: 1280,
      height: 800
    },
    
    // Chrome stability arguments
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-ipc-flooding-protection',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--enable-automation',
      '--password-store=basic',
      '--use-mock-keychain',
      '--remote-debugging-port=0'
    ].concat(process.env.HEADLESS === 'false' ? [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ] : []),
    
    // Longer timeout for browser connection
    timeout: 30000,
    
    // Slow down interactions for better visibility when debugging
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : (process.env.HEADLESS === 'false' ? 50 : 0),
    
    // Open DevTools automatically in visible debug mode
    devtools: process.env.DEVTOOLS === 'true',
    
    // Keep browser open after tests complete (useful for debugging)
    handleSIGINT: false,  // Let our custom handlers deal with this
    handleSIGTERM: false, // Let our custom handlers deal with this
    handleSIGHUP: false   // Let our custom handlers deal with this
  },
  
  // Server configuration for local testing
  server: {
    command: 'npm run dev',
    port: 3000,
    launchTimeout: 30000,
    debug: process.env.DEBUG_SERVER === 'true'
  },
  
  // Browser configuration
  browser: 'chromium',
  
  // Test environment options
  exitOnPageError: false, // Don't exit on console errors during development
  
  // Timeouts - longer for visible mode to allow manual observation
  browserContext: 'default',
  
  // Custom options for different test modes
  testTimeout: process.env.HEADLESS === 'false' ? 60000 : 30000, // 60s visible, 30s headless
  expect: {
    timeout: process.env.HEADLESS === 'false' ? 10000 : 5000 // 10s visible, 5s headless
  }
};