/**
 * @ldesign/builder 配置文件 - TypeScript 工具库示例
 * 
 * 此配置展示如何为 TypeScript 工具库配置构建选项
 * 支持多入口、多格式输出和类型声明文件生成
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 输出配置
  output: {
    // 支持的格式：ESM、CJS、UMD
    format: ['esm', 'cjs', 'umd'],
    // 生成 source map
    sourcemap: true,
    // UMD 格式的全局变量名
    name: 'TypeScriptUtils',
    // 文件名模式
    fileName: '[name].[format].js',
    // ESM 格式配置
    esm: {
      preserveStructure: true, // 保持目录结构，支持按需引入
      dts: true
    },
    // CJS 格式配置
    cjs: {
      preserveStructure: true,
      dts: true
    },
    // UMD 格式配置
    umd: {
      input: 'src/index.ts', // UMD 只打包主入口
      dts: false // UMD 不需要单独的类型文件
    }
  },

  // 库类型
  libraryType: 'typescript',

  // 打包器选择
  bundler: 'rollup',

  // 生成类型声明文件
  dts: true,

  // TypeScript 配置
  typescript: {
    declaration: true,
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    skipLibCheck: true
  },

  // 外部依赖（工具库通常不需要外部依赖）
  external: [],

  // 全局变量映射（UMD 格式使用）
  globals: {},

  // 性能配置
  performance: {
    treeshaking: true,
    minify: false, // 开发阶段不压缩，便于调试
    bundleAnalyzer: false
  },

  // 清理输出目录
  clean: true,

  // 日志级别
  logLevel: 'info'
})
