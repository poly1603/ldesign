import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 多入口配置 - 自动扫描 src 目录下的所有 TypeScript 文件
  input: ['src/**/*.ts'],

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'MixedLibrary' // UMD格式需要全局变量名
  },

  // 库类型 - 混合类型库
  libraryType: LibraryType.MIXED,

  // 打包器选择
  bundler: 'rollup',

  // UMD 构建配置 - 多入口项目也支持 UMD
  umd: {
    enabled: true,
    entry: 'src/index.ts', // 指定 UMD 入口文件
    name: 'MixedLibrary',
    forceMultiEntry: false, // 不强制多入口 UMD
    minify: false // 默认不压缩
  },

  // Babel 转换配置
  babel: {
    enabled: false, // 可以启用 Babel 转换
    targets: '> 1%, last 2 versions, not dead'
  },

  // Banner 和 Footer 配置
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

  // 样式配置
  style: {
    extract: true,        // 提取 CSS 到单独文件
    minimize: false,      // 默认不压缩 CSS
    autoprefixer: true,   // 自动添加浏览器前缀
    modules: false,       // 不使用 CSS Modules
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true
        }
      },
      sass: {
        enabled: false
      }
    }
  },

  // 外部依赖（不打包到输出中）
  external: [],

  // 性能配置
  performance: {
    treeshaking: true,
    minify: false, // 默认不压缩
    bundleAnalyzer: false
  },

  // 默认不压缩
  minify: false,

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})
