import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3002,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
