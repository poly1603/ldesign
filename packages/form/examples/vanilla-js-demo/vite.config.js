import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/form': resolve(__dirname, '../../../src/index.ts'),
      '@ldesign/form/vanilla': resolve(
        __dirname,
        '../../../src/vanilla/index.ts'
      ),
      '@ldesign/form/styles/index.css': resolve(
        __dirname,
        '../../../src/styles/index.css'
      ),
    },
  },
})
