import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件配置 - 使用通配符模式
  input: ['src/**/*.ts'],

  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // 输出格式配置 - 暂时禁用UMD直到TypeScript错误修复
  output: {
    format: ['esm', 'cjs'],
    sourcemap: true
  },

  // UMD 构建配置 - 暂时禁用
  umd: {
    enabled: false
  },

  // 样式处理配置
  style: {
    extract: true,
    minimize: false,
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true
        }
      }
    }
  },

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
