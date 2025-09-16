import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配置 - Rolldown 兼容模式
  input: 'src/index.ts',

  // 输出配置 - 简化版本
  output: {
    format: ['esm'], // 只输出 ESM 格式
    sourcemap: true,
    name: 'Vue3Components'
  },

  // 库类型 - Vue 3 组件库
  libraryType: LibraryType.VUE3,

  // 打包器选择
  bundler: 'rolldown',

  // Vue 配置 - 简化版本
  vue: {
    version: 3,
    jsx: {
      enabled: false, // 禁用 JSX
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
    declaration: false, // 禁用类型声明文件生成
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true
  },

  // 样式配置 - 禁用所有样式处理
  style: {
    extract: false,       // 禁用 CSS 提取
    minimize: false,      // 禁用 CSS 压缩
    autoprefixer: false,  // 禁用自动前缀
    modules: false,
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
    minify: false, // 禁用压缩
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})
