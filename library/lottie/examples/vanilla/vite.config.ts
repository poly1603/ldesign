import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  server: {
    port: 8080,
    fs: {
      allow: ['..', '../..']
    }
  },
  resolve: {
    alias: {
      '@ldesign/lottie': resolve(__dirname, '../../src'),
    }
  },
  publicDir: '../assets'
})
