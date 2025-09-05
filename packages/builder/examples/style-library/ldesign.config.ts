import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 样式库入口 - 主要的样式文件
  input: 'src/index.less',

  // 输出配置 - 样式库主要输出 CSS，但需要 ESM 格式来处理样式导入
  output: {
    format: ['esm'],
    sourcemap: true
  },

  // 库类型 - 样式库
  libraryType: LibraryType.STYLE,

  // 打包器选择
  bundler: 'rollup',

  // 样式配置
  style: {
    extract: true,        // 提取 CSS 到单独文件
    minimize: true,       // 压缩 CSS
    autoprefixer: true,   // 自动添加浏览器前缀
    modules: false,       // 不使用 CSS Modules
    preprocessor: {
      less: {
        enabled: true,
        options: {
          // Less 编译选项
          javascriptEnabled: true,
          modifyVars: {
            // 可以在这里覆盖变量
          }
        }
      },
      sass: {
        enabled: false
      }
    },
    // 浏览器兼容性
    browserslist: [
      '> 1%',
      'last 2 versions',
      'not dead',
      'not ie 11'
    ]
  },

  // 外部依赖（样式库通常不需要外部依赖）
  external: [],

  // 性能配置
  performance: {
    treeshaking: false,   // CSS 不需要 Tree Shaking
    minify: true,         // 压缩输出
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})
