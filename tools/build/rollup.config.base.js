import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { glob } from 'glob'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import postcss from 'rollup-plugin-postcss'
import VueJsx from 'unplugin-vue-jsx/rollup'
import Vue from 'unplugin-vue/rollup'

/**
 * 增强的 Rollup 配置创建器
 * 支持多入口点、多种输出格式、自动发现子模块
 *
 * @param {object} options - 配置选项
 * @param {string} options.packageName - 包的全局名称（必需）
 * @param {string} [options.packageDir] - 包目录路径，默认为当前工作目录
 * @param {Array} [options.external] - 外部依赖，默认包含 Vue 相关包
 * @param {Array} [options.plugins] - 额外的 Rollup 插件
 * @param {Array} [options.formats] - 输出格式，默认为 ['es', 'cjs', 'umd']
 * @param {boolean} [options.vue] - 是否启用 Vue 支持，默认为 true
 * @param {object} [options.globals] - 全局变量映射，默认包含 Vue 映射
 * @param {object} [options.entries] - 自定义入口点，默认自动发现
 * @param {string} [options.tsconfig] - TypeScript 配置文件路径
 */
export function createRollupConfig(options = {}) {
  // 必需参数检查
  if (!options.packageName) {
    throw new Error('packageName is required')
  }

  // 默认配置
  const defaultConfig = {
    packageDir: process.cwd(),
    external: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
    plugins: [],
    formats: ['es', 'cjs', 'umd'],
    vue: true,
    globals: {
      'vue': 'Vue',
      '@vue/runtime-core': 'Vue',
      '@vue/runtime-dom': 'Vue',
    },
    entries: null, // 自动发现
    tsconfig: null, // 默认使用 tsconfig.json
    globIgnore: [], // 自动发现时忽略的模式
  }

  // 合并配置，用户配置优先
  const {
    packageDir,
    external,
    plugins,
    formats,
    vue,
    packageName,
    globals,
    entries,
    tsconfig,
    globIgnore,
  } = {
    ...defaultConfig,
    ...options,
    // 对于数组类型，进行合并而不是覆盖
    external: [...defaultConfig.external, ...(options.external || [])],
    plugins: [...defaultConfig.plugins, ...(options.plugins || [])],
    globals: { ...defaultConfig.globals, ...(options.globals || {}) },
  }

  // 读取 package.json 获取包信息
  const packageJsonPath = resolve(packageDir, 'package.json')
  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found in ${packageDir}`)
  }

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const name
    = packageName || pkg.name?.replace('@ldesign/', '') || 'LDesignPackage'

  /**
   * 自动发现入口点
   * 支持主入口点和所有子目录中的 index.ts 文件
   */
  function discoverEntries() {
    if (entries) {
      return entries
    }

    const srcDir = resolve(packageDir, 'src')
    const discoveredEntries = {}

    // 主入口点
    const mainEntry = resolve(srcDir, 'index.ts')
    if (existsSync(mainEntry)) {
      discoveredEntries.index = mainEntry
    }

    // 查找所有子目录中的 index.ts 文件
    const subModules = glob.sync('**/index.ts', {
      cwd: srcDir,
      absolute: false,
      ignore: ['index.ts', ...globIgnore], // 排除根目录的 index.ts 和用户指定的模式
    })

    subModules.forEach((subModule) => {
      // 将路径转换为入口点名称
      // 例如：vue/index.ts -> vue/index, utils/index.ts -> utils/index
      const entryName = subModule.replace(/\.ts$/, '')
      const fullPath = resolve(srcDir, subModule)
      discoveredEntries[entryName] = fullPath
    })

    return discoveredEntries
  }

  const inputEntries = discoverEntries()

  // JavaScript 构建插件（不生成类型定义）
  const createJsPlugins = () => {
    const basePlugins = [
      nodeResolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      // 处理 CSS/LESS 文件
      postcss({
        extract: true,
        minimize: true,
        use: ['less'],
        extensions: ['.css', '.less'],
      }),
      // Vue 单文件组件支持
      vue
        ? Vue({
            include: [/\.vue$/],
            template: {
              compilerOptions: {
                isCustomElement: tag => tag.startsWith('router-'),
              },
            },
          })
        : null,

      // Vue JSX 支持
      vue
        ? VueJsx({
            include: [/\.[jt]sx$/],
          })
        : null,
      typescript({
        tsconfig: tsconfig || resolve(packageDir, 'tsconfig.json'),
        include: [/(\.tsx?|\.mts)(\?.*)?$/],
        declaration: false, // 不在 JS 构建中生成类型定义
        declarationMap: false, // 不生成声明映射文件
        rootDir: resolve(packageDir, 'src'),
        outDir: undefined, // 不设置 outDir，让 Rollup 处理输出
        noEmitOnError: false, // 即使有类型错误也继续构建
        filterRoot: resolve(packageDir, 'src'), // 只检查 src 目录
      }),
      ...plugins,
    ].filter(Boolean)

    // 如果启用 Vue 支持，添加 Babel JSX 处理
    if (vue) {
      basePlugins.push(
        babel({
          babelHelpers: 'bundled',
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          exclude: 'node_modules/**',
          presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
          plugins: [
            [
              '@vue/babel-plugin-jsx',
              {
                transformOn: true,
                mergeProps: false,
              },
            ],
          ],
        }),
      )
    }

    return basePlugins
  }

  // 类型定义构建插件
  const createDtsPlugins = () => [
    // 添加一个插件来忽略 CSS/LESS 文件
    {
      name: 'ignore-styles',
      resolveId(id) {
        if (
          id.endsWith('.css')
          || id.endsWith('.less')
          || id.endsWith('.scss')
          || id.endsWith('.sass')
        ) {
          return { id, external: true }
        }
        return null
      },
    },
    dts({
      tsconfig: tsconfig || resolve(packageDir, 'tsconfig.json'),
      respectExternal: true,
    }),
  ]

  const configs = []

  // ESM 格式配置 - 只生成 JavaScript 文件
  if (formats.includes('es')) {
    configs.push(
      defineConfig({
        input: inputEntries,
        output: {
          dir: 'esm',
          format: 'es',
          sourcemap: true,
          exports: 'named',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
        plugins: createJsPlugins(),
        onwarn(warning, warn) {
          // 忽略未使用的外部导入警告
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT')
            return
          // 忽略循环依赖警告（如果是已知的安全循环依赖）
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('vue/ssr.ts'))
            return
          warn(warning)
        },
      }),
    )
  }

  // CommonJS 格式配置 - 只生成 JavaScript 文件
  if (formats.includes('cjs')) {
    configs.push(
      defineConfig({
        input: inputEntries,
        output: {
          dir: 'cjs',
          format: 'cjs',
          sourcemap: true,
          exports: 'named',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
        plugins: createJsPlugins(),
        onwarn(warning, warn) {
          // 忽略未使用的外部导入警告
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT')
            return
          // 忽略循环依赖警告（如果是已知的安全循环依赖）
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('vue/ssr.ts'))
            return
          warn(warning)
        },
      }),
    )
  }

  // UMD 格式配置 - 生成未压缩和压缩版本
  if (formats.includes('umd')) {
    const mainEntry = inputEntries.index || Object.values(inputEntries)[0]
    if (mainEntry) {
      // UMD 未压缩版本
      configs.push(
        defineConfig({
          input: mainEntry,
          output: {
            file: 'dist/index.js',
            format: 'umd',
            name,
            sourcemap: true,
            inlineDynamicImports: true,
            globals: {
              vue: 'Vue',
              ...globals,
            },
          },
          external: [
            'vue',
            '@vue/runtime-core',
            '@vue/runtime-dom',
            ...external,
          ],
          plugins: createJsPlugins(),
          onwarn(warning, warn) {
            // 忽略未使用的外部导入警告
            if (warning.code === 'UNUSED_EXTERNAL_IMPORT')
              return
            // 忽略循环依赖警告
            if (warning.code === 'CIRCULAR_DEPENDENCY')
              return
            // 忽略混合导出警告
            if (warning.code === 'MIXED_EXPORTS')
              return
            // 忽略缺失全局变量警告
            if (warning.code === 'MISSING_GLOBAL_NAME')
              return
            // 忽略缺失 Node.js 内置模块 shims 警告
            if (warning.code === 'MISSING_NODE_BUILTINS')
              return
            warn(warning)
          },
        }),
      )

      // UMD 压缩版本
      configs.push(
        defineConfig({
          input: mainEntry,
          output: {
            file: 'dist/index.min.js',
            format: 'umd',
            name,
            sourcemap: true,
            plugins: [terser()],
            inlineDynamicImports: true,
            globals: {
              vue: 'Vue',
              ...globals,
            },
          },
          external: [
            'vue',
            '@vue/runtime-core',
            '@vue/runtime-dom',
            ...external,
          ],
          plugins: createJsPlugins(),
          onwarn(warning, warn) {
            // 忽略未使用的外部导入警告
            if (warning.code === 'UNUSED_EXTERNAL_IMPORT')
              return
            // 忽略循环依赖警告
            if (warning.code === 'CIRCULAR_DEPENDENCY')
              return
            // 忽略混合导出警告
            if (warning.code === 'MIXED_EXPORTS')
              return
            // 忽略缺失全局变量警告
            if (warning.code === 'MISSING_GLOBAL_NAME')
              return
            // 忽略缺失 Node.js 内置模块 shims 警告
            if (warning.code === 'MISSING_NODE_BUILTINS')
              return
            warn(warning)
          },
        }),
      )
    }
  }

  // 类型定义配置 - 统一生成到 types 目录
  configs.push(
    defineConfig({
      input: inputEntries,
      output: {
        dir: 'types',
        format: 'es',
        entryFileNames: '[name].d.ts',
        chunkFileNames: '[name].d.ts',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
      plugins: createDtsPlugins(),
    }),
  )

  return configs.length === 1 ? configs[0] : configs
}

export default createRollupConfig
