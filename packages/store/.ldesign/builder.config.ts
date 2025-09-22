import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 压缩代码
  minify: true,

  // 外部依赖配置
  external: [
    'vue',
    'pinia',
    'reflect-metadata',
    'ws',
    'node:events',
    'node:path',
    'node:fs',
    'node:util'
  ],

  // 全局变量配置
  globals: {
    'vue': 'Vue',
    'pinia': 'Pinia',
    'reflect-metadata': 'Reflect',
    'ws': 'WebSocket'
  },

  // 构建格式
  formats: ['esm', 'cjs', 'umd'],

  // 输出配置
  output: {
    // 禁用空chunk警告
    chunkFileNames: '[name]-[hash].js',
    // 禁用控制台警告
    onwarn: (warning, warn) => {
      // 忽略空chunk警告
      if (warning.code === 'EMPTY_BUNDLE') return
      // 忽略外部依赖警告
      if (warning.code === 'UNRESOLVED_IMPORT') return
      // 忽略globals警告
      if (warning.code === 'MISSING_GLOBAL_NAME') return
      warn(warning)
    }
  },

  // 构建选项
  build: {
    // 禁用构建警告
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 忽略node:events等Node.js内置模块的警告
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.startsWith('node:')) {
          return
        }
        // 忽略空chunk警告
        if (warning.code === 'EMPTY_BUNDLE') {
          return
        }
        // 忽略globals警告
        if (warning.code === 'MISSING_GLOBAL_NAME') {
          return
        }
        warn(warning)
      }
    }
  }
})
