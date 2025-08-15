import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

// 简化的 Vite 配置，用于快速启动测试
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: _tag => false,
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
    __VUE_PROD_DEVTOOLS__: false,
    __DEV_MODE__: JSON.stringify('built'),
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@/components': resolve(process.cwd(), 'src/components'),
      '@/utils': resolve(process.cwd(), 'src/utils'),
      '@/styles': resolve(process.cwd(), 'src/styles'),
      '@/plugins': resolve(process.cwd(), 'src/plugins'),
      '@/middleware': resolve(process.cwd(), 'src/middleware'),
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
  logLevel: 'info',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['vue', 'monaco-editor', 'prismjs'],
    exclude: ['alova'],
  },
})
