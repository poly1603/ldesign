import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/grid': path.resolve(__dirname, '../../src')
    }
  }
})




