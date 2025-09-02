import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'esm/index.js',
      format: 'es',
      sourcemap: true
    },
    external: ['vue'],
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'types',
        rootDir: 'src'
      })
    ]
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external: ['vue'],
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json'
      })
    ]
  }
]
