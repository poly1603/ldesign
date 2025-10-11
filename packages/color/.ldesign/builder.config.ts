import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 禁用构建后验证（库项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  },

  // 禁用性能监控
  performance: {
    enabled: false
  },

  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js', // 去掉 .umd 后缀
    name: 'LDesignColor', // UMD 全局变量名
  },

  // 外部依赖配置 - 优化 tree-shaking
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

  // 日志级别设置为 silent，只显示错误信息
  logLevel: 'silent',

  // 构建选项 - 优化性能
  build: {
    // 禁用构建警告
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 完全静默，不输出任何警告
      },
      // 优化 tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
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
      },
    },
  },
})
