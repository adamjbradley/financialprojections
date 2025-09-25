#!/usr/bin/env node
/**
 * Emergency Chrome cleanup script
 * Use when Puppeteer tests leave zombie Chrome processes
 */

const { exec } = require('child_process');

console.log('🚨 Emergency Chrome Cleanup');
console.log('============================');

// Kill Chrome processes
const killCommands = [
  'pkill -f "Chrome.*testing"',
  'pkill -f chromium',  
  'pkill -f "Google Chrome for Testing"',
  'pkill -f puppeteer',
  'ps aux | grep -i chrome | grep -v grep | awk \'{print $2}\' | xargs kill -9 2>/dev/null || true'
];

let completed = 0;

killCommands.forEach((cmd, index) => {
  exec(cmd, (error, stdout, stderr) => {
    completed++;
    if (stdout) console.log(`Command ${index + 1}: ${stdout.trim()}`);
    
    if (completed === killCommands.length) {
      // Check remaining processes
      exec('ps aux | grep -i chrome | grep -v grep | wc -l', (error, stdout) => {
        const remaining = parseInt(stdout.trim());
        if (remaining === 0) {
          console.log('✅ All Chrome processes cleaned up!');
        } else {
          console.log(`⚠️  ${remaining} Chrome processes may still be running`);
          console.log('💡 Try manually closing Chrome windows or restart your computer');
        }
        console.log('\n🎯 Safe to run tests again!');
      });
    }
  });
});

// Instructions
console.log('\n📋 Prevention Tips:');
console.log('- Use Ctrl+C to stop tests (don\'t force-quit terminal)');
console.log('- Let tests complete naturally when possible');
console.log('- Use HEADLESS=true for faster, safer headless testing');
console.log('- Run: node kill-chrome.js anytime you see zombie Chrome windows\n');