import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // Vue 3 库类型支持
  libraryType: LibraryType.VUE3,

  // 基础配置
  root: process.cwd(),
  input: 'src/index.ts',
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
    '@ldesign/shared',
    '@ldesign/color'
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    '@ldesign/shared': 'LDesignShared',
    '@ldesign/color': 'LDesignColor'
  },

  // UMD 格式的库名称
  name: 'LDesignTheme'
})
