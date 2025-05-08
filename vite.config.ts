import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Simple function to copy files during build
function copyFilesPlugin() {
  return {
    name: 'copy-files',
    generateBundle() {
      // Files to copy
      const filesToCopy = [
        { src: 'manifest.json', dest: 'manifest.json' },
        { src: 'modal.css', dest: 'modal.css' },
        { src: 'src/popup.html', dest: 'popup.html' },
        { src: 'src/test.html', dest: 'test.html' },
        { src: 'src/popup.js', dest: 'popup.js' }
      ];

      // Create icons directory if it doesn't exist
      const iconsDir = resolve('dist', 'icons');
      if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
      }

      // Copy icon files
      const iconSizes = [16, 48, 128];
      iconSizes.forEach(size => {
        const iconSrc = `icons/icon${size}.png`;
        const iconDest = `icons/icon${size}.png`;
        
        if (fs.existsSync(iconSrc)) {
          this.emitFile({
            type: 'asset',
            fileName: iconDest,
            source: fs.readFileSync(iconSrc)
          });
        }
      });

      // Copy each file
      filesToCopy.forEach(file => {
        if (fs.existsSync(file.src)) {
          this.emitFile({
            type: 'asset',
            fileName: file.dest,
            source: fs.readFileSync(file.src)
          });
        }
      });
    }
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [copyFilesPlugin()]
}); 