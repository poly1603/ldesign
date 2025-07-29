import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'

const external = ['ua-parser-js', '@ldesign/engine']

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'es/index.js',
      format: 'es',
      sourcemap: true
    },
    external,
    plugins: [
      nodeResolve(),
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
    output: {
      file: 'cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external,
    plugins: [
      nodeResolve(),
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
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'LDesignDevice',
      sourcemap: true,
      globals: {
        'ua-parser-js': 'UAParser',
        '@ldesign/engine': 'LDesignEngine'
      }
    },
    external,
    plugins: [
      nodeResolve(),
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
    output: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'LDesignDevice',
      sourcemap: true,
      globals: {
        'ua-parser-js': 'UAParser',
        '@ldesign/engine': 'LDesignEngine'
      }
    },
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      terser()
    ]
  },
  // Types build
  {
    input: 'src/index.ts',
    output: {
      file: 'types/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  }
])