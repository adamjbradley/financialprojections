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

## File Structure

```
/
├── CLAUDE.md                          # This development guide
├── aadhaar_revenue_projections_prd.md # Product Requirements Document  
├── india_revenue_tool_fixed-v4.html   # Main application file
├── demographics/                       # APAC demographic data with pension percentages
│   ├── india_demographics.json        # India demographic segments with pension data
│   ├── singapore_demographics.json    # Singapore demographic segments with pension data
│   └── australia_demographics.json    # Australia demographic segments with pension data
└── financialprojections/               # Additional assets directory
    └── LICENSE                         # License file
```

The entire application logic, styling, and functionality is contained within the single HTML file for maximum portability and ease of deployment. Demographic data is stored in separate JSON files for easy maintenance and updates.

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