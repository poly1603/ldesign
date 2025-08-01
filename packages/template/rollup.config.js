import path from 'node:path'
import { fileURLToPath } from 'node:url'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { glob } from 'glob'
import dts from 'rollup-plugin-dts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const external = ['vue']

// 获取所有 TypeScript 文件作为入口点
function getInputFiles() {
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
  })

  const input = {}
  files.forEach((file) => {
    const name = path.relative('src', file).replace(/\.(ts|tsx)$/, '')
    input[name] = file
  })

  return input
}

// 通用插件配置
function getPlugins() {
  return [
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
    }),
    vue(),
    vueJsx(),
    nodeResolve({
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      jsx: 'preserve',
    }),
  ]
}

export default [
  // ESM 格式
  {
    input: getInputFiles(),
    output: {
      dir: 'es',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: getPlugins(),
  },

  // CommonJS 格式
  {
    input: getInputFiles(),
    output: {
      dir: 'lib',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: getPlugins(),
  },

  // UMD 格式
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'LDesignTemplate',
        sourcemap: true,
        globals: { vue: 'Vue' },
        exports: 'named',
      },
      {
        file: 'dist/index.min.js',
        format: 'umd',
        name: 'LDesignTemplate',
        sourcemap: true,
        globals: { vue: 'Vue' },
        exports: 'named',
        plugins: [terser()],
      },
    ],
    external,
    plugins: getPlugins(),
  },

  // 类型定义文件
  {
    input: getInputFiles(),
    output: {
      dir: 'types',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [dts()],
  },
]
