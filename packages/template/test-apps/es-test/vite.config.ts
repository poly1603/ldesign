import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/template': resolve(__dirname, '../../es'),
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3002,
  },
  define: {
    __TEMPLATE_ENV__: '"es"',
  },
})
