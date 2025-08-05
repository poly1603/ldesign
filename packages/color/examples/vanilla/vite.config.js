import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    host: true
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@ldesign/color/vue', replacement: resolve(__dirname, '../../src/adapt/vue') },
      { find: '@ldesign/color', replacement: resolve(__dirname, '../../src') },
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
