/**
 * @ldesign/kit 简化构建配置
 * 
 * 为了解决复杂构建问题，暂时使用简化配置
 * 只构建主入口文件，子模块通过主入口导出
 */

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2020',
  platform: 'node',
  external: [
    // Node.js 内置模块
    'fs',
    'path',
    'crypto',
    'os',
    'child_process',
    'util',
    'stream',
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
    // 第三方依赖
    'chalk',
    'ora',
    'prompts',
    'figlet',
    'chalk-animation',
    'cli-progress',
    'node-notifier',
    'simple-git',
    'glob',
    'archiver',
    'tar',
    'yauzl',
    'form-data',
    'node-fetch',
    'ws',
    'svg2ttf',
    'ttf2eot',
    'ttf2woff',
    'ttf2woff2',
    'svgicons2svgfont',
    'cac',
    'rimraf',
    'jiti',
    'json5'
  ],
  onSuccess: async () => {
    console.log('✅ @ldesign/kit 构建成功')
  }
})
