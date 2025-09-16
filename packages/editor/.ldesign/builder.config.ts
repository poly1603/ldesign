import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 基础配置
  root: process.cwd(),
  outDir: 'dist',

  // 输出格式：ESM、CJS、UMD
  formats: ['esm', 'cjs', 'umd'],

  // 生成类型声明文件
  dts: true,

  // 生产环境压缩代码
  minify: true,

  // 生成 source map
  sourcemap: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    'react',
    '@angular/core',
    '@ldesign/shared',
    'lodash-es'
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    'react': 'React',
    '@angular/core': 'ng.core',
    '@ldesign/shared': 'LDesignShared',
    'lodash-es': '_'
  },

  // UMD 格式的库名称
  name: 'LDesignEditor',

  // 启用样式处理
  css: true,

  // 多入口配置
  entries: {
    // 主入口
    index: 'src/index.ts',
    // 框架适配器
    'adapters/vue': 'src/adapters/vue.ts',
    'adapters/react': 'src/adapters/react.ts',
    'adapters/angular': 'src/adapters/angular.ts'
  }
})
