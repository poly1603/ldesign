import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: {
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      '@ldesign/flowchart': fileURLToPath(new URL('../../src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
