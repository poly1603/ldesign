import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ldesign/engine': resolve(__dirname, '../packages/engine/src'),
      '@ldesign/router': resolve(__dirname, '../packages/router/src'),
      '@ldesign/i18n': resolve(__dirname, '../packages/i18n/src'),
    }
  },
  server: {
    port: 8888,
    open: true,
    host: true,
  }
})