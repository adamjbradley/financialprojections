/**
 * Playwright Configuration for APAC Revenue Projections System
 * Multi-browser testing with Edge, Safari, and Chrome support
 * Resolves Chrome WebSocket connection issues on macOS
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  
  // Global test settings
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'tests/playwright-report' }],
    ['json', { outputFile: 'tests/test-results.json' }],
    ['line']
  ],
  
  // Global test setup
  use: {
    baseURL: 'http://localhost:3000',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Capture video on failure
    video: 'retain-on-failure',
    
    // Trace settings
    trace: 'on-first-retry',
    
    // Default timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // Multi-browser projects configuration
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    
    // Microsoft Edge - Primary browser (most stable on macOS)
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
        // Launch options for visible mode
        launchOptions: {
          headless: process.env.HEADLESS !== 'false',
          slowMo: process.env.HEADLESS === 'false' ? 100 : 0,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        }
      }
    },

    // Safari/WebKit - Native macOS browser
    {
      name: 'safari',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit launch options
        launchOptions: {
          headless: process.env.HEADLESS !== 'false',
          slowMo: process.env.HEADLESS === 'false' ? 100 : 0
        }
      }
    },

    // Chrome - Fallback option (may have WebSocket issues in visible mode)
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          headless: process.env.HEADLESS !== 'false',
          slowMo: process.env.HEADLESS === 'false' ? 100 : 0,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security'
          ]
        }
      }
    },

    // Mobile emulation projects
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  // Development server setup
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});