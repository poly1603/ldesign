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

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js' // 去掉 .umd 后缀
  },

  // 外部依赖配置
  external: [
    'vue',
    'crypto-js',
    'node-forge',
    'tslib',
    'node:fs',
    'node:path',
    'node:os',
    'node:util',
    'node:events',
    'node:stream',
    'node:crypto',
    'node:http',
    'node:https',
    'node:url',
    'node:buffer',
    'node:child_process',
    'node:worker_threads'
],

  // 全局变量配置
  globals: {
    'vue': 'Vue',
    'crypto-js': 'CryptoJS',
    'node-forge': 'forge',
    'tslib': 'tslib'
},

  // 日志级别设置为 silent，只显示错误信息
  logLevel: 'silent',

  // 构建选项
  build: {
    // 禁用构建警告
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 完全静默，不输出任何警告
        return
      }
    }
  }
})