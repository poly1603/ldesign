import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@word-viewer/core': path.resolve(__dirname, '../../packages/core/dist/index.esm.js'),
    },
  },
  server: {
    port: 3002,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});

