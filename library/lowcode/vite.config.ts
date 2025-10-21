import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  server: {
    port: 5173,
    open: true,
    host: true
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignLowcode',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css';
          }
          return assetInfo.name || '';
        }
      }
    }
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
});


