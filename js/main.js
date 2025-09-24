/**
 * Main entry point for APAC Revenue Projections System
 * Imports all modular JavaScript components in the correct order
 * Generated for Vite build system compatibility
 */

// Import modules in dependency order
import './core.js';
import './segments.js';
import './projections.js';
import './demographics.js';
import './export.js';
import './ui.js';
import './missing-functions.js';

// Function to load default segments for first-time users
function loadDefaultSegments() {
    if (!window.predefinedSegments || !window.predefinedSegments.sku) {
        console.error('Predefined segments not available');
        return;
    }
    
    // Load the first 5 default SKU segments
    const defaultSegments = window.predefinedSegments.sku.slice(0, 5).map(template => ({
        id: Date.now() + Math.random(),
        name: template.name,
        type: 'sku',
        pricePerTransaction: template.price,
        costPerTransaction: template.cost,
        monthlyVolume: template.volume,
        volumeGrowth: template.volumeGrowth,
        category: template.category || 'authentication',
        pensionPct: template.pensionPct || 0,
        notes: `Market: ${template.market || 'General'}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
    
    window.segments = defaultSegments;
    
    // Save to localStorage
    localStorage.setItem('segments', JSON.stringify(window.segments));
    
    console.log(`Loaded ${defaultSegments.length} default segments`);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 APAC Revenue Projections System - Vite Version Loaded');
    
    // Load segments from localStorage if available
    const savedSegments = localStorage.getItem('segments');
    if (savedSegments) {
        try {
            window.segments = JSON.parse(savedSegments);
            console.log(`Loaded ${window.segments.length} segments from localStorage`);
        } catch (e) {
            console.error('Failed to load segments from localStorage:', e);
            window.segments = [];
        }
    } else {
        // First time user - load default segments
        console.log('First time user detected - loading default segments');
        loadDefaultSegments();
    }
    
    // Initialize core components
    if (typeof window.initializeApplication === 'function') {
        window.initializeApplication();
    }
    
    // Load initial data
    if (typeof window.loadSavedModels === 'function') {
        window.loadSavedModels();
    }
    
    // Render segments after loading
    if (typeof window.renderSegments === 'function') {
        setTimeout(() => window.renderSegments(), 100);
    }
    
    // Set up initial UI state
    if (typeof window.refreshSegmentDisplay === 'function') {
        window.refreshSegmentDisplay();
    }
    
    // Show welcome message
    if (typeof window.showToast === 'function') {
        window.showToast('Welcome to APAC Revenue Projections (Vite)', 'success');
    }
});