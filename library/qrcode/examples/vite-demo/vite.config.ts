import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3333,
    host: true,
    open: true,
    force: true, // Force optimizer to re-bundle
  },
  optimizeDeps: {
    force: true, // Force re-optimization of dependencies
  },
  cacheDir: 'node_modules/.vite-temp', // Use different cache directory
  resolve: {
    alias: {
      '@ldesign/qrcode': path.resolve(__dirname, '../../dist/index.esm.js')
    }
  }
});
