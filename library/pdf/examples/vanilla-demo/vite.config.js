import { defineConfig } from 'vite'
import { resolve } from 'path'



export default defineConfig({
  server: {
    port: 4444
  },
  resolve: {
    alias: {
      '@ldesign/pdf-viewer': resolve(__dirname, '../../src'),
    }
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
