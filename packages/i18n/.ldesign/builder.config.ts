import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // 外部化Node.js特定模块，确保在浏览器环境中不会被打包
  external: [
    // Node.js 内置模块
    'fs', 'path', 'os', 'util', 'events', 'stream', 'crypto', 'http', 'https', 'url', 'buffer',
    'child_process', 'worker_threads', 'cluster', 'net', 'tls', 'dns', 'dgram', 'readline',
    'perf_hooks', 'timers', 'assert', 'zlib',
    // Node.js 现代导入方式
    'node:fs', 'node:path', 'node:os', 'node:util', 'node:events', 'node:stream', 'node:crypto',
    'node:http', 'node:https', 'node:url', 'node:buffer', 'node:child_process', 'node:worker_threads',
    'node:cluster', 'node:net', 'node:tls', 'node:dns', 'node:dgram', 'node:readline',
    'node:perf_hooks', 'node:timers', 'node:assert', 'node:zlib', 'node:fs/promises'
  ]
})
