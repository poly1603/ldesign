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

  // 减少构建日志输出
  logLevel: 'error',

  // 优化构建配置
  rollupOptions: {
    // 抑制特定警告
    onwarn(warning, warn) {
      // 忽略空 chunk 警告
      if (warning.code === 'EMPTY_BUNDLE') return
      // 忽略循环依赖警告（如果不是关键的）
      if (warning.code === 'CIRCULAR_DEPENDENCY') return
      // 其他警告正常显示
      warn(warning)
    },
    output: {
      // 减少空 chunk 警告
      manualChunks: (id) => {
        // 将所有类型文件合并到一个 chunk 中，避免生成空 chunk
        if (id.includes('/types/') || id.endsWith('/types.ts')) {
          return undefined // 不生成单独的 chunk
        }
        return undefined
      }
    },
    // 忽略仅包含类型定义的模块
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
    // 外部化 Vue 相关依赖
    external: ['vue', '@vue/shared', '@vue/runtime-core', '@vue/reactivity']
  }

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
