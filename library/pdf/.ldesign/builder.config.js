import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 多入口点配置
  input: [
    'src/index.ts',           // 核心入口
    'src/adapt/vue/index.ts'  // Vue适配器入口
  ],
  
  // 输出配置
  output: {
    formats: ['esm', 'cjs', 'umd'],
    dir: 'dist'
  },
  
  // 外部依赖
  external: ['vue', 'pdfjs-dist'],
  
  // 全局变量映射
  globals: {
    vue: 'Vue',
    'pdfjs-dist': 'pdfjsLib'
  },
  
  // 类型声明
  dts: true,
  
  // 构建选项
  minify: true,
  sourcemap: true,
  clean: true
})
