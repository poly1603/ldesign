import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/device': path.resolve(__dirname, '../../es/index.js'),
    },
  },
  server: {
    port: 5174,
  },
})
