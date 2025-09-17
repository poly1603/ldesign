import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 基础服务器配置
  server: {
    port: 3011,
    open: false,
    host: '0.0.0.0'
  },

  preview: {
    port: 8888,
    host: '0.0.0.0'  // 允许外部访问
  },

  // 🚀 构建优化配置
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 手动分包策略 - 基于实际使用的依赖
        manualChunks: (id) => {
          // Vue 核心
          if (id.includes('vue') && !id.includes('node_modules')) {
            return 'vue-core'
          }

          // Vue 生态系统
          if (id.includes('vue-router') || id.includes('pinia')) {
            return 'vue-ecosystem'
          }

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

          // LDesign 核心包
          if (id.includes('@ldesign/cache') || id.includes('@ldesign/i18n') || id.includes('@ldesign/router')) {
            return 'ldesign-core'
          }

          // LDesign 功能包
          if (id.includes('@ldesign/api') || id.includes('@ldesign/device') || id.includes('@ldesign/color')) {
            return 'ldesign-features'
          }

          // 大型第三方库
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },

        // 文件命名策略
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // 页面组件放在 pages 目录
            if (facadeModuleId.includes('/pages/') || facadeModuleId.includes('/views/')) {
              return 'pages/[name]-[hash].js'
            }
            // 组件放在 components 目录
            if (facadeModuleId.includes('/components/')) {
              return 'components/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        },

        // 入口文件命名
        entryFileNames: 'js/[name]-[hash].js',

        // 资源文件命名
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.names?.[0] || 'asset'
          const info = fileName.split('.')
          const ext = info[info.length - 1]

          // 图片资源
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(fileName)) {
            return 'images/[name]-[hash].[ext]'
          }

          // 字体资源
          if (/\.(woff2?|eot|ttf|otf)$/i.test(fileName)) {
            return 'fonts/[name]-[hash].[ext]'
          }

          // CSS 文件
          if (ext === 'css') {
            return 'css/[name]-[hash].[ext]'
          }

          // 其他资源
          return 'assets/[name]-[hash].[ext]'
        }
      },

      // 🚫 外部化 Node.js 内置模块，避免打包到浏览器代码中
      external: (id) => {
        // 只外部化真正的 Node.js 内置模块，不外部化 npm 包
        const nodeBuiltins = [
          'fs', 'path', 'os', 'util', 'stream', 'events',
          'node:fs', 'node:path', 'node:os', 'node:util', 'node:stream', 'node:events',
          'fs/promises', 'node:fs/promises',
          'chokidar', 'fsevents', 'readdirp', 'glob-parent', 'is-binary-path',
          'picomatch', 'fill-range', 'braces', 'micromatch'
        ]
        // 不外部化 crypto 和 node:crypto，让它们被 polyfill
        return nodeBuiltins.includes(id)
      }
    },

    // 暂时禁用压缩以便调试
    minify: false,

    // 代码分割阈值
    chunkSizeWarningLimit: 500,

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 生成 source map 用于调试
    sourcemap: true,

    // 输出目录
    outDir: 'dist',

    // 静态资源处理
    assetsDir: 'assets',

    // 内联资源大小限制（小于此大小的资源会被内联）
    assetsInlineLimit: 4096
  },

  // 🔧 环境变量和全局变量定义
  define: {
    // 定义全局变量，避免 process is not defined 错误
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify('v18.0.0'),
    'process.versions': JSON.stringify({ node: '18.0.0' }),
    'process.browser': true,
    'process.nextTick': 'setTimeout',
    'global': 'globalThis',
    '__DEV__': false,
    '__PROD__': true,
    // 提供 crypto 模块的浏览器 polyfill - 暂时禁用
    // 'crypto': 'globalThis.crypto'
  },

  // 基础代理配置 - 环境特定配置会覆盖这些设置
  proxy: {
    // API 服务代理
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Service': 'ldesign-api'
      }
    },

    // 静态资源代理
    assets: {
      target: 'http://localhost:9000',
      pathPrefix: '/assets'
    },

    // WebSocket 代理
    websocket: {
      target: 'http://localhost:8080',
      pathPrefix: '/ws'
    },

    // 全局代理配置
    global: {
      timeout: 10000,
      verbose: false,
      secure: false
    }
  },

  // 🛠️ 开发工具配置 - 简单启用/禁用（暂时禁用，等插件完善后启用）
  tools: {
    // 字体转换工具
    font: {
      enabled: false // 暂时禁用
    },

    // SVG 组件生成工具
    svg: {
      enabled: false // 暂时禁用
    },

    // 图片优化工具
    image: {
      enabled: false // 暂时禁用
    },

    // API 文档生成工具
    apiDocs: {
      enabled: false
    },

    // PWA 支持工具
    pwa: {
      enabled: false
    }
  },

  // 路径别名配置 - 无需手动写r函数，defineConfig会自动处理相对路径
  resolve: {
    alias: [
      // Map workspace Vue entrypoints for vite dep-scan
      { find: '@ldesign/api/vue', replacement: '../packages/api/src/vue' },
      { find: '@ldesign/crypto/vue', replacement: '../packages/crypto/src/vue' },
      { find: '@ldesign/http/vue', replacement: '../packages/http/src/vue' },
      { find: '@ldesign/size/vue', replacement: '../packages/size/src/vue' },
      { find: '@ldesign/i18n/vue', replacement: '../packages/i18n/src/vue' },
      { find: '@ldesign/router/vue', replacement: '../packages/router/src/vue' },
      { find: '@ldesign/device/vue', replacement: '../packages/device/src/vue' },
      { find: '@ldesign/color/vue', replacement: '../packages/color/src/vue' },
      { find: '@ldesign/cache/vue', replacement: '../packages/cache/src/vue' },
      { find: '@ldesign/cache', replacement: '../packages/cache/src' },
      { find: '@ldesign/engine/vue', replacement: '../packages/engine/src/vue' },
      { find: '@ldesign/chart/vue', replacement: '../packages/chart/src/vue' },
      { find: '@ldesign/store/vue', replacement: '../packages/store/src/vue' },
      // Map http root to source to avoid exports subpath issues - use exact match
      { find: /^@ldesign\/http$/, replacement: '../packages/http/src/index.ts' },
      { find: '@ldesign/color', replacement: '../packages/color/src' },

      // Node.js 模块浏览器 polyfill
      { find: /^crypto$/, replacement: 'crypto-js' },
      { find: /^node:crypto$/, replacement: 'crypto-js' },
      { find: /^node:process$/, replacement: 'process/browser' },

      { find: '@', replacement: './src' }
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
  },

  optimizeDeps: {
    exclude: ['alova', 'alova/GlobalFetch', 'axios']
  },



  // �🔧 Node.js polyfills 配置
  plugins: [
    // 添加一个简单的 process polyfill 插件
    {
      name: 'process-polyfill',
      config(config, { command }) {
        if (command === 'build') {
          config.define = config.define || {}
          // 更完整的 process polyfill
          Object.assign(config.define, {
            'process': JSON.stringify({
              env: { NODE_ENV: 'production' },
              platform: 'browser',
              version: 'v18.0.0',
              versions: { node: '18.0.0' },
              browser: true,
              nextTick: function (fn: any) { setTimeout(fn, 0) }
            }),
            'process.env': JSON.stringify({ NODE_ENV: 'production' }),
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.platform': JSON.stringify('browser'),
            'process.version': JSON.stringify('v18.0.0'),
            'process.versions': JSON.stringify({ node: '18.0.0' }),
            'process.browser': true,
            'global': 'globalThis'
          })
        }
      }
    },
    // 添加 crypto polyfill 插件
    {
      name: 'crypto-polyfill',
      config(config, { command }) {
        if (command === 'build') {
          // 添加 crypto 模块的 polyfill
          config.resolve = config.resolve || {}
          config.resolve.alias = config.resolve.alias || {}

          // 如果 alias 是数组，转换为对象
          if (Array.isArray(config.resolve.alias)) {
            const aliasObj: any = {}
            config.resolve.alias.forEach((item: any) => {
              if (typeof item === 'object' && item.find && item.replacement) {
                if (typeof item.find === 'string') {
                  aliasObj[item.find] = item.replacement
                }
              }
            })
            config.resolve.alias = aliasObj
          }

          // 添加 crypto polyfill
          ; (config.resolve.alias as any)['crypto'] = 'crypto-js'
        }
      }
    }
  ]
})
