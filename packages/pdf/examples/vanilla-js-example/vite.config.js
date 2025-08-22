import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    // 代理配置（如果需要）
    proxy: {
      // '/api': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    },
    // HMR配置
    hmr: {
      overlay: true,
    },
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',

    // Rollup配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // 手动分块
        manualChunks: {
          'pdf-lib': ['pdfjs-dist'],
          'vendor': ['@ldesign/pdf'],
        },
        // 资源文件命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `styles/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        // JS文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },

    // Terser配置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 文件大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@styles': resolve(__dirname, 'styles'),
      '@assets': resolve(__dirname, 'assets'),
      '@ldesign/pdf': resolve(__dirname, '../../src'),
    },
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'pdfjs-dist',
      '@ldesign/pdf',
    ],
    exclude: [
      // 排除不需要预构建的依赖
    ],
  },

  // CSS配置
  css: {
    // CSS预处理器配置
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/variables.scss";`,
      },
    },
    // CSS模块化
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS配置
    postcss: {
      plugins: [
        // 可以添加autoprefixer等插件
      ],
    },
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  // ESBuild配置
  esbuild: {
    target: 'es2020',
    format: 'esm',
    platform: 'browser',
    // 移除console和debugger（生产环境）
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // 保留函数名（用于调试）
    keepNames: true,
  },

  // 预览服务器配置
  preview: {
    port: 3001,
    host: true,
    open: true,
    cors: true,
  },

  // 插件配置
  plugins: [
    // 可以添加自定义插件
    {
      name: 'pdf-viewer-plugin',
      configureServer(server) {
        // 开发服务器中间件
        server.middlewares.use('/api/health', (req, res, next) => {
          if (req.url === '/api/health') {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }))
          }
          else {
            next()
          }
        })
      },
      generateBundle(options, bundle) {
        // 构建时的钩子
        console.log('📦 Bundle generated with', Object.keys(bundle).length, 'files')
      },
    },
  ],

  // 实验性功能
  experimental: {
    // 启用实验性功能
  },

  // 日志级别
  logLevel: 'info',

  // 清除屏幕
  clearScreen: false,

  // 环境配置
  envDir: '.',
  envPrefix: 'VITE_',
})
