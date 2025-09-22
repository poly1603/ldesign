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

  // 排除测试相关文件和类型声明文件
  exclude: [
    'src/test-setup.ts',
    'src/types/ldesign-engine.d.ts', // 纯类型声明文件，不需要编译
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/__tests__/**',
    '**/tests/**'
  ],

  // 外部依赖配置
  external: [
    'vue',
    // Node.js 内置模块在浏览器环境中应该被外部化
    /^node:/
  ],

  // 全局变量映射
  globals: {
    'vue': 'Vue'
  }

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
