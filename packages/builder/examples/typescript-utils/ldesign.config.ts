import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配�?  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'TypescriptUtils' // UMD格式需要全局变量�?
  },

  // 库类�?- TypeScript 工具�?
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

  // 外部依赖（不打包到输出中�?
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
  logLevel: 'info',

  // 打包后验证配�?  postBuildValidation: {
  enabled: false, // 暂时禁用，先测试基本打包
  testFramework: 'vitest',
  testPattern: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  timeout: 90000, // 增加超时时间，因为测试较�?    failOnError: true,

  environment: {
    tempDir: '.validation-temp',
    keepTempFiles: false,
    installDependencies: true,
    packageManager: 'pnpm'
  },

  reporting: {
    format: 'console',
    verbose: true,
    includePerformance: true,
    includeCoverage: false
  },

  scope: {
    formats: ['esm', 'cjs', 'umd'],
    validateTypes: true,
    validateStyles: false,
    validateSourceMaps: true
  }
})


