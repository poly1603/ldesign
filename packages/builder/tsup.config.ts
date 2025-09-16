import { defineConfig } from 'tsup'

export default defineConfig([
  // 主库构建
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,

    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.js' : '.cjs'
      }
    },

    external: [
      // Node.js 内置模块
      'node:path',
      'node:fs',
      'node:url',
      'node:process',
      'node:module',
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
    ],

    target: 'node16',
    platform: 'node',
    bundle: true,
    tsconfig: 'tsconfig.json',
    minify: false,
    keepNames: true,

    esbuildOptions(options) {
      options.packages = 'external'
    },
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

    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.js' : '.cjs'
      }
    },

    external: [
      // Node.js 内置模块
      'node:path',
      'node:fs',
      'node:url',
      'node:process',
      'node:module',
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
    ],

    target: 'node16',
    platform: 'node',
    bundle: true,
    tsconfig: 'tsconfig.json',
    minify: false,
    keepNames: true,

    esbuildOptions(options) {
      options.packages = 'external'
    },
  }
])


