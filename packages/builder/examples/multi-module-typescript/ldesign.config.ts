import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 多入口配�?- 自动扫描 src 目录下的所�?TypeScript 文件
  input: ['src/**/*.ts'],

  // 库类�?- TypeScript �?  libraryType: LibraryType.TYPESCRIPT,

  // 打包器选择
  bundler: 'rollup',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'MultiModuleTypescriptExample'
  },

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationDir: 'dist',
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true
  },

  // 外部依赖（不打包到输出中�?  external: [],

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


