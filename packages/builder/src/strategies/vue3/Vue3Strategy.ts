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
import { shouldMinify } from '../../utils/minify-processor'

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

    // DTS 文件复制插件（如果存在 types 目录）
    if (config.dts !== false) {
      plugins.push(this.createDtsCopyPlugin())
    }

    // 代码压缩插件（生产模式）
    if (shouldMinify(config)) {
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

    // 如果使用格式特定配置（output.esm, output.cjs, output.umd），直接返回
    if (outputConfig.esm || outputConfig.cjs || outputConfig.umd) {
      const result = { ...outputConfig }

      // 为每个输出格式添加 assetFileNames 配置
      if (result.esm && typeof result.esm === 'object') {
        result.esm = {
          ...result.esm,
          assetFileNames: '[name].[ext]',
          globals: {
            vue: 'Vue',
            ...result.esm.globals
          }
        }
      }

      if (result.cjs && typeof result.cjs === 'object') {
        result.cjs = {
          ...result.cjs,
          assetFileNames: '[name].[ext]',
          globals: {
            vue: 'Vue',
            ...result.cjs.globals
          }
        }
      }

      if (result.umd && typeof result.umd === 'object') {
        result.umd = {
          ...result.umd,
          assetFileNames: '[name].[ext]',
          globals: {
            vue: 'Vue',
            ...result.umd.globals
          }
        }
      }

      // 确保全局变量包含 Vue
      result.globals = {
        vue: 'Vue',
        ...result.globals
      }

      return result
    }

    // 否则使用传统的 format 数组配置
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
      // Vue TSX/JSX 支持（必须在 Vue SFC 插件之前）
      try {
        const { default: VueJsx } = await import('unplugin-vue-jsx/rollup')
        plugins.push(VueJsx({
          version: 3, // Vue 3
          optimize: config.mode === 'production'
        }))
      } catch (e) {
        // 如果未安装 JSX 插件，则跳过（仍然允许纯 Vue SFC 构建）
        console.warn('unplugin-vue-jsx 未安装，跳过 JSX/TSX 支持')
      }

      // Vue SFC 插件（使用 rollup-plugin-vue，更稳定）
      const VuePlugin = await import('rollup-plugin-vue')

      // 注册 TypeScript 支持以解决 "No fs option provided to compileScript" 错误
      try {
        const { registerTS } = await import('@vue/compiler-sfc')
        const typescript = await import('typescript')
        registerTS(() => typescript.default)
      } catch (error) {
        // 如果无法导入 TypeScript 或 @vue/compiler-sfc，继续执行
        console.warn('Failed to register TypeScript support for Vue SFC:', error)
      }

      plugins.push(VuePlugin.default({
        preprocessStyles: true,
        // 只处理 .vue 文件
        include: /\.vue$/,
        ...this.getVueOptions(config)
      }))

      // Node 解析插件
      const nodeResolve = await import('@rollup/plugin-node-resolve')
      plugins.push(nodeResolve.default({
        preferBuiltins: false,
        browser: true,
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.vue']
      }))

      // CommonJS 插件
      const commonjs = await import('@rollup/plugin-commonjs')
      plugins.push(commonjs.default())
      // esbuild 插件处理 TypeScript 和 JSX（保留 JSX 语法）
      const { default: esbuild } = await import('rollup-plugin-esbuild')
      plugins.push(esbuild({
        include: /\.(ts|tsx|js|jsx)$/,
        exclude: [/node_modules/],
        target: 'es2020',
        // 保留 JSX/TSX 以便后续由 Vue JSX 插件处理
        jsx: 'preserve',
        tsconfig: 'tsconfig.json',
        minify: shouldMinify(config),
        sourceMap: config.output?.sourcemap !== false
      }))

      // JSON 插件
      const json = await import('@rollup/plugin-json')
      plugins.push(json.default())

      // 样式处理插件（使用 rollup-plugin-styles，更好的 Vue SFC 支持）
      try {
        const Styles = await import('rollup-plugin-styles')
        plugins.push(Styles.default({
          mode: 'extract',
          modules: false,
          minimize: shouldMinify(config),
          namedExports: true,
          include: [
            '**/*.less',
            '**/*.css',
            '**/*.scss',
            '**/*.sass'
          ],
          url: {
            inline: false,
          },
          ...this.getStylesOptions(config)
        }))
      } catch (e) {
        // 如果 rollup-plugin-styles 不可用，回退到 postcss
        const postcss = await import('rollup-plugin-postcss')
        plugins.push(postcss.default({
          ...this.getPostCSSOptions(config),
          include: [
            /\.(css|less|scss|sass)$/,
            /\?vue&type=style/
          ]
        }))
      }
    } catch (error) {
      console.error('插件加载失败:', error)
    }

    // 添加 DTS 复制插件
    plugins.push(this.createDtsCopyPlugin())

    return plugins
  }

  /**
   * 构建外部依赖配置
   */
  private buildExternals(config: BuilderConfig): string[] | ((id: string) => boolean) {
    let externals: string[] = []

    if (Array.isArray(config.external)) {
      externals = [...config.external]
    } else if (typeof config.external === 'function') {
      // 如果是函数，直接返回
      return config.external
    } else {
      externals = []
    }

    // 确保 Vue 是外部依赖
    if (!externals.includes('vue')) {
      externals.push('vue')
    }

    // 添加 node_modules 排除规则
    return (id: string) => {
      // 排除 node_modules 中的所有模块
      if (id.includes('node_modules')) {
        return true
      }

      // 检查是否在外部依赖列表中
      return externals.some(ext => {
        return id === ext || id.startsWith(ext + '/')
      })
    }
  }

  /**
   * 获取 Vue 选项
   */
  private getVueOptions(config: BuilderConfig): any {
    const vueConfig = config.vue || {}

    return {
      include: /\.vue$/,
      exclude: /node_modules/,
      // 模板编译选项
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag.startsWith('ld-') || tag.startsWith('template-'),
          // 启用生产优化
          hoistStatic: config.mode === 'production',
          cacheHandlers: config.mode === 'production',
        },
        ...vueConfig.template
      },
      // 脚本处理选项
      script: {
        // 启用 defineModel 宏
        defineModel: true,
        // 启用 props 解构
        propsDestructure: true,
        ...vueConfig.script
      },
      // 样式处理选项
      style: {
        // 启用 CSS 模块
        modules: vueConfig.cssModules !== false,
        ...vueConfig.style
      },
      // 传递其他用户配置
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
      // JSX 配置
      jsx: 'preserve',
      jsxImportSource: 'vue',
      // Vue 相关类型
      types: ['vue', '@vue/runtime-core', ...(tsConfig.types || [])],
      // 路径映射
      paths: {
        '@/*': ['src/*'],
        ...tsConfig.paths
      },
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
      modules: config.style?.modules || false,
      // 支持 less/scss 等预处理器
      use: ['less'],
      extensions: ['.css', '.less', '.scss', '.sass']
    }
  }

  /**
   * 获取 rollup-plugin-styles 选项
   */
  private getStylesOptions(config: BuilderConfig): any {
    return {
      // 样式提取配置
      extract: config.style?.extract !== false,
      minimize: shouldMinify(config),
      sourceMap: config.output?.sourcemap !== false,
      modules: config.style?.modules || false,
      // 支持的文件扩展名
      extensions: ['.css', '.less', '.scss', '.sass'],
      // 预处理器配置
      less: {
        javascriptEnabled: true
      },
      scss: {
        includePaths: ['node_modules']
      }
    }
  }

  /**
   * 创建 DTS 文件生成插件
   */
  private createDtsCopyPlugin(): any {
    return {
      name: 'generate-dts-files',
      writeBundle: async (options: any) => {
        console.log('🔍 DTS 插件被调用，options:', options)
        try {
          const outputDir = options.dir
          if (!outputDir) {
            console.log('⚠️ 输出目录为空')
            return
          }

          console.log('🔧 开始生成 TypeScript 声明文件')
          await this.generateDtsFiles(outputDir)

        } catch (error) {
          console.warn('⚠️ 处理 DTS 文件失败:', error instanceof Error ? error.message : String(error))
        }
      }
    }
  }

  /**
   * 使用 TypeScript 编译器生成 DTS 文件
   */
  private async generateDtsFiles(outputDir: string): Promise<void> {
    try {
      const fs = await import('fs')
      const path = await import('path')

      // 尝试导入 TypeScript
      let ts: any
      try {
        ts = await import('typescript')
      } catch (error) {
        console.warn('⚠️ 无法导入 TypeScript，跳过 DTS 生成')
        return
      }

      const rootDir = process.cwd()
      const srcDir = path.join(rootDir, 'src')
      const tsconfigPath = path.join(rootDir, 'tsconfig.json')

      // 检查 src 目录和 tsconfig.json 是否存在
      if (!fs.existsSync(srcDir)) {
        console.log('⚠️ src 目录不存在，跳过 DTS 生成')
        return
      }

      // 读取和解析 tsconfig.json
      let parsedConfig: any
      if (fs.existsSync(tsconfigPath)) {
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8')
        const configFile = ts.parseConfigFileTextToJson(tsconfigPath, tsconfigContent)

        if (configFile.error) {
          console.warn('⚠️ 解析 tsconfig.json 失败:', configFile.error.messageText)
          parsedConfig = { compilerOptions: {} }
        } else {
          parsedConfig = ts.parseJsonConfigFileContent(
            configFile.config,
            ts.sys,
            path.dirname(tsconfigPath)
          )
        }
      } else {
        console.log('⚠️ tsconfig.json 不存在，使用默认配置')
        parsedConfig = {
          options: {},
          fileNames: [],
          errors: []
        }
      }

      // 获取所有 TypeScript 文件
      const glob = await import('glob')
      const tsFiles = await glob.glob('**/*.{ts,tsx}', {
        cwd: srcDir,
        absolute: true,
        ignore: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**', '**/*.d.ts']
      })

      if (tsFiles.length === 0) {
        console.log('⚠️ 没有找到 TypeScript 文件')
        return
      }

      console.log(`🔧 开始生成 ${tsFiles.length} 个文件的 TypeScript 声明文件`)

      // 创建编译选项
      const compilerOptions: any = {
        ...parsedConfig.options,
        declaration: true,
        emitDeclarationOnly: true,
        outDir: outputDir,
        rootDir: srcDir,
        skipLibCheck: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        strict: false,
        noEmitOnError: false
      }

      // 创建编译器主机
      const host = ts.createCompilerHost(compilerOptions)

      // 创建 TypeScript 程序
      const program = ts.createProgram(tsFiles, compilerOptions, host)

      // 生成声明文件
      const emitResult = program.emit(undefined, undefined, undefined, true)

      // 检查编译错误
      const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

      if (allDiagnostics.length > 0) {
        console.warn('⚠️ TypeScript 编译警告:')
        allDiagnostics.forEach((diagnostic: any) => {
          if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
            console.warn(`  ${path.relative(rootDir, diagnostic.file.fileName)} (${line + 1},${character + 1}): ${message}`)
          } else {
            console.warn(`  ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`)
          }
        })
      }

      if (emitResult.emitSkipped) {
        console.warn('⚠️ TypeScript 声明文件生成失败')
      } else {
        // 统计生成的 .d.ts 文件数量
        const generatedDtsFiles = await glob.glob('**/*.d.ts', {
          cwd: outputDir,
          absolute: false
        })
        console.log(`✅ TypeScript 声明文件生成成功，共生成 ${generatedDtsFiles.length} 个 .d.ts 文件`)
      }

    } catch (error) {
      console.warn('⚠️ 生成 TypeScript 声明文件失败:', error instanceof Error ? error.message : String(error))
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
      'src/**/*.{ts,tsx,js,jsx,vue,json}'
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
