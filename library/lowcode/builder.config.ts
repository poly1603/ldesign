import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  entry: 'src/index.ts',
  formats: ['esm', 'cjs', 'umd'],
  output: {
    esm: 'es',
    cjs: 'lib',
    umd: 'dist'
  },
  external: [
    'vue',
    'pinia',
    '@ldesign/shared',
    '@vueuse/core'
  ],
  globals: {
    vue: 'Vue',
    pinia: 'Pinia'
  },
  dts: true,
  sourcemap: true,
  minify: {
    umd: true
  },
  vue: {
    target: 'vue3',
    style: {
      preprocessor: 'less'
    }
  },
  banner: {
    content: `/**
 * @ldesign/lowcode v1.0.0
 * (c) 2024 LDesign Team
 * @license MIT
 */`
  }
});


