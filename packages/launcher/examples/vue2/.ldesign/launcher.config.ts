import { defineConfig } from '@ldesign/launcher'
import vue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue2()],
  server: {
    port: 3004,
    open: false,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2015'
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  }
})
