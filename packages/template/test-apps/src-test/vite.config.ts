import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/template': resolve(__dirname, '../../src'),
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
  },
  define: {
    __TEMPLATE_ENV__: '"src"',
  },
})
