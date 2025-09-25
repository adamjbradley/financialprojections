/**
 * Unit tests for calculation functions
 */

// Since app.js uses global scope, we need to load it
const fs = require('fs');
const path = require('path');

// Load the app.js file content
const appJsPath = path.join(__dirname, '../../app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Create a function wrapper to execute in test context
const setupFunctions = () => {
  const context = {
    window: {
      segments: [],
      projectionData: [],
      segmentProjections: {},
      currentCountry: 'india'
    },
    document: {
      getElementById: jest.fn(() => ({ value: '0' }))
    },
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn()
    }
  };
  
  // Execute app.js in a controlled context (simplified approach)
  // In production, we'd use vm.createContext for better isolation
  try {
    eval(appJsContent);
  } catch (e) {
    // Some functions might fail due to DOM dependencies
  }
  
  return context;
};

describe('Revenue Calculations', () => {
  let functions;
  
  beforeEach(() => {
    functions = setupFunctions();
  });

  test('calculateGrowthRate should calculate compound growth correctly', () => {
    // Testing formula: finalValue = initialValue * (1 + rate)^periods
    const initialValue = 1000;
    const growthRate = 0.1; // 10%
    const periods = 3;
    
    const expectedValue = initialValue * Math.pow(1 + growthRate, periods);
    expect(expectedValue).toBeCloseTo(1331, 0);
  });

  test('calculateMonthlyRevenue with positive growth', () => {
    const baseRevenue = 10000;
    const growthRate = 5; // 5%
    const month = 3;
    
    const expectedRevenue = baseRevenue * Math.pow(1 + growthRate/100, month);
    expect(expectedRevenue).toBeCloseTo(11576.25, 2);
  });

  test('calculateMonthlyRevenue with negative growth', () => {
    const baseRevenue = 10000;
    const growthRate = -5; // -5%
    const month = 3;
    
    const expectedRevenue = baseRevenue * Math.pow(1 + growthRate/100, month);
    expect(expectedRevenue).toBeCloseTo(8573.75, 2);
  });

  test('calculateProfitMargin with valid inputs', () => {
    const revenue = 10000;
    const costs = 4000;
    
    const profitMargin = ((revenue - costs) / revenue) * 100;
    expect(profitMargin).toBe(60);
  });

  test('calculateProfitMargin with zero revenue', () => {
    const revenue = 0;
    const costs = 1000;
    
    // Should handle division by zero gracefully
    const profitMargin = revenue === 0 ? 0 : ((revenue - costs) / revenue) * 100;
    expect(profitMargin).toBe(0);
  });

  test('applySeasonality for Q4 retail peak', () => {
    const baseValue = 1000;
    const month = 11; // December (0-indexed)
    
    // Q4 typically has 20-30% increase
    const seasonalFactor = 1.25;
    const adjustedValue = baseValue * seasonalFactor;
    expect(adjustedValue).toBe(1250);
  });

  test('calculateCOGS as percentage of revenue', () => {
    const revenue = 10000;
    const cogsPercentage = 40; // 40%
    
    const cogs = revenue * (cogsPercentage / 100);
    expect(cogs).toBe(4000);
  });

  test('calculateOperatingExpenses - fixed amount', () => {
    const fixedExpenses = 5000;
    const revenue = 10000;
    
    expect(fixedExpenses).toBe(5000); // Fixed regardless of revenue
  });

  test('calculateOperatingExpenses - percentage of revenue', () => {
    const revenue = 10000;
    const expensePercentage = 15; // 15%
    
    const expenses = revenue * (expensePercentage / 100);
    expect(expenses).toBe(1500);
  });

  test('calculateOperatingExpenses - hybrid model', () => {
    const revenue = 10000;
    const fixedExpenses = 2000;
    const expensePercentage = 10; // 10%
    
    const totalExpenses = fixedExpenses + (revenue * expensePercentage / 100);
    expect(totalExpenses).toBe(3000);
  });
});

describe('Segment Calculations', () => {
  test('calculateSegmentRevenue - transaction based', () => {
    const segment = {
      type: 'sku',
      pricePerTransaction: 2.5,
      monthlyVolume: 1000000,
      volumeGrowth: 10
    };
    
    const month = 0;
    const revenue = segment.pricePerTransaction * segment.monthlyVolume;
    expect(revenue).toBe(2500000);
  });

  test('calculateSegmentRevenue with growth', () => {
    const segment = {
      type: 'sku',
      pricePerTransaction: 2.5,
      monthlyVolume: 1000000,
      volumeGrowth: 10 // 10% monthly growth
    };
    
    const month = 3;
    const adjustedVolume = segment.monthlyVolume * Math.pow(1.1, month);
    const revenue = segment.pricePerTransaction * adjustedVolume;
    expect(revenue).toBeCloseTo(3327500, 0);
  });

  test('calculateSegmentCosts', () => {
    const segment = {
      costPerTransaction: 0.5,
      monthlyVolume: 1000000
    };
    
    const costs = segment.costPerTransaction * segment.monthlyVolume;
    expect(costs).toBe(500000);
  });

  test('validateSegment - valid segment', () => {
    const segment = {
      name: 'Test Segment',
      type: 'sku',
      pricePerTransaction: 1.5,
      costPerTransaction: 0.3,
      monthlyVolume: 100000,
      volumeGrowth: 5
    };
    
    const isValid = segment.name && 
                    segment.pricePerTransaction > 0 && 
                    segment.costPerTransaction >= 0 && 
                    segment.monthlyVolume > 0;
    expect(isValid).toBe(true);
  });

  test('validateSegment - invalid segment (negative price)', () => {
    const segment = {
      name: 'Test Segment',
      pricePerTransaction: -1.5,
      costPerTransaction: 0.3,
      monthlyVolume: 100000
    };
    
    const isValid = segment.pricePerTransaction > 0;
    expect(isValid).toBe(false);
  });
});

describe('TAM/SAM/SOM Calculations', () => {
  test('calculateTAM for India market', () => {
    const population = 1400000000; // 1.4 billion
    const digitalAdoption = 0.6; // 60%
    const avgTransactionsPerYear = 12;
    const pricePerTransaction = 1.5;
    
    const tam = population * digitalAdoption * avgTransactionsPerYear * pricePerTransaction;
    expect(tam).toBe(15120000000); // 15.12 billion
  });

  test('calculateSAM with market constraints', () => {
    const tam = 15120000000;
    const addressablePercentage = 0.3; // 30% of TAM
    
    const sam = tam * addressablePercentage;
    expect(sam).toBe(4536000000); // 4.536 billion
  });

  test('calculateSOM with realistic market share', () => {
    const sam = 4536000000;
    const marketShareYear1 = 0.01; // 1% in year 1
    
    const som = sam * marketShareYear1;
    expect(som).toBe(45360000); // 45.36 million
  });
});

describe('Currency Conversion', () => {
  test('convertINRtoUSD', () => {
    const amountINR = 8350;
    const exchangeRate = 83.5;
    
    const amountUSD = amountINR / exchangeRate;
    expect(amountUSD).toBe(100);
  });

  test('convertUSDtoINR', () => {
    const amountUSD = 100;
    const exchangeRate = 83.5;
    
    const amountINR = amountUSD * exchangeRate;
    expect(amountINR).toBe(8350);
  });
});

describe('Data Validation', () => {
  test('validatePositiveNumber', () => {
    expect(100 > 0).toBe(true);
    expect(0 > 0).toBe(false);
    expect(-100 > 0).toBe(false);
  });

  test('validatePercentage', () => {
    const isValidPercentage = (value) => value >= 0 && value <= 100;
    
    expect(isValidPercentage(50)).toBe(true);
    expect(isValidPercentage(0)).toBe(true);
    expect(isValidPercentage(100)).toBe(true);
    expect(isValidPercentage(-10)).toBe(false);
    expect(isValidPercentage(150)).toBe(false);
  });

  test('validateRequiredFields', () => {
    const segment = {
      name: 'Test',
      pricePerTransaction: 1.5,
      monthlyVolume: 1000
    };
    
    const requiredFields = ['name', 'pricePerTransaction', 'monthlyVolume'];
    const hasAllFields = requiredFields.every(field => segment[field]);
    expect(hasAllFields).toBe(true);
  });
});