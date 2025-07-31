import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 创建标准化的Rollup配置
 * @param {Object} options 配置选项
 * @param {string} options.packageDir 包目录路径
 * @param {string} options.packageName 包名称
 * @param {Object} options.external 外部依赖
 * @param {boolean} options.vue 是否支持Vue
 * @returns {Array} Rollup配置数组
 */
export function createBuildConfig(options = {}) {
  const {
    packageDir = process.cwd(),
    packageName,
    external = [],
    vue = false,
    analyze = false
  } = options

  // 读取package.json
  const pkg = JSON.parse(
    readFileSync(resolve(packageDir, 'package.json'), 'utf-8')
  )

  const name = packageName || pkg.name.replace('@ldesign/', '')
  const input = resolve(packageDir, 'src/index.ts')
  
  // 基础外部依赖
  const baseExternal = [
    'vue',
    'vue-demi',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@vue/reactivity',
    '@vue/shared',
    ...external
  ]

  // 基础插件
  const basePlugins = [
    nodeResolve({
      preferBuiltins: true,
      browser: false
    }),
    commonjs(),
    typescript({
      tsconfig: resolve(packageDir, 'tsconfig.json'),
      declaration: false,
      declarationMap: false
    })
  ]

  // Vue插件
  if (vue) {
    const { default: vuePlugin } = await import('@vitejs/plugin-vue')
    basePlugins.unshift(vuePlugin())
  }

  // 分析插件
  if (analyze) {
    basePlugins.push(
      visualizer({
        filename: resolve(packageDir, 'dist/stats.html'),
        open: true,
        gzipSize: true
      })
    )
  }

  const configs = []

  // ESM构建
  configs.push(
    defineConfig({
      input,
      external: baseExternal,
      plugins: basePlugins,
      output: {
        file: resolve(packageDir, 'dist/index.js'),
        format: 'es',
        sourcemap: true
      }
    })
  )

  // CJS构建
  configs.push(
    defineConfig({
      input,
      external: baseExternal,
      plugins: basePlugins,
      output: {
        file: resolve(packageDir, 'dist/index.cjs'),
        format: 'cjs',
        sourcemap: true,
        exports: 'auto'
      }
    })
  )

  // UMD构建（用于浏览器）
  configs.push(
    defineConfig({
      input,
      external: ['vue'],
      plugins: [
        ...basePlugins,
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        })
      ],
      output: {
        file: resolve(packageDir, `dist/${name}.umd.js`),
        format: 'umd',
        name: `LDesign${name.charAt(0).toUpperCase() + name.slice(1)}`,
        globals: {
          vue: 'Vue'
        },
        sourcemap: true
      }
    })
  )

  // 类型声明文件
  configs.push(
    defineConfig({
      input,
      external: baseExternal,
      plugins: [
        dts({
          tsconfig: resolve(packageDir, 'tsconfig.json'),
          rollupTypes: true
        })
      ],
      output: {
        file: resolve(packageDir, 'dist/index.d.ts'),
        format: 'es'
      }
    })
  )

  return configs
}

/**
 * 获取包的依赖信息
 * @param {string} packageDir 包目录
 * @returns {Object} 依赖信息
 */
export function getPackageDependencies(packageDir) {
  const pkg = JSON.parse(
    readFileSync(resolve(packageDir, 'package.json'), 'utf-8')
  )

  return {
    dependencies: Object.keys(pkg.dependencies || {}),
    peerDependencies: Object.keys(pkg.peerDependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {})
  }
}

/**
 * 创建包大小检查配置
 * @param {Object} options 配置选项
 * @returns {Object} 大小限制配置
 */
export function createSizeConfig(options = {}) {
  const {
    maxSize = '50kb',
    maxGzipSize = '20kb'
  } = options

  return {
    limit: maxSize,
    gzipLimit: maxGzipSize,
    track: [
      'dist/index.js',
      'dist/index.cjs',
      'dist/*.umd.js'
    ]
  }
}