/**
 * @ldesign/kit 构建配置
 *
 * 使用 @ldesign/builder 作为构建工具，提供快速的 TypeScript 构建
 * 支持 ESM 和 CJS 双格式输出，以及类型声明生成
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsup'

// 读取 package.json 获取版本信息
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

/**
 * 需要单独构建的子模块列表
 * 这些模块可以独立导入使用
 */
const subModules = [
  'utils',
  'filesystem',
  'network',
  'process',
  'database',
  'logger',
  'config',
  'cache',
  'events',
  'validation',
  'git',
  'package',
  'ssl',
  'cli',
  'inquirer',
  'notification',
  'performance',
  'iconfont',
  'scaffold',
  'console',
  'project', // 新增的项目模块
]

/**
 * 主构建配置
 * 构建主入口文件
 */
const mainConfig = defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true, // 启用类型声明文件生成
  sourcemap: true,
  clean: false, // 因为要构建多个目标，所以不清理
  splitting: false, // 禁用代码分割以确保兼容性
  treeshake: true, // 启用树摇优化
  minify: false, // 库文件不压缩，便于调试
  target: 'es2020', // 目标 ES 版本
  platform: 'node', // Node.js 平台
  external: [
    // Node.js 内置模块
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
    'node:timers/promises',
    // 第三方依赖
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  banner: {
    js: `/**
 * @ldesign/kit v${pkg.version}
 * Node.js 开发工具库
 * (c) 2024 LDesign Team
 * Released under the MIT License
 */`,
  },
})

/**
 * 子模块构建配置
 * 为每个子模块生成独立的构建配置
 */
const subModuleConfigs = subModules.map(module =>
  defineConfig({
    entry: {
      index: `src/${module}/index.ts`,
    },
    format: ['esm', 'cjs'],
    outDir: `dist/${module}`,
    dts: true, // 启用类型声明文件生成
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    minify: false,
    target: 'es2020',
    platform: 'node',
    external: [
      // Node.js 内置模块
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
      'node:timers/promises',
      // 第三方依赖
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      // 内部模块互相引用
      '@ldesign/kit',
      '@ldesign/kit/*',
    ],
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    banner: {
      js: `/**
 * @ldesign/kit/${module} v${pkg.version}
 * Node.js 开发工具库 - ${module} 模块
 * (c) 2024 LDesign Team
 * Released under the MIT License
 */`,
    },
  }),
)

/**
 * 导出所有构建配置
 * 包括主模块和所有子模块的构建配置
 */
export default [mainConfig, ...subModuleConfigs]
