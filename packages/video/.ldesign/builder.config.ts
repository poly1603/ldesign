import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: {
    // 指定 TypeScript 配置文件
    tsconfig: './tsconfig.json',
    // 只为入口文件生成声明文件
    only: true,
    // 设置输出目录
    outDir: './dist'
  },

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
