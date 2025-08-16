import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

// 工作配置 - 绕过 TypeScript 检查问题
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
    __DEV_MODE__: JSON.stringify(process.env.VITE_DEV_MODE || 'built'),
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@/components': resolve(process.cwd(), 'src/components'),
      '@/utils': resolve(process.cwd(), 'src/utils'),
      '@/styles': resolve(process.cwd(), 'src/styles'),
      '@/plugins': resolve(process.cwd(), 'src/plugins'),
      '@/middleware': resolve(process.cwd(), 'src/middleware'),
      // 根据环境动态设置包别名
      ...(process.env.VITE_DEV_MODE === 'source'
        ? {
            '@ldesign/device': resolve(process.cwd(), '../device/src'),
            '@ldesign/engine': resolve(process.cwd(), '../engine/src'),
            '@ldesign/http': resolve(process.cwd(), '../http/src'),
            '@ldesign/i18n': resolve(process.cwd(), '../i18n/src'),
            '@ldesign/router': resolve(process.cwd(), '../router/src'),
            '@ldesign/template': resolve(process.cwd(), '../template/src'),
          }
        : {}),
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
    port: process.env.VITE_DEV_MODE === 'source' ? 3002 : 3001,
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
