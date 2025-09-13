import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 打包与调试
  minify: true,
  sourcemap: true,
  clean: true,

  // 外部依赖（不打包进最终产物）
  external: ['vue'],

  // 输出配置：使用布尔开关；true 使用默认配置，false/缺省跳过
  output: {
    esm: true,
    cjs: true,
    umd: {
      name: 'LDesignCache',
      globals: {
        vue: 'Vue',
      },
    },
  },
})
