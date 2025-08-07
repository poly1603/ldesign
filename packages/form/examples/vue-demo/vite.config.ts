import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
    }),
  ],
  esbuild: {
    target: 'esnext',
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  server: {
    port: 3002,
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
    },
  },
})
