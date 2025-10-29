import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 5173,
    host: '0.0.0.0', // 支持IP访问,绕过代理问题
    strictPort: false, // 端口被占用时自动尝试下一个
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000', // 使用127.0.0.1避免代理问题
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ API代理错误:', err.message)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 API代理请求:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ API代理响应:', proxyRes.statusCode, req.url)
          })
        },
      },
      '/ws': {
        target: 'ws://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ WebSocket代理错误:', err.message)
          })
          proxy.on('open', (proxySocket) => {
            console.log('✅ WebSocket代理连接已打开')
          })
          proxy.on('close', (res, socket, head) => {
            console.log('⚠️ WebSocket代理连接已关闭')
          })
        },
      },
    },
    cors: true,
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // 使用 esbuild 而不是 terser
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'ui-vendor': ['naive-ui'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'naive-ui'],
  },
})


