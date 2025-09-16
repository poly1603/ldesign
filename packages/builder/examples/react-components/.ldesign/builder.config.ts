import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 多入口配�?- 自动扫描 src 目录下的所�?TypeScript �?React 文件
  input: ['src/**/*.ts', 'src/**/*.tsx'],

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'ReactComponents', // UMD格式需要全局变量�?
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  },

  // 库类�?- React 组件�?
  libraryType: 'react', // 使用 React 策略

  // 打包器选择
  bundler: 'rollup',

  // React 配置
  react: {
    jsx: {
      enabled: true,
      pragma: 'React.createElement',
      pragmaFrag: 'React.Fragment',
      runtime: 'classic' // �?'automatic'
    }
  },

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationDir: 'dist',
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true,
    jsx: 'react-jsx' // �?'react'
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
  external: ['react', 'react-dom', 'react/jsx-runtime'],



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


