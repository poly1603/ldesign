import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3003,
    open: false,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext'
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  }
})
