import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  minify: false,
  external: [
    // 外部依赖，不打包进去
    'jiti',
    'commander',
    'inquirer',
    'chalk',
    'ora',
    'fs-extra',
    'glob',
    'cosmiconfig',
    'dotenv',
    'semver',
    'validate-npm-package-name',
    'execa',
    'listr2',
    'update-notifier'
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '#!/usr/bin/env node'
    };
  }
});
