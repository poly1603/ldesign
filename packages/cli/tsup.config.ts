import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件
  entry: ['src/**/*.ts', '!src/web/**/*', '!src/**/*.test.ts', '!src/**/*.spec.ts'],

  // 输出格式 - 只使用 ESM，避免 import.meta 问题
  format: ['esm'],

  // 输出目录
  outDir: 'dist',

  // 生成类型定义文件
  dts: true,

  // 清理输出目录
  clean: true,

  // 分包策略
  splitting: false,

  // 源码映射
  sourcemap: true,

  // 不压缩（CLI 工具不需要压缩）
  minify: false,

  // 目标环境
  target: 'node16',

  // 平台
  platform: 'node',

  // 外部依赖
  external: [
    'express',
    'cors',
    'ws',
    'chokidar',
    'open',
    'portfinder',
    'cac',
    'chalk'
  ],

  // 保持目录结构
  keepNames: true,

  // 环境变量
  env: {
    NODE_ENV: 'production'
  },

  // 构建完成后的钩子
  onSuccess: async () => {
    console.log('✅ CLI 构建完成')
  }
})
