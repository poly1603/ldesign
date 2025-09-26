import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  // 使用 LDesign 预设，包含通用的构建优化
  launcher: {
    preset: 'ldesign',
  },

  // Vite 标准的 resolve 配置
  resolve: {
    alias: [
      // 用户自定义别名（在所有阶段都生效）
      { find: '@components', replacement: './src/components', stages: ['dev', 'build', 'preview'] } as any,
      { find: '@utils', replacement: './src/utils', stages: ['dev', 'build', 'preview'] } as any,
      { find: '@assets', replacement: './src/assets', stages: ['dev', 'build', 'preview'] } as any,
      { find: '@styles', replacement: './src/styles', stages: ['dev', 'build', 'preview'] } as any,

      // 开发和生产环境别名：指向 packages 源码
      { find: '@ldesign/template/es/index.css', replacement: resolve(__dirname, '../../packages/template/src/styles/index.css'), stages: ['dev', 'build'] } as any,
      { find: '@ldesign/template', replacement: resolve(__dirname, '../../packages/template/src'), stages: ['dev', 'build'] } as any,
      { find: '@ldesign/i18n/es/index.css', replacement: resolve(__dirname, '../../packages/i18n/src/styles/index.css'), stages: ['dev', 'build'] } as any,
      { find: '@ldesign/size/es/index.css', replacement: resolve(__dirname, '../../packages/size/src/styles/index.css'), stages: ['dev', 'build'] } as any,
      { find: '@ldesign/color/es/exports/vue.css', replacement: resolve(__dirname, '../../packages/color/es/exports/vue.css'), stages: ['dev', 'build'] } as any,
      { find: '@ldesign/color/es/index.css', replacement: resolve(__dirname, '../../packages/color/src/styles/index.css'), stages: ['dev', 'build'] } as any,

      // @ldesign 包的开发时别名 - 指向源码目录（仅在 dev 阶段）
      // 特殊子路径导入
      { find: '@ldesign/color/exports/vue', replacement: resolve(__dirname, '../../packages/color/src/exports/vue'), stages: ['dev'] } as any,
      { find: '@ldesign/i18n/vue', replacement: resolve(__dirname, '../../packages/i18n/src/vue'), stages: ['dev'] } as any,
      
      // 主包路径
      { find: '@ldesign/api', replacement: resolve(__dirname, '../../packages/api/src'), stages: ['dev'] } as any,
      { find: '@ldesign/builder', replacement: resolve(__dirname, '../../packages/builder/src'), stages: ['dev'] } as any,
      { find: '@ldesign/cache', replacement: resolve(__dirname, '../../packages/cache/src'), stages: ['dev'] } as any,
      { find: '@ldesign/calendar', replacement: resolve(__dirname, '../../packages/calendar/src'), stages: ['dev'] } as any,
      { find: '@ldesign/captcha', replacement: resolve(__dirname, '../../packages/captcha/src'), stages: ['dev'] } as any,
      { find: '@ldesign/chart', replacement: resolve(__dirname, '../../packages/chart/src'), stages: ['dev'] } as any,
      { find: '@ldesign/color', replacement: resolve(__dirname, '../../packages/color/src'), stages: ['dev'] } as any,
      { find: '@ldesign/component', replacement: resolve(__dirname, '../../packages/component/src'), stages: ['dev'] } as any,
      { find: '@ldesign/cropper', replacement: resolve(__dirname, '../../packages/cropper/src'), stages: ['dev'] } as any,
      { find: '@ldesign/crypto', replacement: resolve(__dirname, '../../packages/crypto/src'), stages: ['dev'] } as any,
      { find: '@ldesign/datepicker', replacement: resolve(__dirname, '../../packages/datepicker/src'), stages: ['dev'] } as any,
      { find: '@ldesign/device', replacement: resolve(__dirname, '../../packages/device/src'), stages: ['dev'] } as any,
      { find: '@ldesign/editor', replacement: resolve(__dirname, '../../packages/editor/src'), stages: ['dev'] } as any,
      { find: '@ldesign/engine', replacement: resolve(__dirname, '../../packages/engine/src'), stages: ['dev'] } as any,
      { find: '@ldesign/flowchart', replacement: resolve(__dirname, '../../packages/flowchart/src'), stages: ['dev'] } as any,
      { find: '@ldesign/form', replacement: resolve(__dirname, '../../packages/form/src'), stages: ['dev'] } as any,
      { find: '@ldesign/git', replacement: resolve(__dirname, '../../packages/git/src'), stages: ['dev'] } as any,
      { find: '@ldesign/http', replacement: resolve(__dirname, '../../packages/http/src'), stages: ['dev'] } as any,
      { find: '@ldesign/i18n', replacement: resolve(__dirname, '../../packages/i18n/src'), stages: ['dev', 'build'] } as any,
      { find: '@ldesign/icons', replacement: resolve(__dirname, '../../packages/icons/packages'), stages: ['dev'] } as any,
      { find: '@ldesign/kit', replacement: resolve(__dirname, '../../packages/kit/src'), stages: ['dev'] } as any,
      { find: '@ldesign/launcher', replacement: resolve(__dirname, '../../packages/launcher/src'), stages: ['dev'] } as any,
      { find: '@ldesign/map', replacement: resolve(__dirname, '../../packages/map/src'), stages: ['dev'] } as any,
      { find: '@ldesign/pdf', replacement: resolve(__dirname, '../../packages/pdf/src'), stages: ['dev'] } as any,
      { find: '@ldesign/progress', replacement: resolve(__dirname, '../../packages/progress/src'), stages: ['dev'] } as any,
      { find: '@ldesign/qrcode', replacement: resolve(__dirname, '../../packages/qrcode/src'), stages: ['dev'] } as any,
      { find: '@ldesign/router', replacement: resolve(__dirname, '../../packages/router/src'), stages: ['dev'] } as any,
      { find: '@ldesign/shared', replacement: resolve(__dirname, '../../packages/shared/src'), stages: ['dev'] } as any,
      { find: '@ldesign/size', replacement: resolve(__dirname, '../../packages/size/src'), stages: ['dev'] } as any,
      { find: '@ldesign/store', replacement: resolve(__dirname, '../../packages/store/src'), stages: ['dev'] } as any,
      { find: '@ldesign/table', replacement: resolve(__dirname, '../../packages/table/src'), stages: ['dev'] } as any,
      { find: '@ldesign/template', replacement: resolve(__dirname, '../../packages/template/src'), stages: ['dev'] } as any,
      { find: '@ldesign/theme', replacement: resolve(__dirname, '../../packages/theme/src'), stages: ['dev'] } as any,
      { find: '@ldesign/tree', replacement: resolve(__dirname, '../../packages/tree/src'), stages: ['dev'] } as any,
      { find: '@ldesign/ui', replacement: resolve(__dirname, '../../packages/ui/src'), stages: ['dev'] } as any,
      { find: '@ldesign/video', replacement: resolve(__dirname, '../../packages/video/src'), stages: ['dev'] } as any,
      { find: '@ldesign/watermark', replacement: resolve(__dirname, '../../packages/watermark/src'), stages: ['dev'] } as any,
      { find: '@ldesign/websocket', replacement: resolve(__dirname, '../../packages/websocket/src'), stages: ['dev'] } as any,


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
  },

  // ESBuild 配置
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'vue'
  }
}
)