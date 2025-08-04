import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 启用模板编译器
          isCustomElement: _tag => false,
        },
      },
    }),
    vueJsx(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/template': resolve(__dirname, '../es'),
    },
  },

  server: {
    port: 3005,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  esbuild: {
    target: 'es2020',
  },
})
