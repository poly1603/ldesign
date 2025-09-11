import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  server: {
    port: 3001,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@ldesign/watermark': fileURLToPath(new URL('../../src', import.meta.url))
    }
  },
})
