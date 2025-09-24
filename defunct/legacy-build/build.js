#!/usr/bin/env node
/**
 * Build Script for APAC Revenue Projections System
 * Combines modular JavaScript files into a single-page application
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_CONFIG = {
    // Input files (order matters for dependencies)
    jsFiles: [
        'js/core.js',
        'js/segments.js', 
        'js/projections.js',
        'js/demographics.js',
        'js/export.js',
        'js/ui.js'
    ],
    inputHtml: 'india_revenue_tool_modular.html',
    outputHtml: 'india_revenue_tool_single.html',
    cssFile: 'styles.css'
};

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        log(`❌ Error reading file ${filePath}: ${error.message}`, 'red');
        process.exit(1);
    }
}

function writeFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`✅ Written: ${filePath}`, 'green');
    } catch (error) {
        log(`❌ Error writing file ${filePath}: ${error.message}`, 'red');
        process.exit(1);
    }
}

function combineJavaScript() {
    log('\n📦 Combining JavaScript modules...', 'blue');
    
    let combinedJs = '';
    let totalLines = 0;
    
    // Add header comment
    combinedJs += `/**
 * Combined JavaScript for APAC Revenue Projections System
 * Generated on: ${new Date().toISOString()}
 * Modules included: ${BUILD_CONFIG.jsFiles.length}
 */\n\n`;
    
    BUILD_CONFIG.jsFiles.forEach((jsFile, index) => {
        const filePath = path.join(__dirname, jsFile);
        
        if (!fs.existsSync(filePath)) {
            log(`❌ JavaScript file not found: ${jsFile}`, 'red');
            process.exit(1);
        }
        
        log(`   📄 Reading: ${jsFile}`, 'cyan');
        const content = readFile(filePath);
        const lines = content.split('\n').length;
        totalLines += lines;
        
        // Add module separator
        combinedJs += `\n/* ================================================
 * MODULE ${index + 1}: ${jsFile.toUpperCase()}
 * Lines: ${lines}
 * ================================================ */\n\n`;
        
        // Remove the module header comment from individual files
        const cleanContent = content.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');
        combinedJs += cleanContent + '\n';
    });
    
    log(`   ✨ Combined ${BUILD_CONFIG.jsFiles.length} modules (${totalLines} total lines)`, 'green');
    return combinedJs;
}

function buildSinglePageApp() {
    log('🚀 Building single-page application...', 'blue');
    
    // Check if input HTML exists
    const inputHtmlPath = path.join(__dirname, BUILD_CONFIG.inputHtml);
    if (!fs.existsSync(inputHtmlPath)) {
        log(`❌ Input HTML file not found: ${BUILD_CONFIG.inputHtml}`, 'red');
        process.exit(1);
    }
    
    // Read the modular HTML template
    log(`   📄 Reading HTML template: ${BUILD_CONFIG.inputHtml}`, 'cyan');
    let htmlContent = readFile(inputHtmlPath);
    
    // Combine all JavaScript
    const combinedJs = combineJavaScript();
    
    // Replace the modular script includes with the combined script
    const scriptIncludes = BUILD_CONFIG.jsFiles
        .map(jsFile => `    <script src="${jsFile}"></script>`)
        .join('\n');
    
    // Find and replace the script includes section
    const scriptIncludePattern = new RegExp(
        `<!-- Load all modular JavaScript files -->\\s*\\n(\\s*<script src="js/[^"]+"></script>\\s*\\n)+`,
        'g'
    );
    
    if (scriptIncludePattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(
            scriptIncludePattern,
            `<!-- Combined JavaScript -->\n    <script>\n${combinedJs}    </script>\n`
        );
        log('   ✅ Replaced modular script includes with combined script', 'green');
    } else {
        // Fallback: add combined script before closing body tag
        const bodyClosePattern = /<\/body>/;
        if (bodyClosePattern.test(htmlContent)) {
            htmlContent = htmlContent.replace(
                bodyClosePattern,
                `    <!-- Combined JavaScript -->\n    <script>\n${combinedJs}    </script>\n</body>`
            );
            log('   ✅ Added combined script before closing body tag', 'green');
        } else {
            log('   ❌ Could not find location to insert combined JavaScript', 'red');
            process.exit(1);
        }
    }
    
    // Update version information in HTML
    const versionPattern = /Version \d+\.\d+\.\d+ - [^<]+/;
    const currentDate = new Date().toISOString().split('T')[0];
    const newVersionInfo = `Version 2.2.0 - Enhanced CRUD Operations & Segment Management (Single-Page Build ${currentDate})`;
    
    if (versionPattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(versionPattern, newVersionInfo);
        log('   ✅ Updated version information', 'green');
    }
    
    // Verify CSS link is present
    const cssLinkPattern = /<link rel="stylesheet" href="styles\.css">/;
    if (cssLinkPattern.test(htmlContent)) {
        log('   ✅ CSS link verified', 'green');
    } else {
        log('   ⚠️  Warning: CSS link not found', 'yellow');
    }
    
    // Write the single-page HTML file
    const outputPath = path.join(__dirname, BUILD_CONFIG.outputHtml);
    writeFile(outputPath, htmlContent);
    
    return htmlContent;
}

function generateBuildReport(htmlContent) {
    log('\n📊 Build Report:', 'blue');
    
    const stats = {
        htmlLines: htmlContent.split('\n').length,
        htmlSize: Buffer.byteLength(htmlContent, 'utf8'),
        jsModules: BUILD_CONFIG.jsFiles.length,
        outputFile: BUILD_CONFIG.outputHtml
    };
    
    // Check if CSS file exists
    const cssPath = path.join(__dirname, BUILD_CONFIG.cssFile);
    if (fs.existsSync(cssPath)) {
        const cssContent = readFile(cssPath);
        stats.cssLines = cssContent.split('\n').length;
        stats.cssSize = Buffer.byteLength(cssContent, 'utf8');
    }
    
    log(`   📄 Output file: ${stats.outputFile}`, 'cyan');
    log(`   📏 HTML lines: ${stats.htmlLines.toLocaleString()}`, 'cyan');
    log(`   💾 HTML size: ${(stats.htmlSize / 1024).toFixed(1)} KB`, 'cyan');
    log(`   📦 JavaScript modules: ${stats.jsModules}`, 'cyan');
    
    if (stats.cssLines) {
        log(`   🎨 CSS lines: ${stats.cssLines.toLocaleString()}`, 'cyan');
        log(`   💾 CSS size: ${(stats.cssSize / 1024).toFixed(1)} KB`, 'cyan');
    }
    
    const totalSize = stats.htmlSize + (stats.cssSize || 0);
    log(`   📊 Total size: ${(totalSize / 1024).toFixed(1)} KB`, 'green');
    
    return stats;
}

function validateBuild() {
    log('\n🔍 Validating build...', 'blue');
    
    const outputPath = path.join(__dirname, BUILD_CONFIG.outputHtml);
    const cssPath = path.join(__dirname, BUILD_CONFIG.cssFile);
    
    // Check if output file exists
    if (!fs.existsSync(outputPath)) {
        log('   ❌ Output HTML file was not created', 'red');
        return false;
    }
    
    // Check if CSS file exists
    if (!fs.existsSync(cssPath)) {
        log('   ⚠️  Warning: CSS file not found - styles may not load', 'yellow');
    } else {
        log('   ✅ CSS file found', 'green');
    }
    
    // Basic HTML validation
    const htmlContent = readFile(outputPath);
    
    const requiredElements = [
        { name: 'DOCTYPE', pattern: /<!DOCTYPE html>/i },
        { name: 'HTML tag', pattern: /<html[^>]*>/i },
        { name: 'Head section', pattern: /<head>/i },
        { name: 'Body section', pattern: /<body>/i },
        { name: 'Chart.js', pattern: /Chart\.js/i },
        { name: 'XLSX library', pattern: /xlsx/i },
        { name: 'Combined JavaScript', pattern: /Combined JavaScript/ }
    ];
    
    let validationPassed = true;
    
    requiredElements.forEach(element => {
        if (element.pattern.test(htmlContent)) {
            log(`   ✅ ${element.name} found`, 'green');
        } else {
            log(`   ❌ ${element.name} missing`, 'red');
            validationPassed = false;
        }
    });
    
    // Check for potential issues
    const potentialIssues = [
        { name: 'Modular script includes', pattern: /<script src="js\/[^"]+"><\/script>/ },
        { name: 'Missing functions', pattern: /is not defined/ }
    ];
    
    potentialIssues.forEach(issue => {
        if (issue.pattern.test(htmlContent)) {
            log(`   ⚠️  Warning: ${issue.name} detected`, 'yellow');
        }
    });
    
    return validationPassed;
}

function main() {
    console.log(colors.blue + '=' * 60 + colors.reset);
    log('🏗️  APAC Revenue Projections - Build System', 'blue');
    console.log(colors.blue + '=' * 60 + colors.reset);
    
    const startTime = Date.now();
    
    try {
        // Build the single-page application
        const htmlContent = buildSinglePageApp();
        
        // Generate build report
        const stats = generateBuildReport(htmlContent);
        
        // Validate the build
        const isValid = validateBuild();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (isValid) {
            log('\n🎉 Build completed successfully!', 'green');
            log(`   ⏱️  Duration: ${duration}ms`, 'cyan');
            log(`   🚀 Ready for deployment: ${BUILD_CONFIG.outputHtml}`, 'green');
            log('\n📋 Next steps:');
            log('   1. Test the single-page application locally', 'cyan');
            log('   2. Deploy both HTML and CSS files to your web server', 'cyan');
            log('   3. Verify all functionality works as expected', 'cyan');
        } else {
            log('\n❌ Build completed with validation errors', 'red');
            log('   Please review the warnings above and fix any issues', 'yellow');
            process.exit(1);
        }
        
    } catch (error) {
        log(`\n💥 Build failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the build if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { buildSinglePageApp, generateBuildReport, validateBuild };