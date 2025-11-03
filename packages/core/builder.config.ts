import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  
  output: {
    formats: ['esm', 'cjs', 'umd', 'dts'],
    esm: {
      dir: 'es',
      minify: false
    },
    cjs: {
      dir: 'lib',
      minify: false
    },
    umd: {
      dir: 'dist',
      name: 'LDesignCore',
      entry: 'src/index.ts',
      minify: true
    },
    dts: {
      dir: 'es',
      only: false
    }
  },

  external: [],

  bundler: 'rollup',

  sourcemap: true
})
