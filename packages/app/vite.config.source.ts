import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

/**
 * Vite 配置 - 源码模式
 *
 * 此配置直接引用 @ldesign/* 包的源码目录
 * 适用于：
 * - 开发调试
 * - 源码修改实时预览
 * - 包开发和测试
 */
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
    __VUE_PROD_DEVTOOLS__: true, // 开发模式启用 devtools
    // 环境标识
    __DEV_MODE__: JSON.stringify('source'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/middleware': resolve(__dirname, 'src/middleware'),

      // 直接映射到源码目录 - 用于开发调试
      '@ldesign/engine': resolve(__dirname, '../engine/src/index.ts'),
      '@ldesign/engine/vue': resolve(__dirname, '../engine/src/vue/index.ts'),

      '@ldesign/router': resolve(__dirname, '../router/src/index.ts'),
      '@ldesign/router/vue': resolve(__dirname, '../router/src/vue/index.ts'),

      '@ldesign/template': resolve(__dirname, '../template/src/index.ts'),
      '@ldesign/template/vue': resolve(
        __dirname,
        '../template/src/vue/index.ts'
      ),

      '@ldesign/i18n': resolve(__dirname, '../i18n/src/index.ts'),
      '@ldesign/i18n/vue': resolve(__dirname, '../i18n/src/vue/index.ts'),

      '@ldesign/http': resolve(__dirname, '../http/src/index.ts'),
      '@ldesign/http/vue': resolve(__dirname, '../http/src/vue/index.ts'),

      '@ldesign/device': resolve(__dirname, '../device/src/index.ts'),
      '@ldesign/device/vue': resolve(__dirname, '../device/src/vue/index.ts'),

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
    port: 3002,
    host: '0.0.0.0',
    open: true,
    cors: true,
    // 源码模式需要更长的 HMR 超时
    hmr: {
      timeout: 60000,
    },
  },
  logLevel: 'info',
  build: {
    target: 'es2020',
    outDir: 'dist-source',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          // 源码模式下不分离 ldesign 包，因为它们是源码
          monaco: ['monaco-editor'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'monaco-editor', 'prismjs'],
    // 排除源码包，让它们保持源码状态
    exclude: [
      '@ldesign/engine',
      '@ldesign/router',
      '@ldesign/template',
      '@ldesign/i18n',
      '@ldesign/http',
      '@ldesign/device',
      'alova',
    ],
  },
  // 添加环境信息到开发工具
  esbuild: {
    define: {
      __DEV_ENV_INFO__: JSON.stringify({
        mode: 'source',
        description: '使用源码模式',
        port: 3002,
        packages: 'source files',
      }),
    },
  },
})
