import { readFileSync } from 'node:fs'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
// import { visualizer } from 'rollup-plugin-visualizer'

// 读取 package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// 外部依赖
const external = [
  'vue',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/reactivity',
]

// 全局变量映射
const globals = {
  'vue': 'Vue',
  '@vue/runtime-core': 'Vue',
  '@vue/runtime-dom': 'Vue',
  '@vue/reactivity': 'Vue',
}

// 基础插件
const basePlugins = [
  replace({
    __VERSION__: JSON.stringify(pkg.version),
    __DEV__: 'false',
    preventAssignment: true,
  }),
  nodeResolve({
    preferBuiltins: false,
    browser: true,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist',
    rootDir: 'src',
    exclude: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*', 'e2e/**/*'],
  }),
]

// 开发版本插件
const devPlugins = [
  ...basePlugins,
  // visualizer({
  //   filename: 'dist/bundle-analysis.html',
  //   open: false,
  //   gzipSize: true
  // })
]

// 生产版本插件
const prodPlugins = [
  ...basePlugins,
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.debug'],
    },
    mangle: {
      reserved: ['Engine', 'createEngine'],
    },
  }),
]

export default defineConfig([
  // ES Module 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins: devPlugins,
  },

  // CommonJS 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    external,
    plugins: devPlugins,
  },

  // UMD 构建 (开发版)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/ldesign-engine.js',
      format: 'umd',
      name: 'LDesignEngine',
      sourcemap: true,
      globals,
    },
    external,
    plugins: devPlugins,
  },

  // UMD 构建 (生产版)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/ldesign-engine.min.js',
      format: 'umd',
      name: 'LDesignEngine',
      sourcemap: true,
      globals,
    },
    external,
    plugins: prodPlugins,
  },

  // Vue 适配器单独构建
  {
    input: 'src/vue/index.ts',
    output: [
      {
        file: 'dist/vue.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'lib/vue.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
    ],
    external: [...external, '@ldesign/engine'],
    plugins: devPlugins,
  },
])
