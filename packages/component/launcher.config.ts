import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  // 项目基础信息
  projectName: '@ldesign/component',
  framework: 'vue',

  // 开发服务器配置
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
    cors: true,
    strictPort: false,
    hmr: {
      port: 3001
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
    cssTarget: 'chrome80',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    
    // 库模式配置
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignComponent',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    
    // Rollup 配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        },
        // 为 UMD 构建提供更好的文件名
        entryFileNames: '[name].[format].js',
        chunkFileNames: '[name]-[hash].[format].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    }
  },

  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types')
    },
    extensions: ['.ts', '.vue', '.js', '.json', '.less']
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `
          @import "@/styles/variables.less";
          @import "@/styles/mixins.less";
        `,
        modifyVars: {
          // 可以在这里覆盖 LESS 变量
        }
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // 插件配置
  plugins: [
    // Vue 插件会自动添加
  ],

  // 依赖优化
  optimizeDeps: {
    include: ['vue'],
    exclude: []
  },

  // 环境变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },

  // Launcher 特定配置
  launcher: {
    // 日志级别
    logLevel: 'info',
    
    // 自动重启
    autoRestart: true,
    
    // 钩子函数
    hooks: {
      beforeStart: async () => {
        console.log('🚀 Starting LDesign Component development server...')
      },
      afterBuild: async () => {
        console.log('📦 LDesign Component build completed!')
      }
    },
    
    // 开发工具
    devtools: {
      enabled: true,
      vueDevtools: true
    }
  },

  // 测试配置
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts']
  }
})
