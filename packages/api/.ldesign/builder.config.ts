import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd']
  },

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    entry: 'src/index-lib.ts', // 明确指定UMD入口文件
    fileName: 'index.js' // 去掉 .umd 后缀
  }

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
