import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        basic: resolve(__dirname, 'basic.html'),
        plugins: resolve(__dirname, 'plugins.html'),
        themes: resolve(__dirname, 'themes.html'),
        advanced: resolve(__dirname, 'advanced.html')
      }
    }
  },
  resolve: {
    alias: {
      '@ldesign/video': resolve(__dirname, '../../src/index.ts')
    }
  }
})
