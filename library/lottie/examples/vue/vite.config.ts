import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/lottie': resolve(__dirname, '../../src'),
    }
  },
  publicDir: '../assets',
  server: {
    fs: {
      allow: ['..', '../..']
    }
  }
})
