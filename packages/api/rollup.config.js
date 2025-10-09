import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const external = ['vue', 'react', '@ldesign/http', '@ldesign/engine']
const isProduction = process.env.NODE_ENV === 'production'

// 通用插件配置
const getPlugins = (declaration = false) => [
  resolve({
    preferBuiltins: false,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  }),
  commonjs({
    include: /node_modules/,
  }),
  typescript({
    tsconfig: './tsconfig.json',
    declaration,
    declarationDir: declaration ? 'dist' : undefined,
    outDir: 'dist',
    sourceMap: true,
    inlineSources: !isProduction,
  }),
  isProduction && terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
      drop_console: true,
      drop_debugger: true,
    },
    mangle: {
      safari10: true,
    },
    output: {
      comments: false,
    },
  }),
].filter(Boolean)

export default defineConfig([
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: getPlugins(true),
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
  // Vue build
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'dist/vue.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: getPlugins(false),
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
  // React build
  {
    input: 'src/react/index.ts',
    output: {
      file: 'dist/react.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: getPlugins(false),
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
  },
])
