import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@ldesign/color': resolve(__dirname, 'packages/color/src'),
      '@ldesign/crypto': resolve(__dirname, 'packages/crypto/src'),
      '@ldesign/device': resolve(__dirname, 'packages/device/src'),
      '@ldesign/engine': resolve(__dirname, 'packages/engine/src'),
      '@ldesign/http': resolve(__dirname, 'packages/http/src'),
      '@ldesign/i18n': resolve(__dirname, 'packages/i18n/src'),
      '@ldesign/size': resolve(__dirname, 'packages/size/src'),
      '@ldesign/store': resolve(__dirname, 'packages/store/src'),
      '@ldesign/template': resolve(__dirname, 'packages/template/src'),
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesign',
      fileName: format => `ldesign.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
