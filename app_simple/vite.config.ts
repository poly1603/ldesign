import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ldesign/engine': resolve(__dirname, '../packages/engine/src'),
      '@ldesign/router': resolve(__dirname, '../packages/router/src')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  }
})