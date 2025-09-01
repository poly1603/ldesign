import { resolve } from 'node:path'
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'

const coreInput = 'src/index.ts'
const vueInput = 'src/adapt/vue/index.ts'
const external = ['vue', 'pdfjs-dist']

export default defineConfig([
  // Core ESM build
  {
    input: coreInput,
    external,
    output: {
      file: 'esm/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'esm',
        declaration: false,
      }),
    ],
  },
  // Vue ESM build
  {
    input: vueInput,
    external,
    output: {
      file: 'esm/adapt/vue/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'esm',
        declaration: false,
      }),
    ],
  },
  // Core CJS build
  {
    input: coreInput,
    external,
    output: {
      file: 'cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'cjs',
        declaration: false,
      }),
    ],
  },
  // Vue CJS build
  {
    input: vueInput,
    external,
    output: {
      file: 'cjs/adapt/vue/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'cjs',
        declaration: false,
      }),
    ],
  },
  // UMD build
  {
    input: coreInput,
    external: ['vue'],
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignPdf',
      sourcemap: true,
      globals: {
        vue: 'Vue',
      },
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
  },
  // Core Types
  {
    input: coreInput,
    output: {
      file: 'types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  // Vue Types
  {
    input: vueInput,
    output: {
      file: 'types/adapt/vue/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
])
