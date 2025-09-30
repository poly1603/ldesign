/**
 * @ldesign/builder 配置文件
 *
 * 用于将 app 打包成 npm 包的配置
 * 支持将应用构建为可复用的组件库
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 输出配置 - npm 包构建输出到 npm-dist

  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（便于调试）
  minify: false,

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
