import { defineConfig } from '@ldesign/builder'

const isUmdOnly = process.argv.includes('umd') || process.argv.includes('-f') && process.argv.includes('umd')

export default defineConfig({
  // 单入口：UMD 使用专用入口避免代码分割，其它格式使用常规入口
  input: isUmdOnly ? 'src/index.umd.ts' : 'src/index.ts',
  root: process.cwd(),

  dts: true,
  sourcemap: true,
  minify: true,

  external: ['vue'],
  globals: {
    vue: 'Vue',
  },

  // 通过 Rollup 选项强制 UMD 不做代码分割
  rollupOptions: {
    output: {
      inlineDynamicImports: true,
      exports: 'named'
    }
  },

  // 输出目录与现有字段保持一致
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
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignRouter',
      sourcemap: true,
      minify: true,
    },
  },
})
