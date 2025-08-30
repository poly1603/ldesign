// import { defineConfig } from '@ldesign/builder'

export default {
  // 入口文件
  input: 'src/index.ts',

  // 输出目录
  outDir: 'dist',

  // 输出格式
  formats: ['esm', 'cjs', 'iife', 'umd'],

  // 生成类型声明文件
  dts: true,

  // 类型声明文件输出目录
  dtsDir: 'types',

  // 外部依赖（不会被打包）
  external: [
    // 例如: 'vue', 'react', 'lodash'
  ],

  // 全局变量映射（用于 IIFE 和 UMD 格式）
  globals: {
    // 例如: vue: 'Vue', react: 'React'
  },

  // 自定义插件配置
  plugins: [
    // 例如: { name: 'postcss', options: { ... } }
  ],

  // Rollup 配置选项
  rollupOptions: {
    // 自定义 Rollup 配置
  }
}
