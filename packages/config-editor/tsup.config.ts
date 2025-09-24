/**
 * tsup 构建配置
 * 
 * 用于构建库文件和 CLI 工具
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from 'tsup'

export default defineConfig([
  // 主库构建配置
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    outDir: 'dist',
    external: ['vue', 'express', 'vite', 'fs', 'path', 'events', 'fs-extra', 'yaml'],
    splitting: false,
    treeshake: true,
    minify: false,
    target: 'node18',
    platform: 'node'
  },
  // CLI 工具构建配置
  {
    entry: ['src/cli.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist',
    external: ['express', 'vite'],
    splitting: false,
    treeshake: true,
    minify: false,
    target: 'node18',
    platform: 'node',
    banner: {
      js: '#!/usr/bin/env node'
    }
  },
  // 服务器构建配置
  {
    entry: ['src/server/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist/server',
    external: ['express', 'cors', 'multer', 'chokidar', 'fs-extra'],
    splitting: false,
    treeshake: true,
    minify: false,
    target: 'node18',
    platform: 'node'
  }
])
