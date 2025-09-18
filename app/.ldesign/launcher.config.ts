import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 使用 LDesign 预设，包含通用的构建优化和 polyfills
  launcher: {
    preset: 'ldesign',

    // 别名配置 - 只在开发阶段生效，构建时使用包的产物
    alias: {
      enabled: true,
      stages: ['dev'], // 只在 dev 阶段启用别名，build 和 preview 时使用构建产物
      ldesign: true, // 启用内置的 @ldesign 包别名
      polyfills: true, // 启用 Node.js polyfill 别名
      presets: ['ldesign', 'polyfills', 'common'], // 使用预设别名

      // 自定义别名映射 - 用户可以根据需要添加或修改
      custom: [
        // 示例：项目根目录别名
        { find: '@', replacement: './src' },

        // 示例：自定义 @ldesign 包别名（如果需要覆盖内置的）
        // { find: '@ldesign/http', replacement: '../packages/http/src' },
        // { find: '@ldesign/api', replacement: '../packages/api/src' },
        // { find: '@ldesign/ui', replacement: '../packages/ui/src' },

        // 用户可以在这里添加更多自定义别名...
      ]
    }
  },

  // 基础服务器配置
  server: {
    port: 3011,
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
