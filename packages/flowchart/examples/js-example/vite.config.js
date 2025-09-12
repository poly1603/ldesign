import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [],
  server: {
    port: 9998,
    open: true,
    host: true
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
