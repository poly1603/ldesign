import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
  server: {
    port: 5000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});


