/**
 * Vue 3 组件库构建策略
 *
 * 为 Vue 3 组件库提供完整的构建策略，包括：
 * - Vue SFC 单文件组件编译
 * - TypeScript 支持
 * - 样式提取和处理
 * - 组件类型定义生成
 * - 插件式安装支持
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig } from '../../types/adapter'

/**
 * Vue 3 组件库构建策略
 */
export class Vue3Strategy implements ILibraryStrategy {
  readonly name = 'vue3'
  readonly supportedTypes: LibraryType[] = [LibraryType.VUE3]
  readonly priority = 10

  /**
   * 应用 Vue 3 策略
   */
  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    // 解析入口配置
    const resolvedInput = await this.resolveInputEntries(config)

    const unifiedConfig: UnifiedConfig = {
      input: resolvedInput,
      output: this.buildOutputConfig(config),
      plugins: await this.buildPlugins(config),
      external: this.buildExternals(config),
      treeshake: config.performance?.treeshaking !== false,
      onwarn: this.createWarningHandler()
    }

    return unifiedConfig
  }

  /**
   * 检查策略是否适用
   */
  isApplicable(config: BuilderConfig): boolean {
    return config.libraryType === LibraryType.VUE3
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<BuilderConfig> {
    return {
      libraryType: LibraryType.VUE3,
      output: {
        format: ['esm', 'cjs'],
        sourcemap: true
      },
      vue: {
        version: 3,
        jsx: {
          enabled: true
        },
        template: {
          precompile: true
        }
      },
      typescript: {
        declaration: true,
        declarationDir: 'dist',
        target: 'ES2020',
        module: 'ESNext',
        strict: true
      },
      style: {
        extract: true,
        minimize: true,
        autoprefixer: true
      },
      performance: {
        treeshaking: true,
        minify: true
      },
      external: ['vue']
    }
  }

  /**
   * 获取推荐插件
   */
  getRecommendedPlugins(config: BuilderConfig): any[] {
    const plugins = []

    // Vue SFC 插件
    plugins.push({
      name: 'rollup-plugin-vue',
      options: this.getVueOptions(config)
    })

    // TypeScript 插件
    plugins.push({
      name: '@rollup/plugin-typescript',
      options: this.getTypeScriptOptions(config)
    })

    // Node 解析插件
    plugins.push({
      name: '@rollup/plugin-node-resolve',
      options: {
        preferBuiltins: false,
        browser: true
      }
    })

    // CommonJS 插件
    plugins.push({
      name: '@rollup/plugin-commonjs',
      options: {}
    })

    // 样式处理插件
    if (config.style?.extract !== false) {
      plugins.push({
        name: 'rollup-plugin-postcss',
        options: this.getPostCSSOptions(config)
      })
    }

    // 代码压缩插件（生产模式）
    if (config.mode === 'production' && config.performance?.minify !== false) {
      plugins.push({
        name: '@rollup/plugin-terser',
        options: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          format: {
            comments: false
          }
        }
      })
    }

    return plugins
  }

  /**
   * 验证配置
   */
  validateConfig(config: BuilderConfig): any {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // 检查入口文件
    if (!config.input) {
      errors.push('Vue 3 策略需要指定入口文件')
    }

    // 检查 Vue 版本
    if (config.vue?.version && config.vue.version !== 3) {
      warnings.push('当前策略针对 Vue 3 优化，建议使用 Vue 3')
    }

    // 检查外部依赖
    if (Array.isArray(config.external) && !config.external.includes('vue')) {
      suggestions.push('建议将 Vue 添加到外部依赖中以减少包体积')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * 构建输出配置
   */
  private buildOutputConfig(config: BuilderConfig): any {
    const outputConfig = config.output || {}
    const formats = Array.isArray(outputConfig.format)
      ? outputConfig.format
      : [outputConfig.format || 'esm']

    return {
      dir: outputConfig.dir || 'dist',
      format: formats,
      sourcemap: outputConfig.sourcemap !== false,
      exports: 'named',
      globals: {
        vue: 'Vue',
        ...outputConfig.globals
      }
    }
  }

  /**
   * 构建插件配置
   */
  private async buildPlugins(config: BuilderConfig): Promise<any[]> {
    const plugins: any[] = []

    try {
      // Node 解析插件（第一个）
      const nodeResolve = await import('@rollup/plugin-node-resolve')
      plugins.push(nodeResolve.default({
        preferBuiltins: false,
        browser: true,
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.vue']
      }))

      // Vue SFC 插件（使用 unplugin-vue，兼容 Rollup）
      const { default: VuePlugin } = await import('unplugin-vue/rollup')
      plugins.push(VuePlugin(this.getVueOptions(config)))

      // 先用 TypeScript 插件处理纯 .ts 入口与模块（排除 Vue 虚拟模块）
      const { default: tsPlugin } = await import('@rollup/plugin-typescript')
      plugins.push({
        name: 'typescript',
        plugin: async () => tsPlugin({
          ...this.getTypeScriptOptions(config),
          include: ['src/**/*.ts', 'src/**/*.tsx'],
          exclude: ['**/*.vue', '**/*.vue?*', 'node_modules/**'],
          // 避免 @rollup/plugin-typescript 在缺失 rollup 顶层 sourcemap 时报错
          sourceMap: config.output?.sourcemap !== false
        } as any)
      })

      // 再用 Babel 去掉 TS 注解（特别是 Vue 虚拟模块）
      const { default: babel } = await import('@rollup/plugin-babel')
      plugins.push(babel({
        babelrc: false,
        configFile: false,
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        presets: [
          ['@babel/preset-typescript', { allowDeclareFields: true }]
        ],
        // 仅处理脚本相关文件与 vue 的 script 虚拟模块
        include: [
          /\.(ts|tsx|js|jsx)$/,
          /\?vue&type=script/,
        ],
        exclude: [
          /\?vue&type=style/,
          /\?vue&type=template/,
          /\.(css|less|scss|sass)$/
        ]
      }))

      // 再用 esbuild 做转译与最小化（兼容 Vue 虚拟模块）
      const { default: esbuild } = await import('rollup-plugin-esbuild')
      plugins.push(esbuild({
        include: /\.(ts|tsx|js|jsx)(\?|$)/,
        exclude: [/node_modules/],
        target: 'es2020',
        jsx: 'preserve',
        tsconfig: 'tsconfig.json',
        minify: config.performance?.minify !== false,
        sourceMap: config.output?.sourcemap !== false
      }))

      // CommonJS 插件
      const commonjs = await import('@rollup/plugin-commonjs')
      plugins.push(commonjs.default())

      // 样式处理插件（接收 vue SFC 的 style 虚拟模块）
      const postcss = await import('rollup-plugin-postcss')
      plugins.push(postcss.default({
        ...this.getPostCSSOptions(config),
        include: [
          /\.(css|less|scss|sass)$/,
          /\?vue&type=style/
        ]
      }))
    } catch (error) {
      console.error('插件加载失败:', error)
    }

    return plugins
  }

  /**
   * 构建外部依赖配置
   */
  private buildExternals(config: BuilderConfig): string[] {
    let externals: string[] = []

    if (Array.isArray(config.external)) {
      externals = [...config.external]
    } else if (typeof config.external === 'function') {
      // 如果是函数，我们只能添加 Vue 作为默认外部依赖
      externals = ['vue']
    } else {
      externals = []
    }

    // 确保 Vue 是外部依赖
    if (!externals.includes('vue')) {
      externals.push('vue')
    }

    return externals
  }

  /**
   * 获取 Vue 选项
   */
  private getVueOptions(config: BuilderConfig): any {
    const vueConfig = config.vue || {}

    return {
      include: /\.vue$/,
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag.startsWith('ld-')
        },
        ...vueConfig.template
      },
      ...vueConfig
    }
  }

  /**
   * 获取 TypeScript 选项
   */
  private getTypeScriptOptions(config: BuilderConfig): any {
    const tsConfig = config.typescript || {}

    return {
      target: tsConfig.target || 'ES2020',
      module: tsConfig.module || 'ESNext',
      declaration: tsConfig.declaration !== false,
      // declarationDir 将由 RollupAdapter 动态设置
      strict: tsConfig.strict !== false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      moduleResolution: 'node',
      resolveJsonModule: true,
      jsx: 'preserve',
      ...tsConfig
    }
  }

  /**
   * 获取 PostCSS 选项
   */
  private getPostCSSOptions(config: BuilderConfig): any {
    return {
      extract: config.style?.extract !== false,
      minimize: config.style?.minimize !== false,
      sourceMap: config.output?.sourcemap !== false,
      modules: config.style?.modules || false
    }
  }

  /**
   * 创建警告处理器
   */
  private createWarningHandler() {
    return (warning: any) => {
      // 忽略一些常见的无害警告
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }

      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return
      }

      console.warn(`Warning: ${warning.message}`)
    }
  }

  /**
   * 解析入口配置
   * - 若用户未传入 input，则将 src 下所有源文件作为入口（排除测试与声明文件）
   * - 若用户传入 glob 模式的数组，则解析为多入口
   * - 若用户传入单个文件或对象，则直接返回
   */
  private async resolveInputEntries(config: BuilderConfig): Promise<string | string[] | Record<string, string>> {
    // 如果没有提供input，自动扫描src目录
    if (!config.input) {
      return this.autoDiscoverEntries()
    }

    // 如果是字符串数组且包含glob模式，解析为多入口
    if (Array.isArray(config.input)) {
      return this.resolveGlobEntries(config.input)
    }

    // 其他情况直接返回用户配置
    return config.input
  }

  /**
   * 自动发现入口文件
   */
  private async autoDiscoverEntries(): Promise<string | Record<string, string>> {
    const { findFiles } = await import('../../utils/file-system')
    const { relative, extname } = await import('path')

    const files = await findFiles([
      'src/**/*.{ts,tsx,js,jsx,vue}'
    ], {
      cwd: process.cwd(),
      ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
    })

    if (files.length === 0) return 'src/index.ts'

    const entryMap: Record<string, string> = {}
    for (const abs of files) {
      const rel = relative(process.cwd(), abs)
      const relFromSrc = rel.replace(/^src[\\/]/, '')
      const noExt = relFromSrc.slice(0, relFromSrc.length - extname(relFromSrc).length)
      const key = noExt.replace(/\\/g, '/')
      entryMap[key] = abs
    }
    return entryMap
  }

  /**
   * 解析glob模式的入口配置
   */
  private async resolveGlobEntries(patterns: string[]): Promise<Record<string, string>> {
    const { findFiles } = await import('../../utils/file-system')
    const { relative, extname } = await import('path')

    const files = await findFiles(patterns, {
      cwd: process.cwd(),
      ignore: ['**/*.d.ts', '**/*.test.*', '**/*.spec.*', '**/__tests__/**']
    })

    if (files.length === 0) {
      throw new Error(`No files found matching patterns: ${patterns.join(', ')}`)
    }

    const entryMap: Record<string, string> = {}
    for (const abs of files) {
      const rel = relative(process.cwd(), abs)
      const relFromSrc = rel.replace(/^src[\\/]/, '')
      const noExt = relFromSrc.slice(0, relFromSrc.length - extname(relFromSrc).length)
      const key = noExt.replace(/\\/g, '/')
      entryMap[key] = abs
    }
    return entryMap
  }
}
