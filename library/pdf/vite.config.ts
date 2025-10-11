import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'vue/index': resolve(__dirname, 'src/adapters/vue/index.ts')
      },
      name: 'PDFViewer',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'pdfjs-dist'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})
