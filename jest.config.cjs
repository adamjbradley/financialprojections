// Check if Puppeteer dependencies are available
const hasPuppeteer = (() => {
  try {
    require.resolve('puppeteer');
    require.resolve('jest-puppeteer');
    return true;
  } catch (e) {
    return false;
  }
})();

// Base configuration for unit and integration tests
const baseConfig = {
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app.js',
    'js/**/*.js',
    '!js/main.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  transform: {},
  extensionsToTreatAsEsm: [],
  globals: {
    URL: 'http://localhost:3000'
  }
};

// Enhanced configuration with Puppeteer support
const enhancedConfig = {
  ...baseConfig,
  // Include E2E tests when Puppeteer is available
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/tests/e2e/**/*.test.js'
  ],
  // Use projects for different test environments
  projects: [
    {
      // Unit and Integration tests (headless jsdom)
      displayName: 'unit/integration',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js'
      }
    },
    {
      // E2E tests (Puppeteer with configurable headless mode)
      displayName: 'e2e',
      testEnvironment: 'node',
      preset: 'jest-puppeteer',
      testMatch: [
        '<rootDir>/tests/e2e/**/*.test.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/puppeteer-setup.js'],
      globals: {
        URL: 'http://localhost:3000',
        HEADLESS: process.env.HEADLESS !== 'false',
        SLOWMO: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
        DEVTOOLS: process.env.DEVTOOLS === 'true',
        DEBUG_LOGS: process.env.DEBUG_LOGS === 'true',
        PAUSE_AFTER_EACH: process.env.PAUSE_AFTER_EACH === 'true',
        DEBUG_BREAKPOINTS: process.env.DEBUG_BREAKPOINTS === 'true',
        KEEP_OPEN: process.env.KEEP_OPEN === 'true'
      }
    }
  ]
};

// Export appropriate configuration based on dependencies
module.exports = hasPuppeteer ? enhancedConfig : baseConfig;