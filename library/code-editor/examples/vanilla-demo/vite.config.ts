import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/code-editor': resolve(__dirname, '../../src/index.ts')
    }
  },
  server: {
    port: 3000
  }
})
