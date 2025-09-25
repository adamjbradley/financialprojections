// Jest setup file
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.window = {
  segments: [],
  projectionData: [],
  segmentProjections: {},
  chart: null,
  currentSegmentType: 'sku',
  currentView: 'consolidated',
  selectedSegments: new Set(),
  currentPage: 1,
  itemsPerPage: 10
};

// Mock Chart.js
global.Chart = jest.fn(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
  render: jest.fn()
}));

// Mock XLSX
global.XLSX = {
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(() => ({ SheetNames: [], Sheets: {} })),
    book_append_sheet: jest.fn(),
    sheet_to_json: jest.fn()
  },
  write: jest.fn(),
  read: jest.fn()
};

// Mock DOM elements
document.getElementById = jest.fn((id) => {
  return {
    value: '',
    innerHTML: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    click: jest.fn(),
    focus: jest.fn()
  };
});

document.querySelector = jest.fn(() => ({
  value: '',
  innerHTML: '',
  classList: {
    add: jest.fn(),
    remove: jest.fn()
  }
}));

document.querySelectorAll = jest.fn(() => []);

document.createElement = jest.fn((tag) => ({
  tagName: tag.toUpperCase(),
  classList: {
    add: jest.fn(),
    remove: jest.fn()
  },
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  addEventListener: jest.fn(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  click: jest.fn(),
  innerHTML: '',
  value: '',
  href: '',
  download: ''
}));

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};