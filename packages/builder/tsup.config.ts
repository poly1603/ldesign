import { defineConfig } from 'tsup'

// 基础库配置拆分为 ESM 与 CJS，避免 CJS 代码分割导致 Node 将 .cjs 识别为 ESM 的告警
const esmLibraryConfig = defineConfig({
  // 入口文件 - 打包所有核心 TypeScript 文件，排除测试文件
  entry: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/__tests__/**',
    '!src/tests/**/*.test.ts'
  ],

  // 仅输出 ESM，允许代码分割
  format: ['esm'],

  // 输出目录
  outDir: 'dist',

  // 生成类型声明文件
  dts: true,

  // 代码分割 - 启用以优化输出结构（仅对 ESM）
  splitting: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 保持目录结构
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs'
    }
  },

  // 外部依赖
  external: [
    // Node.js 内置模块
    'node:path',
    'node:fs',
    'node:url',
    'node:process',
    'node:module',

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
  ],

  // 目标环境
  target: 'node16',

  // 平台
  platform: 'node',

  // 保持模块结构 - 启用打包以减少文件数量
  bundle: true,

  // TypeScript 配置
  tsconfig: 'tsconfig.json',

  // 压缩代码（生产环境）
  minify: false,

  // 保持文件名
  keepNames: true,

  // 输出配置
  esbuildOptions(options) {
    options.packages = 'external'
    // 设置 chunk 文件输出到 chunks 目录
    options.chunkNames = 'chunks/[name]-[hash]'
  },
})

// CJS 库配置（禁用代码分割以避免 Node 警告）
const cjsLibraryConfig = defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/__tests__/**',
    '!src/tests/**/*.test.ts'
  ],
  format: ['cjs'],
  outDir: 'dist',
  dts: false, // DTS 已由 ESM 配置生成，避免重复
  splitting: false, // 关键：CJS 禁止代码分割，防止 .cjs 中出现 ESM 语法
  sourcemap: true,
  clean: false, // 避免清理掉 ESM 构建产物
  outExtension({ format }) {
    return { js: format === 'esm' ? '.js' : '.cjs' }
  },
  external: [
    'node:path',
    'node:fs',
    'node:url',
    'node:process',
    'node:module',
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
    '@rollup/plugin-babel',
    '@rollup/plugin-commonjs',
    '@rollup/plugin-json',
    '@rollup/plugin-node-resolve',
    '@rollup/plugin-replace',
    '@rollup/plugin-terser',
    '@rollup/plugin-typescript',
    '@vitejs/plugin-react',
    '@vue/compiler-sfc',
    'unplugin-vue',
    'unplugin-vue-jsx',
    'rollup-plugin-esbuild',
    'rollup-plugin-filesize',
    'rollup-plugin-less',
    'rollup-plugin-livereload',
    'rollup-plugin-postcss',
    'rollup-plugin-sass',
    'rollup-plugin-serve',
    'rollup-plugin-stylus',
    'rollup-plugin-vue',
  ],
  target: 'node16',
  platform: 'node',
  bundle: true,
  tsconfig: 'tsconfig.json',
  minify: false,
  keepNames: true,
  esbuildOptions(options) {
    options.packages = 'external'
    options.chunkNames = 'chunks/[name]-[hash]'
  },
})

// UMD 配置（用于浏览器和独立使用）
const umdConfig = defineConfig([
  // 非压缩版本
  {
    entry: { index: 'src/index.ts' },
    format: ['iife'],
    outDir: 'dist',
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false, // 不清理，避免删除其他配置的输出
    minify: false,
    globalName: 'LDesignBuilder',
    platform: 'neutral', // 适用于浏览器和 Node.js
    target: 'es2020',
    outExtension() {
      return { js: '.js' }
    },
    // 外部依赖 - 对于 UMD 构建，需要明确外部化 Node.js 内置模块
    external: [
      // Node.js 内置模块
      'node:path', 'node:fs', 'node:url', 'node:process', 'node:module',
      'path', 'fs', 'events', 'crypto', 'url', 'os', 'assert', 'worker_threads', 'child_process', 'util',

      // 第三方依赖
      'rollup', 'chalk', 'commander', 'ora', 'fast-glob', 'fs-extra', 'glob', 'gzip-size', 'pretty-bytes', 'tslib', 'typescript',

      // Rollup 插件
      '@rollup/plugin-babel', '@rollup/plugin-commonjs', '@rollup/plugin-json', '@rollup/plugin-node-resolve', '@rollup/plugin-replace', '@rollup/plugin-terser', '@rollup/plugin-typescript',

      // Vue 相关
      '@vitejs/plugin-react', '@vue/compiler-sfc', 'unplugin-vue', 'unplugin-vue-jsx',

      // 样式处理插件
      'rollup-plugin-esbuild', 'rollup-plugin-filesize', 'rollup-plugin-less', 'rollup-plugin-livereload', 'rollup-plugin-postcss', 'rollup-plugin-sass', 'rollup-plugin-serve', 'rollup-plugin-stylus', 'rollup-plugin-vue'
    ],
    esbuildOptions(options) {
      options.packages = 'external'
      options.footer = {
        js: '// UMD build for @ldesign/builder'
      }
    },
  },
  // 压缩版本
  {
    entry: { 'index.min': 'src/index.ts' },
    format: ['iife'],
    outDir: 'dist',
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: true,
    globalName: 'LDesignBuilder',
    platform: 'neutral',
    target: 'es2020',
    outExtension() {
      return { js: '.js' }
    },
    // 外部依赖 - 与非压缩版本相同
    external: [
      // Node.js 内置模块
      'node:path', 'node:fs', 'node:url', 'node:process', 'node:module',
      'path', 'fs', 'events', 'crypto', 'url', 'os', 'assert', 'worker_threads', 'child_process', 'util',

      // 第三方依赖
      'rollup', 'chalk', 'commander', 'ora', 'fast-glob', 'fs-extra', 'glob', 'gzip-size', 'pretty-bytes', 'tslib', 'typescript',

      // Rollup 插件
      '@rollup/plugin-babel', '@rollup/plugin-commonjs', '@rollup/plugin-json', '@rollup/plugin-node-resolve', '@rollup/plugin-replace', '@rollup/plugin-terser', '@rollup/plugin-typescript',

      // Vue 相关
      '@vitejs/plugin-react', '@vue/compiler-sfc', 'unplugin-vue', 'unplugin-vue-jsx',

      // 样式处理插件
      'rollup-plugin-esbuild', 'rollup-plugin-filesize', 'rollup-plugin-less', 'rollup-plugin-livereload', 'rollup-plugin-postcss', 'rollup-plugin-sass', 'rollup-plugin-serve', 'rollup-plugin-stylus', 'rollup-plugin-vue'
    ],
    esbuildOptions(options) {
      options.packages = 'external'
      options.footer = {
        js: '// Minified UMD build for @ldesign/builder'
      }
    },
  }
])

// 导出主配置（ESM + CJS + UMD 配置）
export default [esmLibraryConfig, cjsLibraryConfig, ...umdConfig]
