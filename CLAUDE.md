# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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