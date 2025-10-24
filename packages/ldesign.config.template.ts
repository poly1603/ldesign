/**
 * LDesign 包通用构建配置模板
 * 
 * 此配置适用于大多数 TypeScript 库包
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件（自动检测）
  input: 'src/index.ts',

  // 输出配置
  output: {
    // 支持多种格式
    format: ['esm', 'cjs', 'umd'],

    // ESM 输出到 es 目录
    esm: {
      dir: 'es',
      preserveStructure: true,
    },

    // CJS 输出到 lib 目录
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },

    // UMD 输出到 dist 目录
    umd: {
      dir: 'dist',
      name: 'LDesign', // 需要根据实际包名修改
    },
  },

  // 生成 TypeScript 声明文件
  dts: true,

  // 生成 sourcemap
  sourcemap: true,

  // 不压缩（让使用者决定）
  minify: false,

  // 构建前清理
  clean: true,

  // 外部依赖（不打包）
  external: [
    'vue',
    'react',
    'react-dom',
    /^@ldesign\//,
    /^lodash/,
  ],

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationMap: true,
  },
})


