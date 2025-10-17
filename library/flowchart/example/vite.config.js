import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  },
  server: {
    port: 8000,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});





