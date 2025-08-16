import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

/**
 * Vite 默认配置
 *
 * 根据环境变量 VITE_DEV_MODE 决定使用哪种模式：
 * - built: 使用构建产物（默认）
 * - source: 使用源码
 */

const devMode = process.env.VITE_DEV_MODE || 'built'
const isSourceMode = devMode === 'source'

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
    __VUE_PROD_DEVTOOLS__: isSourceMode,
    // 环境标识
    __DEV_MODE__: JSON.stringify(devMode),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/middleware': resolve(__dirname, 'src/middleware'),

      // 根据模式动态配置别名
      ...(isSourceMode
        ? {
          // 源码模式：直接映射到源码目录
          '@ldesign/engine': resolve(__dirname, '../engine/src/index.ts'),
          '@ldesign/engine/vue': resolve(
            __dirname,
            '../engine/src/vue/index.ts'
          ),
          '@ldesign/router': resolve(__dirname, '../router/src/index.ts'),
          '@ldesign/router/vue': resolve(
            __dirname,
            '../router/src/vue/index.ts'
          ),
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
          '@ldesign/device/vue': resolve(
            __dirname,
            '../device/src/vue/index.ts'
          ),
          // 使用包含编译器的Vue版本
          vue: 'vue/dist/vue.esm-bundler.js',
        }
        : {
          // 构建模式：使用构建产物（从 node_modules）
          // 不需要特殊别名，让 Vite 自动解析
        }),
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
    port: isSourceMode ? 3002 : 3001,
    host: '0.0.0.0',
    open: true,
    cors: true,
    // 源码模式需要更长的 HMR 超时
    ...(isSourceMode && {
      hmr: {
        timeout: 60000,
      },
    }),
  },
  logLevel: 'info',
  esbuild: {
    // 忽略 TypeScript 错误以允许 Vite 启动
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // 跳过类型检查以加快启动速度
    target: 'es2020',
    keepNames: true,
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
    include: ['vue', 'monaco-editor', 'prismjs'],
    exclude: [
      '@ldesign/engine',
      '@ldesign/router',
      '@ldesign/template',
      '@ldesign/i18n',
      '@ldesign/http',
      '@ldesign/device',
      'axios',
      'alova',
    ],
  },
})
