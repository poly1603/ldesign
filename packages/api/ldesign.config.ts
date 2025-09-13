import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 关闭压缩，确保与你的配置一致
  minify: false,

  // 生成 source map
  sourcemap: true,

  // 启用清理功能，构建前删除旧产物（包含 CJS/lib 目录）
  clean: true,

  // 外部依赖（不打包进最终产物）
  external: ['vue', '@ldesign/http'],

  // 顶层 Banner/Footer：作用于所有构建产物

  // 输出配置：使用布尔开关；true 使用默认配置，false/缺省跳过
  output: {
    esm: true,
    cjs: true,
    umd: {
      name: 'LDesignApi',
      globals: {
        vue: 'Vue',
        '@ldesign/http': 'LDesignHttp',
      },
    },
  },
})
