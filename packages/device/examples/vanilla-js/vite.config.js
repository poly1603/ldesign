import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/device': path.resolve(__dirname, '../../es/index.js')
    }
  },
  server: {
    port: 5174
  }
})
