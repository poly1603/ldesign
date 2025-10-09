import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件配置 - 排除 web 目录
  entry: ['src/**/*.ts', '!src/web/**/*'],

  // 输出配置
  outDir: 'dist',

  // 格式配置
  format: ['esm', 'cjs'],

  // 库类型 - TypeScript 库
  libraryType: 'typescript',

  // 禁用 UMD 构建
  umd: {
    enabled: false
  },

  // 生成类型定义文件
  dts: true,

  // 外部依赖（不打包进最终文件）
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

  // 构建选项
  clean: true,
  sourcemap: true,

  // 目标环境
  target: 'node18',

  // 平台
  platform: 'node',

  // 分包策略
  splitting: false,

  // 压缩配置
  minify: false,

  // 环境变量
  env: {
    NODE_ENV: 'production'
  },

  // 插件配置
  plugins: [],

  // 鏋勫缓閽╁瓙
  onSuccess: async () => {
    console.log('✅ CLI 构建完成')
  },

  // 禁用构建后验证（CLI 项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  }
})
