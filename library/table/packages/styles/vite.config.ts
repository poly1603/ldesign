import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.css'),
      },
      output: {
        assetFileNames: '[name][extname]',
      },
    },
  },
});


