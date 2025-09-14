import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 30000,
    open: true
  },
  resolve: {
    alias: {
      '@ldesign/captcha': resolve(__dirname, '../../src/index-core.ts'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
})
