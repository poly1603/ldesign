import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { dts } from 'rollup-plugin-dts'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// 外部依赖
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'node:fs',
  'node:fs/promises',
  'node:path',
  'node:crypto',
  'node:os',
  'node:process',
  'node:child_process',
  'node:util',
  'node:stream',
  'node:events',
  'node:url',
  'node:buffer',
  'node:zlib',
  'node:http',
  'node:https',
  'node:net',
  'node:tls',
  'node:readline',
  'node:perf_hooks',
  'node:worker_threads',
  'node:cluster',
  'node:dgram',
  'node:dns',
  'node:timers',
  'node:timers/promises'
]

// 通用插件配置
const plugins = [
  nodeResolve({
    preferBuiltins: true,
    exportConditions: ['node']
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false
  })
]

// 主模块配置
const mainConfig = defineConfig({
  input: 'src/index.ts',
  external,
  plugins,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true
    }
  ]
})

// 子模块配置
const subModules = [
  'filesystem',
  'utils',
  'cache',
  'validation',
  // 'archive', // 暂时禁用，需要修复类型错误
  'git',
  'package',
  'ssl',
  'cli',
  'inquirer',
  'notification',
  'performance',
  'config',
  'database',
  'events',
  'logger',
  'network',
  'process',
  'builder'
]

const subModuleConfigs = subModules.map(module => defineConfig({
  input: `src/${module}/index.ts`,
  external,
  plugins,
  output: [
    {
      file: `dist/${module}/index.cjs`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    },
    {
      file: `dist/${module}/index.js`,
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true
    }
  ]
}))

// 类型声明文件配置
const dtsConfig = defineConfig({
  input: 'src/index.ts',
  external,
  plugins: [dts()],
  output: {
    file: pkg.types,
    format: 'es'
  }
})

// 子模块类型声明配置
const subModuleDtsConfigs = subModules.map(module => defineConfig({
  input: `src/${module}/index.ts`,
  external,
  plugins: [dts()],
  output: {
    file: `dist/${module}/index.d.ts`,
    format: 'es'
  }
}))

export default [
  mainConfig,
  ...subModuleConfigs,
  dtsConfig,
  ...subModuleDtsConfigs
]
