/**
 * Rollup 配置 - 核心功能构建
 *
 * 仅构建核心功能，不包含 Vue 集成
 */

import { createRequire } from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

export default defineConfig([
  // ESM 构建
  {
    input: 'src/core-only.ts',
    output: {
      file: 'dist/core.esm.js',
      format: 'es',
      sourcemap: true,
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        rootDir: 'src',
        exclude: [
          'tests/**/*',
          'e2e/**/*',
          '**/*.test.ts',
          '**/*.spec.ts',
          'src/vue/**/*', // 排除 Vue 相关文件
        ],
      }),
    ],
  },

  // CommonJS 构建
  {
    input: 'src/core-only.ts',
    output: {
      file: 'dist/core.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        rootDir: 'src',
        exclude: [
          'tests/**/*',
          'e2e/**/*',
          '**/*.test.ts',
          '**/*.spec.ts',
          'src/vue/**/*', // 排除 Vue 相关文件
        ],
      }),
    ],
  },
])
