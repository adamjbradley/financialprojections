# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Aadhaar Revenue Projections System** - a web-based financial modeling tool for projecting revenue opportunities from India's Aadhaar authentication services following the January 2025 policy change allowing commercial entity access.

The project consists of:
- A standalone HTML application (`india_revenue_tool_fixed-v4.html`) with embedded JavaScript and CSS
- Product Requirements Document (`aadhaar_revenue_projections_prd.md`)
- Financial projection models and calculators built in JavaScript

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
    notes: "description"
  }
]

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
- `exportToExcel()`: Excel export functionality
- `runScenarioAnalysis()`: Scenario planning and analysis
- `renderSegments()`: Dynamic UI rendering for segments

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
2. JavaScript calculates projections using financial models
3. Results displayed in tables and charts
4. Data can be exported to Excel/CSV formats
5. Segment library allows importing/exporting segment configurations

### Financial Model Parameters
- **Revenue Models**: Transaction fees (₹0.50-3.00 per transaction), license fees, tiered pricing
- **Market Data**: Sector-specific growth rates, penetration curves, volume projections
- **Cost Models**: COGS percentages, operating expenses, infrastructure scaling costs
- **Scenarios**: Conservative, optimistic, pessimistic projections with Monte Carlo support

### Key Business Logic
- **Volume Projections**: 221+ crore monthly transactions baseline, 2-4x growth expected
- **Revenue Opportunity**: ₹4,000-15,000 crores annually projected
- **Market Segments**: E-commerce, travel, healthcare, fintech, government services
- **Pricing Strategy**: Multi-tier pricing with peak hour surcharges

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
└── financialprojections/               # Additional assets directory
    └── LICENSE                         # License file
```

The entire application logic, styling, and functionality is contained within the single HTML file for maximum portability and ease of deployment.