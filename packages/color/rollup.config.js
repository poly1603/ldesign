import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'

const external = ['@ldesign/engine']

export default defineConfig([
  // ES Module and CommonJS builds
  {
    input: 'src/index.ts',
    external,
    output: [
      {
        file: 'es/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'cjs/index.js',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  },
  // UMD build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignColor',
      globals: {
        '@ldesign/engine': 'LDesignEngine'
      },
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      terser()
    ]
  },
  // Type definitions
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'types/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
])