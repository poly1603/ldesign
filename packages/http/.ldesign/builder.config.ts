import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 生成 source map（生产环境可考虑关闭以减少体积）
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 启用代码压缩以减少包体积
  minify: true,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js', // 去掉 .umd 后缀
  },

  // 外部依赖配置
  external: [
    'vue',
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
    'node:worker_threads',
  ],

  // 全局变量配置
  globals: {
    vue: 'Vue',
  },

  // 日志级别设置为 silent，只显示错误信息
  logLevel: 'silent',

  // 构建选项
  build: {
    // 禁用构建警告
    rollupOptions: {
      onwarn: (_warning, _warn) => {
        // 完全静默，不输出任何警告

      },
      // 性能优化配置
      treeshake: {
        // 启用更激进的 tree-shaking
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        // 优化输出格式
        compact: true,
        // 启用更好的压缩
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
    },
  },
})
