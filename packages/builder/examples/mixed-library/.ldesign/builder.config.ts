import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配置 - 使用主入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'], // 恢复完整格式支持
    sourcemap: true,
    name: 'MixedLibrary' // UMD格式需要全局变量�?
  },

  // 库类�?- 混合类型�?
  libraryType: LibraryType.MIXED,

  // 打包器选择
  bundler: 'rollup', // 恢复使用 Rollup 以支持完整功能

  // UMD 构建配置 - 恢复启用
  umd: {
    enabled: true, // 恢复启用 UMD
    entry: 'src/index.ts',
    name: 'MixedLibrary',
    forceMultiEntry: false,
    minify: false
  },

  // Babel 转换配置
  babel: {
    enabled: false, // 可以启用 Babel 转换
    targets: '> 1%, last 2 versions, not dead'
  },

  // Banner �?Footer 配置
  banner: {
    banner: '/*! Mixed Library - A comprehensive library with TypeScript and styles */',
    copyright: {
      owner: 'LDesign Team',
      year: 2024,
      license: 'MIT'
    },
    buildInfo: {
      version: true,
      buildTime: true,
      environment: true
    }
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

  // 样式配置 - 恢复完整样式支持
  style: {
    extract: true,        // 恢复 CSS 提取
    minimize: false,
    autoprefixer: true,   // 恢复自动前缀
    modules: false,
    preprocessor: {
      less: {
        enabled: true,    // 恢复 LESS 处理
        options: {
          javascriptEnabled: true
        }
      },
      sass: {
        enabled: false
      }
    }
  },

  // 外部依赖（不打包到输出中�?  external: [],

  // 性能配置
  performance: {
    treeshaking: true,
    minify: false, // 默认不压�?    bundleAnalyzer: false
  },

  // 默认不压�?  minify: false,

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})


