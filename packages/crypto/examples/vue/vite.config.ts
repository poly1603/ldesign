import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    open: true,
  },
  resolve: {
    alias: {
      '@ldesign/crypto/vue': path.resolve(__dirname, '../../src/vue.ts'),
      '@ldesign/crypto': path.resolve(__dirname, '../../src/index.ts'),
      '@': path.resolve(__dirname, '../../src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
