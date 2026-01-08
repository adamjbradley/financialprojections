/**
 * APAC Revenue Projections System - Consolidated Utilities Module
 *
 * This module provides:
 * - Unified validation functions
 * - Encrypted localStorage wrapper
 * - Toast-based notification system
 * - Input sanitization utilities
 * - CDN fallback handling
 *
 * @module utils
 * @version 1.0.0
 */

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

/**
 * Simple encryption key derived from a passphrase
 * In production, this should use Web Crypto API with proper key derivation
 * @private
 */
const STORAGE_KEY = 'apac-revenue-v2';

/**
 * Encrypts data for localStorage storage using base64 encoding with obfuscation
 * @param {*} data - Data to encrypt (will be JSON stringified)
 * @returns {string} - Encrypted string
 */
function encryptData(data) {
    try {
        const jsonStr = JSON.stringify(data);
        // Simple obfuscation: base64 encode + reverse + add checksum
        const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
        const reversed = base64.split('').reverse().join('');
        const checksum = Array.from(jsonStr).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9999;
        return `${checksum.toString(16).padStart(4, '0')}${reversed}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

/**
 * Decrypts data from localStorage
 * @param {string} encryptedData - Encrypted string from localStorage
 * @returns {*} - Decrypted and parsed data, or null on failure
 */
function decryptData(encryptedData) {
    try {
        if (!encryptedData || encryptedData.length < 5) return null;

        // Extract checksum and reverse the obfuscation
        const storedChecksum = encryptedData.substring(0, 4);
        const reversed = encryptedData.substring(4);
        const base64 = reversed.split('').reverse().join('');
        const jsonStr = decodeURIComponent(escape(atob(base64)));

        // Verify checksum
        const calculatedChecksum = Array.from(jsonStr).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9999;
        if (storedChecksum !== calculatedChecksum.toString(16).padStart(4, '0')) {
            console.warn('Checksum mismatch - data may be corrupted');
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

/**
 * Secure localStorage wrapper with encryption for sensitive data
 * @namespace SecureStorage
 */
const SecureStorage = {
    /**
     * Save data to localStorage with optional encryption
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @param {boolean} [encrypt=false] - Whether to encrypt the data
     * @returns {boolean} - Success status
     */
    set(key, data, encrypt = false) {
        try {
            const value = encrypt ? encryptData(data) : JSON.stringify(data);
            if (value === null) return false;
            localStorage.setItem(key, encrypt ? `ENC:${value}` : value);
            return true;
        } catch (error) {
            console.error(`SecureStorage.set error for key "${key}":`, error);
            return false;
        }
    },

    /**
     * Retrieve data from localStorage with automatic decryption
     * @param {string} key - Storage key
     * @param {*} [defaultValue=null] - Default value if key doesn't exist
     * @returns {*} - Retrieved data or default value
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;

            // Check if data is encrypted
            if (value.startsWith('ENC:')) {
                const decrypted = decryptData(value.substring(4));
                return decrypted !== null ? decrypted : defaultValue;
            }

            return JSON.parse(value);
        } catch (error) {
            console.error(`SecureStorage.get error for key "${key}":`, error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key to remove
     * @returns {boolean} - Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`SecureStorage.remove error for key "${key}":`, error);
            return false;
        }
    },

    /**
     * Check if a key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Whether the key exists
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },

    /**
     * Clear all app-related localStorage items
     * @param {string} [prefix='apac-'] - Prefix to match for clearing
     */
    clearAll(prefix = 'apac-') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Array<{field: string, message: string}>} errors - Array of validation errors
 */

/**
 * Unified segment data validator
 * @param {string} name - Segment name
 * @param {number} price - Price per transaction
 * @param {number} cost - Cost per transaction
 * @param {number} volume - Monthly volume
 * @param {number} growth - Growth rate percentage
 * @param {Object} [options={}] - Additional validation options
 * @param {string} [options.editingId=null] - ID of segment being edited (for duplicate check)
 * @param {Array} [options.existingSegments=[]] - Array of existing segments
 * @param {string} [options.fieldPrefix=''] - Prefix for field names in errors
 * @returns {ValidationResult} - Validation result
 */
function validateSegment(name, price, cost, volume, growth, options = {}) {
    const { editingId = null, existingSegments = [], fieldPrefix = '' } = options;
    const errors = [];

    const f = (field) => fieldPrefix ? `${fieldPrefix}${field}` : field;

    // Name validation
    if (!name || typeof name !== 'string') {
        errors.push({ field: f('Name'), message: 'Name is required' });
    } else if (name.trim().length < 2) {
        errors.push({ field: f('Name'), message: 'Name must be at least 2 characters long' });
    } else if (name.trim().length > 100) {
        errors.push({ field: f('Name'), message: 'Name must be less than 100 characters' });
    }

    // Price validation
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
        errors.push({ field: f('Price'), message: 'Price must be a valid number' });
    } else if (priceNum <= 0) {
        errors.push({ field: f('Price'), message: 'Price must be greater than 0' });
    } else if (priceNum > 1000000) {
        errors.push({ field: f('Price'), message: 'Price seems unrealistically high (>1M)' });
    }

    // Cost validation
    const costNum = parseFloat(cost);
    if (isNaN(costNum)) {
        errors.push({ field: f('Cost'), message: 'Cost must be a valid number' });
    } else if (costNum < 0) {
        errors.push({ field: f('Cost'), message: 'Cost cannot be negative' });
    } else if (!isNaN(priceNum) && costNum >= priceNum) {
        errors.push({ field: f('Cost'), message: 'Cost should be less than price for profitability' });
    }

    // Volume validation
    const volumeNum = parseFloat(volume);
    if (isNaN(volumeNum)) {
        errors.push({ field: f('Volume'), message: 'Volume must be a valid number' });
    } else if (volumeNum <= 0) {
        errors.push({ field: f('Volume'), message: 'Volume must be greater than 0' });
    } else if (volumeNum > 10000000000) {
        errors.push({ field: f('Volume'), message: 'Volume seems unrealistically high (>10B/month)' });
    }

    // Growth rate validation
    const growthNum = parseFloat(growth);
    if (isNaN(growthNum)) {
        errors.push({ field: f('Growth'), message: 'Growth rate must be a valid number' });
    } else if (growthNum < -100) {
        errors.push({ field: f('Growth'), message: 'Growth rate cannot be less than -100%' });
    } else if (growthNum > 1000) {
        errors.push({ field: f('Growth'), message: 'Growth rate seems unrealistically high (>1000%)' });
    }

    // Duplicate name check
    if (name && existingSegments.length > 0) {
        const duplicate = existingSegments.find(seg =>
            seg.name &&
            seg.name.toLowerCase() === name.trim().toLowerCase() &&
            String(seg.id) !== String(editingId)
        );
        if (duplicate) {
            errors.push({ field: f('Name'), message: 'A segment with this name already exists' });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate model edit data
 * @param {string} name - Model name
 * @param {number} projectionMonths - Number of projection months
 * @param {number} growthRate - Growth rate percentage
 * @param {number} costPercentage - COGS percentage
 * @param {number} operatingExpenses - Operating expenses amount
 * @param {number} usdRate - USD exchange rate
 * @returns {ValidationResult} - Validation result
 */
function validateModel(name, projectionMonths, growthRate, costPercentage, operatingExpenses, usdRate) {
    const errors = [];

    // Name validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push({ field: 'modelName', message: 'Model name must be at least 2 characters' });
    } else if (name.trim().length > 100) {
        errors.push({ field: 'modelName', message: 'Model name must be less than 100 characters' });
    }

    // Projection months validation
    const months = parseInt(projectionMonths, 10);
    if (isNaN(months) || months < 1) {
        errors.push({ field: 'projectionMonths', message: 'Projection period must be at least 1 month' });
    } else if (months > 120) {
        errors.push({ field: 'projectionMonths', message: 'Projection period cannot exceed 120 months' });
    }

    // Growth rate validation
    const growth = parseFloat(growthRate);
    if (isNaN(growth)) {
        errors.push({ field: 'growthRate', message: 'Growth rate must be a valid number' });
    } else if (growth < -100 || growth > 1000) {
        errors.push({ field: 'growthRate', message: 'Growth rate must be between -100% and 1000%' });
    }

    // Cost percentage validation
    const costPct = parseFloat(costPercentage);
    if (isNaN(costPct)) {
        errors.push({ field: 'costPercentage', message: 'COGS percentage must be a valid number' });
    } else if (costPct < 0 || costPct > 100) {
        errors.push({ field: 'costPercentage', message: 'COGS percentage must be between 0% and 100%' });
    }

    // Operating expenses validation
    const opEx = parseFloat(operatingExpenses);
    if (isNaN(opEx)) {
        errors.push({ field: 'operatingExpenses', message: 'Operating expenses must be a valid number' });
    } else if (opEx < 0) {
        errors.push({ field: 'operatingExpenses', message: 'Operating expenses cannot be negative' });
    }

    // USD rate validation
    const rate = parseFloat(usdRate);
    if (isNaN(rate)) {
        errors.push({ field: 'usdRate', message: 'Exchange rate must be a valid number' });
    } else if (rate <= 0) {
        errors.push({ field: 'usdRate', message: 'Exchange rate must be greater than 0' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate percentage value
 * @param {number} value - Value to validate
 * @param {string} [fieldName='Value'] - Field name for error messages
 * @returns {ValidationResult} - Validation result
 */
function validatePercentage(value, fieldName = 'Value') {
    const errors = [];
    const num = parseFloat(value);

    if (isNaN(num)) {
        errors.push({ field: fieldName, message: `${fieldName} must be a valid number` });
    } else if (num < 0 || num > 100) {
        errors.push({ field: fieldName, message: `${fieldName} must be between 0% and 100%` });
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @param {string} [fieldName='Value'] - Field name for error messages
 * @returns {ValidationResult} - Validation result
 */
function validatePositiveNumber(value, fieldName = 'Value') {
    const errors = [];
    const num = parseFloat(value);

    if (isNaN(num)) {
        errors.push({ field: fieldName, message: `${fieldName} must be a valid number` });
    } else if (num <= 0) {
        errors.push({ field: fieldName, message: `${fieldName} must be greater than 0` });
    }

    return { isValid: errors.length === 0, errors };
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

/**
 * Toast notification types
 * @enum {string}
 */
const ToastType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Toast notification configuration
 * @private
 */
const toastConfig = {
    styles: {
        success: {
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            icon: '✓'
        },
        error: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            icon: '✕'
        },
        warning: {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            icon: '⚠'
        },
        info: {
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            icon: 'ℹ'
        }
    },
    defaultDuration: 4000,
    maxToasts: 5
};

/** @private */
let activeToasts = [];

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} [type='info'] - Toast type (success, error, warning, info)
 * @param {number} [duration=4000] - Duration in milliseconds (0 for persistent)
 * @param {Object} [options={}] - Additional options
 * @param {Function} [options.onUndo] - Undo callback function
 * @param {string} [options.undoLabel='Undo'] - Label for undo button
 * @returns {string} - Toast ID for programmatic dismissal
 */
function showToast(message, type = ToastType.INFO, duration = toastConfig.defaultDuration, options = {}) {
    const toastId = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = toastConfig.styles[type] || toastConfig.styles.info;

    // Limit number of toasts
    while (activeToasts.length >= toastConfig.maxToasts) {
        dismissToast(activeToasts[0].id);
    }

    // Calculate position
    const topPosition = 20 + (activeToasts.length * 70);

    // Create toast element
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'apac-toast';
    toast.style.cssText = `
        position: fixed;
        top: ${topPosition}px;
        right: 20px;
        background: ${config.background};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: ${1100 + activeToasts.length};
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        max-width: 450px;
        font-weight: 500;
        animation: toastSlideIn 0.3s ease-out;
        transition: top 0.3s ease, opacity 0.3s ease;
    `;

    // Add animation styles if not present
    if (!document.getElementById('apac-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'apac-toast-styles';
        style.textContent = `
            @keyframes toastSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes toastSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .apac-toast:hover { transform: scale(1.02); }
        `;
        document.head.appendChild(style);
    }

    // Icon
    const iconSpan = document.createElement('span');
    iconSpan.textContent = config.icon;
    iconSpan.style.fontSize = '1.2em';
    toast.appendChild(iconSpan);

    // Message
    const messageSpan = document.createElement('span');
    messageSpan.innerHTML = message;
    messageSpan.style.flex = '1';
    toast.appendChild(messageSpan);

    // Undo button (if callback provided)
    if (options.onUndo) {
        const undoBtn = document.createElement('button');
        undoBtn.textContent = options.undoLabel || 'Undo';
        undoBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: 600;
        `;
        undoBtn.onclick = () => {
            options.onUndo();
            dismissToast(toastId);
        };
        toast.appendChild(undoBtn);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        font-size: 1.4em;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
    `;
    closeBtn.onclick = () => dismissToast(toastId);
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    // Track toast
    const toastData = { id: toastId, element: toast };
    activeToasts.push(toastData);

    // Auto-dismiss
    if (duration > 0) {
        toastData.timeout = setTimeout(() => dismissToast(toastId), duration);
    }

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        if (toastData.timeout) {
            clearTimeout(toastData.timeout);
            toastData.timeout = null;
        }
    });

    toast.addEventListener('mouseleave', () => {
        if (duration > 0 && !toastData.timeout) {
            toastData.timeout = setTimeout(() => dismissToast(toastId), 2000);
        }
    });

    return toastId;
}

/**
 * Dismiss a toast notification
 * @param {string} toastId - ID of toast to dismiss
 */
function dismissToast(toastId) {
    const index = activeToasts.findIndex(t => t.id === toastId);
    if (index === -1) return;

    const toast = activeToasts[index];
    if (toast.timeout) clearTimeout(toast.timeout);

    if (toast.element) {
        toast.element.style.animation = 'toastSlideOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
        }, 300);
    }

    activeToasts.splice(index, 1);

    // Reposition remaining toasts
    activeToasts.forEach((t, i) => {
        if (t.element) {
            t.element.style.top = `${20 + (i * 70)}px`;
        }
    });
}

/**
 * Convenience methods for different toast types
 */
const Toast = {
    success: (message, duration) => showToast(message, ToastType.SUCCESS, duration),
    error: (message, duration) => showToast(message, ToastType.ERROR, duration || 6000),
    warning: (message, duration) => showToast(message, ToastType.WARNING, duration || 5000),
    info: (message, duration) => showToast(message, ToastType.INFO, duration),
    undo: (message, onUndo, duration = 8000) => showToast(message, ToastType.WARNING, duration, { onUndo }),
    dismiss: dismissToast,
    dismissAll: () => [...activeToasts].forEach(t => dismissToast(t.id))
};

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string safe for HTML insertion
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitize string for use in HTML attributes
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string safe for attribute values
 */
function sanitizeAttribute(str) {
    if (typeof str !== 'string') return '';

    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Create safe HTML from template with sanitized values
 * @param {string} template - Template string with {placeholders}
 * @param {Object} values - Object with placeholder values
 * @returns {string} - HTML string with sanitized values
 * @example
 * safeHTML('<div>{name}</div>', { name: '<script>alert(1)</script>' })
 * // Returns: '<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>'
 */
function safeHTML(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return values.hasOwnProperty(key) ? sanitizeHTML(String(values[key])) : match;
    });
}

// ============================================================================
// CDN FALLBACK HANDLING
// ============================================================================

/**
 * CDN fallback configuration
 * @private
 */
const cdnFallbacks = {
    xlsx: {
        test: () => typeof XLSX !== 'undefined',
        cdnUrls: [
            'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
            'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
            'https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js'
        ]
    },
    chartjs: {
        test: () => typeof Chart !== 'undefined',
        cdnUrls: [
            'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
            'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
            'https://unpkg.com/chart.js@3.9.1/dist/chart.min.js'
        ]
    }
};

/**
 * Load a script from URL with promise
 * @private
 * @param {string} url - Script URL
 * @param {number} [timeout=10000] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
function loadScript(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        const timer = setTimeout(() => {
            script.remove();
            reject(new Error(`Script load timeout: ${url}`));
        }, timeout);

        script.onload = () => {
            clearTimeout(timer);
            resolve();
        };

        script.onerror = () => {
            clearTimeout(timer);
            script.remove();
            reject(new Error(`Failed to load: ${url}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * Ensure a CDN library is loaded, trying fallback URLs if needed
 * @param {string} libraryName - Name of the library (xlsx, chartjs)
 * @returns {Promise<boolean>} - Whether library was successfully loaded
 */
async function ensureCDNLibrary(libraryName) {
    const config = cdnFallbacks[libraryName];
    if (!config) {
        console.error(`Unknown CDN library: ${libraryName}`);
        return false;
    }

    // Already loaded
    if (config.test()) {
        return true;
    }

    // Try each fallback URL
    for (const url of config.cdnUrls) {
        try {
            console.log(`Loading ${libraryName} from ${url}...`);
            await loadScript(url);

            if (config.test()) {
                console.log(`Successfully loaded ${libraryName}`);
                return true;
            }
        } catch (error) {
            console.warn(`Failed to load ${libraryName} from ${url}:`, error.message);
        }
    }

    console.error(`All CDN sources failed for ${libraryName}`);
    Toast.error(`Failed to load ${libraryName} library. Some features may not work.`);
    return false;
}

/**
 * Initialize all required CDN libraries
 * @returns {Promise<{xlsx: boolean, chartjs: boolean}>}
 */
async function initializeCDNLibraries() {
    const results = {
        xlsx: await ensureCDNLibrary('xlsx'),
        chartjs: await ensureCDNLibrary('chartjs')
    };

    if (!results.xlsx || !results.chartjs) {
        Toast.warning('Some libraries failed to load. Please refresh the page.');
    }

    return results;
}

// ============================================================================
// DISPLAY VALIDATION ERRORS
// ============================================================================

/**
 * Display validation errors on form fields
 * @param {Array<{field: string, message: string}>} errors - Array of errors
 * @param {Object} [fieldMap={}] - Map of field names to element IDs
 */
function displayValidationErrors(errors, fieldMap = {}) {
    // Clear previous errors
    document.querySelectorAll('.validation-error').forEach(el => {
        el.classList.remove('validation-error');
    });
    document.querySelectorAll('.validation-message').forEach(el => {
        el.remove();
    });

    if (!errors || errors.length === 0) return;

    // Display new errors
    errors.forEach(error => {
        const fieldId = fieldMap[error.field] || error.field;
        const field = document.getElementById(fieldId);

        if (field) {
            field.classList.add('validation-error');

            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-message';
            errorDiv.style.cssText = `
                color: #ef4444;
                font-size: 0.85em;
                margin-top: 4px;
            `;
            errorDiv.textContent = error.message;
            field.parentNode.appendChild(errorDiv);
        }
    });

    // Show toast with first error
    Toast.error(errors[0].message);
}

/**
 * Clear validation errors from form
 */
function clearValidationErrors() {
    document.querySelectorAll('.validation-error').forEach(el => {
        el.classList.remove('validation-error');
    });
    document.querySelectorAll('.validation-message').forEach(el => {
        el.remove();
    });
}

// ============================================================================
// EXPORTS - Attach to window for use in inline scripts
// ============================================================================

window.APACUtils = {
    // Storage
    SecureStorage,

    // Validation
    validateSegment,
    validateModel,
    validatePercentage,
    validatePositiveNumber,
    displayValidationErrors,
    clearValidationErrors,

    // Notifications
    Toast,
    ToastType,
    showToast,
    dismissToast,

    // Sanitization
    sanitizeHTML,
    sanitizeAttribute,
    safeHTML,

    // CDN
    ensureCDNLibrary,
    initializeCDNLibraries
};

// Backward compatibility - expose commonly used functions globally
window.showSuccessMessage = (msg, duration) => Toast.success(msg, duration);
window.showErrorMessage = (msg, duration) => Toast.error(msg, duration);
window.showWarningMessage = (msg, duration) => Toast.warning(msg, duration);
window.showUndoToast = (msg, callback) => Toast.undo(msg, callback);

console.log('📦 APAC Utils module loaded - v1.0.0');
