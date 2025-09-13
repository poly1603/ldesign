import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignQRCode',
      fileName: (format) => `index.${format === 'es' ? 'js' : format}`
    },
    rollupOptions: {
      external: ['vue', 'qrcode'],
      output: {
        globals: {
          vue: 'Vue',
          qrcode: 'QRCode'
        }
      }
    },
    sourcemap: true,
    minify: 'terser'
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
