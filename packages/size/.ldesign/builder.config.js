import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 基础配置
  root: process.cwd(),
  outDir: 'dist',
  
  // 库类型：Vue 3
  libraryType: 'vue3',
  
  // 输出格式：ESM、CJS
  formats: ['esm', 'cjs'],
  
  // 生成类型声明文件
  dts: true,
  
  // 生产环境压缩代码
  minify: true,
  
  // 生成 source map
  sourcemap: true,
  
  // 外部依赖（不打包进最终产物）
  external: [
    'vue'
  ],
  
  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue'
  },
  
  // UMD 格式的库名称
  name: 'LDesignSize'
})
