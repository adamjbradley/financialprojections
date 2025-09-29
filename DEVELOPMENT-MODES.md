# Development Modes & Auto-Build Guide

## 🚀 Quick Start Commands

### **Option 1: Standard Development (Recommended for most cases)**
```bash
npm run dev
```
- ✅ Hot reload from source files
- ✅ Instant updates
- ✅ Best for active development
- 🌐 URL: http://localhost:3000/index-working.html

### **Option 2: Auto-Build to dist/ (NEW!)**
```bash
npm run watch
```
- ✅ Automatically rebuilds to `dist/` on file changes
- ✅ Use with `npm run preview` in another terminal
- 🌐 URL: http://localhost:4173/index-working.html

### **Option 3: Watch & Preview Together**
```bash
npm run dev:preview
```
- ✅ Builds once, then watches for changes
- ✅ Runs preview server simultaneously
- ✅ Auto-updates `dist/` folder
- 🌐 URL: http://localhost:4173/index-working.html

## 📁 Available Commands

| Command | Description | When to Use |
|---------|-------------|------------|
| `npm run dev` | Standard Vite dev server with HMR | Active development |
| `npm run build` | One-time build to dist/ | Manual deployment |
| `npm run preview` | Serve dist/ folder | Test production build |
| **`npm run watch`** | **Auto-rebuild on changes** | **Keep dist/ updated** |
| **`npm run watch:full`** | **Watch specific files & rebuild** | **Custom file watching** |
| **`npm run dev:auto`** | **Build once, then watch** | **Start auto-build session** |
| **`npm run dev:preview`** | **Watch + Preview together** | **Full auto-build workflow** |

## 🔄 Auto-Build Workflow

### Step 1: Start Auto-Build
```bash
# Terminal 1 - Auto-build on file changes
npm run watch
```

### Step 2: Serve the Built Files
```bash
# Terminal 2 - Serve from dist/
npm run preview
```

### Or: All-in-One Command
```bash
# Single terminal - Build, watch, and serve
npm run dev:preview
```

## 📝 How It Works

1. **`npm run watch`** uses Vite's built-in watch mode:
   - Monitors all source files
   - Rebuilds to `dist/` on changes
   - Optimizes for production on each build

2. **`npm run watch:full`** uses chokidar for custom watching:
   - Watches specific file patterns
   - Triggers full rebuild on any change
   - More control over what triggers rebuilds

3. **`npm run dev:preview`** combines both:
   - Initial build to ensure dist/ is current
   - Starts watch mode for continuous updates
   - Runs preview server in parallel

## 🎯 Which Mode Should I Use?

### For Active Development
```bash
npm run dev
```
Best performance, instant updates, no build overhead.

### For Testing Production Build
```bash
npm run dev:preview
```
See exactly what will be deployed, with auto-updates.

### For Deployment Preparation
```bash
npm run build
# Then deploy the dist/ folder
```
One-time optimized build for production.

## ⚙️ Configuration

The watch mode monitors these files by default:
- `index-working.html` (main application)
- `index.html` (modular version)
- `styles.css` (stylesheets)
- `app.js` (JavaScript for modular version)
- `demographics/**/*.json` (data files)

To customize what files trigger rebuilds, edit the `watch:full` script in `package.json`.

## 🔍 Troubleshooting

### Changes Not Appearing?
1. Check which mode you're running
2. Verify you're viewing the correct URL (port 3000 vs 4173)
3. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

### Build Failing?
1. Check console for errors
2. Run `npm run build` manually to see detailed error
3. Ensure no syntax errors in HTML/JS files

### Performance Issues?
- Use `npm run dev` for development (faster)
- Only use watch mode when you need dist/ updated
- Consider increasing Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run watch`

## 📊 Performance Comparison

| Mode | Build Time | Update Speed | CPU Usage | Best For |
|------|------------|--------------|-----------|----------|
| `dev` | None | Instant | Low | Development |
| `watch` | ~150ms | Fast | Medium | Auto-deploy |
| `build` | ~150ms | Manual | None | Production |

---

**Note**: The `dist/` folder is ignored by git and should not be committed. It's automatically generated from source files.