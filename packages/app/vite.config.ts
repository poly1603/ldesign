import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 启用运行时模板编译
          isCustomElement: (_tag: string) => false,
        },
      },
    }),
    vueJsx({
      // 配置 JSX 选项
      transformOn: true,
      mergeProps: true,
    }),
  ],
  define: {
    // 启用Vue运行时编译器
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/middleware': resolve(__dirname, 'src/middleware'),
      // 配置本地包别名，指向ES模块构建文件
      '@ldesign/engine': resolve(__dirname, '../engine/es/index.js'),
      '@ldesign/router': resolve(__dirname, '../router/es/index.js'),
      '@ldesign/template': resolve(__dirname, '../template/es/index.js'),
      '@ldesign/template/vue': resolve(
        __dirname,
        '../template/es/vue/index.js'
      ),
      '@ldesign/i18n': resolve(__dirname, '../i18n/es/index.js'),
      '@ldesign/i18n/vue': resolve(__dirname, '../i18n/es/vue/index.js'),
      // 使用包含编译器的Vue版本
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
    port: 3000,
    open: true,
    cors: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          engine: ['@ldesign/engine'],
          monaco: ['monaco-editor'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      '@ldesign/engine',
      '@ldesign/i18n',
      'monaco-editor',
      'prismjs',
    ],
  },
})
