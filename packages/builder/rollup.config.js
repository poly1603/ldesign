/**
 * Rollup 配置文件
 * 
 * 为 @ldesign/builder 包提供 Rollup 打包配置
 * 支持多入口点、多格式输出、TypeScript 编译
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { dts } from 'rollup-plugin-dts'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 外部依赖 - 不打包到最终产物中
const external = [
  // Node.js 内置模块
  'node:path',
  'node:fs',
  'node:url',
  'node:process',
  'node:module',
  'path',
  'fs',
  'url',
  'process',
  'module',
  'os',
  'util',
  'events',
  'stream',
  'child_process',

  // 第三方依赖
  'rollup',
  'rolldown',
  'chalk',
  'commander',
  'ora',
  'fast-glob',
  'fs-extra',
  'glob',
  'gzip-size',
  'pretty-bytes',
  'tslib',
  'typescript',
  'jiti',
  'rimraf',

  // Rollup 插件
  '@rollup/plugin-babel',
  '@rollup/plugin-commonjs',
  '@rollup/plugin-json',
  '@rollup/plugin-node-resolve',
  '@rollup/plugin-replace',
  '@rollup/plugin-terser',
  '@rollup/plugin-typescript',
  '@rollup/plugin-alias',

  // Vue 相关
  '@vitejs/plugin-react',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx',
  '@vitejs/plugin-vue2',
  '@vitejs/plugin-vue2-jsx',
  '@vue/compiler-sfc',
  'unplugin-vue',
  'unplugin-vue-jsx',

  // 样式处理插件
  'rollup-plugin-dts',
  'rollup-plugin-esbuild',
  'rollup-plugin-filesize',
  'rollup-plugin-less',
  'rollup-plugin-livereload',
  'rollup-plugin-postcss',
  'rollup-plugin-sass',
  'rollup-plugin-serve',
  'rollup-plugin-stylus',
  'rollup-plugin-vue',

  // CSS 处理
  'autoprefixer',
  'clean-css',
  'postcss',
  'less',
  'cssnano',

  // 工作区依赖
  '@ldesign/kit'
]

// 基础插件配置
const basePlugins = [
  nodeResolve({
    preferBuiltins: true,
    exportConditions: ['node'],
    extensions: ['.ts', '.js', '.json']
  }),
  commonjs({
    include: /node_modules/,
    ignoreDynamicRequires: true
  }),
  json()
]

// TypeScript 插件配置
const createTypeScriptPlugin = (declarationDir) => typescript({
  tsconfig: './tsconfig.json',
  declaration: true,
  declarationDir,
  outDir: declarationDir,
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    'src/__tests__/**/*'
  ],
  compilerOptions: {
    declaration: true,
    declarationMap: true,
    outDir: declarationDir
  }
})

// 创建配置
const configs = []

// 主入口配置 - ESM 格式
configs.push({
  input: 'src/index.ts',
  external,
  plugins: [
    ...basePlugins,
    createTypeScriptPlugin('dist')
  ],
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    exports: 'named'
  }
})

// 主入口配置 - CJS 格式
configs.push({
  input: 'src/index.ts',
  external,
  plugins: [
    ...basePlugins,
    createTypeScriptPlugin('dist')
  ],
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  }
})

// CLI 入口配置 - ESM 格式
configs.push({
  input: 'src/cli/index.ts',
  external,
  plugins: [
    ...basePlugins,
    createTypeScriptPlugin('dist/cli')
  ],
  output: {
    file: 'dist/cli/index.js',
    format: 'es',
    sourcemap: true,
    exports: 'named'
  }
})

// CLI 入口配置 - CJS 格式
configs.push({
  input: 'src/cli/index.ts',
  external,
  plugins: [
    ...basePlugins,
    createTypeScriptPlugin('dist/cli')
  ],
  output: {
    file: 'dist/cli/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  }
})

// 类型声明文件配置 - 主入口
configs.push({
  input: 'src/index.ts',
  external,
  plugins: [dts()],
  output: {
    file: 'dist/index.d.ts',
    format: 'es'
  }
})

// 类型声明文件配置 - 主入口 CJS
configs.push({
  input: 'src/index.ts',
  external,
  plugins: [dts()],
  output: {
    file: 'dist/index.d.cts',
    format: 'es'
  }
})

// 类型声明文件配置 - CLI 入口
configs.push({
  input: 'src/cli/index.ts',
  external,
  plugins: [dts()],
  output: {
    file: 'dist/cli/index.d.ts',
    format: 'es'
  }
})

// 类型声明文件配置 - CLI 入口 CJS
configs.push({
  input: 'src/cli/index.ts',
  external,
  plugins: [dts()],
  output: {
    file: 'dist/cli/index.d.cts',
    format: 'es'
  }
})

export default defineConfig(configs)
