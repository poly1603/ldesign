import { defineConfig } from 'tsup'

export default defineConfig([
  // 主库构建 - 纯 ESM
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    outDir: 'dist',
    external: ['simple-git'],
    treeshake: true,
    target: 'node18',
    platform: 'node',
    outExtension() {
      return {
        js: '.js',
      }
    },
  },
  // CLI 工具构建 - ESM
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: false,
    minify: false,
    splitting: false,
    outDir: 'bin',
    external: ['simple-git'],
    treeshake: true,
    target: 'node18',
    platform: 'node',
    outExtension() {
      return {
        js: '.js',
      }
    },
    esbuildOptions(options) {
      options.banner = {
        js: '#!/usr/bin/env node',
      }
    },
  },
])
