/**
 * Core Module - Global Variables and Utility Functions
 * APAC Revenue Projections System
 */

// Global variables
window.segments = [];
window.projectionData = [];
window.segmentProjections = {};
window.chart = null;
window.currentSegmentType = 'sku';
window.currentView = 'consolidated';
window.savedModels = [];
window.selectedModelId = null;
window.editingSegmentId = null;
window.selectedSegments = new Set();
window.librarySelectedSegments = new Set();
window.segmentLibrary = [];
window.activeToasts = []; // Track active undo toasts

// Enhanced predefined segments data with categories
const predefinedSegments = {
    sku: [
        { name: 'OTP (SMS) - Banking', price: 0.15, cost: 0.10, volume: 4000000000/12, volumeGrowth: 5, market: 'Banking, Payments', category: 'authentication' },
        { name: 'OTP (SMS) - E-commerce', price: 0.12, cost: 0.08, volume: 2500000000/12, volumeGrowth: 8, market: 'E-commerce, Retail', category: 'authentication' },
        { name: 'OTP (SMS) - Government', price: 0.10, cost: 0.07, volume: 1500000000/12, volumeGrowth: 3, market: 'Govt Services, DBT', category: 'authentication' },
        { name: 'Biometric - Pension Auth', price: 3.50, cost: 2.00, volume: 50000000, volumeGrowth: 10, market: 'Pension, EPFO', category: 'biometric' },
        { name: 'Biometric - Banking', price: 4.00, cost: 2.50, volume: 30000000, volumeGrowth: 15, market: 'Banking KYC', category: 'biometric' },
        { name: 'eKYC - Banking', price: 20.00, cost: 12.00, volume: 15000000, volumeGrowth: 20, market: 'Account Opening', category: 'kyc' },
        { name: 'eKYC - Telecom', price: 18.00, cost: 10.00, volume: 10000000, volumeGrowth: 12, market: 'SIM Verification', category: 'kyc' },
        { name: 'eKYC - Insurance', price: 25.00, cost: 15.00, volume: 5000000, volumeGrowth: 25, market: 'Policy Issuance', category: 'kyc' },
        { name: 'Tokenization - Cards', price: 1.00, cost: 0.50, volume: 1200000000/12, volumeGrowth: 30, market: 'Card Payments', category: 'tokenization' },
        { name: 'Tokenization - UPI', price: 0.50, cost: 0.25, volume: 800000000/12, volumeGrowth: 35, market: 'UPI Transactions', category: 'tokenization' }
    ]
};

// Core validation functions
window.validateSegmentData = function validateSegmentData(name, price, cost, volume, growth) {
    const errors = [];
    
    if (!name || name.length < 2) {
        errors.push({ field: 'segmentName', message: 'Name must be at least 2 characters long' });
    }
    
    if (!price || price <= 0) {
        errors.push({ field: 'pricePerTransaction', message: 'Price must be greater than 0' });
    }
    
    if (isNaN(cost) || cost < 0) {
        errors.push({ field: 'costPerTransaction', message: 'Cost cannot be negative' });
    }
    
    if (cost >= price) {
        errors.push({ field: 'costPerTransaction', message: 'Cost should be less than price for profitability' });
    }
    
    if (!volume || volume <= 0) {
        errors.push({ field: 'monthlyVolume', message: 'Volume must be greater than 0' });
    }
    
    if (volume > 10000000000) {
        errors.push({ field: 'monthlyVolume', message: 'Volume seems unrealistically high (>10B/month)' });
    }
    
    if (isNaN(growth) || growth < -100 || growth > 1000) {
        errors.push({ field: 'volumeGrowth', message: 'Growth rate must be between -100% and 1000%' });
    }
    
    // Check for duplicate names (excluding current editing segment)
    const duplicateName = window.segments.find(seg => 
        seg.name.toLowerCase() === name.toLowerCase() && 
        seg.id !== window.editingSegmentId
    );
    if (duplicateName) {
        errors.push({ field: 'segmentName', message: 'A segment with this name already exists' });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateSkuEditData(name, price, cost, volume, growth) {
    const errors = [];
    
    if (!name || name.length < 2) {
        errors.push({ field: 'skuEditName', message: 'Name must be at least 2 characters long' });
    }
    
    if (!price || price <= 0) {
        errors.push({ field: 'skuEditPrice', message: 'Price must be greater than 0' });
    }
    
    if (isNaN(cost) || cost < 0) {
        errors.push({ field: 'skuEditCost', message: 'Cost cannot be negative' });
    }
    
    if (cost >= price) {
        errors.push({ field: 'skuEditCost', message: 'Cost should be less than price for profitability' });
    }
    
    if (!volume || volume <= 0) {
        errors.push({ field: 'skuEditVolume', message: 'Volume must be greater than 0' });
    }
    
    if (volume > 10000000000) {
        errors.push({ field: 'skuEditVolume', message: 'Volume seems unrealistically high (>10B/month)' });
    }
    
    if (isNaN(growth) || growth < -100 || growth > 1000) {
        errors.push({ field: 'skuEditGrowth', message: 'Growth rate must be between -100% and 1000%' });
    }
    
    // Check for duplicate names (excluding current editing SKU)
    const duplicateName = window.segments.find(seg => 
        seg.name.toLowerCase() === name.toLowerCase() && 
        String(seg.id) !== String(window.currentEditingSkuId)
    );
    if (duplicateName) {
        errors.push({ field: 'skuEditName', message: 'SKU name already exists' });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Utility functions for validation errors and messages
window.showValidationErrors = function showValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.validation-error').forEach(el => {
        el.classList.remove('validation-error');
    });
    document.querySelectorAll('.validation-message').forEach(el => {
        el.remove();
    });
    
    // Show new errors
    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('validation-error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-message';
            errorDiv.textContent = error.message;
            field.parentNode.appendChild(errorDiv);
        }
    });
    
    // Show alert with first error
    if (errors.length > 0) {
        alert(`Validation Error: ${errors[0].message}`);
    }
}

function showSkuEditValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.sku-validation-error').forEach(el => {
        el.classList.remove('sku-validation-error');
    });
    document.querySelectorAll('.sku-validation-message').forEach(el => {
        el.remove();
    });
    
    // Show new errors
    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('sku-validation-error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'sku-validation-message';
            errorDiv.textContent = error.message;
            field.parentNode.appendChild(errorDiv);
        }
    });
    
    // Show alert with first error
    if (errors.length > 0) {
        alert(`Validation Error: ${errors[0].message}`);
    }
}

window.showSuccessMessage = function showSuccessMessage(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        font-weight: 500;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

// Toast notification system
function showUndoToast(message, undoCallback) {
    // Generate unique ID for this toast
    const toastId = `undoToast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate position based on existing toasts
    const existingToastsCount = window.activeToasts.length;
    const topPosition = 20 + (existingToastsCount * 80); // 80px spacing between toasts
    
    // Create undo toast
    const toastDiv = document.createElement('div');
    toastDiv.id = toastId;
    toastDiv.style.cssText = `
        position: fixed;
        top: ${topPosition}px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        transition: all 0.3s ease;
    `;
    
    // Add message and undo button
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    undoButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
    `;
    
    undoButton.onclick = () => {
        if (undoCallback) undoCallback();
        removeToast(toastId);
    };
    
    toastDiv.appendChild(messageSpan);
    toastDiv.appendChild(undoButton);
    document.body.appendChild(toastDiv);
    
    // Add to active toasts tracking
    window.activeToasts.push({
        id: toastId,
        element: toastDiv,
        position: existingToastsCount
    });
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        removeToast(toastId);
    }, 8000);
    
    // Helper function to remove specific toast
    function removeToast(id) {
        const toastIndex = window.activeToasts.findIndex(toast => toast.id === id);
        if (toastIndex !== -1) {
            const toast = window.activeToasts[toastIndex];
            if (toast.element && toast.element.parentNode) {
                toast.element.remove();
            }
            window.activeToasts.splice(toastIndex, 1);
            repositionToasts();
        }
    }
    
    // Helper function to reposition remaining toasts
    function repositionToasts() {
        window.activeToasts.forEach((toast, index) => {
            const newTopPosition = 20 + (index * 80);
            if (toast.element) {
                toast.element.style.top = `${newTopPosition}px`;
                toast.position = index;
            }
        });
    }
}

// Utility functions for number formatting
window.formatCurrency = function formatCurrency(amount, currency = '₹') {
    if (amount >= 10000000) {
        return `${currency}${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
        return `${currency}${(amount / 100000).toFixed(1)} L`;
    } else if (amount >= 1000) {
        return `${currency}${(amount / 1000).toFixed(1)} K`;
    } else {
        return `${currency}${amount.toFixed(2)}`;
    }
}

window.formatNumber = function formatNumber(num) {
    if (num >= 10000000) {
        return `${(num / 10000000).toFixed(1)} Cr`;
    } else if (num >= 100000) {
        return `${(num / 100000).toFixed(1)} L`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)} K`;
    } else {
        return num.toLocaleString();
    }
}

// Date utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Configuration and constants
const APP_CONFIG = {
    VERSION: '4.0.0',
    MAX_SEGMENTS: 100,
    DEFAULT_PROJECTION_MONTHS: 36,
    CURRENCY_SYMBOL: '₹',
    DATE_FORMAT: 'YYYY-MM-DD',
    TOAST_DURATION: 8000,
    MAX_VOLUME_THRESHOLD: 10000000000,
    GROWTH_RATE_LIMITS: {
        MIN: -100,
        MAX: 1000
    }
};

// Export predefined segments for other modules
window.predefinedSegments = predefinedSegments;
window.APP_CONFIG = APP_CONFIG;

// Utility functions for local storage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

function clearLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Failed to clear localStorage:', error);
        return false;
    }
}