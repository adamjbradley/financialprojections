# Project Structure Documentation

## 📁 HTML Files Explanation

This project contains **two HTML entry points** due to a modularization attempt. Here's what you need to know:

### 🟢 ACTIVE FILE: `index-working.html`
- **Size:** 468KB (8,787 lines)
- **Status:** ✅ **FULLY FUNCTIONAL - USE THIS FOR ALL WORK**
- **Structure:** Monolithic HTML with all JavaScript inline
- **URL:** 
  - Development: `http://localhost:3000/index-working.html`
  - Preview: `http://localhost:4174/index-working.html`
- **Contains:** All features including:
  - Revenue projections
  - Segment management
  - Model saving/loading
  - Currency conversion
  - Demographics analysis
  - Export functionality

### 🔴 ARCHIVED FILE: `index.html`
- **Size:** 47KB (766 lines)
- **Status:** ❌ **INCOMPLETE - DO NOT USE**
- **Structure:** HTML shell that loads external `app.js`
- **URL:** 
  - Development: `http://localhost:3000/`
  - Preview: `http://localhost:4174/`
- **Issues:** 
  - Missing function scope (377+ functions broken)
  - Event handlers can't access modular functions
  - Incomplete migration from monolithic structure

## 📖 History & Context

### Why Two Files Exist

1. **Original State**: The project started as a monolithic HTML file with inline JavaScript
2. **Modularization Attempt**: Team tried to modernize by splitting into:
   - `index.html` (HTML structure)
   - `app.js` (6,774 lines of extracted JavaScript)
   - `/js/` folder with 7 module files:
     - `core.js` - Global variables and utilities
     - `segments.js` - Segment management
     - `projections.js` - Financial calculations
     - `demographics.js` - APAC data handling
     - `export.js` - Excel/CSV export
     - `ui.js` - DOM manipulation
     - `missing-functions.js` - Functions that needed restoration

3. **Rollback Decision**: The modularization broke too many functions due to:
   - Inline `onclick` handlers expecting global functions
   - Complex interdependencies between functions
   - Time constraints requiring immediate functionality

4. **Current State**: 
   - Development continues on `index-working.html`
   - Modular files preserved for future migration
   - Both files built by Vite but only one is functional

## 🛠️ Development Workflow

### For Daily Development
```bash
# Start development server
npm run dev
# Opens http://localhost:3000/index-working.html

# Build for production
npm run build
# Creates dist/index-working.html

# Preview production build
npm run preview
# Serves from http://localhost:4174/index-working.html
```

### File Locations
```
project-root/
├── index-working.html      ← 📝 EDIT THIS FILE
├── index.html              ← ❌ Don't edit (broken)
├── app.js                  ← Part of failed modularization
├── styles.css              ← Shared styles
├── /js/                    ← Modular JS (not currently used)
└── /dist/                  ← Production build output
    ├── index-working.html  ← Deployed version
    └── index.html          ← Also built but not functional
```

## ⚠️ Important Notes

1. **All new features** should be added to `index-working.html`
2. **All bug fixes** should be applied to `index-working.html`
3. **Testing** should use `index-working.html` endpoints
4. **Deployment** should serve `dist/index-working.html`

## 🔮 Future Plans

The modular architecture (`index.html` + `app.js` + `/js/`) is preserved for future migration when:
- Comprehensive test coverage is established
- Time allows for careful refactoring
- All inline event handlers can be replaced with event delegation
- Proper module bundling strategy is implemented

Until then, **`index-working.html` is the single source of truth** for this application.

## 📊 Quick Comparison

| Aspect | index-working.html | index.html |
|--------|-------------------|------------|
| **Status** | ✅ Active Development | ❌ Archived |
| **Functionality** | 100% Working | ~30% Working |
| **JavaScript** | Inline (monolithic) | External (modular) |
| **File Size** | 468KB | 47KB + 377KB (app.js) |
| **Line Count** | 8,787 lines | 766 + 6,774 lines |
| **Use Case** | Production & Dev | Future migration |
| **Last Updated** | Currently maintained | Frozen state |

## 🚀 Quick Start for New Developers

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000/index-working.html`
5. **Make all edits to `index-working.html`**

---

*Last Updated: September 26, 2024*
*Document Version: 1.0*