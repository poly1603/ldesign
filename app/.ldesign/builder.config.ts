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

  // UMD 构建配置
  umd: {
    enabled: true,
    entry: 'src/index-lib.ts', // 明确指定 UMD 入口文件
    minify: true, // UMD版本启用压缩
    fileName: 'index.js' // 去掉 .umd 后缀
  },

  // 外部依赖配置
  external: [
    'vue',
    'vue-router',
    'pinia',
    'axios',
    'alova',
    'socket.io-client',
    // LDesign 包
    '@ldesign/api',
    '@ldesign/cache',
    '@ldesign/color',
    '@ldesign/crypto',
    '@ldesign/device',
    '@ldesign/engine',
    '@ldesign/http',
    '@ldesign/i18n',
    '@ldesign/kit',
    '@ldesign/router',
    '@ldesign/shared',
    '@ldesign/size',
    '@ldesign/store',
    '@ldesign/template',
    '@ldesign/webcomponent',
    // Node.js 内置模块
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
    'vue-router': 'VueRouter',
    'pinia': 'Pinia',
    'axios': 'axios',
    'alova': 'alova'
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
