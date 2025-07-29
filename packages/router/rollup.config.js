import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'es/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  },
  // CJS build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
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
    external: ['vue-router', 'vue'],
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignRouter',
      globals: {
        'vue-router': 'VueRouter',
        vue: 'Vue'
      },
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  },
  // UMD minified build
  {
    input: 'src/index.ts',
    external: ['vue-router', 'vue'],
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'LDesignRouter',
      globals: {
        'vue-router': 'VueRouter',
        vue: 'Vue'
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
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'types/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
])