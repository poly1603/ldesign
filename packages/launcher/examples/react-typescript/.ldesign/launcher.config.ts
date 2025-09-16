import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  }
})
