import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 基础配置
  root: process.cwd(),
  input: 'src/index.ts',

  // 生成类型声明文件
  dts: true,

  // 生产环境压缩代码
  minify: true,

  // 生成 source map
  sourcemap: true,

  // 外部依赖（不打包进最终产物）
  external: ['vue', '@ldesign/http'],

  // UMD 格式的全局变量映射
  globals: {
    vue: 'Vue',
    '@ldesign/http': 'LDesignHttp',
  },

  // 明确指定不同格式的输出目录，确保与 package.json 保持一致
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'LDesignApi',
      sourcemap: true,
      minify: true,
    },
  },
})
