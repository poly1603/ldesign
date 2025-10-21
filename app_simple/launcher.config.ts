import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  server: {
    port: 9000,
    host: '0.0.0.0',
    open: false
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },

  resolve: {
    alias: [
      { find: '@', replacement: './src' }
    ]
  }
})


