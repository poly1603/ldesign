import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'src/tools/preview'),
  
  build: {
    outDir: resolve(__dirname, 'dist/preview'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/tools/preview/index.html')
      }
    }
  },

  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@packages': resolve(__dirname, 'src/packages'),
      '@tools': resolve(__dirname, 'src/tools')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  optimizeDeps: {
    include: ['svgo']
  }
})
