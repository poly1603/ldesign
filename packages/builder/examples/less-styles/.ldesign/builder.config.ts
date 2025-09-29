/**
 * @ldesign/builder 配置文件 - Less 样式库示例
 * 
 * 此配置展示如何为 Less 样式库配置构建选项
 * 支持 Less 编译、CSS 提取、主题切换和样式优化
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.less',

  // 输出配置
  output: {
    // 输出 ESM 格式
    format: ['esm'],
    // 生成 source map
    sourcemap: true,
    // 文件名模式
    fileName: '[name].js'
  },

  // 库类型
  libraryType: 'style',

  // 打包器选择
  bundler: 'rollup',

  // 不生成类型声明文件（CSS 库不需要）
  dts: false,

  // 样式配置
  css: {
    // 提取 CSS 到单独文件
    extract: true,
    // 使用 Less 预处理器
    preprocessor: 'less',
    // 启用 CSS 模块（可选）
    modules: false,
    // PostCSS 配置
    postcss: {
      plugins: [
        // 自动添加浏览器前缀
        'autoprefixer',
        // CSS 压缩（生产环境）
        'cssnano'
      ]
    }
  },

  // Less 配置
  less: {
    // 数学计算模式
    math: 'always',
    // 启用内联 JavaScript
    javascriptEnabled: true,
    // 全局变量
    globalVars: {
      'primary-color': '#722ED1',
      'success-color': '#62cb62',
      'warning-color': '#f5c538',
      'error-color': '#e54848'
    },
    // 修改变量
    modifyVars: {
      // 可以在这里覆盖 Less 变量
    }
  },

  // 性能配置
  performance: {
    treeshaking: false, // CSS 不需要 tree shaking
    minify: true, // 压缩 CSS
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info',

  // 自定义插件配置
  plugins: [
    // 可以添加自定义的 Less/CSS 处理插件
  ]
})
