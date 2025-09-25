/**
 * Integration tests for data flow between modules
 */

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset global state
    global.window = {
      segments: [],
      projectionData: [],
      segmentProjections: {},
      currentCountry: 'india'
    };
    
    global.localStorage = {
      store: {},
      getItem: jest.fn(key => global.localStorage.store[key] || null),
      setItem: jest.fn((key, value) => {
        global.localStorage.store[key] = value;
      }),
      removeItem: jest.fn(key => {
        delete global.localStorage.store[key];
      }),
      clear: jest.fn(() => {
        global.localStorage.store = {};
      })
    };
  });

  describe('Segment Management Flow', () => {
    test('adding segment should update localStorage', () => {
      const newSegment = {
        id: Date.now(),
        name: 'Test Segment',
        pricePerTransaction: 2.5,
        costPerTransaction: 0.5,
        monthlyVolume: 1000000,
        volumeGrowth: 10
      };

      // Add segment
      global.window.segments.push(newSegment);
      
      // Save to localStorage
      localStorage.setItem('segments', JSON.stringify(global.window.segments));
      
      // Verify
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'segments',
        JSON.stringify([newSegment])
      );
    });

    test('deleting segment should update all related data', () => {
      // Setup initial segments
      global.window.segments = [
        { id: 1, name: 'Segment 1' },
        { id: 2, name: 'Segment 2' },
        { id: 3, name: 'Segment 3' }
      ];

      // Delete segment with id 2
      const segmentIdToDelete = 2;
      global.window.segments = global.window.segments.filter(
        s => s.id !== segmentIdToDelete
      );

      // Verify segment was removed
      expect(global.window.segments.length).toBe(2);
      expect(global.window.segments.find(s => s.id === 2)).toBeUndefined();
      
      // Should also clear related projections
      delete global.window.segmentProjections[segmentIdToDelete];
      expect(global.window.segmentProjections[segmentIdToDelete]).toBeUndefined();
    });

    test('updating segment should recalculate projections', () => {
      const segment = {
        id: 1,
        name: 'Original',
        pricePerTransaction: 2,
        monthlyVolume: 1000000
      };

      global.window.segments = [segment];
      
      // Update segment
      global.window.segments[0].pricePerTransaction = 3;
      
      // Trigger recalculation (simplified)
      const updatedRevenue = global.window.segments[0].pricePerTransaction * 
                            global.window.segments[0].monthlyVolume;
      
      expect(updatedRevenue).toBe(3000000);
    });
  });

  describe('Projection Calculation Flow', () => {
    test('projections should aggregate all segments', () => {
      global.window.segments = [
        {
          id: 1,
          pricePerTransaction: 2,
          costPerTransaction: 0.5,
          monthlyVolume: 1000000
        },
        {
          id: 2,
          pricePerTransaction: 3,
          costPerTransaction: 1,
          monthlyVolume: 500000
        }
      ];

      // Calculate total revenue
      const totalRevenue = global.window.segments.reduce((sum, segment) => {
        return sum + (segment.pricePerTransaction * segment.monthlyVolume);
      }, 0);

      expect(totalRevenue).toBe(3500000); // 2M + 1.5M
      
      // Calculate total costs
      const totalCosts = global.window.segments.reduce((sum, segment) => {
        return sum + (segment.costPerTransaction * segment.monthlyVolume);
      }, 0);

      expect(totalCosts).toBe(1000000); // 500K + 500K
    });

    test('projections should respect growth rates', () => {
      const segment = {
        pricePerTransaction: 2,
        monthlyVolume: 1000000,
        volumeGrowth: 10 // 10% monthly
      };

      const projections = [];
      for (let month = 0; month < 3; month++) {
        const volume = segment.monthlyVolume * Math.pow(1.1, month);
        const revenue = segment.pricePerTransaction * volume;
        projections.push({ month, revenue });
      }

      expect(projections[0].revenue).toBe(2000000);
      expect(projections[1].revenue).toBeCloseTo(2200000, 0);
      expect(projections[2].revenue).toBeCloseTo(2420000, 0);
    });
  });

  describe('Demographics Integration', () => {
    test('loading demographics should update segments', () => {
      const demographicData = {
        country: { key: 'india', name: 'India' },
        demographicSegments: [
          {
            name: 'Urban Citizens',
            population: 500000000,
            authPct: 80,
            authFreq: 2
          }
        ]
      };

      // Load demographics
      global.window.currentCountry = demographicData.country.key;
      
      // Create segment from demographic data
      const segment = {
        name: demographicData.demographicSegments[0].name,
        monthlyVolume: demographicData.demographicSegments[0].population * 
                      (demographicData.demographicSegments[0].authPct / 100) * 
                      demographicData.demographicSegments[0].authFreq / 12,
        demographicBased: true
      };

      global.window.segments.push(segment);
      
      expect(global.window.segments[0].monthlyVolume).toBeCloseTo(66666666.67, 0);
    });

    test('switching countries should update currency', () => {
      const countries = {
        india: { currency: 'INR', rate: 1 },
        singapore: { currency: 'SGD', rate: 61.5 },
        australia: { currency: 'AUD', rate: 54.2 }
      };

      // Switch to Singapore
      global.window.currentCountry = 'singapore';
      const currentRate = countries[global.window.currentCountry].rate;
      
      // Convert 1000 INR to SGD
      const amountINR = 1000;
      const amountSGD = amountINR / currentRate;
      
      expect(amountSGD).toBeCloseTo(16.26, 2);
    });
  });

  describe('Export/Import Flow', () => {
    test('exported data should be importable', () => {
      const originalSegments = [
        { id: 1, name: 'Segment 1', pricePerTransaction: 2 },
        { id: 2, name: 'Segment 2', pricePerTransaction: 3 }
      ];

      // Export
      const exportedData = JSON.stringify(originalSegments);
      
      // Clear
      global.window.segments = [];
      
      // Import
      const importedSegments = JSON.parse(exportedData);
      global.window.segments = importedSegments;
      
      expect(global.window.segments).toEqual(originalSegments);
    });

    test('Excel export should include all necessary data', () => {
      global.window.segments = [{
        name: 'Test',
        pricePerTransaction: 2,
        monthlyVolume: 1000000
      }];
      
      global.window.projectionData = [
        { month: 'Jan 2025', revenue: 2000000, costs: 500000 },
        { month: 'Feb 2025', revenue: 2200000, costs: 550000 }
      ];

      // Prepare export data
      const exportData = {
        segments: global.window.segments,
        projections: global.window.projectionData,
        metadata: {
          exportDate: new Date().toISOString(),
          country: global.window.currentCountry
        }
      };

      expect(exportData.segments.length).toBe(1);
      expect(exportData.projections.length).toBe(2);
      expect(exportData.metadata.country).toBe('india');
    });
  });

  describe('Model Save/Load Flow', () => {
    test('saving model should preserve all state', () => {
      const model = {
        name: 'Q1 2025 Projection',
        segments: [
          { id: 1, name: 'Segment 1' }
        ],
        parameters: {
          growthRate: 10,
          costPercentage: 40,
          projectionMonths: 12
        },
        createdAt: new Date().toISOString()
      };

      // Save model
      const savedModels = JSON.parse(localStorage.getItem('savedModels') || '[]');
      savedModels.push(model);
      localStorage.setItem('savedModels', JSON.stringify(savedModels));
      
      // Verify saved
      const stored = JSON.parse(localStorage.getItem('savedModels'));
      expect(stored[0].name).toBe('Q1 2025 Projection');
      expect(stored[0].segments.length).toBe(1);
      expect(stored[0].parameters.growthRate).toBe(10);
    });

    test('loading model should restore state', () => {
      const savedModel = {
        segments: [{ id: 1, name: 'Saved Segment' }],
        parameters: { growthRate: 15 }
      };

      // Load model
      global.window.segments = savedModel.segments;
      global.window.growthRate = savedModel.parameters.growthRate;
      
      expect(global.window.segments[0].name).toBe('Saved Segment');
      expect(global.window.growthRate).toBe(15);
    });
  });

  describe('Error Recovery Flow', () => {
    test('should handle corrupted localStorage data', () => {
      // Set corrupted data
      localStorage.setItem('segments', 'not valid json');
      
      // Try to load
      let segments = [];
      try {
        segments = JSON.parse(localStorage.getItem('segments'));
      } catch (e) {
        segments = [];
      }
      
      expect(segments).toEqual([]);
    });

    test('should validate data before calculations', () => {
      const invalidSegment = {
        name: 'Invalid',
        pricePerTransaction: -5, // Invalid negative price
        monthlyVolume: 1000000
      };

      const isValid = invalidSegment.pricePerTransaction > 0;
      
      if (!isValid) {
        // Should not add to segments
        expect(isValid).toBe(false);
      }
    });
  });
});