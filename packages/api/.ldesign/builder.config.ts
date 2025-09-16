import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 关闭压缩，确保与你的配置一致
  minify: false,

  // 生成 source map
  sourcemap: true,

  // 暂时禁用清理功能来测试
  clean: false,

  // 外部依赖（不打包进最终产物）
  external: ['vue', '@ldesign/http'],

  // 输出配置：明确指定输出目录，确保与 package.json exports 字段一致
  output: {
    // ESM 格式输出到 es/ 目录
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', '!src/index-lib.ts']
    },
    // CommonJS 格式输出到 lib/ 目录
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: ['src/**/*.ts', '!src/index-lib.ts']
    },
    // UMD 格式输出到 dist/ 目录
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'LDesignApi',
      globals: {
        vue: 'Vue',
        '@ldesign/http': 'LDesignHttp',
      },
      input: 'src/index.ts'
    },
  },
})
