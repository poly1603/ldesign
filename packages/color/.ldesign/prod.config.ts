import { defineConfig } from '@ldesign/builder'

/**
 * 生产环境专用配置
 * 优化包大小，确保最佳性能
 */
export default defineConfig({
  // 生产模式配置
  mode: 'production',

  // 生成类型声明文件
  dts: true,

  // 生产环境不生成 source map（减小包大小）
  sourcemap: false,

  // 清理输出目录
  clean: true,

  // 压缩代码
  minify: true,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true,
    fileName: 'index.js',
  },

  // 外部依赖配置 - 生产环境优化
  external: [
    'vue',
    'lucide-vue-next',
    '@arco-design/color',
    'chroma-js',
    'tslib',
    // Node.js 内置模块
    'node:fs',
    'node:path',
    'node:os',
    'node:util',
    'node:events',
    'node:stream',
    'node:crypto',
    'node:http',
    'node:https',
    'node:url',
    'node:buffer',
    'node:child_process',
    'node:worker_threads',
  ],

  // 全局变量配置
  globals: {
    'vue': 'Vue',
    'lucide-vue-next': 'LucideVueNext',
    '@arco-design/color': 'ArcoColor',
    'chroma-js': 'chroma',
  },

  // 生产环境静默日志
  logLevel: 'silent',

  // 构建选项 - 生产环境优化
  build: {
    // 生产环境构建警告
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 生产环境完全静默
      },
      // 激进的 tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        // 生产环境启用更激进的优化
        preset: 'smallest',
      },
      // 代码分割优化
      output: {
        manualChunks: (id) => {
          // Vue 相关代码分离
          if (id.includes('vue') || id.includes('/ui/') || id.includes('/composables/')) {
            return 'vue'
          }
          // 工具函数分离
          if (id.includes('/utils/')) {
            return 'utils'
          }
          // 核心功能
          if (id.includes('/core/')) {
            return 'core'
          }
          return 'index'
        },
        // 生产环境输出优化
        compact: true,
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          reservedNamesAsProps: false,
          symbols: true,
        },
      },
    },

    // 生产环境特定优化
    target: 'es2020',

    // 压缩选项
    minify: {
      // 使用 terser 进行更好的压缩
      terser: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
    },
  },
})
