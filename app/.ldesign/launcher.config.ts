import { defineConfig, type AliasEntry } from '@ldesign/launcher'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  // 使用 LDesign 预设，包含通用的构建优化
  launcher: {
    preset: 'ldesign',
  },

  // 显式添加插件 - 确保 Vue JSX 插件被正确加载
  plugins: [
    vue() as any,
    vueJsx({
      transformOn: true,
      mergeProps: true,
      jsxImportSource: 'vue',
      // 确保 TSX 文件被正确处理
      include: /\.(vue|jsx|tsx)$/,
    }) as any
  ],

  // Vite 标准的 resolve 配置
  resolve: {
    alias: [
      // 用户自定义别名（在所有阶段都生效）
      { find: '@components', replacement: './src/components', stages: ['dev', 'build', 'preview'] },
      { find: '@utils', replacement: './src/utils', stages: ['dev', 'build', 'preview'] },
      { find: '@assets', replacement: './src/assets', stages: ['dev', 'build', 'preview'] },
      { find: '@styles', replacement: './src/styles', stages: ['dev', 'build', 'preview'] },

      // 开发和生产环境别名：指向 packages 源码
      { find: '@ldesign/template/es/index.css', replacement: resolve(__dirname, '../../../packages/template/src/styles/index.css'), stages: ['dev', 'build'] },
      { find: '@ldesign/template', replacement: resolve(__dirname, '../../../packages/template/src'), stages: ['dev', 'build'] },
      { find: '@ldesign/i18n/es/index.css', replacement: resolve(__dirname, '../../../packages/i18n/src/styles/index.css'), stages: ['dev', 'build'] },
      { find: '@ldesign/size/es/index.css', replacement: resolve(__dirname, '../../../packages/size/src/styles/index.css'), stages: ['dev', 'build'] },
      { find: '@ldesign/color/es/exports/vue.css', replacement: resolve(__dirname, '../../../packages/color/es/exports/vue.css'), stages: ['dev', 'build'] },
      { find: '@ldesign/color/es/index.css', replacement: resolve(__dirname, '../../../packages/color/src/styles/index.css'), stages: ['dev', 'build'] },

      // @ldesign 包的开发时别名 - 指向源码目录（仅在 dev 阶段）
      { find: '@ldesign/api', replacement: resolve(__dirname, '../../../packages/api/src'), stages: ['dev'] },
      { find: '@ldesign/builder', replacement: resolve(__dirname, '../../../packages/builder/src'), stages: ['dev'] },
      { find: '@ldesign/cache', replacement: resolve(__dirname, '../../../packages/cache/src'), stages: ['dev'] },
      { find: '@ldesign/calendar', replacement: resolve(__dirname, '../../../packages/calendar/src'), stages: ['dev'] },
      { find: '@ldesign/captcha', replacement: resolve(__dirname, '../../../packages/captcha/src'), stages: ['dev'] },
      { find: '@ldesign/chart', replacement: resolve(__dirname, '../../../packages/chart/src'), stages: ['dev'] },
      { find: '@ldesign/color', replacement: resolve(__dirname, '../../../packages/color/src'), stages: ['dev'] },
      { find: '@ldesign/component', replacement: resolve(__dirname, '../../../packages/component/src'), stages: ['dev'] },
      { find: '@ldesign/cropper', replacement: resolve(__dirname, '../../../packages/cropper/src'), stages: ['dev'] },
      { find: '@ldesign/crypto', replacement: resolve(__dirname, '../../../packages/crypto/src'), stages: ['dev'] },
      { find: '@ldesign/datepicker', replacement: resolve(__dirname, '../../../packages/datepicker/src'), stages: ['dev'] },
      { find: '@ldesign/device', replacement: resolve(__dirname, '../../../packages/device/src'), stages: ['dev'] },
      { find: '@ldesign/editor', replacement: resolve(__dirname, '../../../packages/editor/src'), stages: ['dev'] },
      { find: '@ldesign/engine', replacement: resolve(__dirname, '../../../packages/engine/src'), stages: ['dev'] },
      { find: '@ldesign/flowchart', replacement: resolve(__dirname, '../../../packages/flowchart/src'), stages: ['dev'] },
      { find: '@ldesign/form', replacement: resolve(__dirname, '../../../packages/form/src'), stages: ['dev'] },
      { find: '@ldesign/git', replacement: resolve(__dirname, '../../../packages/git/src'), stages: ['dev'] },
      { find: '@ldesign/http', replacement: resolve(__dirname, '../../../packages/http/src'), stages: ['dev'] },
      { find: '@ldesign/i18n', replacement: resolve(__dirname, '../../../packages/i18n/src'), stages: ['dev', 'build'] },
      { find: '@ldesign/icons', replacement: resolve(__dirname, '../../../packages/icons/packages'), stages: ['dev'] },
      { find: '@ldesign/kit', replacement: resolve(__dirname, '../../../packages/kit/src'), stages: ['dev'] },
      { find: '@ldesign/launcher', replacement: resolve(__dirname, '../../../packages/launcher/src'), stages: ['dev'] },
      { find: '@ldesign/map', replacement: resolve(__dirname, '../../../packages/map/src'), stages: ['dev'] },
      { find: '@ldesign/pdf', replacement: resolve(__dirname, '../../../packages/pdf/src'), stages: ['dev'] },
      { find: '@ldesign/progress', replacement: resolve(__dirname, '../../../packages/progress/src'), stages: ['dev'] },
      { find: '@ldesign/qrcode', replacement: resolve(__dirname, '../../../packages/qrcode/src'), stages: ['dev'] },
      { find: '@ldesign/router', replacement: resolve(__dirname, '../../../packages/router/src'), stages: ['dev'] },
      { find: '@ldesign/shared', replacement: resolve(__dirname, '../../../packages/shared/src'), stages: ['dev'] },
      { find: '@ldesign/size', replacement: resolve(__dirname, '../../../packages/size/src'), stages: ['dev'] },
      { find: '@ldesign/store', replacement: resolve(__dirname, '../../../packages/store/src'), stages: ['dev'] },
      { find: '@ldesign/table', replacement: resolve(__dirname, '../../../packages/table/src'), stages: ['dev'] },
      { find: '@ldesign/template', replacement: resolve(__dirname, '../../../packages/template/src'), stages: ['dev'] },
      { find: '@ldesign/theme', replacement: resolve(__dirname, '../../../packages/theme/src'), stages: ['dev'] },
      { find: '@ldesign/tree', replacement: resolve(__dirname, '../../../packages/tree/src'), stages: ['dev'] },
      { find: '@ldesign/ui', replacement: resolve(__dirname, '../../../packages/ui/src'), stages: ['dev'] },
      { find: '@ldesign/video', replacement: resolve(__dirname, '../../../packages/video/src'), stages: ['dev'] },
      { find: '@ldesign/watermark', replacement: resolve(__dirname, '../../../packages/watermark/src'), stages: ['dev'] },
      { find: '@ldesign/websocket', replacement: resolve(__dirname, '../../../packages/websocket/src'), stages: ['dev'] },


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
})
