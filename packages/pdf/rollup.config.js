import { resolve } from 'node:path'
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
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
      nodeResolve({ browser: true, preferBuiltins: false }),
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
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      json(),
      postcss({
        extensions: ['.css', '.less'],
        extract: resolve(process.cwd(), 'esm/adapt/vue/index.css'),
        minimize: true,
        use: ['less'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'esm',
        declaration: false,
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx'],
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
        ],
        plugins: ['@vue/babel-plugin-jsx'],
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
      exports: 'named',
    },
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      json(),
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
      exports: 'named',
    },
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      json(),
      postcss({
        extensions: ['.css', '.less'],
        extract: resolve(process.cwd(), 'cjs/adapt/vue/index.css'),
        minimize: true,
        use: ['less'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        outDir: 'cjs',
        declaration: false,
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx'],
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
        ],
        plugins: ['@vue/babel-plugin-jsx'],
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
    external: [...external, /\.less$/, /\.css$/],
    output: {
      file: 'types/adapt/vue/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
])
