import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/grid/vue': path.resolve(__dirname, '../../src/adapters/vue'),
      '@ldesign/grid': path.resolve(__dirname, '../../src')
    }
  }
})













