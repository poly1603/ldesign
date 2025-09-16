import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配�?- 使用 src/index.ts 作为入口
  input: ['src/**/*.ts'],

  libraryType: LibraryType.TYPESCRIPT,
  bundler: 'rolldown',

  output: {
    format: ['esm', 'cjs', 'umd'], // 输出完整的三种格式
    sourcemap: true,
    name: 'BasicTypescript' // UMD格式需要全局变量�?
  },

  // UMD 构建配置
  umd: {
    enabled: true,
    entry: 'src/index.ts',
    name: 'BasicTypescript',
    minify: false // 默认不压�?
  },

  // Babel 转换配置（可选）
  babel: {
    enabled: false, // 默认不启�?
    targets: 'defaults'
  },

  // Banner �?Footer 配置
  banner: {
    copyright: {
      owner: 'LDesign Team',
      license: 'MIT'
    },
    buildInfo: {
      version: true,
      buildTime: true
    }
  },

  typescript: {
    declaration: true
  },

  // 默认不压�?  minify: false,

  clean: true,

  // 打包后验证配�?  postBuildValidation: {
  enabled: false, // 暂时禁用，先测试基本打包
  testFramework: 'vitest',
  testPattern: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  timeout: 60000,
  failOnError: true,

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
    formats: ['esm', 'cjs'],
    validateTypes: true,
    validateStyles: false,
    validateSourceMaps: false
  }
})


