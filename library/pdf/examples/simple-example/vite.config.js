import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@pdf-plugin': resolve(__dirname, '../../src')
    }
  },
  server: {
    port: 3003,
    open: true,
    host: true
  }
});
