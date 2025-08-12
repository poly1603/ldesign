import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ldesign/i18n': resolve(__dirname, '../../src/index.ts'),
      '@ldesign/i18n/vue': resolve(__dirname, '../../src/vue/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
