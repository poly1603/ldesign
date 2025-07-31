import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import vue from 'rollup-plugin-vue'

const external = ['vue']

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false,
    declarationMap: false,
  }),
]

const vuePlugins = [
  vue(),
  ...plugins,
]

const createConfig = (input, output, format, includeVue = false) => ({
  input,
  output: {
    file: output,
    format,
    name: format === 'umd' ? 'LDesignDevice' : undefined,
    sourcemap: true,
    globals: {
      vue: 'Vue',
    },
  },
  external,
  plugins: includeVue ? vuePlugins : plugins,
})

export default defineConfig([
  // ESM build
  createConfig('src/index.ts', 'es/index.js', 'es'),
  createConfig('src/vue/index.ts', 'es/vue/index.js', 'es', true),
  
  // UMD build
  createConfig('src/index.ts', 'dist/index.js', 'umd'),
  createConfig('src/vue/index.ts', 'dist/vue/index.js', 'umd', true),
  
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'types/vue/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
])