import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'vue'
]

export default defineConfig([
  // ESM and CJS builds
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
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: [
      esbuild({
        target: 'es2020',
        tsconfig: 'tsconfig.json'
      })
    ]
  },
  // UMD build
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignEngine',
      globals: {
        vue: 'Vue'
      },
      sourcemap: true
    },
    plugins: [
      esbuild({
        target: 'es2020',
        tsconfig: 'tsconfig.json'
      })
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