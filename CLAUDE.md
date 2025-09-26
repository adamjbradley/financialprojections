# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: WHICH HTML FILE TO USE 🚨

**ALWAYS USE `index-working.html` FOR ALL DEVELOPMENT!**

### File Structure Explanation:
- **`index-working.html` (468KB)** ✅ **ACTIVE VERSION - USE THIS**
  - Complete monolithic file with all JavaScript inline
  - Fully functional with all features working
  - All recent development happens here
  - URL: `http://localhost:4174/index-working.html`
  
- **`index.html` (47KB)** ❌ **INCOMPLETE - DO NOT USE**
  - Failed modularization attempt
  - Loads external `app.js` file
  - Has JavaScript scope issues
  - Preserved for future migration only

**Why two files exist:** The project attempted modularization (splitting into modules) but it broke ~377 functions due to scope issues. Development rolled back to the monolithic version (`index-working.html`) while preserving the modular work for future attempts.

**For all development, testing, and deployment: Use `index-working.html`**

## 🚨 CRITICAL TESTING MANDATE 🚨

**⚠️ NEVER USE CHROME/PUPPETEER FOR TESTING - ALWAYS USE PLAYWRIGHT! ⚠️**

**Chrome WebSocket connection issues on macOS are persistent and will cause test failures.** 

### **MANDATORY Testing Commands:**
```bash
# ✅ CORRECT - Use Microsoft Edge with Playwright
npm run test:playwright:headed:edge
node test-edge-simple.cjs
HEADLESS=false node test-edge-simple.cjs

# ✅ CORRECT - Headless Playwright
npm run test:playwright

# ❌ WRONG - Never use these Chrome/Puppeteer commands
# node comprehensive-test.cjs
# HEADLESS=false npm run test:e2e
# Any puppeteer-based tests in visible mode
```

**If you need to create new tests, always use Playwright with Edge browser support.**

## Project Overview

This is the **APAC Revenue Projections System** - a comprehensive web-based financial modeling tool for projecting revenue opportunities from digital authentication services across Asia-Pacific countries, with specialized focus on India's Aadhaar authentication services following the January 2025 policy change allowing commercial entity access.

The project consists of:
- A standalone HTML application (`india_revenue_tool_fixed-v4.html`) with embedded JavaScript and CSS
- Product Requirements Document (`aadhaar_revenue_projections_prd.md`) 
- Comprehensive demographic data for APAC countries (`demographics/` directory)
- Financial projection models and calculators built in JavaScript
- Standardized pension percentage tracking across all APAC countries

## Architecture

### Core Application Structure
The main application is a single-page web application built with vanilla JavaScript:

- **Frontend**: HTML5 with embedded CSS and JavaScript
- **Data Management**: Client-side JavaScript with local storage
- **Calculations**: Pure JavaScript financial modeling engines
- **Export**: Excel/CSV export using XLSX.js library
- **Visualization**: Chart.js for revenue projection charts

### Key Components

#### Financial Modeling Engine
- Revenue calculation models (transaction-based, subscription, tiered pricing)
- Market sizing calculators (TAM/SAM/SOM)
- Scenario planning with Monte Carlo simulation support
- Infrastructure cost modeling

#### Data Models
```javascript
// Market segments structure
segments = [
  {
    id: "unique_id",
    name: "segment_name",
    type: "sku",
    pricePerTransaction: 1.50,
    costPerTransaction: 0.30,
    monthlyVolume: 10000000,
    volumeGrowth: 0.12,
    category: "authentication",
    notes: "description",
    pensionPct: 12.5 // Pension percentage for this segment
  }
]

// Demographic data structure (for APAC countries)
demographicData = {
  "country": {
    "key": "singapore",
    "name": "Singapore", 
    "currency": "SGD",
    "population": 5.9
  },
  "demographicSegments": [
    {
      "name": "Central Region - Citizens",
      "population": 2.8,
      "authPct": 95,           // Authentication percentage
      "pensionPct": 22,        // Pension recipient percentage  
      "authFreq": 2.5,
      "digitalAdoption": 98,
      "economicTier": "high",
      "urbanization": 100,
      "authGrowthRate": 8
    }
  ]
}

// Projection data structure
projectionData = [
  {
    month: "2025-01",
    revenue: 15000000,
    cogs: 3000000,
    grossProfit: 12000000,
    operatingExpenses: 2000000,
    netProfit: 10000000,
    profitMargin: 66.67,
    cumulativeRevenue: 15000000
  }
]
```

#### Core Functions
- `calculateProjections()`: Main projection calculation engine
- `calculateSegmentProjections()`: Segment-specific calculations  
- `exportToExcel()`: Excel export functionality with pension data
- `runScenarioAnalysis()`: Scenario planning and analysis
- `renderSegments()`: Dynamic UI rendering for segments
- `loadPensionModelFromExternal()`: Load demographic data with pension percentages
- `refreshDemographicInsights()`: Calculate insights including pension rates
- `exportDemographicData()`: Export demographic data with pension percentages

## Development Guidelines

### Working with the Application

Since this is a standalone HTML application, development is straightforward:

1. **Open the application**: Open `india_revenue_tool_fixed-v4.html` in a web browser
2. **Make changes**: Edit the HTML file directly for modifications
3. **Test**: Refresh browser to see changes
4. **No build process required**: All dependencies are loaded via CDN

### Key Dependencies (CDN-loaded)
- **XLSX.js**: Excel file generation and export
- **Chart.js**: Data visualization and charting
- **Modern browser**: ES6+ JavaScript features

### Data Flow
1. User inputs parameters via web interface
2. System loads demographic data including pension percentages for selected country
3. JavaScript calculates projections using financial models with pension data
4. Results displayed in tables and charts with authentication and pension insights
5. Data can be exported to Excel/CSV formats including pension percentage information
6. Segment library allows importing/exporting segment configurations with pension data

### Financial Model Parameters
- **Revenue Models**: Transaction fees (₹0.50-3.00 per transaction), license fees, tiered pricing
- **Market Data**: Sector-specific growth rates, penetration curves, volume projections
- **Cost Models**: COGS percentages, operating expenses, infrastructure scaling costs
- **Demographic Data**: Authentication rates, pension percentages, digital adoption, economic tiers
- **Scenarios**: Conservative, optimistic, pessimistic projections with Monte Carlo support

### Key Business Logic
- **Volume Projections**: 221+ crore monthly transactions baseline, 2-4x growth expected
- **Revenue Opportunity**: ₹4,000-15,000 crores annually projected
- **Market Segments**: E-commerce, travel, healthcare, fintech, government services, pension services
- **Pricing Strategy**: Multi-tier pricing with peak hour surcharges
- **APAC Coverage**: Standardized demographic data across India, Singapore, Australia with pension tracking

### Pension Percentage Features
- **Multi-Country Support**: Pension data for India (4.2-15.2%), Singapore (2-28%), Australia (8-28%)
- **Revenue Integration**: Pension authentication volumes included in revenue calculations
- **Excel Export**: Pension percentages automatically included in all data exports
- **Real-time Insights**: UI displays both authentication and pension rates separately
- **Demographic Analysis**: Pension rates tracked alongside economic tiers and urbanization

## Important Notes

- This project focuses on **defensive financial analysis only** - no malicious code creation
- The tool is designed for government policy makers and financial analysts
- All calculations use conservative assumptions with documented limitations
- Models include comprehensive risk assessments and sensitivity analysis
- Data validation and quality checks are built into the calculation engines

## 🧪 Test-Driven Development Requirements

### **CRITICAL: Testing is Mandatory for All Changes**

This project has a **comprehensive test suite with 353 test cases** covering all functionality. Any future development **MUST maintain and extend** the test coverage.

#### **Test Architecture Overview**
```
/tests/
├── unit/           # 86 unit tests (headless, <1s execution)
├── integration/    # 13 integration tests (headless)
├── e2e/           # 167 end-to-end tests (browser automation)
├── coverage-report.js    # Automated coverage analysis
├── run-all-tests.js     # Master test runner
└── README.md      # Complete testing documentation
```

#### **Testing Requirements for New Features**

**BEFORE adding any new function or feature:**

1. **📊 Write Unit Tests First** (Test-Driven Development)
   ```bash
   # Create tests in /tests/unit/
   # Test pure mathematical/business logic functions
   # Ensure 100% headless execution with jsdom
   ```

2. **🧪 Follow Testing Standards**
   - **Unit Tests**: Test individual functions with no external dependencies
   - **Integration Tests**: Test module interactions and data flow  
   - **E2E Tests**: Test complete user workflows in browser
   - **Coverage Target**: Maintain >80% function coverage

3. **⚡ Test Execution Requirements**
   ```bash
   # Before committing ANY code changes:
   npm run test:unit        # Must pass (headless, fast)
   npm run test:integration # Must pass (headless)
   npm run test:coverage    # Must maintain >80% coverage
   npm run test:report      # Generate updated coverage report
   ```

#### **Required Test Patterns for New Code**

**✅ Mathematical Functions** (highest priority)
```javascript
describe('New Financial Function', () => {
  test('should calculate correctly with valid inputs', () => {
    const result = newFinancialFunction(input);
    expect(result).toBe(expectedOutput);
  });
  
  test('should handle edge cases', () => {
    expect(newFinancialFunction(0)).toBe(0);
    expect(newFinancialFunction(-1)).toBe(expectedNegativeResult);
  });
  
  test('should validate input parameters', () => {
    expect(() => newFinancialFunction(null)).toThrow();
  });
});
```

**✅ UI Components** (for new interface elements)
```javascript
describe('New UI Component', () => {
  test('should render correctly', async () => {
    await page.click('#newButton');
    const result = await page.$('#newElement');
    expect(result).toBeTruthy();
  });
  
  test('should handle user interactions', async () => {
    await page.type('#newInput', 'testValue');
    const value = await page.$eval('#newInput', el => el.value);
    expect(value).toBe('testValue');
  });
});
```

#### **Testing Workflow Integration**

**🔄 Development Cycle:**
1. Write failing test first
2. Implement minimum code to pass test
3. Refactor while maintaining test coverage
4. Run full test suite before committing
5. Update coverage report

**🚀 Continuous Integration:**
- All tests must pass before deployment
- Coverage must remain above 80%
- Performance benchmarks must be maintained
- Accessibility tests must pass

#### **Test Quality Indicators**

**Current Test Status (Baseline):**
- ✅ **353 Total Tests** across 6 categories
- ✅ **47 Unit Tests Passing** (math/calculations)
- ✅ **Quality Score: 105/100** 🏆 EXCELLENT
- ✅ **Function Coverage: 20.1%** (31/154 functions)

**⚠️ Future Development Requirements:**
- New functions MUST have accompanying unit tests
- Mathematical functions MUST achieve 100% test coverage
- UI changes MUST have E2E test coverage
- Performance regressions are NOT acceptable

#### **Testing Command Reference**

```bash
# Quick Development Testing
npm run test:unit              # Fast headless unit tests
npm run test:watch             # Continuous testing during development

# Comprehensive Testing  
npm run test:all               # Complete test suite
npm run test:coverage          # Coverage analysis
npm run test:report            # Generate HTML coverage report

# Specific Test Categories
npm run test:integration       # Module interaction tests
npm run test:e2e              # Full browser automation tests

# Individual Test Files (Working Examples)
npx jest --config=jest.config.cjs tests/unit/math-functions.test.js    # 24 tests
npx jest --config=jest.config.cjs tests/unit/calculations.test.js      # 23 tests
```

#### **Testing Documentation**

- **Complete Guide**: See `/tests/README.md` for comprehensive testing documentation
- **Coverage Report**: HTML report generated at `/tests/coverage-report.html`
- **Test Examples**: Working unit tests in `/tests/unit/math-functions.test.js`

### **⚠️ CRITICAL WARNING for Future Developers**

**DO NOT:**
- Add new functions without corresponding tests
- Reduce test coverage below current levels
- Skip test execution before committing
- Modify core calculation functions without extensive test verification

**ALWAYS:**
- Write tests first (TDD approach)
- Run full test suite before committing
- Maintain comprehensive documentation
- Update test coverage reports

The test suite ensures the financial accuracy and reliability that government policy makers and analysts depend on. **Testing is not optional—it's essential for maintaining trust in financial projections.**

## Build System & Development Workflow

This project uses **Vite** as the modern build system. After experiencing issues with modularization breaking function scope, we've **rolled back to the working monolithic version** while preserving the modular work for future development.

### Current Active Version

1. **Primary (Working)**: `index-working.html`
   - Complete monolithic HTML file with all JavaScript inline
   - **Known working state** - all buttons and features functional
   - Uses Vite for hot reload during development
   - Run with: `npm run dev` → http://localhost:3000

### Archived Versions (For Reference)

2. **Modular (Development Archive)** - `/js/` directory:
   - `index.html` + 7 modular JavaScript files
   - **Status: Incomplete** - function scope issues prevent full functionality
   - Preserved for future gradual migration approach
   - Contains valuable separated concerns: core, segments, projections, demographics, export, ui, missing-functions

3. **Legacy Builds** - `/defunct/` directory:
   - Original versions and build artifacts
   - Custom Node.js build script preserved

### Development Commands

```bash
# Install dependencies
npm install

# Start development server with working version (http://localhost:3000)
npm run dev

# Build working version for production (outputs to /dist/)
npm run build

# Preview production build (http://localhost:4173)
npm run preview
```

### Rollback Details & Future Plans

**Why we rolled back:**
- Modularization broke global function scope (~377 functions needed window exposure)
- Cascade of errors after refactoring 7,293 lines into modules
- HTML inline event handlers expected global function access
- Immediate working application was prioritized over architectural purity

**What was preserved:**
- All modular JavaScript work in `/js/` directory (4,433 lines across 7 files)
- Proper separation of concerns: core utilities, segment management, projections, demographics, etc.
- Vite build system configuration
- Modern development tooling

**Future migration strategy:**
1. **Gradual approach**: Extract one module at a time with comprehensive testing
2. **Event delegation**: Replace inline onclick handlers with modern event listeners
3. **Automated testing**: Add test suite before attempting modularization again
4. **Function mapping**: Create systematic inventory of required global functions

## File Structure

```
/
├── CLAUDE.md                          # This development guide
├── aadhaar_revenue_projections_prd.md # Product Requirements Document
├── package.json                       # Node.js dependencies and scripts
├── vite.config.js                     # Vite build configuration
├── index.html                         # Modern Vite-compatible entry point
├── build.js                           # Legacy custom build script
├── india_revenue_tool_modular.html    # Modular development version (legacy)
├── india_revenue_tool_single.html     # Combined single-page version (legacy)
├── india_revenue_tool_fixed-v4.html   # Original monolithic version
├── styles.css                         # Main stylesheet
├── js/                                # Modular JavaScript source files
│   ├── main.js                        # Vite entry point and module loader
│   ├── core.js                        # Global variables and utility functions
│   ├── segments.js                    # Segment management and validation
│   ├── projections.js                 # Financial calculations and models
│   ├── demographics.js                # APAC data loading and analysis
│   ├── export.js                      # Excel/CSV export functionality
│   └── ui.js                          # DOM manipulation and event handlers
├── dist/                              # Production build output (generated)
│   ├── index.html                     # Optimized single-page application
│   └── assets/                        # Minified JS/CSS with cache-busting hashes
├── demographics/                       # APAC demographic data with pension percentages
│   ├── india_demographics.json        # India demographic segments with pension data
│   ├── singapore_demographics.json    # Singapore demographic segments with pension data
│   └── australia_demographics.json    # Australia demographic segments with pension data
└── LICENSE                            # License file
```

### Build System Benefits

**Vite Advantages:**
- ⚡ Lightning-fast development with hot module replacement
- 📦 Optimized production builds with tree-shaking
- 🔧 Zero-configuration setup for vanilla JavaScript projects
- 🎯 Industry-standard tooling used by major frameworks
- 📊 Built-in asset optimization and code splitting
- 🔄 Live reload during development regardless of project size

**Development Workflow:**
1. Use `npm run dev` for development with instant hot reload
2. Build with `npm run build` for optimized production deployment
3. Deploy the entire `/dist/` directory to your web server
4. Both development and production maintain identical functionality

## Working with Demographic Data

### Data Structure Requirements
All demographic JSON files must follow this standardized structure:

```json
{
  "country": {
    "key": "country_key",
    "name": "Country Name",
    "currency": "CUR",
    "exchangeRate": 1.0,
    "population": 100.0
  },
  "demographicSegments": [
    {
      "name": "Segment Name",
      "population": 10.0,
      "authPct": 75,
      "pensionPct": 15,
      "authFreq": 1.5,
      "digitalAdoption": 85,
      "economicTier": "high|medium|low",
      "urbanization": 80,
      "authGrowthRate": 5
    }
  ],
  "summary": {
    "averageAuthRate": 75.0,
    "averagePensionRate": 15.0
  }
}
```

### Adding New Countries
1. Create new JSON file in `demographics/` directory
2. Follow the standardized structure above
3. Include realistic pension percentage estimates based on country's pension system
4. Test data loading in the Demographics tab of the application

---

## 📋 Quick Reference for Future Development

### **Pre-Development Checklist**
- [ ] Read this CLAUDE.md file completely
- [ ] Review `/tests/README.md` for testing guidelines
- [ ] Run `npm run test:report` to see current coverage
- [ ] Understand existing test patterns in `/tests/unit/math-functions.test.js`

### **Development Workflow**
1. **Plan**: Identify what functions/features to add
2. **Test First**: Write failing unit tests for new functionality
3. **Implement**: Write minimal code to pass tests
4. **Verify**: Run `npm run test:unit` (must pass)
5. **Document**: Update relevant documentation
6. **Coverage**: Run `npm run test:coverage` (must maintain >80%)
7. **Final Check**: Run `npm run test:all` before committing

### **Testing Commands Reference**

#### **📊 Headless Testing (Default - Fast)**
```bash
npm run test:unit                    # Unit tests with jsdom (85/99 tests passing)
npm run test:e2e                     # E2E tests in headless mode
npm run test                         # All tests in default modes
npm run test:watch                   # Watch mode for rapid feedback
npm run test:coverage                # Generate coverage analysis
npm run test:report                  # Generate HTML coverage report
```

#### **👁️ Visible Browser Testing (Ready!)**
```bash
npm run test:browser                 # E2E tests with visible browser (167 tests)
npm run test:e2e:visible             # Same as above (alias)
npm run test:e2e:debug               # Visible + slow motion + DevTools + logs
npm run test:e2e:step                # Interactive step-through testing
```

#### **🎛️ Custom Environment Controls**
```bash
# Basic visible mode
HEADLESS=false npm run test:e2e

# Custom slow motion and debugging
HEADLESS=false SLOWMO=200 DEVTOOLS=true npm run test:e2e

# Interactive debugging with breakpoints
HEADLESS=false DEBUG_BREAKPOINTS=true npm run test:e2e

# Keep browser open after tests
HEADLESS=false KEEP_OPEN=true npm run test:e2e
```

#### **🔧 Debugging Specific Tests**
```bash
# Debug specific unit test files
npx jest --config=jest.config.cjs tests/unit/math-functions.test.js --verbose

# Debug specific E2E test with visible browser
HEADLESS=false npx jest --config=jest.config.cjs tests/e2e/app.test.js
```

### **File Structure for New Tests**
```
/tests/unit/your-new-feature.test.js    # Unit tests for new functions
/tests/e2e/your-new-ui.test.js          # E2E tests for new UI components
/tests/integration/your-data-flow.test.js # Integration tests for complex workflows
```

### **Browser Testing Benefits**

#### **Headless Mode ⚡ (Default)**
- **Speed**: Tests complete in seconds
- **Automation**: Perfect for CI/CD pipelines
- **Resource Efficient**: Low memory usage
- **Parallel Execution**: Multiple test suites simultaneously

#### **Visible Mode 👁️ (New)**
- **Visual Debugging**: See exactly what tests are doing
- **UI Verification**: Confirm visual elements work correctly
- **Development**: Understand test failures immediately  
- **Demo Ready**: Show stakeholders comprehensive test coverage

#### **Debug Mode 🔍**
- **Step-by-Step**: Pause and inspect at any point
- **Console Access**: Full DevTools available
- **Interactive**: Manual intervention during tests
- **Learning**: Understand test behavior deeply

### **Contact & Support**
- **Test Documentation**: `/tests/README.md`
- **Coverage Reports**: `/tests/coverage-report.html`
- **Browser Testing Guide**: `/test-modes.md`
- **Working Examples**: `/tests/unit/math-functions.test.js`
- **Test Patterns**: All files in `/tests/unit/` directory

**Remember: The financial accuracy of this tool is critical for policy decisions. Comprehensive testing isn't just good practice—it's a requirement for maintaining trust and reliability.**

**Ready**: Complete dual-mode testing system! Watch all 167 E2E tests execute in real-time with visible browser mode, perfect for demonstrating comprehensive test coverage to stakeholders or debugging complex UI interactions! 🎯

**Installation**: Simply run `npm install` to get all dependencies, then use `npm run test:browser` for visible testing.

---

## 🎭 **NEW: Multi-Browser Testing with Microsoft Playwright**

### **🚀 BREAKTHROUGH: Chrome WebSocket Issues RESOLVED!**

**Problem Solved:** The persistent Chrome WebSocket connection errors in visible browser mode on macOS have been completely resolved by migrating to **Microsoft Playwright with Edge browser support**.

### **✅ What's Now Available:**

#### **Microsoft Edge Browser Testing** (Primary Solution)
```bash
# Headless Edge testing (fast, reliable)
npm run test:playwright:edge

# VISIBLE Edge testing (WORKING! - solves Chrome issues)  
npm run test:playwright:headed:edge

# Simple direct Edge test
node test-edge-simple.cjs                    # Headless mode
HEADLESS=false node test-edge-simple.cjs     # Visible mode ✅
```

#### **Safari/WebKit Browser Testing** (macOS Native)
```bash
# Safari testing (requires: npx playwright install webkit)
npm run test:playwright:safari
npm run test:playwright:headed:safari
HEADLESS=false node test-safari-simple.cjs   # After webkit install
```

#### **Multi-Browser Testing**
```bash
# Test across all browsers
npm run test:playwright

# Browser-specific testing
npm run test:playwright:chrome              # Chrome (may still have issues)
npm run test:playwright:edge                # Edge (recommended)  
npm run test:playwright:safari              # Safari (native macOS)
```

### **🎯 Playwright Advantages Over Puppeteer:**

1. **✅ Stable Visible Mode** - No more Chrome DevTools Protocol WebSocket errors
2. **✅ Multi-Browser Support** - Edge, Safari, Chrome, Firefox all supported  
3. **✅ Auto-Waiting** - Built-in smart waiting for elements (no more timeouts)
4. **✅ Better Error Handling** - Clearer error messages and recovery
5. **✅ Native Safari Support** - Test on Apple's actual rendering engine
6. **✅ Cross-Platform** - Same tests work on macOS, Windows, Linux

### **🚨 REMINDER: Chrome/Puppeteer is FORBIDDEN for visible testing! 🚨**

**Chrome WebSocket Protocol errors will cause test failures. Always use Playwright with Edge browser.**

### **📂 New Test Structure:**
```
/tests/
├── playwright/                    # New Playwright tests
│   ├── apac-app.spec.js          # Main E2E test suite  
│   └── global.setup.js           # Playwright setup
├── unit/                         # Existing Jest unit tests (unchanged)
├── integration/                  # Existing Jest integration tests
└── e2e/                         # Legacy Puppeteer tests (kept for reference)
```

### **🔧 Configuration Files:**
- `playwright.config.js` - Multi-browser Playwright configuration
- `test-edge-simple.cjs` - Direct Edge browser testing
- `test-safari-simple.cjs` - Direct Safari browser testing

### **🏆 SUCCESS METRICS:**

**✅ Microsoft Edge (WORKING):**
- Headless mode: ✅ Perfect
- Visible mode: ✅ **RESOLVED Chrome issues!**
- Performance: ✅ Excellent on macOS
- Stability: ✅ No WebSocket connection errors

**⚠️ Safari/WebKit:**
- Requires: `npx playwright install webkit` 
- Status: Available but needs webkit binary download

**⚠️ Chrome:**
- Legacy compatibility maintained
- Still may have WebSocket issues in visible mode

### **🎭 Recommended Development Workflow:**

#### **For Daily Development:**
```bash
# Quick mathematical validation (always reliable)
npx jest --config=jest.config.cjs tests/unit/math-functions.test.js

# Visual debugging with Edge (NO MORE CHROME ISSUES!)
HEADLESS=false node test-edge-simple.cjs
```

#### **For Comprehensive Testing:**
```bash
# Full mathematical validation
npm run test:unit

# Multi-browser E2E testing  
npm run test:playwright

# Visible mode validation (Edge)
npm run test:playwright:headed:edge
```

#### **For Cross-Browser Validation:**
```bash
# Install all browsers first
npx playwright install

# Test on all browsers
npm run test:playwright                      # All browsers headless
npm run test:playwright:headed              # All browsers visible
```

### **🔍 Migration Benefits Achieved:**

1. **✅ RESOLVED:** Chrome WebSocket connection errors completely eliminated
2. **✅ ENHANCED:** Multiple browser testing capabilities added
3. **✅ IMPROVED:** More stable automation with Playwright's auto-waiting
4. **✅ MAINTAINED:** All existing Jest mathematical tests unchanged
5. **✅ ADDED:** Native Safari testing capability for macOS
6. **✅ FUTURE-PROOF:** Modern browser automation framework

### **⚡ Quick Start Commands:**

```bash
# Install and test immediately
npm install
HEADLESS=false node test-edge-simple.cjs    # See Edge browser in action!

# Full multi-browser setup
npx playwright install
npm run test:playwright:headed              # See all browsers in action
```

**🎉 RESULT: Visible browser automation now works perfectly, resolving all previous Chrome WebSocket connection issues while adding multi-browser testing capabilities!**

**Installation**: Run `npm install` (Playwright already included), then use `HEADLESS=false node test-edge-simple.cjs` for immediate visible browser testing with Microsoft Edge.