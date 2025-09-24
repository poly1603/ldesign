import { defineConfig } from '@ldesign/builder'

/**
 * 开发环境专用配置
 * 优化开发体验，提升构建速度
 */
export default defineConfig({
  // 开发模式配置
  mode: 'development',

  // 快速构建，不生成类型声明文件
  dts: false,

  // 生成 source map 便于调试
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // 开发环境只构建 ESM 格式
  formats: ['esm'],

  // 外部依赖配置 - 开发环境优化
  external: [
    'vue',
    'lucide-vue-next',
    '@arco-design/color',
    'chroma-js',
    'tslib',
  ],

  // 全局变量配置
  globals: {
    'vue': 'Vue',
    'lucide-vue-next': 'LucideVueNext',
    '@arco-design/color': 'ArcoColor',
    'chroma-js': 'chroma',
  },

  // 开发环境日志级别
  logLevel: 'info',

  // 构建选项 - 开发环境优化
  build: {
    // 开发环境构建警告
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 只显示重要警告
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT')
          return
        if (warning.code === 'CIRCULAR_DEPENDENCY')
          return
        warn(warning)
      },
      // 优化 tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      // 开发环境不进行代码分割
      output: {
        manualChunks: undefined,
      },
    },
  },

  // 监听模式配置
  watch: {
    // 排除不需要监听的文件
    exclude: [
      'node_modules/**',
      'dist/**',
      'es/**',
      'lib/**',
      'coverage/**',
      '__tests__/**',
      'docs/**',
      '*.test.ts',
      '*.spec.ts',
    ],
    // 包含需要监听的文件
    include: [
      'src/**/*.ts',
      'src/**/*.vue',
      'src/**/*.less',
      'src/**/*.css',
    ],
    // 监听选项
    options: {
      // 忽略初始构建
      ignoreInitial: false,
      // 防抖延迟
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 10,
      },
    },
  },
})
