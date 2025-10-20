import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: true
  },
  resolve: {
    alias: {
      '@ldesign/map-renderer': resolve(__dirname, '../src/index.ts')
    }
  },
  optimizeDeps: {
    include: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/geo-layers', '@deck.gl/aggregation-layers']
  }
});
