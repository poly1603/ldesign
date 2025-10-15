import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/flowchart': resolve(__dirname, '../src/index.ts')
    }
  },
  server: {
    port: 8890,
    open: true,
    host: true
  }
})
