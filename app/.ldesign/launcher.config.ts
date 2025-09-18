import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  // 使用 LDesign 预设，包含通用的构建优化
  launcher: {
    preset: 'ldesign',
  },

  // 显式添加插件
  plugins: [
    vue() as any,
    vueJsx({
      transformOn: true,
      mergeProps: true,
    }) as any
  ],

  // Vite 标准的 resolve 配置
  resolve: {
    alias: [
      // 用户自定义别名
      { find: '@components', replacement: './src/components' },
      { find: '@utils', replacement: './src/utils' },
      { find: '@assets', replacement: './src/assets' },
      { find: '@styles', replacement: './src/styles' },

      // @ldesign 包的开发时别名 - 指向源码目录（使用绝对路径）
      { find: '@ldesign/api', replacement: resolve(__dirname, '../../packages/api/src') },
      { find: '@ldesign/builder', replacement: resolve(__dirname, '../../packages/builder/src') },
      { find: '@ldesign/cache', replacement: resolve(__dirname, '../../packages/cache/src') },
      { find: '@ldesign/calendar', replacement: resolve(__dirname, '../../packages/calendar/src') },
      { find: '@ldesign/captcha', replacement: resolve(__dirname, '../../packages/captcha/src') },
      { find: '@ldesign/chart', replacement: resolve(__dirname, '../../packages/chart/src') },
      { find: '@ldesign/color', replacement: resolve(__dirname, '../../packages/color/src') },
      { find: '@ldesign/component', replacement: resolve(__dirname, '../../packages/component/src') },
      { find: '@ldesign/cropper', replacement: resolve(__dirname, '../../packages/cropper/src') },
      { find: '@ldesign/crypto', replacement: resolve(__dirname, '../../packages/crypto/src') },
      { find: '@ldesign/datepicker', replacement: resolve(__dirname, '../../packages/datepicker/src') },
      { find: '@ldesign/device', replacement: resolve(__dirname, '../../packages/device/src') },
      { find: '@ldesign/editor', replacement: resolve(__dirname, '../../packages/editor/src') },
      { find: '@ldesign/engine', replacement: resolve(__dirname, '../../packages/engine/src') },
      { find: '@ldesign/flowchart', replacement: resolve(__dirname, '../../packages/flowchart/src') },
      { find: '@ldesign/form', replacement: resolve(__dirname, '../../packages/form/src') },
      { find: '@ldesign/git', replacement: resolve(__dirname, '../../packages/git/src') },
      { find: '@ldesign/http', replacement: resolve(__dirname, '../../packages/http/src') },
      { find: '@ldesign/i18n', replacement: resolve(__dirname, '../../packages/i18n/src') },
      { find: '@ldesign/icons', replacement: resolve(__dirname, '../../packages/icons/packages') },
      { find: '@ldesign/kit', replacement: resolve(__dirname, '../../packages/kit/src') },
      { find: '@ldesign/launcher', replacement: resolve(__dirname, '../../packages/launcher/src') },
      { find: '@ldesign/map', replacement: resolve(__dirname, '../../packages/map/src') },
      { find: '@ldesign/pdf', replacement: resolve(__dirname, '../../packages/pdf/src') },
      { find: '@ldesign/progress', replacement: resolve(__dirname, '../../packages/progress/src') },
      { find: '@ldesign/qrcode', replacement: resolve(__dirname, '../../packages/qrcode/src') },
      { find: '@ldesign/router', replacement: resolve(__dirname, '../../packages/router/src') },
      { find: '@ldesign/shared', replacement: resolve(__dirname, '../../packages/shared/src') },
      { find: '@ldesign/size', replacement: resolve(__dirname, '../../packages/size/src') },
      { find: '@ldesign/store', replacement: resolve(__dirname, '../../packages/store/src') },
      { find: '@ldesign/table', replacement: resolve(__dirname, '../../packages/table/src') },
      { find: '@ldesign/template', replacement: resolve(__dirname, '../../packages/template/src') },
      { find: '@ldesign/theme', replacement: resolve(__dirname, '../../packages/theme/src') },
      { find: '@ldesign/tree', replacement: resolve(__dirname, '../../packages/tree/src') },
      { find: '@ldesign/ui', replacement: resolve(__dirname, '../../packages/ui/src') },
      { find: '@ldesign/video', replacement: resolve(__dirname, '../../packages/video/src') },
      { find: '@ldesign/watermark', replacement: resolve(__dirname, '../../packages/watermark/src') },
      { find: '@ldesign/websocket', replacement: resolve(__dirname, '../../packages/websocket/src') },
    ]
  },

  // 基础服务器配置
  server: {
    port: 3340,
    open: false,
    host: '0.0.0.0',

    // 项目特定的 API 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    }
  },

  preview: {
    port: 8888,
    host: '0.0.0.0'  // 允许外部访问
  },

  // 构建配置 - 覆盖预设中的部分配置
  build: {
    outDir: 'site', // 输出到 site 目录

    // 项目特定的分包策略
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // UI 组件库
          if (id.includes('lucide-vue-next')) {
            return 'ui-libs'
          }

          // 加密相关
          if (id.includes('crypto-js') || id.includes('@ldesign/crypto')) {
            return 'crypto'
          }

          // 网络请求
          if (id.includes('axios') || id.includes('alova') || id.includes('@ldesign/http')) {
            return 'http'
          }

          // 使用预设中的默认分包策略
          return undefined
        }
      }
    }
  }
})
