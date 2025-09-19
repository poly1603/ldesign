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
    esm: {
      dir: 'es',
      format: 'esm'
    },
    cjs: {
      dir: 'lib',
      format: 'cjs'
    }
    // 不包含 UMD 配置
  }

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
