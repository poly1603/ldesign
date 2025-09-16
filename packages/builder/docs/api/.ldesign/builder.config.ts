import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs'], // 不需要 UMD，因为这是文档模块
    sourcemap: true,
    name: 'ApiDocs'
  },

  // 库类型
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
    treeshaking: true,
    minify: false, // 文档不需要压缩
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info',

  // 暂时不使用自定义插件
  // plugins: []
})
