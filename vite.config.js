import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'demographics',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        working: resolve(__dirname, 'index-working.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize for single-page application
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    // Inline small assets
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // Ensure CSS and JS are properly handled
  css: {
    devSourcemap: true
  },
  // Skip optimization for CDN dependencies
  optimizeDeps: {
    exclude: ['chart.js', 'xlsx']
  }
});