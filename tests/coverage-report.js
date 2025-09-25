#!/usr/bin/env node

/**
 * Comprehensive Test Coverage Report Generator
 * Analyzes test coverage across all functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestCoverageAnalyzer {
  constructor() {
    this.appJsPath = path.join(__dirname, '../app.js');
    this.testDirectory = __dirname;
    this.htmlIndexPath = path.join(__dirname, '../index.html');
    
    this.functionsFound = new Set();
    this.functionsTested = new Set();
    this.uiElementsFound = new Set();
    this.uiElementsTested = new Set();
    this.testStats = {
      unit: { files: 0, tests: 0 },
      integration: { files: 0, tests: 0 },
      e2e: { files: 0, tests: 0 },
      accessibility: { files: 0, tests: 0 },
      performance: { files: 0, tests: 0 },
      visual: { files: 0, tests: 0 }
    };
  }

  async generateReport() {
    console.log('🧪 Generating Comprehensive Test Coverage Report...\n');
    
    await this.analyzeSourceCode();
    await this.analyzeTestFiles();
    await this.analyzeUIElements();
    
    this.generateSummaryReport();
    this.generateDetailedReport();
    this.generateRecommendations();
    
    console.log('✅ Coverage report generation complete!');
  }

  async analyzeSourceCode() {
    console.log('📊 Analyzing source code...');
    
    if (!fs.existsSync(this.appJsPath)) {
      console.log('❌ app.js not found');
      return;
    }
    
    const appJsContent = fs.readFileSync(this.appJsPath, 'utf-8');
    
    // Extract function definitions
    const functionPatterns = [
      /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
      /window\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*function/g,
      /const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:function|\()/g,
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*function/g
    ];
    
    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(appJsContent)) !== null) {
        this.functionsFound.add(match[1]);
      }
    });
    
    console.log(`   Found ${this.functionsFound.size} functions in source code`);
  }

  async analyzeTestFiles() {
    console.log('🔍 Analyzing test files...');
    
    const testTypes = ['unit', 'integration', 'e2e'];
    
    for (const testType of testTypes) {
      const testDir = path.join(this.testDirectory, testType);
      if (fs.existsSync(testDir)) {
        const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));
        this.testStats[testType].files = testFiles.length;
        
        let totalTests = 0;
        
        testFiles.forEach(testFile => {
          const testPath = path.join(testDir, testFile);
          const testContent = fs.readFileSync(testPath, 'utf-8');
          
          // Count test cases
          const testMatches = testContent.match(/(?:test|it)\s*\(/g);
          const testCount = testMatches ? testMatches.length : 0;
          totalTests += testCount;
          
          // Find tested functions
          const testedFunctions = this.extractTestedFunctions(testContent);
          testedFunctions.forEach(func => this.functionsTested.add(func));
          
          console.log(`   ${testFile}: ${testCount} tests`);
        });
        
        this.testStats[testType].tests = totalTests;
      }
    }
    
    // Check for specialized test files
    const specialFiles = [
      { name: 'accessibility.test.js', type: 'accessibility' },
      { name: 'performance.test.js', type: 'performance' },
      { name: 'visual-regression.test.js', type: 'visual' }
    ];
    
    specialFiles.forEach(({ name, type }) => {
      const filePath = path.join(this.testDirectory, 'e2e', name);
      if (fs.existsSync(filePath)) {
        this.testStats[type].files = 1;
        const content = fs.readFileSync(filePath, 'utf-8');
        const testMatches = content.match(/(?:test|it)\s*\(/g);
        this.testStats[type].tests = testMatches ? testMatches.length : 0;
      }
    });
  }

  extractTestedFunctions(testContent) {
    const testedFunctions = [];
    
    // Look for function calls in tests
    this.functionsFound.forEach(funcName => {
      if (testContent.includes(funcName)) {
        testedFunctions.push(funcName);
      }
    });
    
    return testedFunctions;
  }

  async analyzeUIElements() {
    console.log('🎨 Analyzing UI elements...');
    
    if (!fs.existsSync(this.htmlIndexPath)) {
      console.log('   HTML file not found, skipping UI analysis');
      return;
    }
    
    const htmlContent = fs.readFileSync(this.htmlIndexPath, 'utf-8');
    
    // Extract UI elements
    const uiPatterns = [
      /id="([^"]+)"/g,
      /class="([^"]+)"/g,
      /onclick="([^"(]+)\(/g,
      /onchange="([^"(]+)\(/g,
      /<button[^>]*>/g,
      /<input[^>]*>/g,
      /<select[^>]*>/g,
      /<div[^>]*class="[^"]*tab[^"]*"[^>]*>/g
    ];
    
    uiPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        if (match[1]) {
          this.uiElementsFound.add(match[1]);
        }
      }
    });
    
    // Check test files for UI element testing
    const e2eDir = path.join(this.testDirectory, 'e2e');
    if (fs.existsSync(e2eDir)) {
      const e2eFiles = fs.readdirSync(e2eDir).filter(f => f.endsWith('.test.js'));
      
      e2eFiles.forEach(testFile => {
        const testPath = path.join(e2eDir, testFile);
        const testContent = fs.readFileSync(testPath, 'utf-8');
        
        this.uiElementsFound.forEach(element => {
          if (testContent.includes(element)) {
            this.uiElementsTested.add(element);
          }
        });
      });
    }
    
    console.log(`   Found ${this.uiElementsFound.size} UI elements`);
    console.log(`   Tested ${this.uiElementsTested.size} UI elements`);
  }

  generateSummaryReport() {
    console.log('\n📋 TEST COVERAGE SUMMARY');
    console.log('========================\n');
    
    // Function Coverage
    const functionCoverage = (this.functionsTested.size / this.functionsFound.size * 100).toFixed(1);
    console.log(`📊 FUNCTION COVERAGE: ${functionCoverage}% (${this.functionsTested.size}/${this.functionsFound.size})`);
    
    // UI Element Coverage
    const uiCoverage = this.uiElementsFound.size > 0 ? 
      (this.uiElementsTested.size / this.uiElementsFound.size * 100).toFixed(1) : 0;
    console.log(`🎨 UI ELEMENT COVERAGE: ${uiCoverage}% (${this.uiElementsTested.size}/${this.uiElementsFound.size})`);
    
    console.log('\n📁 TEST SUITE BREAKDOWN:');
    console.log('-----------------------');
    
    Object.entries(this.testStats).forEach(([type, stats]) => {
      const icon = this.getTestTypeIcon(type);
      console.log(`${icon} ${type.toUpperCase().padEnd(12)} | ${stats.files} files | ${stats.tests} tests`);
    });
    
    const totalTestFiles = Object.values(this.testStats).reduce((sum, stats) => sum + stats.files, 0);
    const totalTests = Object.values(this.testStats).reduce((sum, stats) => sum + stats.tests, 0);
    
    console.log(`\n📊 TOTALS: ${totalTestFiles} test files | ${totalTests} test cases`);
    
    // Coverage Quality Assessment
    console.log('\n🎯 COVERAGE QUALITY:');
    console.log('-------------------');
    
    const qualityScore = this.calculateQualityScore();
    console.log(`Overall Quality Score: ${qualityScore.score}/100`);
    console.log(`Quality Level: ${qualityScore.level}`);
  }

  generateDetailedReport() {
    console.log('\n📝 DETAILED COVERAGE ANALYSIS');
    console.log('=============================\n');
    
    // Untested Functions
    const untestedFunctions = Array.from(this.functionsFound).filter(func => 
      !this.functionsTested.has(func)
    );
    
    if (untestedFunctions.length > 0) {
      console.log('❌ UNTESTED FUNCTIONS:');
      untestedFunctions.sort().forEach(func => {
        console.log(`   • ${func}`);
      });
    } else {
      console.log('✅ All functions have test coverage!');
    }
    
    // Well-tested Functions
    console.log('\n✅ TESTED FUNCTIONS:');
    Array.from(this.functionsTested).sort().slice(0, 10).forEach(func => {
      console.log(`   • ${func}`);
    });
    if (this.functionsTested.size > 10) {
      console.log(`   ... and ${this.functionsTested.size - 10} more`);
    }
    
    // UI Testing Coverage
    const untestedUIElements = Array.from(this.uiElementsFound).filter(element => 
      !this.uiElementsTested.has(element)
    );
    
    if (untestedUIElements.length > 0) {
      console.log('\n❌ UNTESTED UI ELEMENTS:');
      untestedUIElements.sort().slice(0, 20).forEach(element => {
        console.log(`   • ${element}`);
      });
      if (untestedUIElements.length > 20) {
        console.log(`   ... and ${untestedUIElements.length - 20} more`);
      }
    }
  }

  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================\n');
    
    const recommendations = [];
    
    // Function Coverage Recommendations
    const functionCoverage = this.functionsTested.size / this.functionsFound.size;
    if (functionCoverage < 0.8) {
      recommendations.push('🔴 CRITICAL: Function coverage below 80%. Add unit tests for core functions.');
    } else if (functionCoverage < 0.9) {
      recommendations.push('🟡 MODERATE: Consider adding tests for remaining untested functions.');
    }
    
    // Test Type Recommendations
    if (this.testStats.unit.tests < 50) {
      recommendations.push('🔴 CRITICAL: Add more unit tests for individual functions.');
    }
    
    if (this.testStats.e2e.tests < 20) {
      recommendations.push('🟡 MODERATE: Add more end-to-end tests for user workflows.');
    }
    
    if (this.testStats.accessibility.tests === 0) {
      recommendations.push('🔴 CRITICAL: No accessibility tests found. Add A11y testing.');
    }
    
    if (this.testStats.performance.tests === 0) {
      recommendations.push('🟡 MODERATE: Add performance tests for critical operations.');
    }
    
    if (this.testStats.visual.tests === 0) {
      recommendations.push('🟡 MODERATE: Consider adding visual regression tests.');
    }
    
    // UI Coverage Recommendations
    const uiCoverage = this.uiElementsFound.size > 0 ? 
      this.uiElementsTested.size / this.uiElementsFound.size : 1;
    
    if (uiCoverage < 0.7) {
      recommendations.push('🟡 MODERATE: Many UI elements lack test coverage. Add more UI tests.');
    }
    
    // Quality Recommendations
    const qualityScore = this.calculateQualityScore();
    if (qualityScore.score < 70) {
      recommendations.push('🔴 CRITICAL: Overall test quality needs improvement.');
    }
    
    if (recommendations.length === 0) {
      console.log('🎉 EXCELLENT: Your test coverage is comprehensive!');
      console.log('   • All critical areas are well-tested');
      console.log('   • Good balance of test types');
      console.log('   • Strong foundation for maintaining code quality');
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log('\n📈 SUGGESTED NEXT STEPS:');
    console.log('1. Run existing tests: npm run test');
    console.log('2. Run with coverage: npm run test:coverage');
    console.log('3. Run specific test suites: npm run test:unit, npm run test:e2e');
    console.log('4. Review and add tests for untested functions');
    console.log('5. Consider adding integration tests for complex workflows');
  }

  calculateQualityScore() {
    const functionCoverage = this.functionsTested.size / this.functionsFound.size;
    const uiCoverage = this.uiElementsFound.size > 0 ? 
      this.uiElementsTested.size / this.uiElementsFound.size : 1;
    
    const testTypeScore = (
      (this.testStats.unit.tests > 0 ? 20 : 0) +
      (this.testStats.integration.tests > 0 ? 15 : 0) +
      (this.testStats.e2e.tests > 0 ? 20 : 0) +
      (this.testStats.accessibility.tests > 0 ? 15 : 0) +
      (this.testStats.performance.tests > 0 ? 10 : 0) +
      (this.testStats.visual.tests > 0 ? 10 : 0)
    );
    
    const coverageScore = (functionCoverage * 40) + (uiCoverage * 30);
    const totalScore = Math.round(coverageScore + testTypeScore);
    
    let level;
    if (totalScore >= 90) level = '🏆 EXCELLENT';
    else if (totalScore >= 80) level = '🥇 VERY GOOD';
    else if (totalScore >= 70) level = '🥈 GOOD';
    else if (totalScore >= 60) level = '🥉 FAIR';
    else level = '❌ NEEDS IMPROVEMENT';
    
    return { score: totalScore, level };
  }

  getTestTypeIcon(type) {
    const icons = {
      unit: '🧪',
      integration: '🔗',
      e2e: '🎭',
      accessibility: '♿',
      performance: '⚡',
      visual: '👁️'
    };
    return icons[type] || '📝';
  }
}

// Generate HTML Report
function generateHTMLReport(analyzer) {
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Coverage Report - APAC Revenue Projections</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .metric { display: inline-block; background: white; padding: 20px; border-radius: 8px; margin: 10px; text-align: center; }
        .metric h3 { margin: 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; color: #667eea; }
        .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .function-list { columns: 3; column-gap: 20px; }
        .function-item { break-inside: avoid; margin: 5px 0; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(to right, #28a745, #20c997); transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Coverage Report</h1>
        <p>APAC Revenue Projections System - Comprehensive Testing Analysis</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>Function Coverage</h3>
            <div class="value">${(analyzer.functionsTested.size / analyzer.functionsFound.size * 100).toFixed(1)}%</div>
            <p>${analyzer.functionsTested.size}/${analyzer.functionsFound.size} functions</p>
        </div>
        <div class="metric">
            <h3>UI Coverage</h3>
            <div class="value">${analyzer.uiElementsFound.size > 0 ? (analyzer.uiElementsTested.size / analyzer.uiElementsFound.size * 100).toFixed(1) : 0}%</div>
            <p>${analyzer.uiElementsTested.size}/${analyzer.uiElementsFound.size} elements</p>
        </div>
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${Object.values(analyzer.testStats).reduce((sum, stats) => sum + stats.tests, 0)}</div>
            <p>Across all test suites</p>
        </div>
        <div class="metric">
            <h3>Quality Score</h3>
            <div class="value">${analyzer.calculateQualityScore().score}/100</div>
            <p>${analyzer.calculateQualityScore().level}</p>
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Test Suite Breakdown</h2>
        ${Object.entries(analyzer.testStats).map(([type, stats]) => `
            <div style="margin: 15px 0;">
                <strong>${analyzer.getTestTypeIcon(type)} ${type.toUpperCase()}</strong>
                <div class="progress-bar" style="margin: 5px 0;">
                    <div class="progress-fill" style="width: ${Math.min(stats.tests / 50 * 100, 100)}%;"></div>
                </div>
                <small>${stats.files} files, ${stats.tests} tests</small>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>✅ Well-Tested Functions (${analyzer.functionsTested.size})</h2>
        <div class="function-list">
            ${Array.from(analyzer.functionsTested).sort().map(func => 
                `<div class="function-item good">✓ ${func}</div>`
            ).join('')}
        </div>
    </div>
    
    ${analyzer.functionsFound.size - analyzer.functionsTested.size > 0 ? `
    <div class="section">
        <h2>❌ Functions Needing Tests (${analyzer.functionsFound.size - analyzer.functionsTested.size})</h2>
        <div class="function-list">
            ${Array.from(analyzer.functionsFound).filter(func => !analyzer.functionsTested.has(func)).sort().map(func => 
                `<div class="function-item danger">✗ ${func}</div>`
            ).join('')}
        </div>
    </div>
    ` : ''}
    
    <div class="section">
        <h2>📝 Test Execution Commands</h2>
        <pre style="background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px;">
npm run test                 # Run all tests
npm run test:unit           # Run unit tests only  
npm run test:integration    # Run integration tests
npm run test:e2e            # Run end-to-end tests
npm run test:coverage       # Run with coverage report
npm run test:watch          # Run in watch mode
        </pre>
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'coverage-report.html');
  fs.writeFileSync(reportPath, htmlReport);
  console.log(`\n📊 HTML report saved to: ${reportPath}`);
}

// Main execution
async function main() {
  const analyzer = new TestCoverageAnalyzer();
  await analyzer.generateReport();
  generateHTMLReport(analyzer);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TestCoverageAnalyzer };