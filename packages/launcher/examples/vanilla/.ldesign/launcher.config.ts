import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3005,
    open: false,
    host: 'localhost'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015'
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss', '.css']
  }
})
