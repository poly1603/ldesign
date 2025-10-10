import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/pdf': resolve(__dirname, '../../src'),
    },
  },
  server: {
    port: 3001,
  },
});
