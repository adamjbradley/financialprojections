/**
 * Comprehensive unit tests for projection and calculation functions
 */

describe('Projection and Calculation Functions', () => {
  
  beforeEach(() => {
    global.window = {
      segments: [],
      projectionData: [],
      segmentProjections: {},
      currentCountry: 'india',
      currentView: 'consolidated'
    };
    
    // Mock document.getElementById with proper values
    document.getElementById = jest.fn((id) => {
      const values = {
        'startRevenue': '1000000',
        'growthRate': '10',
        'projectionMonths': '12',
        'costPercentage': '40',
        'operatingExpenses': '50000',
        'operatingExpenseType': 'fixed',
        'operatingExpensePercentage': '15',
        'seasonality': 'none',
        'usdRate': '83.5',
        'inflationRate': '4.5',
        'taxRate': '30'
      };
      return { value: values[id] || '0' };
    });
  });

  describe('calculateProjections()', () => {
    test('should calculate monthly projections with growth', () => {
      const calculateProjections = () => {
        const baseRevenue = parseFloat(document.getElementById('startRevenue').value);
        const growthRate = parseFloat(document.getElementById('growthRate').value) / 100;
        const months = parseInt(document.getElementById('projectionMonths').value);
        
        const projections = [];
        for (let i = 0; i < months; i++) {
          const revenue = baseRevenue * Math.pow(1 + growthRate, i);
          projections.push({
            month: i,
            revenue: Math.round(revenue)
          });
        }
        return projections;
      };
      
      const result = calculateProjections();
      expect(result.length).toBe(12);
      expect(result[0].revenue).toBe(1000000);
      expect(result[1].revenue).toBe(1100000);
      expect(result[11].revenue).toBeCloseTo(2853117, 0);
    });

    test('should handle negative growth rate', () => {
      document.getElementById('growthRate').value = '-5';
      
      const calculateProjections = () => {
        const baseRevenue = parseFloat(document.getElementById('startRevenue').value);
        const growthRate = parseFloat(document.getElementById('growthRate').value) / 100;
        const months = parseInt(document.getElementById('projectionMonths').value);
        
        const projections = [];
        for (let i = 0; i < months; i++) {
          const revenue = baseRevenue * Math.pow(1 + growthRate, i);
          projections.push({
            month: i,
            revenue: Math.round(revenue)
          });
        }
        return projections;
      };
      
      const result = calculateProjections();
      expect(result[1].revenue).toBe(950000);
      expect(result[11].revenue).toBeLessThan(600000);
    });

    test('should calculate COGS correctly', () => {
      const calculateCOGS = (revenue) => {
        const cogsPercentage = parseFloat(document.getElementById('costPercentage').value);
        return revenue * (cogsPercentage / 100);
      };
      
      expect(calculateCOGS(1000000)).toBe(400000);
      expect(calculateCOGS(500000)).toBe(200000);
    });

    test('should calculate operating expenses - fixed type', () => {
      const calculateOperatingExpenses = (revenue) => {
        const type = document.getElementById('operatingExpenseType').value;
        
        if (type === 'fixed') {
          return parseFloat(document.getElementById('operatingExpenses').value);
        } else if (type === 'percentage') {
          const percentage = parseFloat(document.getElementById('operatingExpensePercentage').value);
          return revenue * (percentage / 100);
        } else if (type === 'hybrid') {
          const fixed = parseFloat(document.getElementById('operatingExpenses').value);
          const percentage = parseFloat(document.getElementById('operatingExpensePercentage').value);
          return fixed + (revenue * percentage / 100);
        }
        return 0;
      };
      
      expect(calculateOperatingExpenses(1000000)).toBe(50000);
      
      document.getElementById('operatingExpenseType').value = 'percentage';
      expect(calculateOperatingExpenses(1000000)).toBe(150000);
      
      document.getElementById('operatingExpenseType').value = 'hybrid';
      expect(calculateOperatingExpenses(1000000)).toBe(200000);
    });

    test('should calculate profit margins', () => {
      const calculateProfitMargin = (revenue, totalCosts) => {
        if (revenue === 0) return 0;
        return ((revenue - totalCosts) / revenue) * 100;
      };
      
      expect(calculateProfitMargin(1000000, 400000)).toBe(60);
      expect(calculateProfitMargin(1000000, 700000)).toBe(30);
      expect(calculateProfitMargin(1000000, 1000000)).toBe(0);
      expect(calculateProfitMargin(0, 100000)).toBe(0);
    });

    test('should apply seasonality adjustments', () => {
      const applySeasonality = (baseValue, month, seasonalityType) => {
        if (seasonalityType === 'none') return baseValue;
        
        const seasonalFactors = {
          'retail': [0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4],
          'summer': [0.8, 0.8, 0.9, 1.1, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.8, 0.8]
        };
        
        const factors = seasonalFactors[seasonalityType] || Array(12).fill(1);
        return baseValue * factors[month % 12];
      };
      
      expect(applySeasonality(1000, 0, 'none')).toBe(1000);
      expect(applySeasonality(1000, 11, 'retail')).toBe(1400);
      expect(applySeasonality(1000, 6, 'summer')).toBe(1400);
    });
  });

  describe('calculateSegmentProjections()', () => {
    test('should calculate projections for individual segments', () => {
      window.segments = [
        {
          id: 1,
          pricePerTransaction: 2.5,
          costPerTransaction: 0.5,
          monthlyVolume: 1000000,
          volumeGrowth: 5
        }
      ];
      
      const calculateSegmentProjections = (segment, months) => {
        const projections = [];
        const monthlyGrowth = segment.volumeGrowth / 100;
        
        for (let i = 0; i < months; i++) {
          const volume = segment.monthlyVolume * Math.pow(1 + monthlyGrowth, i);
          const revenue = volume * segment.pricePerTransaction;
          const costs = volume * segment.costPerTransaction;
          
          projections.push({
            month: i,
            volume: Math.round(volume),
            revenue: Math.round(revenue),
            costs: Math.round(costs),
            profit: Math.round(revenue - costs)
          });
        }
        return projections;
      };
      
      const result = calculateSegmentProjections(window.segments[0], 3);
      
      expect(result.length).toBe(3);
      expect(result[0].volume).toBe(1000000);
      expect(result[0].revenue).toBe(2500000);
      expect(result[0].costs).toBe(500000);
      expect(result[0].profit).toBe(2000000);
      expect(result[1].volume).toBe(1050000);
    });

    test('should handle multiple segments aggregation', () => {
      window.segments = [
        {
          id: 1,
          pricePerTransaction: 2,
          monthlyVolume: 1000000
        },
        {
          id: 2,
          pricePerTransaction: 3,
          monthlyVolume: 500000
        }
      ];
      
      const calculateTotalRevenue = (segments) => {
        return segments.reduce((total, segment) => {
          return total + (segment.pricePerTransaction * segment.monthlyVolume);
        }, 0);
      };
      
      expect(calculateTotalRevenue(window.segments)).toBe(3500000);
    });
  });

  describe('TAM/SAM/SOM Calculations', () => {
    test('should calculate Total Addressable Market (TAM)', () => {
      const calculateTAM = (population, penetrationRate, avgTransactionsPerYear, pricePerTransaction) => {
        return population * penetrationRate * avgTransactionsPerYear * pricePerTransaction;
      };
      
      const tam = calculateTAM(1400000000, 0.6, 12, 1.5);
      expect(tam).toBe(15120000000); // 15.12 billion
    });

    test('should calculate Serviceable Addressable Market (SAM)', () => {
      const calculateSAM = (tam, serviceablePercentage) => {
        return tam * serviceablePercentage;
      };
      
      const sam = calculateSAM(15120000000, 0.3);
      expect(sam).toBe(4536000000); // 4.536 billion
    });

    test('should calculate Serviceable Obtainable Market (SOM)', () => {
      const calculateSOM = (sam, realisticMarketShare) => {
        return sam * realisticMarketShare;
      };
      
      const som = calculateSOM(4536000000, 0.01);
      expect(som).toBe(45360000); // 45.36 million
    });
  });

  describe('Financial Metrics', () => {
    test('should calculate ROI', () => {
      const calculateROI = (totalRevenue, totalInvestment) => {
        if (totalInvestment === 0) return 0;
        return ((totalRevenue - totalInvestment) / totalInvestment) * 100;
      };
      
      expect(calculateROI(1500000, 1000000)).toBe(50);
      expect(calculateROI(2000000, 1000000)).toBe(100);
      expect(calculateROI(900000, 1000000)).toBe(-10);
    });

    test('should calculate payback period', () => {
      const calculatePaybackPeriod = (initialInvestment, monthlyProfit) => {
        if (monthlyProfit <= 0) return Infinity;
        return initialInvestment / monthlyProfit;
      };
      
      expect(calculatePaybackPeriod(1000000, 100000)).toBe(10); // 10 months
      expect(calculatePaybackPeriod(500000, 50000)).toBe(10);
      expect(calculatePaybackPeriod(1000000, 0)).toBe(Infinity);
    });

    test('should calculate break-even point', () => {
      const calculateBreakEvenPoint = (fixedCosts, pricePerUnit, variableCostPerUnit) => {
        const contributionMargin = pricePerUnit - variableCostPerUnit;
        if (contributionMargin <= 0) return Infinity;
        return Math.ceil(fixedCosts / contributionMargin);
      };
      
      expect(calculateBreakEvenPoint(100000, 10, 6)).toBe(25000);
      expect(calculateBreakEvenPoint(50000, 5, 3)).toBe(25000);
      expect(calculateBreakEvenPoint(100000, 5, 5)).toBe(Infinity);
    });

    test('should calculate NPV', () => {
      const calculateNPV = (cashFlows, discountRate) => {
        return cashFlows.reduce((npv, cashFlow, period) => {
          return npv + cashFlow / Math.pow(1 + discountRate, period);
        }, 0);
      };
      
      const cashFlows = [-100000, 30000, 40000, 50000, 60000];
      const npv = calculateNPV(cashFlows, 0.1);
      expect(npv).toBeCloseTo(38095.24, 2);
    });
  });

  describe('Currency Conversions', () => {
    test('should convert INR to USD', () => {
      const convertToUSD = (amountINR) => {
        const rate = parseFloat(document.getElementById('usdRate').value);
        return amountINR / rate;
      };
      
      expect(convertToUSD(8350)).toBe(100);
      expect(convertToUSD(41750)).toBe(500);
    });

    test('should convert between different APAC currencies', () => {
      const currencyRates = {
        'INR': 1,
        'SGD': 61.5,
        'AUD': 54.2,
        'JPY': 0.56,
        'KRW': 0.063
      };
      
      const convertCurrency = (amount, fromCurrency, toCurrency) => {
        const inINR = amount * currencyRates[fromCurrency];
        return inINR / currencyRates[toCurrency];
      };
      
      expect(convertCurrency(100, 'SGD', 'INR')).toBe(6150);
      expect(convertCurrency(1000, 'INR', 'SGD')).toBeCloseTo(16.26, 2);
    });
  });

  describe('Growth Calculations', () => {
    test('should calculate CAGR', () => {
      const calculateCAGR = (beginValue, endValue, years) => {
        if (beginValue <= 0 || years <= 0) return 0;
        return (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
      };
      
      expect(calculateCAGR(1000000, 1610510, 5)).toBeCloseTo(10, 1);
      expect(calculateCAGR(500000, 1000000, 3)).toBeCloseTo(26, 0);
    });

    test('should calculate month-over-month growth', () => {
      const calculateMoMGrowth = (currentMonth, previousMonth) => {
        if (previousMonth === 0) return 0;
        return ((currentMonth - previousMonth) / previousMonth) * 100;
      };
      
      expect(calculateMoMGrowth(110000, 100000)).toBe(10);
      expect(calculateMoMGrowth(95000, 100000)).toBe(-5);
    });

    test('should calculate year-over-year growth', () => {
      const calculateYoYGrowth = (currentYear, previousYear) => {
        if (previousYear === 0) return 0;
        return ((currentYear - previousYear) / previousYear) * 100;
      };
      
      expect(calculateYoYGrowth(1200000, 1000000)).toBe(20);
      expect(calculateYoYGrowth(900000, 1000000)).toBe(-10);
    });
  });

  describe('Scenario Analysis', () => {
    test('should calculate best case scenario', () => {
      const calculateScenario = (baseValue, adjustmentPercent) => {
        return baseValue * (1 + adjustmentPercent / 100);
      };
      
      expect(calculateScenario(1000000, 20)).toBe(1200000); // Best case
      expect(calculateScenario(1000000, 0)).toBe(1000000);  // Base case
      expect(calculateScenario(1000000, -20)).toBe(800000); // Worst case
    });

    test('should perform sensitivity analysis', () => {
      const sensitivityAnalysis = (baseRevenue, variable, changePercent) => {
        const changes = {
          'price': baseRevenue * (1 + changePercent / 100),
          'volume': baseRevenue * (1 + changePercent / 100),
          'cost': baseRevenue * (1 - changePercent / 100 * 0.4) // Assuming 40% cost impact
        };
        return changes[variable] || baseRevenue;
      };
      
      expect(sensitivityAnalysis(1000000, 'price', 10)).toBe(1100000);
      expect(sensitivityAnalysis(1000000, 'volume', -10)).toBe(900000);
      expect(sensitivityAnalysis(1000000, 'cost', 10)).toBe(960000);
    });
  });
});