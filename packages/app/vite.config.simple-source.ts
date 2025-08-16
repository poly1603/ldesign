import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

/**
 * 简化的 Source 模式配置
 * 跳过类型检查，专注于功能验证
 */
export default defineConfig({
  root: __dirname,
  publicDir: 'public',
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

      // 直接映射到源码目录
      '@ldesign/engine': resolve(__dirname, '../engine/src'),
      '@ldesign/engine/vue': resolve(__dirname, '../engine/src/vue'),
      '@ldesign/router': resolve(__dirname, '../router/src'),
      '@ldesign/router/vue': resolve(__dirname, '../router/src/vue'),
      '@ldesign/template': resolve(__dirname, '../template/src'),
      '@ldesign/template/vue': resolve(__dirname, '../template/src/vue'),
      '@ldesign/i18n': resolve(__dirname, '../i18n/src'),
      '@ldesign/i18n/vue': resolve(__dirname, '../i18n/src/vue'),
      '@ldesign/http': resolve(__dirname, '../http/src'),
      '@ldesign/http/vue': resolve(__dirname, '../http/src/vue'),
      '@ldesign/device': resolve(__dirname, '../device/src'),
      '@ldesign/device/vue': resolve(__dirname, '../device/src/vue'),
      '@ldesign/cache': resolve(__dirname, '../cache/src'),
      '@ldesign/color': resolve(__dirname, '../color/src'),
      '@ldesign/color/vue': resolve(__dirname, '../color/src/adapt/vue'),
      '@ldesign/crypto': resolve(__dirname, '../crypto/src'),
      '@ldesign/crypto/vue': resolve(__dirname, '../crypto/src/adapt/vue'),
      '@ldesign/size': resolve(__dirname, '../size/src'),
      '@ldesign/size/vue': resolve(__dirname, '../size/src/vue'),
      '@ldesign/store': resolve(__dirname, '../store/src'),
      '@ldesign/store/vue': resolve(__dirname, '../store/src/vue'),

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
    cors: true,
    hmr: {
      timeout: 60000,
    },
  },
  logLevel: 'info',
  esbuild: {
    // 完全跳过类型检查
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
      'direct-eval': 'silent',
    },
    target: 'es2020',
    keepNames: true,
    // 忽略所有 TypeScript 错误
    tsconfigRaw: {
      compilerOptions: {
        skipLibCheck: true,
        noEmit: true,
        allowJs: true,
        checkJs: false,
      },
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist-source',
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.simple.html'),
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
      '@ldesign/cache',
      '@ldesign/color',
      '@ldesign/crypto',
      '@ldesign/size',
      '@ldesign/store',
    ],
  },
})
