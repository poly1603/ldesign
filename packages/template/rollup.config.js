import { fileURLToPath } from 'node:url'
import { dirname, resolve as pathResolve } from 'node:path'
import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import vue from 'rollup-plugin-vue'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const external = (id) => {
  // 排除Vue相关的所有模块
  if (id === 'vue' || id.startsWith('vue/') || id.startsWith('@vue/')) {
    return true
  }

  // 排除jsx-runtime
  if (id.includes('jsx-runtime')) {
    return true
  }

  // 排除node_modules中的所有模块
  if (id.includes('node_modules')) {
    return true
  }

  return false
}

const plugins = [
  alias({
    entries: [
      { find: '@', replacement: pathResolve(__dirname, 'src') },
    ],
  }),
  resolve({
    preferBuiltins: false,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue'],
  }),
  commonjs(),
  vue({
    target: 'browser',
    preprocessStyles: true,
  }),
  esbuild({
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    sourceMap: true,
    target: 'es2020',
    jsx: 'automatic',
    jsxImportSource: 'vue',
    tsconfig: './tsconfig.json',
  }),
]

export default defineConfig([
  // Bundled ESM build for dist/ (browser usage)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins,
  },
  // Bundled Vue ESM build for dist/
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'dist/vue.js',
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins,
  },
  // Bundled CJS build for dist/
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins,
  },
  // Bundled Vue CJS build for dist/
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'dist/vue.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins,
  },
  // Modular ESM build for lib/ (preserving structure)
  {
    input: [
      'src/index.ts',
      'src/vue/index.ts',
      'src/core/index.ts',
      'src/utils/index.ts',
      'src/types/index.ts'
    ],
    output: {
      dir: 'lib',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js'
    },
    external,
    plugins,
  },
  // Modular CJS build for lib/
  {
    input: [
      'src/index.ts',
      'src/vue/index.ts',
      'src/core/index.ts',
      'src/utils/index.ts',
      'src/types/index.ts'
    ],
    output: {
      dir: 'lib',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].cjs',
      exports: 'named'
    },
    external,
    plugins,
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'types/index.d.ts',
      format: 'es',
    },
    external,
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: pathResolve(__dirname, 'src') },
        ],
      }),
      dts(),
    ],
  },
  // Vue type definitions
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'types/vue.d.ts',
      format: 'es',
    },
    external,
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: pathResolve(__dirname, 'src') },
        ],
      }),
      dts(),
    ],
  },
])
