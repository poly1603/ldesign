import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配置
  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'TypescriptUtils' // UMD格式需要全局变量名
  },

  // 库类型 - TypeScript 工具库
  libraryType: LibraryType.TYPESCRIPT,

  // 打包器选择
  bundler: 'rollup',

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationDir: 'dist',
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true
  },

  // 外部依赖（不打包到输出中）
  external: [],

  // 性能配置
  performance: {
    treeshaking: true,    // 启用 Tree Shaking
    minify: true,         // 压缩代码
    bundleAnalyzer: false // 不显示分析器
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})
