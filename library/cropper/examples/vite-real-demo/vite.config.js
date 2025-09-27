import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 3001,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@cropper': resolve(__dirname, '../../src')
    }
  },
  optimizeDeps: {
    exclude: ['@cropper']
  },
  esbuild: {
    target: 'es2020'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development')
  }
})
