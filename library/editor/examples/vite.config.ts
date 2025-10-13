import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@examples': resolve(__dirname, './src')
    }
  },
  server: {
    port: 8082,
    open: true,
    host: true,
  }
})
