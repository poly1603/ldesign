import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'
import alias from '@rollup/plugin-alias'
import { glob } from 'glob'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const external = ['vue', '@arco-design/color']

// 获取所有 TypeScript 文件作为入口点
function getInputFiles() {
  const files = glob.sync('src/**/*.ts', {
    ignore: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  })

  const input = {}
  files.forEach((file) => {
    const name = path.relative('src', file).replace(/\.ts$/, '')
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
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
    }),
  ]
}

export default defineConfig([
  // ESM 格式 - es/ 目录（保持目录结构）
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

  // CommonJS 格式 - lib/ 目录（保持目录结构）
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

  // UMD 格式 - dist/ 目录（仅主入口文件）
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'LDesignColor',
        sourcemap: true,
        globals: {
          'vue': 'Vue',
          '@arco-design/color': 'ArcoColor',
        },
      },
      {
        file: 'dist/index.min.js',
        format: 'umd',
        name: 'LDesignColor',
        sourcemap: true,
        globals: {
          'vue': 'Vue',
          '@arco-design/color': 'ArcoColor',
        },
        plugins: [terser()],
      },
    ],
    external,
    plugins: getPlugins(),
  },
  {
    input: 'src/vue/index.ts',
    output: [
      {
        file: 'dist/vue.js',
        format: 'umd',
        name: 'LDesignColorVue',
        sourcemap: true,
        globals: {
          'vue': 'Vue',
          '@arco-design/color': 'ArcoColor',
        },
      },
      {
        file: 'dist/vue.min.js',
        format: 'umd',
        name: 'LDesignColorVue',
        sourcemap: true,
        globals: {
          'vue': 'Vue',
          '@arco-design/color': 'ArcoColor',
        },
        plugins: [terser()],
      },
    ],
    external,
    plugins: getPlugins(),
  },

  // 类型定义文件 - types/ 目录（保持目录结构）
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

  // 向后兼容的类型定义文件 - dist/ 目录（仅主入口）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external,
    plugins: [dts()],
  },
  {
    input: 'src/vue/index.ts',
    output: {
      file: 'dist/vue.d.ts',
      format: 'es',
    },
    external,
    plugins: [dts()],
  },
])
