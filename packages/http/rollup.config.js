import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// 外部依赖，不打包进最终产物
const external = [
  'vue',
  'axios',
  'alova',
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

// 通用插件配置
const commonPlugins = [
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs(),
]

export default defineConfig([
  // 主包构建 - ESM 格式
  {
    input: {
      index: 'src/index.ts',
      vue: 'src/vue/index.ts',
    },
    external,
    output: {
      dir: 'es',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
      exports: 'named',
    },
    plugins: [
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        outDir: 'es',
      }),
    ],
  },
  
  // 主包构建 - UMD 格式（单入口）
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      sourcemap: true,
      name: 'LDesignHttp',
      globals: {
        vue: 'Vue',
        axios: 'axios',
        alova: 'alova',
      },
      exports: 'named',
    },
    plugins: [
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },

  // Vue 插件 - UMD 格式（单入口）
  {
    input: 'src/vue/index.ts',
    external,
    output: {
      file: 'dist/vue.umd.js',
      format: 'umd',
      sourcemap: true,
      name: 'LDesignHttpVue',
      globals: {
        vue: 'Vue',
        axios: 'axios',
        alova: 'alova',
      },
      exports: 'named',
    },
    plugins: [
      ...commonPlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },
  
  // TypeScript 声明文件
  {
    input: {
      index: 'src/index.ts',
      vue: 'src/vue/index.ts',
    },
    external,
    output: {
      dir: 'types',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].d.ts',
    },
    plugins: [
      dts({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
])
