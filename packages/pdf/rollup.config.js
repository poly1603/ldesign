/**
 * Rollup配置文件
 * 用于构建高质量的PDF预览组件库
 */

import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

// 读取package.json获取版本信息
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

// 外部依赖，不打包进最终文件
const external = [
  'pdfjs-dist',
  'vue',
  'react',
  'react-dom',
  ...Object.keys(pkg.peerDependencies || {}),
]

// 基础插件配置
const plugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: false,
    declarationMap: false,
  }),
]

// 输出配置
const output = {
  banner: `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * 
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @homepage ${pkg.homepage}
 */`,
  exports: 'named',
}

export default [
  // 主包构建 - ESM格式
  {
    input: 'src/index.ts',
    output: {
      ...output,
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins,
  },

  // 主包构建 - CommonJS格式
  {
    input: 'src/index.ts',
    output: {
      ...output,
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external,
    plugins,
  },

  // Vue集成构建 - ESM格式
  {
    input: 'src/adapters/vue-adapter.ts',
    output: {
      ...output,
      file: 'dist/vue.esm.js',
      format: 'es',
      sourcemap: true,
    },
    external: [...external, '@ldesign/pdf'],
    plugins,
  },

  // Vue集成构建 - CommonJS格式
  {
    input: 'src/adapters/vue-adapter.ts',
    output: {
      ...output,
      file: 'dist/vue.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: [...external, '@ldesign/pdf'],
    plugins,
  },

  // 类型定义文件构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es',
    },
    external,
    plugins: [dts()],
  },

  // Vue适配器类型定义文件
  {
    input: 'src/adapters/vue-adapter.ts',
    output: {
      file: 'dist/types/vue.d.ts',
      format: 'es',
    },
    external: [...external, '@ldesign/pdf'],
    plugins: [dts()],
  },
]