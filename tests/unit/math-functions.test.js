/**
 * Unit tests for pure mathematical functions (no DOM dependencies)
 */

describe('Mathematical Function Tests', () => {
  
  describe('Revenue Calculation Functions', () => {
    test('should calculate compound growth correctly', () => {
      const calculateCompoundGrowth = (initial, rate, periods) => {
        return initial * Math.pow(1 + rate, periods);
      };
      
      expect(calculateCompoundGrowth(1000, 0.1, 3)).toBeCloseTo(1331, 0);
      expect(calculateCompoundGrowth(1000, 0.05, 12)).toBeCloseTo(1795.86, 1);
      expect(calculateCompoundGrowth(1000000, 0.08, 1)).toBe(1080000);
    });

    test('should calculate monthly revenue with growth', () => {
      const calculateMonthlyRevenue = (base, growthRate, month) => {
        return base * Math.pow(1 + growthRate / 100, month);
      };
      
      expect(calculateMonthlyRevenue(10000, 5, 3)).toBeCloseTo(11576.25, 2);
      expect(calculateMonthlyRevenue(10000, -5, 3)).toBeCloseTo(8573.75, 2);
      expect(calculateMonthlyRevenue(10000, 0, 5)).toBe(10000);
    });

    test('should calculate profit margin', () => {
      const calculateProfitMargin = (revenue, costs) => {
        if (revenue === 0) return 0;
        return ((revenue - costs) / revenue) * 100;
      };
      
      expect(calculateProfitMargin(10000, 4000)).toBe(60);
      expect(calculateProfitMargin(10000, 7000)).toBe(30);
      expect(calculateProfitMargin(0, 1000)).toBe(0);
      expect(calculateProfitMargin(10000, 10000)).toBe(0);
    });

    test('should calculate COGS as percentage', () => {
      const calculateCOGS = (revenue, percentage) => {
        return revenue * (percentage / 100);
      };
      
      expect(calculateCOGS(10000, 40)).toBe(4000);
      expect(calculateCOGS(500000, 25)).toBe(125000);
      expect(calculateCOGS(1000000, 0)).toBe(0);
    });

    test('should apply seasonality factors', () => {
      const applySeasonality = (baseValue, month, type) => {
        const factors = {
          'retail': [0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4],
          'summer': [0.8, 0.8, 0.9, 1.1, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.8, 0.8]
        };
        
        if (type === 'none') return baseValue;
        const seasonalFactors = factors[type] || Array(12).fill(1);
        return baseValue * seasonalFactors[month % 12];
      };
      
      expect(applySeasonality(1000, 11, 'retail')).toBe(1400); // December peak
      expect(applySeasonality(1000, 6, 'summer')).toBe(1400);  // July peak
      expect(applySeasonality(1000, 5, 'none')).toBe(1000);   // No seasonality
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
      expect(calculateROI(1000000, 0)).toBe(0);
    });

    test('should calculate payback period', () => {
      const calculatePaybackPeriod = (initialInvestment, monthlyProfit) => {
        if (monthlyProfit <= 0) return Infinity;
        return initialInvestment / monthlyProfit;
      };
      
      expect(calculatePaybackPeriod(1000000, 100000)).toBe(10);
      expect(calculatePaybackPeriod(500000, 50000)).toBe(10);
      expect(calculatePaybackPeriod(1000000, 0)).toBe(Infinity);
      expect(calculatePaybackPeriod(1000000, -50000)).toBe(Infinity);
    });

    test('should calculate break-even point', () => {
      const calculateBreakEven = (fixedCosts, pricePerUnit, variableCost) => {
        const contributionMargin = pricePerUnit - variableCost;
        if (contributionMargin <= 0) return Infinity;
        return Math.ceil(fixedCosts / contributionMargin);
      };
      
      expect(calculateBreakEven(100000, 10, 6)).toBe(25000);
      expect(calculateBreakEven(50000, 5, 3)).toBe(25000);
      expect(calculateBreakEven(100000, 5, 5)).toBe(Infinity);
    });

    test('should calculate NPV', () => {
      const calculateNPV = (cashFlows, discountRate) => {
        return cashFlows.reduce((npv, cashFlow, period) => {
          return npv + cashFlow / Math.pow(1 + discountRate, period);
        }, 0);
      };
      
      const cashFlows = [-100000, 30000, 40000, 50000, 60000];
      const npv = calculateNPV(cashFlows, 0.1);
      expect(npv).toBeCloseTo(38877.13, 2); // Corrected expected value
    });

    test('should calculate CAGR', () => {
      const calculateCAGR = (beginValue, endValue, years) => {
        if (beginValue <= 0 || years <= 0) return 0;
        return (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
      };
      
      expect(calculateCAGR(1000000, 1610510, 5)).toBeCloseTo(10, 1);
      expect(calculateCAGR(500000, 1000000, 3)).toBeCloseTo(26, 0);
      expect(calculateCAGR(0, 1000000, 5)).toBe(0);
    });
  });

  describe('Currency and Conversion', () => {
    test('should convert currencies with exchange rates', () => {
      const convertCurrency = (amount, fromRate, toRate) => {
        return (amount * fromRate) / toRate;
      };
      
      // INR to USD (83.5 INR = 1 USD)
      expect(convertCurrency(8350, 1, 83.5)).toBeCloseTo(100, 2);
      expect(convertCurrency(41750, 1, 83.5)).toBeCloseTo(500, 2);
      
      // USD to INR
      expect(convertCurrency(100, 83.5, 1)).toBe(8350);
    });

    test('should handle percentage calculations', () => {
      const calculatePercentage = (value, total) => {
        if (total === 0) return 0;
        return (value / total) * 100;
      };
      
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(750, 1000)).toBe(75);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(50, 0)).toBe(0);
    });
  });

  describe('Market Analysis Functions', () => {
    test('should calculate TAM (Total Addressable Market)', () => {
      const calculateTAM = (population, penetration, avgTransactions, price) => {
        return population * penetration * avgTransactions * price;
      };
      
      const tam = calculateTAM(1400000000, 0.6, 12, 1.5);
      expect(tam).toBe(15120000000); // 15.12 billion
    });

    test('should calculate SAM (Serviceable Addressable Market)', () => {
      const calculateSAM = (tam, serviceablePercentage) => {
        return tam * serviceablePercentage;
      };
      
      const sam = calculateSAM(15120000000, 0.3);
      expect(sam).toBe(4536000000); // 4.536 billion
    });

    test('should calculate SOM (Serviceable Obtainable Market)', () => {
      const calculateSOM = (sam, marketShare) => {
        return sam * marketShare;
      };
      
      const som = calculateSOM(4536000000, 0.01);
      expect(som).toBe(45360000); // 45.36 million
    });

    test('should calculate market penetration', () => {
      const calculatePenetration = (actualUsers, totalMarket) => {
        if (totalMarket === 0) return 0;
        return (actualUsers / totalMarket) * 100;
      };
      
      expect(calculatePenetration(1000000, 10000000)).toBe(10);
      expect(calculatePenetration(750000, 5000000)).toBe(15);
      expect(calculatePenetration(0, 1000000)).toBe(0);
    });
  });

  describe('Growth and Trend Analysis', () => {
    test('should calculate month-over-month growth', () => {
      const calculateMoMGrowth = (current, previous) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };
      
      expect(calculateMoMGrowth(110000, 100000)).toBe(10);
      expect(calculateMoMGrowth(95000, 100000)).toBe(-5);
      expect(calculateMoMGrowth(100000, 0)).toBe(0);
    });

    test('should calculate year-over-year growth', () => {
      const calculateYoYGrowth = (currentYear, previousYear) => {
        if (previousYear === 0) return 0;
        return ((currentYear - previousYear) / previousYear) * 100;
      };
      
      expect(calculateYoYGrowth(1200000, 1000000)).toBe(20);
      expect(calculateYoYGrowth(900000, 1000000)).toBe(-10);
      expect(calculateYoYGrowth(1000000, 1000000)).toBe(0);
    });

    test('should perform trend analysis', () => {
      const calculateTrend = (dataPoints) => {
        if (dataPoints.length < 2) return 0;
        
        const firstValue = dataPoints[0];
        const lastValue = dataPoints[dataPoints.length - 1];
        const periods = dataPoints.length - 1;
        
        return Math.pow(lastValue / firstValue, 1 / periods) - 1;
      };
      
      const data = [1000000, 1100000, 1210000, 1331000];
      const trend = calculateTrend(data);
      expect(trend).toBeCloseTo(0.1, 3); // 10% growth rate
    });
  });

  describe('Validation Functions', () => {
    test('should validate positive numbers', () => {
      const isPositiveNumber = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
      };
      
      expect(isPositiveNumber(5)).toBe(true);
      expect(isPositiveNumber('10.5')).toBe(true);
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-5)).toBe(false);
      expect(isPositiveNumber('abc')).toBe(false);
    });

    test('should validate percentage range', () => {
      const isValidPercentage = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 100;
      };
      
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
      expect(isValidPercentage(101)).toBe(false);
      expect(isValidPercentage(-1)).toBe(false);
    });

    test('should validate growth rate range', () => {
      const isValidGrowthRate = (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= -100; // Allow negative growth up to -100%
      };
      
      expect(isValidGrowthRate(10)).toBe(true);
      expect(isValidGrowthRate(0)).toBe(true);
      expect(isValidGrowthRate(-50)).toBe(true);
      expect(isValidGrowthRate(-100)).toBe(true);
      expect(isValidGrowthRate(-101)).toBe(false);
    });
  });

  describe('Array and Data Processing', () => {
    test('should calculate array statistics', () => {
      const calculateStats = (numbers) => {
        if (numbers.length === 0) return { sum: 0, avg: 0, min: 0, max: 0 };
        
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        
        return { sum, avg, min, max };
      };
      
      const data = [10, 20, 30, 40, 50];
      const stats = calculateStats(data);
      
      expect(stats.sum).toBe(150);
      expect(stats.avg).toBe(30);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
    });

    test('should calculate weighted average', () => {
      const calculateWeightedAverage = (values, weights) => {
        if (values.length !== weights.length || values.length === 0) return 0;
        
        const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        return totalWeight === 0 ? 0 : weightedSum / totalWeight;
      };
      
      const values = [85, 90, 78, 92];
      const weights = [0.2, 0.3, 0.3, 0.2];
      const weightedAvg = calculateWeightedAverage(values, weights);
      
      expect(weightedAvg).toBeCloseTo(85.8, 1);
    });
  });
});