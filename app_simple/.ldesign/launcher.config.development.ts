import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default {
  // 基础配置
  root: '.',

  // 开发服务器配置
  server: {
    port: 9000,
    host: 'localhost',
    open: true,
    cors: true,
    strictPort: false,
    hmr: true
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
  },

  // Launcher 特定配置
  launcher: {
    debug: true,
    alias: {
      enabled: true,
      stages: ['dev']
    }
  }
}

