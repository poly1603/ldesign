/**
 * @ldesign/kit 构建配置
 * 
 * 优化的构建配置，支持 ESM 和 CJS 双格式输出
 * 包含类型定义、源码映射和代码分割
 */

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true, // 生成类型定义文件
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2020',
  platform: 'node',
  // 保持 shebang 用于 CLI 工具
  shims: true,
  // 外部依赖
  external: [
    // Node.js 内置模块
    'fs',
    'fs/promises',
    'path',
    'crypto',
    'os',
    'child_process',
    'util',
    'stream',
    'stream/promises',
    'events',
    'url',
    'buffer',
    'zlib',
    'http',
    'https',
    'net',
    'tls',
    'readline',
    'perf_hooks',
    'worker_threads',
    'cluster',
    'dgram',
    'dns',
    'timers',
    'assert',
    'querystring',
    'string_decoder',
    'punycode',
    'v8',
    'vm',
    'tty',
    'domain',
    'process',
    // 第三方依赖 - 核心
    'chalk',
    'ora',
    'prompts',
    'figlet',
    'chalk-animation',
    'cli-progress',
    'node-notifier',
    'simple-git',
    'glob',
    // 第三方依赖 - 压缩
    'archiver',
    'tar',
    'yauzl',
    // 第三方依赖 - 网络
    'form-data',
    'node-fetch',
    'ws',
    // 第三方依赖 - 字体
    'svg2ttf',
    'ttf2eot',
    'ttf2woff',
    'ttf2woff2',
    'svgicons2svgfont',
    // 第三方依赖 - 工具
    'cac',
    'rimraf',
    'jiti',
    'json5',
    'vite',
    'rollup',
  ],
  // 钩子函数
  onSuccess: async () => {
    console.log('✅ @ldesign/kit 构建完成')
  },
  // 忽略文件
  ignoreWatch: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.turbo/**',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
})
