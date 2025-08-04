import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

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
