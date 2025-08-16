import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

// 简化的 Vite 配置，用于快速启动
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (_tag: string) => false,
        },
      },
    }),
    vueJsx({
      transformOn: true,
      mergeProps: true,
    }),
  ],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: true,
    __DEV_MODE__: JSON.stringify('built'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "@/styles/variables.less";`,
      },
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: true,
    cors: true,
  },
  optimizeDeps: {
    include: ['vue', 'pinia'],
    exclude: ['@ldesign/*'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
