/**
 * LDesign Web Components 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs'],
    sourcemap: true
  },

  // 生成类型声明文件
  dts: true,

  // 外部依赖
  external: ['lit'],

  // 清理输出目录
  clean: true,

  // 压缩代码
  minify: false
})
