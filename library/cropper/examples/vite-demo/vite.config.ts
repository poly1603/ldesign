import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // More specific aliases should come first
      { find: '@ldesign/cropper/style.css', replacement: resolve(__dirname, '../../src/styles/cropper.css') },
      { find: '@ldesign/cropper/vue', replacement: resolve(__dirname, '../../src/vue.ts') },
      { find: /^@ldesign\/cropper$/, replacement: resolve(__dirname, '../../src/index.ts') }
    ]
  }
})
