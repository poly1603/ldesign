import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 基础配置
  root: process.cwd(),
  outDir: 'dist',

  // 入口文件
  entry: 'src/index.ts',

  // 输出格式：ESM、CJS、UMD
  formats: ['esm', 'cjs', 'umd'],

  // 库类型 - Vue 3 组件库
  libraryType: 'vue3',

  // 生成类型声明文件
  dts: true,

  // 生产环境压缩代码
  minify: true,

  // 生成 source map
  sourcemap: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@vue/shared'
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/runtime-dom': 'Vue',
    '@vue/shared': 'Vue'
  },

  // UMD 格式的库名称
  name: 'LDesignComponent',

  // Vue 特定配置
  vue: {
    // 处理 Vue SFC 文件
    preprocessStyles: true,
    cssCodeSplit: false,
    isProduction: true,
  },

  // CSS 处理配置
  css: {
    // 启用 CSS 处理
    extract: true,
    modules: false,
    preprocessor: 'less',
  },

  // 样式配置
  style: {
    extract: true,        // 提取 CSS
    minimize: true,       // 压缩 CSS
    autoprefixer: true,   // 自动添加前缀
    modules: false,
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true,
          modifyVars: {},
          globalVars: {
            // 可以在这里定义全局 LESS 变量
          }
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

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationDir: 'dist',
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true
  },

  // Banner 配置
  banner: {
    copyright: {
      owner: 'LDesign Team',
      year: 2025,
      license: 'MIT'
    },
    buildInfo: {
      version: true,
      buildTime: true,
      environment: true
    }
  },

  // 性能配置
  performance: {
    treeshaking: true,      // Tree Shaking
    minify: true,          // 代码压缩
    bundleAnalyzer: false  // 构建分析
  },

  // 构建控制
  clean: true,
  validate: true,
  validatorConfig: {
    checkDts: true,
    checkStyles: true,
    checkSourceMaps: true,
    maxFileSize: 2 * 1024 * 1024,    // 2MB
    maxTotalSize: 20 * 1024 * 1024   // 20MB
  }
})
