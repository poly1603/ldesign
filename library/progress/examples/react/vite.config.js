import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/progress-core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ldesign/progress-react': resolve(__dirname, '../../packages/react/src/index.ts'),
    },
  },
  server: {
    port: 3002,
    open: true,
    host: true,
  },
});

