import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3002,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@ldesign/i18n'],
  },
})
