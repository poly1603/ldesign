import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 多入口配置 - 自动扫描 src 目录下的所有 TypeScript 和 Vue 文件
  input: ['src/**/*.ts', 'src/**/*.vue'],

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'Vue3Components', // UMD格式需要全局变量名
    globals: {
      vue: 'Vue'
    }
  },

  // 库类型 - Vue 3 组件库
  libraryType: LibraryType.VUE3,

  // 打包器选择
  bundler: 'rollup',

  // Vue 配置
  vue: {
    version: 3,
    jsx: {
      enabled: true,
      pragma: 'h',
      pragmaFrag: 'Fragment'
    },
    template: {
      precompile: true,
      optimizeSSR: false
    },
    style: {
      preprocessLang: 'css'
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
    minimize: true,       // 压缩 CSS
    autoprefixer: true,   // 自动添加浏览器前缀
    modules: false,       // 不使用 CSS Modules
    preprocessor: {
      less: {
        enabled: false
      },
      sass: {
        enabled: false
      }
    }
  },

  // 外部依赖（不打包到输出中）
  external: ['vue'],



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
