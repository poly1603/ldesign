import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))

const external = [
  'vue',
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
]

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 */`

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'es/index.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'es',
        rootDir: 'src',
        exclude: ['**/__tests__/**', '**/*.test.*', 'examples/**', 'docs/**']
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
      name: 'LDesignRouter',
      banner,
      sourcemap: true,
      exports: 'named',
      globals: {
        vue: 'Vue'
      }
    },
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
        exclude: ['**/__tests__/**', '**/*.test.*', 'examples/**', 'docs/**']
      })
    ]
  },
  // UMD minified build
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'LDesignRouter',
      banner,
      sourcemap: true,
      exports: 'named',
      globals: {
        vue: 'Vue'
      }
    },
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
        exclude: ['**/__tests__/**', '**/*.test.*', 'examples/**', 'docs/**']
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'es/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts({
        respectExternal: true
      })
    ],
    external
  }
])