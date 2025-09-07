import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 样式库入口 - 为兼容 Rolldown 使用 TypeScript 入口
  input: 'src/index.ts',

  // 输出配置 - 样式库主要输�?CSS，但需�?ESM 格式来处理样式导�?
  output: {
    format: ['esm', 'cjs', 'umd'],
    name: 'StyleLibrary',
    sourcemap: true
  },

  // 库类�?- 样式�?
  libraryType: LibraryType.TYPESCRIPT,

  // 打包器选择
  bundler: 'rollup', // 使用 Rollup 以支持完整功能

  // 样式配置 - Rolldown 兼容模式
  style: {
    extract: false,       // 禁用 CSS 提取以兼容 Rolldown
    minimize: false,      // 禁用 CSS 压缩
    autoprefixer: false,  // 禁用自动前缀
    modules: false,
    preprocessor: {
      less: {
        enabled: false,   // 禁用 LESS 处理
        options: {
          javascriptEnabled: true,
          modifyVars: {}
        }
      },
      sass: {
        enabled: false
      }
    },
    browserslist: [
      '> 1%',
      'last 2 versions',
      'not dead',
      'not ie 11'
    ]
  },

  // TypeScript 配置
  typescript: {
    declaration: true,
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true
  },

  // 外部依赖（样式库通常不需要外部依赖）
  external: [],

  // 性能配置
  performance: {
    treeshaking: false,   // CSS 不需�?Tree Shaking
    minify: true,         // 压缩输出
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})


