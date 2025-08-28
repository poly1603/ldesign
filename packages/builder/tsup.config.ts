import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件
  entry: {
    'index': 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'cli/commands/build': 'src/cli/commands/build.ts',
    'cli/commands/watch': 'src/cli/commands/watch.ts',
    'cli/commands/analyze': 'src/cli/commands/analyze.ts',
    'cli/commands/init': 'src/cli/commands/init.ts',
    'core/plugin-configurator': 'src/core/plugin-configurator.ts',
    'core/project-scanner': 'src/core/project-scanner.ts',
    'core/rollup-builder': 'src/core/rollup-builder.ts',
    'core/type-generator': 'src/core/type-generator.ts',
    'utils/index': 'src/utils/index.ts',
    'utils/logger': 'src/utils/logger.ts',
    'utils/config-loader': 'src/utils/config-loader.ts',
    'types/index': 'src/types/index.ts',
  },

  // 输出格式
  format: ['esm', 'cjs'],

  // 输出目录
  outDir: 'dist',

  // 生成类型声明文件
  dts: true,

  // 代码分割
  splitting: false,

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

  // 保持模块结构
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
  },
})
