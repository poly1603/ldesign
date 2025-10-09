import { defineConfig } from 'tsup'

// 共享的外部依赖配置 - 优化为正则表达式以减少配置体积
const sharedExternal = [
  // Node.js 内置模块 - 使用正则匹配所有 node: 前缀
  /^node:/,
  'path',
  'fs',
  'events',
  'crypto',
  'url',
  'os',
  'assert',
  'worker_threads',
  'child_process',
  'util',

  // 第三方核心依赖
  'rollup',
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

  // Rollup 插件 - 使用正则匹配所有 @rollup/ 前缀
  /^@rollup\//,

  // Vue 相关 - 使用正则匹配
  /^@vitejs\//,
  /^@vue\//,
  /^unplugin-vue/,

  // 样式处理插件 - 使用正则匹配
  /^rollup-plugin-/,

  // 其他依赖
  'autoprefixer',
  'clean-css',
  'jiti',
  'less',
  'postcss',
  'rimraf',
  'vite',
  /^vite-plugin-/,
  /^acorn-/,
  'babel-preset-solid',
  'svelte'
]

// 共享的构建选项
const sharedBuildOptions = {
  target: 'node16' as const,
  platform: 'node' as const,
  bundle: true,
  tsconfig: 'tsconfig.json',
  minify: false,
  keepNames: true,
  treeshake: true, // 启用 tree-shaking
  esbuildOptions(options: any) {
    options.packages = 'external'
    // 减少警告
    options.logLevel = 'warning'
    options.logLimit = 0
    // 处理 import.meta 兼容性
    options.define = {
      'import.meta.url': 'undefined',
      'import.meta': 'undefined'
    }
    // 优化性能
    options.legalComments = 'none' // 移除法律注释以减小体积
    options.charset = 'utf8'
  }
}

// 共享的输出扩展名配置
const sharedOutExtension = ({ format }: { format: string }) => ({
  js: format === 'esm' ? '.js' : '.cjs'
})

export default defineConfig({
  // 打包所有 TypeScript 文件，但排除测试文件
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/__tests__/**', '!src/tests/**'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outExtension: sharedOutExtension,
  external: sharedExternal,
  ...sharedBuildOptions,
})


