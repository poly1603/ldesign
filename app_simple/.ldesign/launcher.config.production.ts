import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  // 基础配置
  root: '.',

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    emptyOutDir: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
        passes: 2
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue/')) {
            return 'vue-core'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          if (id.includes('@ldesign/engine')) {
            return 'ldesign-engine'
          }
          if (id.includes('@ldesign')) {
            return 'ldesign-lib'
          }
        },
        chunkFileNames: 'js/[name].[hash:8].js',
        entryFileNames: 'js/[name].[hash:8].js',
        assetFileNames: '[ext]/[name].[hash:8].[ext]',
        compact: true
      }
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    reportCompressedSize: false,
    assetsInlineLimit: 4096
  },

  // 预览配置
  preview: {
    port: 4173,
    host: 'localhost',
    open: true
  },

  // 别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/api': resolve(__dirname, '../../packages/api/src'),
      '@ldesign/cache': resolve(__dirname, '../../packages/cache/src'),
      '@ldesign/color': resolve(__dirname, '../../packages/color/src'),
      '@ldesign/crypto': resolve(__dirname, '../../packages/crypto/src'),
      '@ldesign/engine': resolve(__dirname, '../../packages/engine/src'),
      '@ldesign/http': resolve(__dirname, '../../packages/http/src'),
      '@ldesign/i18n': resolve(__dirname, '../../packages/i18n/src'),
      '@ldesign/router': resolve(__dirname, '../../packages/router/src'),
      '@ldesign/size': resolve(__dirname, '../../packages/size/src'),
      '@ldesign/store': resolve(__dirname, '../../packages/store/src'),
      '@ldesign/template': resolve(__dirname, '../../packages/template/src')
    },
    dedupe: ['vue', 'pinia', 'lucide-vue-next']
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue', 'pinia'],
    exclude: []
  }
})

