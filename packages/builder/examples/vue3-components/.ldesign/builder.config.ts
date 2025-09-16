import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 多入口配�?- 自动扫描 src 目录下的所�?TypeScript �?Vue 文件
  input: 'src/index.ts', // Rolldown 兼容模式，只处理 TypeScript 文件

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'], // 输出完整格式
    sourcemap: true,
    name: 'Vue3Components', // UMD格式需要全局变量�?
    globals: {
      vue: 'Vue'
    }
  },

  // 库类�?- Vue 3 组件�?
  libraryType: LibraryType.VUE3,

  // 打包器选择
  bundler: 'rollup', // 使用 Rollup 以支持完整功能

  // Vue 配置 - Rolldown 兼容模式暂时禁用
  vue: {
    version: 3,
    jsx: {
      enabled: false, // 禁用 JSX 以兼容 Rolldown
      pragma: 'h',
      pragmaFrag: 'Fragment'
    },
    template: {
      precompile: false, // 禁用模板预编译
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
    extract: true,        // 提取 CSS 到单独文�?
    minimize: true,       // 压缩 CSS
    autoprefixer: true,   // 自动添加浏览器前缀
    modules: false,       // 不使�?CSS Modules
    preprocessor: {
      less: {
        enabled: false
      },
      sass: {
        enabled: false
      }
    }
  },

  // 外部依赖（不打包到输出中�?
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


