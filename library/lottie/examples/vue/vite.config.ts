import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/lottie/vue': resolve(__dirname, '../../src/adapters/vue'),
      '@ldesign/lottie/react': resolve(__dirname, '../../src/adapters/react'),
      '@ldesign/lottie/lit': resolve(__dirname, '../../src/adapters/lit'),
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
