import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // '@ldesign/template': resolve(__dirname, '../src'),  // 使用源代码进行开发
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
