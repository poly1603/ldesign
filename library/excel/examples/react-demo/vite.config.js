import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/excel-viewer-react': resolve(__dirname, '../../packages/react/src/index.ts'),
      '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  server: {
    port: 5002,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});


