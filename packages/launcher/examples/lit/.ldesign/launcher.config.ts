import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3006,
    open: false,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    lib: {
      entry: 'src/main.ts',
      formats: ['es']
    }
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  },
  optimizeDeps: {
    include: ['lit']
  }
})
