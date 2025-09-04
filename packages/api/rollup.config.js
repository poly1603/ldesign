import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const external = [
  'vue',
  '@ldesign/http',
  '@ldesign/engine'
]

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        outDir: 'dist'
      })
    ]
  },
  // Vue build
  {
    input: 'src/vue.ts',
    output: {
      file: 'dist/vue.js',
      format: 'es',
      sourcemap: true
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  }
])
