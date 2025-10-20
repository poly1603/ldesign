import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      // 生产环境优化
      template: {
        compilerOptions: {
          // 移除注释
          comments: false
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ldesign/cache': resolve(__dirname, '../packages/cache/src'),
      '@ldesign/engine': resolve(__dirname, '../packages/engine/src'),
      '@ldesign/router': resolve(__dirname, '../packages/router/src'),
      '@ldesign/i18n': resolve(__dirname, '../packages/i18n/src'),
      '@ldesign/color': resolve(__dirname, '../packages/color/src'),
      '@ldesign/template': resolve(__dirname, '../packages/template/src'),
      '@ldesign/size': resolve(__dirname, '../packages/size/src'),
    }
  },
  server: {
    port: 8888,
    open: true,
    host: true,
  },
  build: {
    // 生产环境构建优化
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2 // 多次压缩以获得更好的结果
      },
      format: {
        comments: false // 移除所有注释
      }
    },
    // 代码分割策略 - 更激进的优化
    rollupOptions: {
      output: {
        // 分块策略 - 更精细的控制
        manualChunks(id) {
          // Vue 核心库单独打包
          if (id.includes('node_modules/vue/')) {
            return 'vue-core'
          }
          // Vue Router
          if (id.includes('vue-router')) {
            return 'vue-router'
          }
          // 其他 node_modules 依赖
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // ldesign engine 核心
          if (id.includes('@ldesign/engine')) {
            return 'ldesign-engine'
          }
          // ldesign 其他包
          if (id.includes('@ldesign')) {
            return 'ldesign-lib'
          }
        },
        // 优化文件名 - 更短的路径
        chunkFileNames: 'js/[name].[hash:8].js',
        entryFileNames: 'js/[name].[hash:8].js',
        assetFileNames: '[ext]/[name].[hash:8].[ext]',
        // 压缩输出
        compact: true
      },
      // 外部化某些依赖（如果使用 CDN）
      // external: []
    },
    // 代码块大小警告阈值
    chunkSizeWarningLimit: 500,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 关闭 source map
    sourcemap: false,
    // 关闭压缩报告以加快构建
    reportCompressedSize: false,
    // 静态资源内联阈值 (kb)
    assetsInlineLimit: 4096,
    // 清理输出目录
    emptyOutDir: true
  },
  // 性能优化
  optimizeDeps: {
    include: ['vue', 'vue-router'],
    // 排除不需要预构建的依赖
    exclude: []
  }
})