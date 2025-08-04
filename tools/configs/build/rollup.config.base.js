import path from 'node:path'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { glob } from 'glob'
import dts from 'rollup-plugin-dts'
import del from 'rollup-plugin-delete'
import postcss from 'rollup-plugin-postcss'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import autoprefixer from 'autoprefixer'

/**
 * 创建基础的 Rollup 配置
 * @param {object} options 配置选项
 * @param {string} [options.packageDir] 包目录路径
 * @param {string[]} [options.external] 外部依赖数组
 * @param {string} [options.globalName] UMD 全局变量名
 * @param {Record<string, string>} [options.globals] UMD 全局变量映射
 * @param {boolean} [options.vue] 是否启用 Vue 支持
 * @param {boolean} [options.includeUmd] 是否包含 UMD 构建（默认true）
 * @param {string[]} [options.formats] 指定构建格式 ['es', 'cjs', 'umd']
 * @returns {Array} Rollup 配置数组
 */
export function createRollupConfig(options = {}) {
  const {
    packageDir = process.cwd(),
    external = [],
    globalName = 'LDesignPackage',
    globals = {},
    vue = false,
    includeUmd = true,
    formats = ['es', 'cjs', 'umd'],
  } = options

  const packagePath = path.resolve(packageDir)

  // 获取所有入口文件（TypeScript、Vue 等）
  function getInputFiles() {
    const ignorePatterns = [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.test.vue',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
      'src/**/*.spec.vue',
      'src/**/*.d.ts' // 排除声明文件
    ]

    // 如果没有启用 Vue 支持，排除 Vue 相关文件
    if (!vue) {
      ignorePatterns.push('src/vue/**/*.ts', 'src/vue/**/*.tsx', 'src/vue/**/*.vue')
    }

    // 搜索所有支持的文件类型
    const filePatterns = ['src/**/*.ts', 'src/**/*.tsx']
    if (vue) {
      filePatterns.push('src/**/*.vue')
    }

    const allFiles = []
    filePatterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        cwd: packagePath,
        ignore: ignorePatterns,
      })
      allFiles.push(...files)
    })

    const input = {}
    allFiles.forEach((file) => {
      const name = path.relative('src', file).replace(/\.(ts|tsx|vue)$/, '')
      input[name] = path.resolve(packagePath, file)
    })

    return input
  }

  // 通用插件配置
  function getPlugins(format = 'es', isFirstBuild = false) {
    const plugins = []

    // 在第一次构建时清理旧的构建产物
    if (isFirstBuild) {
      plugins.push(
        del({
          targets: [
            path.resolve(packagePath, 'dist'),
            path.resolve(packagePath, 'es'),
            path.resolve(packagePath, 'lib'),
            path.resolve(packagePath, 'types'),
          ],
          verbose: false,
        })
      )
    }

    plugins.push(
      alias({
        entries: [
          { find: '@', replacement: path.resolve(packagePath, 'src') },
        ],
      }),
      nodeResolve({
        preferBuiltins: false,
        browser: format === 'umd',
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      }),
      commonjs(),
      // 处理样式文件
      postcss({
        extract: format === 'umd' ? path.resolve(packagePath, `dist/style.css`) : false,
        inject: format !== 'umd',
        minimize: format === 'umd',
        sourceMap: true,
        use: {
          less: {
            javascriptEnabled: true,
          },
          sass: {},
          stylus: {},
        },
        plugins: [
          autoprefixer(),
        ],
      }),
      // 环境变量替换
      replace({
        'process.env.NODE_ENV': JSON.stringify(format === 'umd' ? 'production' : 'development'),
        preventAssignment: true,
      }),
      typescript({
        tsconfig: path.resolve(packagePath, 'tsconfig.json'),
        declaration: false,
        declarationMap: false,
        sourceMap: true,
        exclude: ['**/*.vue'],
      })
    )

    // 如果启用了 Vue 支持，添加 Vue 插件
    if (vue) {
      plugins.push(
        // Vue 单文件组件支持
        vuePlugin({
          include: /\.vue$/,
          style: {
            postcssPlugins: [
              autoprefixer(),
            ],
          },
        }),
        // Vue JSX 支持
        vueJsxPlugin({
          include: /\.[jt]sx$/,
        })
      )
    } else {
      // 非 Vue 项目的 JSX 支持
      plugins.push(
        babel({
          babelHelpers: 'bundled',
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          presets: [
            ['@babel/preset-react', { runtime: 'automatic' }]
          ],
          exclude: ['node_modules/**', '**/*.d.ts'],
        })
      )
    }

    // 添加空chunk过滤器，减少构建警告
    plugins.push({
      name: 'empty-chunk-filter',
      generateBundle(_options, bundle) {
        // 删除空的chunk以减少警告
        Object.keys(bundle).forEach(fileName => {
          const chunk = bundle[fileName]
          if (chunk.type === 'chunk') {
            const code = chunk.code || ''
            const trimmedCode = code.trim()

            // 检查是否为空chunk
            const isEmpty = !trimmedCode ||
                           trimmedCode === 'export {};' ||
                           trimmedCode === 'export{};' ||
                           // 只包含sourcemap注释的文件
                           /^\/\/# sourceMappingURL=.*\.map\s*$/.test(trimmedCode) ||
                           // 只包含空行和sourcemap注释
                           /^\s*\/\/# sourceMappingURL=.*\.map\s*$/.test(trimmedCode)

            if (isEmpty) {
              delete bundle[fileName]
            }
          }
        })
      }
    })

    return plugins
  }

  const configs = []

  // ESM 格式 - es/ 目录（保持目录结构）
  if (formats.includes('es')) {
    configs.push({
      input: getInputFiles(),
      output: {
        dir: path.resolve(packagePath, 'es'),
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external,
      plugins: getPlugins('es', true), // 第一个构建，启用清理
      onwarn(warning, warn) {
        // 忽略空chunk警告
        if (warning.code === 'EMPTY_BUNDLE') {
          return
        }
        warn(warning)
      },
    })
  }

  // CommonJS 格式 - lib/ 目录（保持目录结构）
  if (formats.includes('cjs')) {
    configs.push({
      input: getInputFiles(),
      output: {
        dir: path.resolve(packagePath, 'lib'),
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external,
      plugins: getPlugins('cjs'),
      onwarn(warning, warn) {
        // 忽略空chunk警告
        if (warning.code === 'EMPTY_BUNDLE') {
          return
        }
        warn(warning)
      },
    })
  }

  // UMD 格式 - dist/ 目录（仅主入口文件，不使用代码分割）
  if (formats.includes('umd') && includeUmd) {
    configs.push({
      input: path.resolve(packagePath, 'src/index.ts'),
      output: [
        {
          file: path.resolve(packagePath, 'dist/index.js'),
          format: 'umd',
          name: globalName,
          sourcemap: true,
          globals,
          exports: 'named',
        },
        {
          file: path.resolve(packagePath, 'dist/index.min.js'),
          format: 'umd',
          name: globalName,
          sourcemap: true,
          globals,
          exports: 'named',
          plugins: [terser()],
        },
      ],
      external,
      plugins: [
        ...getPlugins('umd'),
        // 对于 UMD 构建，我们需要内联所有依赖
        {
          name: 'inline-dynamic-imports',
          generateBundle(_options, bundle) {
            // 将动态导入转换为静态导入以避免代码分割
            Object.keys(bundle).forEach(fileName => {
              const chunk = bundle[fileName]
              if (chunk.type === 'chunk' && chunk.isDynamicEntry) {
                chunk.isDynamicEntry = false
              }
            })
          }
        }
      ],
    })
  }

  // Vue 专用 UMD 构建（如果存在 vue 入口）
  const vueEntryPath = path.resolve(packagePath, 'src/vue/index.ts')
  try {
    const fs = require('node:fs')
    if (vue && fs.existsSync(vueEntryPath)) {
      configs.push({
        input: vueEntryPath,
        output: [
          {
            file: path.resolve(packagePath, 'dist/vue.js'),
            format: 'umd',
            name: `${globalName}Vue`,
            sourcemap: true,
            globals,
          },
          {
            file: path.resolve(packagePath, 'dist/vue.min.js'),
            format: 'umd',
            name: `${globalName}Vue`,
            sourcemap: true,
            globals,
            plugins: [terser()],
          },
        ],
        external,
        plugins: getPlugins('umd'),
      })
    }
  }
  catch (e) {
    // Vue 入口文件不存在，跳过
  }

  // 类型定义文件 - types/ 目录（保持目录结构）
  configs.push({
    input: getInputFiles(),
    output: {
      dir: path.resolve(packagePath, 'types'),
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [
      // 处理样式文件导入 - 对于类型声明文件，我们确实需要忽略样式文件
      {
        name: 'ignore-styles-for-dts',
        resolveId(id) {
          if (/\.(css|less|scss|sass|styl)(\?.*)?$/.test(id)) {
            return { id, external: true }
          }
          return null
        }
      },
      dts({
        respectExternal: true,
        compilerOptions: {
          preserveSymlinks: false,
        },
      })
    ],
  })

  // 向后兼容的类型定义文件 - dist/ 目录（仅主入口）
  configs.push({
    input: path.resolve(packagePath, 'src/index.ts'),
    output: {
      file: path.resolve(packagePath, 'dist/index.d.ts'),
      format: 'es',
    },
    external,
    plugins: [
      // 处理样式文件导入 - 对于类型声明文件，我们确实需要忽略样式文件
      {
        name: 'ignore-styles-for-dts',
        resolveId(id) {
          if (/\.(css|less|scss|sass|styl)(\?.*)?$/.test(id)) {
            return { id, external: true }
          }
          return null
        }
      },
      dts({
        respectExternal: true,
        compilerOptions: {
          preserveSymlinks: false,
        },
      })
    ],
  })

  return configs
}

export default createRollupConfig
