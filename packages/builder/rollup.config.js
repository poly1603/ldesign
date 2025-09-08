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
import { dirname, resolve, isAbsolute } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 外部依赖 - 将所有裸模块（非相对/绝对路径）与虚拟模块标记为 external，避免打包三方依赖
const external = (id) => {
  if (id.startsWith('\0')) return true // Rollup 虚拟模块
  if (id.includes('?commonjs-external')) return true // CommonJS 外部化虚拟模块
  // Windows 与 POSIX 的绝对路径判断
  const isAbs = isAbsolute(id) || /^[A-Za-z]:\\/.test(id) || id.startsWith('\\\\')
  const isSource = id.startsWith('src/') || id.startsWith('src\\')
  return !id.startsWith('.') && !isAbs && !isSource
}

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
    exports: 'named',
    inlineDynamicImports: true
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
    exports: 'named',
    inlineDynamicImports: true
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
    exports: 'named',
    inlineDynamicImports: true
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
    exports: 'named',
    inlineDynamicImports: true
  }
})





export default defineConfig(configs)
