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

/**
 * 创建基础的 Rollup 配置
 * @param {Object} options 配置选项
 * @param {string} options.packageDir 包目录路径
 * @param {string[]} options.external 外部依赖
 * @param {string} options.globalName UMD 全局变量名
 * @param {Object} options.globals UMD 全局变量映射
 * @param {boolean} options.vue 是否包含 Vue 支持
 * @returns {Array} Rollup 配置数组
 */
export function createRollupConfig(options = {}) {
  const {
    packageDir = process.cwd(),
    external = [],
    globalName = 'LDesignPackage',
    globals = {},
    vue = false
  } = options

  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const packagePath = path.resolve(__dirname, '..', packageDir)

  // 获取所有 TypeScript 文件作为入口点
  function getInputFiles() {
    const files = glob.sync('src/**/*.ts', {
      cwd: packagePath,
      ignore: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    })

    const input = {}
    files.forEach((file) => {
      const name = path.relative('src', file).replace(/\.ts$/, '')
      input[name] = path.resolve(packagePath, file)
    })

    return input
  }

  // 通用插件配置
  function getPlugins(format = 'es') {
    const plugins = [
      alias({
        entries: [
          { find: '@', replacement: path.resolve(packagePath, 'src') }
        ]
      }),
      nodeResolve({
        preferBuiltins: false,
        browser: format === 'umd'
      }),
      commonjs(),
      typescript({
        tsconfig: path.resolve(packagePath, 'tsconfig.json'),
        declaration: false,
        declarationMap: false,
        sourceMap: true
      })
    ]

    if (vue) {
      // 动态导入 Vue 插件
      try {
        const vuePlugin = require('@vitejs/plugin-vue')
        plugins.unshift(vuePlugin.default())
      } catch (e) {
        console.warn('Vue plugin not found, skipping...')
      }
    }

    return plugins
  }

  const configs = []

  // ESM 格式 - es/ 目录（保持目录结构）
  configs.push({
    input: getInputFiles(),
    output: {
      dir: path.resolve(packagePath, 'es'),
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external,
    plugins: getPlugins('es')
  })

  // CommonJS 格式 - lib/ 目录（保持目录结构）
  configs.push({
    input: getInputFiles(),
    output: {
      dir: path.resolve(packagePath, 'lib'),
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external,
    plugins: getPlugins('cjs')
  })

  // UMD 格式 - dist/ 目录（仅主入口文件）
  configs.push({
    input: path.resolve(packagePath, 'src/index.ts'),
    output: [
      {
        file: path.resolve(packagePath, 'dist/index.js'),
        format: 'umd',
        name: globalName,
        sourcemap: true,
        globals
      },
      {
        file: path.resolve(packagePath, 'dist/index.min.js'),
        format: 'umd',
        name: globalName,
        sourcemap: true,
        globals,
        plugins: [terser()]
      }
    ],
    external,
    plugins: getPlugins('umd')
  })

  // Vue 专用 UMD 构建（如果存在 vue 入口）
  const vueEntryPath = path.resolve(packagePath, 'src/vue/index.ts')
  try {
    const fs = require('fs')
    if (vue && fs.existsSync(vueEntryPath)) {
    configs.push({
      input: vueEntryPath,
      output: [
        {
          file: path.resolve(packagePath, 'dist/vue.js'),
          format: 'umd',
          name: `${globalName}Vue`,
          sourcemap: true,
          globals
        },
        {
          file: path.resolve(packagePath, 'dist/vue.min.js'),
          format: 'umd',
          name: `${globalName}Vue`,
          sourcemap: true,
          globals,
          plugins: [terser()]
        }
      ],
      external,
      plugins: getPlugins('umd')
    })
    }
  } catch (e) {
    // Vue 入口文件不存在，跳过
  }

  // 类型定义文件 - types/ 目录（保持目录结构）
  configs.push({
    input: getInputFiles(),
    output: {
      dir: path.resolve(packagePath, 'types'),
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external,
    plugins: [dts()]
  })

  // 向后兼容的类型定义文件 - dist/ 目录（仅主入口）
  configs.push({
    input: path.resolve(packagePath, 'src/index.ts'),
    output: {
      file: path.resolve(packagePath, 'dist/index.d.ts'),
      format: 'es'
    },
    external,
    plugins: [dts()]
  })

  return configs
}

export default createRollupConfig
