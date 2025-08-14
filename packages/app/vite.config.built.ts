import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

/**
 * Vite 配置 - 构建产物模式
 *
 * 此配置使用已构建的 @ldesign/* 包（从 node_modules 或构建产物）
 * 适用于：
 * - 生产环境开发
 * - 性能测试
 * - 最终用户体验验证
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
    __VUE_PROD_DEVTOOLS__: false,
    // 环境标识
    __DEV_MODE__: JSON.stringify('built'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/middleware': resolve(__dirname, 'src/middleware'),
      // 使用构建产物 - 从 node_modules 或构建目录
      // 这些包将从 node_modules 中的构建版本加载
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
    // 添加环境标识到页面标题
    proxy: {},
  },
  logLevel: 'info',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
          ldesign: [
            '@ldesign/engine',
            '@ldesign/router',
            '@ldesign/template',
            '@ldesign/i18n',
            '@ldesign/http',
            '@ldesign/device',
          ],
          monaco: ['monaco-editor'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      '@ldesign/engine',
      '@ldesign/router',
      '@ldesign/template',
      '@ldesign/i18n',
      '@ldesign/http',
      '@ldesign/device',
      'monaco-editor',
      'prismjs',
    ],
    exclude: ['alova'],
  },
  // 添加环境信息到开发工具
  esbuild: {
    define: {
      __DEV_ENV_INFO__: JSON.stringify({
        mode: 'built',
        description: '使用构建产物模式',
        port: 3001,
        packages: 'node_modules (built)',
      }),
    },
  },
})
