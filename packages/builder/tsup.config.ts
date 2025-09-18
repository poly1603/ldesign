import { defineConfig } from 'tsup'

// 共享的外部依赖配置
const sharedExternal = [
  // Node.js 内置模块
  'node:path',
  'node:fs',
  'node:url',
  'node:process',
  'node:module',
  'node:fs/promises',
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

  // 第三方依赖
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

  // Rollup 插件
  '@rollup/plugin-babel',
  '@rollup/plugin-commonjs',
  '@rollup/plugin-json',
  '@rollup/plugin-node-resolve',
  '@rollup/plugin-replace',
  '@rollup/plugin-terser',
  '@rollup/plugin-typescript',

  // Vue 相关
  '@vitejs/plugin-react',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx',
  '@vitejs/plugin-vue2',
  '@vitejs/plugin-vue2-jsx',
  '@vue/compiler-sfc',
  'unplugin-vue',
  'unplugin-vue-jsx',

  // 样式处理插件
  'rollup-plugin-esbuild',
  'rollup-plugin-filesize',
  'rollup-plugin-less',
  'rollup-plugin-livereload',
  'rollup-plugin-postcss',
  'rollup-plugin-sass',
  'rollup-plugin-serve',
  'rollup-plugin-stylus',
  'rollup-plugin-vue',
  'rollup-plugin-dts',

  // 其他依赖
  'autoprefixer',
  'clean-css',
  'jiti',
  'less',
  'postcss',
  'rimraf',
  'vite',
  'vite-plugin-dts',
  'acorn-jsx',
  'acorn-typescript',
  'babel-preset-solid',
  'rollup-plugin-svelte',
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
  esbuildOptions(options: any) {
    options.packages = 'external'
  }
}

// 共享的输出扩展名配置
const sharedOutExtension = ({ format }: { format: string }) => ({
  js: format === 'esm' ? '.js' : '.cjs'
})

export default defineConfig([
  // 主库构建
  {
    entry: [
      'src/**/*.ts',
      '!src/**/*.test.ts',
      '!src/**/*.spec.ts',
      '!src/__tests__/**/*',
      '!src/tests/**/*',
      // 过滤掉专门的 UMD 入口文件（如果存在）
      '!src/index-lib.ts',
      '!src/index-umd.ts',
      '!src/**/index-lib.ts',
      '!src/**/index-umd.ts'
    ],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outExtension: sharedOutExtension,
    external: sharedExternal,
    ...sharedBuildOptions,
  },
  // CLI 构建
  {
    entry: ['src/cli/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist/cli',
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    outExtension: sharedOutExtension,
    external: sharedExternal,
    ...sharedBuildOptions,
  }
])


