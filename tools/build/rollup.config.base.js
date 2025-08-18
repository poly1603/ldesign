import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export function createRollupConfig(options = {}) {
  const {
    input = 'src/index.ts',
    outputDir = 'dist',
    packageName,
    external = [],
    plugins = [],
    formats = ['es', 'cjs', 'umd'],
    vue = false,
  } = options

  // 读取 package.json 获取包信息
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
  )
  const name =
    packageName || pkg.name?.replace('@ldesign/', '') || 'LDesignPackage'

  const createBasePlugins = outDir => [
    nodeResolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: outDir,
      rootDir: 'src',
      outDir: outDir,
    }),
    ...plugins,
  ]

  // 如果启用Vue支持，添加Vue JSX插件
  const addVueJsxPlugin = plugins => {
    if (vue) {
      try {
        const vueJsx = require('@vitejs/plugin-vue-jsx')
        plugins.splice(
          -1,
          0,
          vueJsx.default({
            transformOn: true,
            mergeProps: false,
          })
        )
      } catch (error) {
        console.warn('Vue JSX plugin not found, skipping...')
      }
    }
    return plugins
  }

  const configs = []

  if (formats.includes('es')) {
    configs.push(
      defineConfig({
        input,
        output: {
          dir: outputDir,
          format: 'es',
          sourcemap: true,
          entryFileNames: 'index.js',
          chunkFileNames: '[name]-[hash].js',
        },
        external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
        plugins: addVueJsxPlugin(createBasePlugins(outputDir)),
      })
    )
  }

  if (formats.includes('cjs')) {
    configs.push(
      defineConfig({
        input,
        output: {
          dir: 'lib',
          format: 'cjs',
          sourcemap: true,
          exports: 'auto',
          entryFileNames: 'index.js',
          chunkFileNames: '[name]-[hash].js',
        },
        external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
        plugins: addVueJsxPlugin(createBasePlugins('lib')),
      })
    )
  }

  if (formats.includes('umd')) {
    configs.push(
      defineConfig({
        input,
        output: {
          file: `${outputDir}/index.min.js`,
          format: 'umd',
          name,
          sourcemap: true,
          plugins: [terser()],
          inlineDynamicImports: true, // UMD 格式内联动态导入
          globals: {
            vue: 'Vue',
            ...options.globals,
          },
        },
        external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
        plugins: addVueJsxPlugin(createBasePlugins(outputDir)),
      })
    )
  }

  return configs.length === 1 ? configs[0] : configs
}

export default createRollupConfig
