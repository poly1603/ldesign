import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配置
  input: 'src/index.ts',
  // 库类型 - TypeScript 库
  libraryType: LibraryType.TYPESCRIPT,

  // 打包器选择
  bundler: 'rollup',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'ComplexLibraryExample'
  },

  // TypeScript 配置
  typescript: {
    declaration: true,
    target: 'ES2020',
    module: 'ESNext',
    strict: false,
    skipLibCheck: true
  },

  // 外部依赖（不打包到输出中）
  external: ['reflect-metadata'],

  // 性能配置
  performance: {
    treeshaking: true,
    minify: true,
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})
