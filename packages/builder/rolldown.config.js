/**
 * Rolldown 配置文件
 * 
 * 为 @ldesign/builder 包提供 Rolldown 打包配置
 * 支持多入口点、多格式输出、TypeScript 编译
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { defineConfig } from 'rolldown'

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

// 创建多个配置以支持不同的入口和格式
const configs = []

// 主入口配置 - ESM 格式
configs.push({
  input: 'src/index.ts',
  external,
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    exports: 'named'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  // Rolldown 内置 TypeScript 支持
  typescript: {
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist'
  }
})

// 主入口配置 - CJS 格式
configs.push({
  input: 'src/index.ts',
  external,
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  typescript: {
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist'
  }
})

// CLI 入口配置 - ESM 格式
configs.push({
  input: 'src/cli/index.ts',
  external,
  output: {
    file: 'dist/cli/index.js',
    format: 'es',
    sourcemap: true,
    exports: 'named'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  typescript: {
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist/cli'
  }
})

// CLI 入口配置 - CJS 格式
configs.push({
  input: 'src/cli/index.ts',
  external,
  output: {
    file: 'dist/cli/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  typescript: {
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist/cli'
  }
})

export default defineConfig(configs)
