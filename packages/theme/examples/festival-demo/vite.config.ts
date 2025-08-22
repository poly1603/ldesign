import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/theme': resolve(__dirname, '../../src'),
      '@ldesign/color': resolve(__dirname, '../../../color/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,

    // 优化构建配置
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'ldesign-vendor': ['@ldesign/theme', '@ldesign/color'],
        },
      },
    },

    // 资源优化
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
  },

  // CSS 优化
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  // 性能优化
  optimizeDeps: {
    include: ['vue', '@ldesign/theme', '@ldesign/color'],
    exclude: [],
  },
})
