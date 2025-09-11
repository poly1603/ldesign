import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 3002,
    open: true,
    host: true,
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      {
        find: '@ldesign/color/vue',
        replacement: resolve(__dirname, '../../src/vue'),
      },
      { find: '@ldesign/color', replacement: resolve(__dirname, '../../src') },
    ],
  },
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
