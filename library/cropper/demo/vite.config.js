import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 3333,
    open: true,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ldesign/cropper': resolve(__dirname, '../src/core/index.ts'),
      '@ldesign/cropper/utils': resolve(__dirname, '../src/utils/index.ts'),
      '@ldesign/cropper/types': resolve(__dirname, '../src/types/index.ts'),
      '@ldesign/cropper/styles': resolve(__dirname, '../src/styles/cropper.css')
    }
  },
  optimizeDeps: {
    exclude: ['@ldesign/cropper']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  esbuild: {
    // 支持 TypeScript
    loader: 'ts',
    target: 'es2020'
  }
})
