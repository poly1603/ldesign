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

  // 排除测试文件和不需要的文件
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/test/**',
    '**/tests/**',
    '**/examples/**',
    '**/demo/**',
  ],

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
