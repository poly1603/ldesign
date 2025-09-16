import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 入口文件配置
  input: 'src/index-core.ts',

  // 库类型
  libraryType: LibraryType.TYPESCRIPT,

  // 打包器选择
  bundler: 'rollup',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    name: 'LDesignCaptcha',
    sourcemap: true
  },

  // UMD 构建配置
  umd: {
    enabled: true,
    entry: 'src/index-core.ts',
    name: 'LDesignCaptcha',
    minify: true
  },

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationDir: 'es',
    target: 'ES2020',
    module: 'ESNext',
    strict: false,
    skipLibCheck: true,
    noImplicitAny: false,
    noImplicitReturns: false,
    noImplicitThis: false,
    strictNullChecks: false,
    strictFunctionTypes: false,
    strictBindCallApply: false,
    strictPropertyInitialization: false,
    noImplicitOverride: false
  },

  // 样式配置
  style: {
    extract: true,
    minimize: true,
    autoprefixer: true,
    modules: false,
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true,
          modifyVars: {}
        }
      }
    },
    browserslist: [
      '> 1%',
      'last 2 versions',
      'not dead',
      'not ie 11'
    ]
  },

  // 外部依赖
  external: [],

  // 全局变量映射（用于UMD格式）
  globals: {},

  // Banner 配置
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

  // 性能配置
  performance: {
    treeshaking: true,
    minify: true,
    bundleAnalyzer: false
  }
})
