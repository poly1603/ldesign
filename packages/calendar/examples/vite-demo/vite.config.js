import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: __dirname,
  base: './',
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ldesign/calendar': path.resolve(__dirname, '../../src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})