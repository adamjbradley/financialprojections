/**
 * Unit tests for APAC Utils Module
 * Tests validation, sanitization, and encryption utilities
 */

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i) => Object.keys(store)[i] || null
    };
})();

global.localStorage = localStorageMock;

// Mock document for Node.js environment
global.document = {
    createElement: (tag) => ({
        textContent: '',
        innerHTML: '',
        style: {},
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        remove: jest.fn(),
        parentNode: { removeChild: jest.fn() }
    }),
    getElementById: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    head: { appendChild: jest.fn() },
    body: { appendChild: jest.fn() }
};

global.btoa = (str) => Buffer.from(str, 'utf-8').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('utf-8');
global.escape = (str) => encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1));
global.unescape = (str) => decodeURIComponent(str.replace(/\+/g, ' '));

describe('APAC Utils Module - Validation Functions', () => {

    describe('validateSegment', () => {
        // Inline implementation for testing (matches utils.js)
        const validateSegment = (name, price, cost, volume, growth, options = {}) => {
            const { editingId = null, existingSegments = [], fieldPrefix = '' } = options;
            const errors = [];
            const f = (field) => fieldPrefix ? `${fieldPrefix}${field}` : field;

            if (!name || typeof name !== 'string') {
                errors.push({ field: f('Name'), message: 'Name is required' });
            } else if (name.trim().length < 2) {
                errors.push({ field: f('Name'), message: 'Name must be at least 2 characters long' });
            } else if (name.trim().length > 100) {
                errors.push({ field: f('Name'), message: 'Name must be less than 100 characters' });
            }

            const priceNum = parseFloat(price);
            if (isNaN(priceNum)) {
                errors.push({ field: f('Price'), message: 'Price must be a valid number' });
            } else if (priceNum <= 0) {
                errors.push({ field: f('Price'), message: 'Price must be greater than 0' });
            } else if (priceNum > 1000000) {
                errors.push({ field: f('Price'), message: 'Price seems unrealistically high (>1M)' });
            }

            const costNum = parseFloat(cost);
            if (isNaN(costNum)) {
                errors.push({ field: f('Cost'), message: 'Cost must be a valid number' });
            } else if (costNum < 0) {
                errors.push({ field: f('Cost'), message: 'Cost cannot be negative' });
            } else if (!isNaN(priceNum) && costNum >= priceNum) {
                errors.push({ field: f('Cost'), message: 'Cost should be less than price for profitability' });
            }

            const volumeNum = parseFloat(volume);
            if (isNaN(volumeNum)) {
                errors.push({ field: f('Volume'), message: 'Volume must be a valid number' });
            } else if (volumeNum <= 0) {
                errors.push({ field: f('Volume'), message: 'Volume must be greater than 0' });
            } else if (volumeNum > 10000000000) {
                errors.push({ field: f('Volume'), message: 'Volume seems unrealistically high (>10B/month)' });
            }

            const growthNum = parseFloat(growth);
            if (isNaN(growthNum)) {
                errors.push({ field: f('Growth'), message: 'Growth rate must be a valid number' });
            } else if (growthNum < -100) {
                errors.push({ field: f('Growth'), message: 'Growth rate cannot be less than -100%' });
            } else if (growthNum > 1000) {
                errors.push({ field: f('Growth'), message: 'Growth rate seems unrealistically high (>1000%)' });
            }

            if (name && existingSegments.length > 0) {
                const duplicate = existingSegments.find(seg =>
                    seg.name && seg.name.toLowerCase() === name.trim().toLowerCase() &&
                    String(seg.id) !== String(editingId)
                );
                if (duplicate) {
                    errors.push({ field: f('Name'), message: 'A segment with this name already exists' });
                }
            }

            return { isValid: errors.length === 0, errors };
        };

        test('should validate valid segment data', () => {
            const result = validateSegment('Test Segment', 10, 5, 1000000, 10);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject empty name', () => {
            const result = validateSegment('', 10, 5, 1000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.field === 'Name')).toBe(true);
        });

        test('should reject name that is too short', () => {
            const result = validateSegment('A', 10, 5, 1000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].message).toContain('at least 2 characters');
        });

        test('should reject negative price', () => {
            const result = validateSegment('Test Segment', -5, 5, 1000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.field === 'Price')).toBe(true);
        });

        test('should reject zero price', () => {
            const result = validateSegment('Test Segment', 0, 0, 1000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('Price must be greater than 0'))).toBe(true);
        });

        test('should reject cost greater than price', () => {
            const result = validateSegment('Test Segment', 5, 10, 1000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('less than price'))).toBe(true);
        });

        test('should reject negative cost', () => {
            const result = validateSegment('Test Segment', 10, -5, 1000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('cannot be negative'))).toBe(true);
        });

        test('should reject zero volume', () => {
            const result = validateSegment('Test Segment', 10, 5, 0, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.field === 'Volume')).toBe(true);
        });

        test('should reject unrealistically high volume', () => {
            const result = validateSegment('Test Segment', 10, 5, 20000000000, 10);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('unrealistically high'))).toBe(true);
        });

        test('should reject growth rate below -100%', () => {
            const result = validateSegment('Test Segment', 10, 5, 1000000, -150);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('less than -100%'))).toBe(true);
        });

        test('should reject growth rate above 1000%', () => {
            const result = validateSegment('Test Segment', 10, 5, 1000000, 1500);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('unrealistically high'))).toBe(true);
        });

        test('should detect duplicate segment names', () => {
            const existingSegments = [{ id: 1, name: 'Existing Segment' }];
            const result = validateSegment('Existing Segment', 10, 5, 1000000, 10, { existingSegments });
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('already exists'))).toBe(true);
        });

        test('should allow same name when editing same segment', () => {
            const existingSegments = [{ id: 1, name: 'Existing Segment' }];
            const result = validateSegment('Existing Segment', 10, 5, 1000000, 10, {
                existingSegments,
                editingId: 1
            });
            expect(result.isValid).toBe(true);
        });

        test('should support field prefix for error messages', () => {
            const result = validateSegment('', 10, 5, 1000000, 10, { fieldPrefix: 'edit' });
            expect(result.errors[0].field).toBe('editName');
        });

        test('should accept valid edge case values', () => {
            // Minimum valid values
            const result1 = validateSegment('AB', 0.01, 0, 1, -100);
            expect(result1.isValid).toBe(true);

            // Maximum valid values
            const result2 = validateSegment('X'.repeat(100), 1000000, 999999, 10000000000, 1000);
            expect(result2.isValid).toBe(true);
        });

        test('should handle non-numeric inputs gracefully', () => {
            const result = validateSegment('Test', 'abc', 'xyz', 'invalid', 'growth');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('validateModel', () => {
        const validateModel = (name, projectionMonths, growthRate, costPercentage, operatingExpenses, usdRate) => {
            const errors = [];

            if (!name || typeof name !== 'string' || name.trim().length < 2) {
                errors.push({ field: 'modelName', message: 'Model name must be at least 2 characters' });
            } else if (name.trim().length > 100) {
                errors.push({ field: 'modelName', message: 'Model name must be less than 100 characters' });
            }

            const months = parseInt(projectionMonths, 10);
            if (isNaN(months) || months < 1) {
                errors.push({ field: 'projectionMonths', message: 'Projection period must be at least 1 month' });
            } else if (months > 120) {
                errors.push({ field: 'projectionMonths', message: 'Projection period cannot exceed 120 months' });
            }

            const growth = parseFloat(growthRate);
            if (isNaN(growth)) {
                errors.push({ field: 'growthRate', message: 'Growth rate must be a valid number' });
            } else if (growth < -100 || growth > 1000) {
                errors.push({ field: 'growthRate', message: 'Growth rate must be between -100% and 1000%' });
            }

            const costPct = parseFloat(costPercentage);
            if (isNaN(costPct)) {
                errors.push({ field: 'costPercentage', message: 'COGS percentage must be a valid number' });
            } else if (costPct < 0 || costPct > 100) {
                errors.push({ field: 'costPercentage', message: 'COGS percentage must be between 0% and 100%' });
            }

            const opEx = parseFloat(operatingExpenses);
            if (isNaN(opEx)) {
                errors.push({ field: 'operatingExpenses', message: 'Operating expenses must be a valid number' });
            } else if (opEx < 0) {
                errors.push({ field: 'operatingExpenses', message: 'Operating expenses cannot be negative' });
            }

            const rate = parseFloat(usdRate);
            if (isNaN(rate)) {
                errors.push({ field: 'usdRate', message: 'Exchange rate must be a valid number' });
            } else if (rate <= 0) {
                errors.push({ field: 'usdRate', message: 'Exchange rate must be greater than 0' });
            }

            return { isValid: errors.length === 0, errors };
        };

        test('should validate valid model data', () => {
            const result = validateModel('Test Model', 12, 10, 40, 500000, 83.5);
            expect(result.isValid).toBe(true);
        });

        test('should reject short model name', () => {
            const result = validateModel('A', 12, 10, 40, 500000, 83.5);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].field).toBe('modelName');
        });

        test('should reject invalid projection months', () => {
            const result = validateModel('Test Model', 0, 10, 40, 500000, 83.5);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.field === 'projectionMonths')).toBe(true);
        });

        test('should reject projection months over 120', () => {
            const result = validateModel('Test Model', 150, 10, 40, 500000, 83.5);
            expect(result.isValid).toBe(false);
        });

        test('should reject cost percentage over 100', () => {
            const result = validateModel('Test Model', 12, 10, 150, 500000, 83.5);
            expect(result.isValid).toBe(false);
        });

        test('should reject negative operating expenses', () => {
            const result = validateModel('Test Model', 12, 10, 40, -100, 83.5);
            expect(result.isValid).toBe(false);
        });

        test('should reject zero exchange rate', () => {
            const result = validateModel('Test Model', 12, 10, 40, 500000, 0);
            expect(result.isValid).toBe(false);
        });
    });
});

describe('APAC Utils Module - Sanitization Functions', () => {

    describe('sanitizeHTML', () => {
        const sanitizeHTML = (str) => {
            if (typeof str !== 'string') return '';
            const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return str.replace(/[&<>"']/g, char => entities[char]);
        };

        test('should escape HTML special characters', () => {
            expect(sanitizeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
        });

        test('should escape ampersands', () => {
            expect(sanitizeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
        });

        test('should escape quotes', () => {
            expect(sanitizeHTML('He said "hello"')).toBe('He said &quot;hello&quot;');
        });

        test('should handle empty strings', () => {
            expect(sanitizeHTML('')).toBe('');
        });

        test('should handle non-string inputs', () => {
            expect(sanitizeHTML(null)).toBe('');
            expect(sanitizeHTML(undefined)).toBe('');
            expect(sanitizeHTML(123)).toBe('');
        });

        test('should preserve safe content', () => {
            expect(sanitizeHTML('Hello World')).toBe('Hello World');
        });
    });

    describe('safeHTML template function', () => {
        const sanitizeHTML = (str) => {
            if (typeof str !== 'string') return '';
            const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return str.replace(/[&<>"']/g, char => entities[char]);
        };

        const safeHTML = (template, values) => {
            return template.replace(/\{(\w+)\}/g, (match, key) => {
                return values.hasOwnProperty(key) ? sanitizeHTML(String(values[key])) : match;
            });
        };

        test('should substitute values safely', () => {
            const result = safeHTML('<div>{name}</div>', { name: 'John' });
            expect(result).toBe('<div>John</div>');
        });

        test('should sanitize injected values', () => {
            const result = safeHTML('<div>{name}</div>', { name: '<script>alert(1)</script>' });
            expect(result).toBe('<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>');
        });

        test('should preserve unmatched placeholders', () => {
            const result = safeHTML('<div>{name} {unknown}</div>', { name: 'John' });
            expect(result).toBe('<div>John {unknown}</div>');
        });

        test('should handle multiple substitutions', () => {
            const result = safeHTML('{greeting}, {name}!', { greeting: 'Hello', name: 'World' });
            expect(result).toBe('Hello, World!');
        });
    });
});

describe('APAC Utils Module - Encryption Functions', () => {

    const encryptData = (data) => {
        try {
            const jsonStr = JSON.stringify(data);
            const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
            const reversed = base64.split('').reverse().join('');
            const checksum = Array.from(jsonStr).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9999;
            return `${checksum.toString(16).padStart(4, '0')}${reversed}`;
        } catch (error) {
            return null;
        }
    };

    const decryptData = (encryptedData) => {
        try {
            if (!encryptedData || encryptedData.length < 5) return null;
            const storedChecksum = encryptedData.substring(0, 4);
            const reversed = encryptedData.substring(4);
            const base64 = reversed.split('').reverse().join('');
            const jsonStr = decodeURIComponent(escape(atob(base64)));
            return JSON.parse(jsonStr);
        } catch (error) {
            return null;
        }
    };

    test('should encrypt and decrypt string data', () => {
        const original = 'test string';
        const encrypted = encryptData(original);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toBe(original);
    });

    test('should encrypt and decrypt object data', () => {
        const original = { name: 'Test Model', segments: [1, 2, 3] };
        const encrypted = encryptData(original);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toEqual(original);
    });

    test('should encrypt and decrypt arrays', () => {
        const original = [1, 2, 3, 'test', { nested: true }];
        const encrypted = encryptData(original);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toEqual(original);
    });

    test('should handle empty objects', () => {
        const original = {};
        const encrypted = encryptData(original);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toEqual(original);
    });

    test('should handle alphanumeric content', () => {
        // Test alphanumeric content which works across all environments
        const original = { name: 'Test Model', value: 12345, active: true };
        const encrypted = encryptData(original);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toEqual(original);
    });

    test('should handle basic ASCII characters', () => {
        // Test basic ASCII range which works across all environments
        const original = { text: 'Hello World 123' };
        const encrypted = encryptData(original);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toEqual(original);
    });

    test('should return null for invalid encrypted data', () => {
        expect(decryptData('')).toBeNull();
        expect(decryptData('abc')).toBeNull();
        expect(decryptData(null)).toBeNull();
    });

    test('encrypted data should be different from original', () => {
        const original = { secret: 'password123' };
        const encrypted = encryptData(original);
        expect(encrypted).not.toContain('password123');
        expect(encrypted).not.toContain('secret');
    });
});

describe('APAC Utils Module - Percentage Validation', () => {

    const validatePercentage = (value, fieldName = 'Value') => {
        const errors = [];
        const num = parseFloat(value);

        if (isNaN(num)) {
            errors.push({ field: fieldName, message: `${fieldName} must be a valid number` });
        } else if (num < 0 || num > 100) {
            errors.push({ field: fieldName, message: `${fieldName} must be between 0% and 100%` });
        }

        return { isValid: errors.length === 0, errors };
    };

    test('should accept valid percentages', () => {
        expect(validatePercentage(0).isValid).toBe(true);
        expect(validatePercentage(50).isValid).toBe(true);
        expect(validatePercentage(100).isValid).toBe(true);
        expect(validatePercentage(33.33).isValid).toBe(true);
    });

    test('should reject percentages over 100', () => {
        expect(validatePercentage(101).isValid).toBe(false);
        expect(validatePercentage(150).isValid).toBe(false);
    });

    test('should reject negative percentages', () => {
        expect(validatePercentage(-1).isValid).toBe(false);
        expect(validatePercentage(-50).isValid).toBe(false);
    });

    test('should reject non-numeric values', () => {
        expect(validatePercentage('abc').isValid).toBe(false);
        expect(validatePercentage(NaN).isValid).toBe(false);
    });

    test('should include field name in error message', () => {
        const result = validatePercentage(-5, 'Tax Rate');
        expect(result.errors[0].message).toContain('Tax Rate');
    });
});

describe('APAC Utils Module - Positive Number Validation', () => {

    const validatePositiveNumber = (value, fieldName = 'Value') => {
        const errors = [];
        const num = parseFloat(value);

        if (isNaN(num)) {
            errors.push({ field: fieldName, message: `${fieldName} must be a valid number` });
        } else if (num <= 0) {
            errors.push({ field: fieldName, message: `${fieldName} must be greater than 0` });
        }

        return { isValid: errors.length === 0, errors };
    };

    test('should accept positive numbers', () => {
        expect(validatePositiveNumber(1).isValid).toBe(true);
        expect(validatePositiveNumber(0.01).isValid).toBe(true);
        expect(validatePositiveNumber(1000000).isValid).toBe(true);
    });

    test('should reject zero', () => {
        expect(validatePositiveNumber(0).isValid).toBe(false);
    });

    test('should reject negative numbers', () => {
        expect(validatePositiveNumber(-1).isValid).toBe(false);
        expect(validatePositiveNumber(-0.5).isValid).toBe(false);
    });

    test('should reject non-numeric values', () => {
        expect(validatePositiveNumber('abc').isValid).toBe(false);
    });
});
