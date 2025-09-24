import { defineConfig } from '../../packages/builder/dist/index.js'

export default defineConfig({
  // 入口文件配置
  entry: 'src/index.ts',

  // 输出配置
  outDir: 'dist',

  // 格式配置
  format: ['esm', 'cjs', 'umd'],

  // 生成类型定义文件
  dts: true,

  // 源码映射
  sourcemap: true,

  // 代码压缩
  minify: false,

  // 清空输出目录
  clean: true,

  // 外部依赖
  external: [
    'pdfjs-dist',
    'pdfjs-dist/build/pdf.worker.entry'
  ],

  // 全局变量映射（用于UMD格式）
  globalName: 'LDesignPDFReader',

  // 样式处理
  css: {
    extract: true,
    minimize: true
  },

  // 构建目标
  target: 'es2020',

  // 平台配置
  platform: 'browser',

  // 分包策略
  splitting: false,

  // 构建钩子
  onSuccess: async () => {
    console.log('✅ PDF Reader 构建成功!')
  }
})
