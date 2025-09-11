import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3004,
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
