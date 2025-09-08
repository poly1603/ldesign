const process = require('node:process')

export default {
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
    'vue-router',
    '@ldesign/shared',
    '@ldesign/template',
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    '@ldesign/shared': 'LDesignShared',
  },

  // UMD 格式的库名称
  name: 'LDesignRouter',
}
