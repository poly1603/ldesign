import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/progress-core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ldesign/progress-vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
    },
  },
  server: {
    port: 3001,
    open: true,
    host: true
  },
});


