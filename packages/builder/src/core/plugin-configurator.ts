/**
 * 插件配置器
 * 智能配置Rollup插件
 */

import type { Plugin } from 'rollup'
import type {
  BuildContext,
  BuildOptions,
  ProjectScanResult,
} from '../types'
import { Logger } from '../utils/logger'
import path from 'path'

const logger = new Logger('PluginConfigurator')

// 插件工厂函数类型
type PluginFactory = (context: BuildContext) => Promise<Plugin | null>

export class PluginConfigurator {
  private readonly pluginRegistry: Map<string, PluginFactory> = new Map()

  constructor() {
    this.registerBuiltinPlugins()
  }

  /**
   * 配置插件
   */
  async configure(scanResult: ProjectScanResult, buildOptions?: Partial<BuildOptions>): Promise<Plugin[]> {
    logger.info('开始配置插件...')
    logger.info('buildOptions:', JSON.stringify(buildOptions, null, 2))

    const context: BuildContext = {
      options: (buildOptions || {}) as BuildOptions,
      scanResult,
      outputConfig: {
        format: 'esm',
        dir: 'dist',
      },
      mode: buildOptions?.mode || 'production',
      isProduction: (buildOptions?.mode || 'production') === 'production',
      root: process.cwd(),
      outDir: buildOptions?.outDir || 'dist',
    }

    logger.info('context.options.css:', context.options.css)

    const plugins: Plugin[] = []

    try {
      // 分析项目需求
      const requirements = this.analyzeRequirements(context.scanResult)

      // 配置基础插件
      logger.info('配置基础插件...')
      await this.configureBasePlugins(context, requirements, plugins)
      logger.info('基础插件配置完成')

      // 配置语言插件
      logger.info('配置语言插件...')
      await this.configureLanguagePlugins(context, requirements, plugins)
      logger.info('语言插件配置完成')

      // 先配置样式插件（需要在 Vue 插件之前，把 SFC 内样式提取并剥离，避免生成 ?vue&type=style 虚拟模块）
      logger.info('准备配置样式插件...')
      await this.configureStylePlugins(context, requirements, plugins)
      logger.info('样式插件配置完成')

      // 再配置框架插件（Vue 插件将接收已剥离样式的 SFC）
      logger.info('配置框架插件...')
      await this.configureFrameworkPlugins(context, requirements, plugins)
      logger.info('框架插件配置完成')

      // 配置优化插件
      await this.configureOptimizationPlugins(context, requirements, plugins)

      // 配置开发插件
      await this.configureDevelopmentPlugins(context, requirements, plugins)

      logger.info(`插件配置完成，共配置 ${plugins.length} 个插件`)

      return plugins
    }
    catch (error) {
      logger.error('插件配置失败:', error)
      throw error
    }
  }

  /**
   * 注册内置插件
   */
  private registerBuiltinPlugins(): void {
    // 基础插件
    this.registerPlugin('node-resolve', this.createNodeResolvePlugin)
    this.registerPlugin('commonjs', this.createCommonJSPlugin)
    this.registerPlugin('json', this.createJsonPlugin)
    this.registerPlugin('alias', this.createAliasPlugin)

    // 语言插件
    this.registerPlugin('typescript', this.createTypeScriptPlugin)
    this.registerPlugin('babel', this.createBabelPlugin)
    this.registerPlugin('esbuild', this.createEsbuildPlugin)

    // 样式插件
    this.registerPlugin('postcss', this.createPostCSSPlugin)
    this.registerPlugin('sass', this.createSassPlugin)
    this.registerPlugin('less', this.createLessPlugin)
    this.registerPlugin('stylus', this.createStylusPlugin)

    // 框架插件
    this.registerPlugin('vue', this.createVuePlugin)
    this.registerPlugin('vue-jsx', this.createVueJsxPlugin)
    this.registerPlugin('react', this.createReactPlugin)
    this.registerPlugin('svelte', this.createSveltePlugin)

    // 优化插件
    this.registerPlugin('terser', this.createTerserPlugin)
    this.registerPlugin('replace', this.createReplacePlugin)
    this.registerPlugin('strip', this.createStripPlugin)
    this.registerPlugin('filesize', this.createFilesizePlugin)

    // 开发插件
    this.registerPlugin('serve', this.createServePlugin)
    this.registerPlugin('livereload', this.createLivereloadPlugin)
  }

  /**
   * 注册插件
   */
  registerPlugin(name: string, factory: PluginFactory): void {
    this.pluginRegistry.set(name, factory)
  }

  /**
   * 分析项目需求
   */
  private analyzeRequirements(scanResult: ProjectScanResult) {
    const files = scanResult.files || []
    const hasTypeScript = files.some(f => f.type === 'typescript' || f.type === 'tsx')
    const hasJSX = files.some(f => f.type === 'jsx')
    const hasTsx = files.some(f => f.type === 'tsx')
    const hasVue = files.some(f => f.type === 'vue') || scanResult.projectType === 'vue'
    const hasReact = (hasJSX || hasTsx) || scanResult.projectType === 'react'
    const hasSvelte = files.some(f => (f as any).type === 'svelte')
    const hasSass = files.some(f => f.type === 'scss')
    const hasLess = files.some(f => f.type === 'less')
    const hasStyles = files.some(f => ['css', 'scss', 'less', 'stylus'].includes(f.type as string) || f.type === 'vue')

    return {
      projectType: scanResult.projectType,
      hasTypeScript,
      hasJSX,
      hasTsx,
      hasJsx: hasJSX || hasTsx, // 兼容性别名
      hasVue,
      hasReact,
      hasSvelte,
      hasStyles,
      hasSass,
      hasLess,
      hasStylus: files.some(f => f.type === 'stylus'),
      fileTypes: {},
    }
  }

  /**
   * 配置基础插件
   */
  private async configureBasePlugins(context: BuildContext, _requirements: any, plugins: Plugin[]): Promise<void> {
    // Node resolve
    const nodeResolvePlugin = await this.createPlugin('node-resolve', context)
    if (nodeResolvePlugin) {
      plugins.push(nodeResolvePlugin)
    }

    // CommonJS
    const commonjsPlugin = await this.createPlugin('commonjs', context)
    if (commonjsPlugin) {
      plugins.push(commonjsPlugin)
    }

    // JSON
    const jsonPlugin = await this.createPlugin('json', context)
    if (jsonPlugin) {
      plugins.push(jsonPlugin)
    }

    // Alias (如果有配置)
    if ((context.options as any).alias) {
      const aliasPlugin = await this.createPlugin('alias', context)
      if (aliasPlugin) {
        plugins.push(aliasPlugin)
      }
    }
  }

  /**
   * 配置语言插件
   */
  private async configureLanguagePlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
    if (requirements.hasTypeScript) {
      // 优先使用 esbuild（更快）
      const esbuildPlugin = await this.createPlugin('esbuild', context)
      if (esbuildPlugin) {
        plugins.push(esbuildPlugin)
      }
      else {
        // 回退到 TypeScript 插件
        const tsPlugin = await this.createPlugin('typescript', context)
        if (tsPlugin) {
          plugins.push(tsPlugin)
        }
      }
    }
    else if (requirements.hasJSX) {
      // 对于纯 JSX 项目，使用 Babel
      const babelPlugin = await this.createPlugin('babel', context)
      if (babelPlugin) {
        plugins.push(babelPlugin)
      }
    }
  }

  /**
   * 配置样式插件
   */
  private async configureStylePlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
    console.log('=== 开始配置样式插件 ===')
    logger.info('配置样式插件，hasVue:', requirements.hasVue, 'hasLess:', requirements.hasLess)

    // 检查是否禁用了样式处理
    if (context.options.css === false) {
      logger.info('样式处理已禁用 (css: false)')
      return
    }

    logger.info('CSS 处理已启用，开始配置样式插件...')

    // 对于 Vue 项目：先提取并移除 SFC 内样式，由我们统一汇总到独立 CSS
    if (requirements.hasVue) {
      const vueStyleExtractPlugin = this.createVueStyleExtractPlugin(context)
      plugins.push(vueStyleExtractPlugin)
      const vueStyleStripPlugin = this.createVueStyleStripPlugin()
      plugins.push(vueStyleStripPlugin)
      logger.info('Vue 样式提取与移除插件配置成功')
    }

    // 配置主要的 CSS 提取插件（处理独立样式文件），并避免处理 Vue 的样式虚拟模块
    const postcssPlugin = await this.createPlugin('postcss', context)
    if (postcssPlugin) {
      plugins.push(postcssPlugin)
      logger.info('PostCSS CSS 提取插件配置成功')
    } else {
      logger.warn('PostCSS CSS 提取插件配置失败')
    }

    if (requirements.hasStyles) {
      // Sass/SCSS
      if ((requirements.fileTypes.scss || 0) > 0) {
        logger.info(`发现 ${requirements.fileTypes.scss} 个 SCSS 文件`)
        const sassPlugin = await this.createPlugin('sass', context)
        if (sassPlugin) {
          plugins.push(sassPlugin)
        }
      }

      // Stylus - 暂未实现
      // TODO: 实现 Stylus 支持
    }
  }

  /**
   * 配置框架插件
   */
  private async configureFrameworkPlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
    if (requirements.projectType === 'vue' || requirements.hasVue) {
      // 如果禁用了样式处理，添加预处理插件来移除样式块
      if (context.options.css === false) {
        logger.info('添加 Vue 样式移除插件')
        const vueStyleStripPlugin = this.createVueStyleStripPlugin()
        plugins.push(vueStyleStripPlugin)
      } else {
        logger.info('启用 CSS 处理，保留 Vue 文件中的样式')
      }

      const vuePlugin = await this.createPlugin('vue', context)
      if (vuePlugin != null) {
        plugins.push(vuePlugin as Plugin)
      }

      // 添加 Vue 文件名优化插件
      const vueFilenamePlugin = this.createVueFilenamePlugin()
      plugins.push(vueFilenamePlugin)

      // 如果检测到 JSX/TSX 文件，添加 Vue JSX 支持
      if (requirements.hasJSX || requirements.hasTsx) {
        const vueJsxPlugin = await this.createPlugin('vue-jsx', context)
        if (vueJsxPlugin != null) {
          plugins.push(vueJsxPlugin as Plugin)
        }
      }
    }

    if (requirements.projectType === 'react') {
      // React 主要通过 Babel/ESBuild 处理，跳过占位的 react 插件
    }

    if (requirements.projectType === 'svelte') {
      const sveltePlugin = await this.createPlugin('svelte', context)
      if (sveltePlugin != null)
        plugins.push(sveltePlugin as Plugin)
    }
  }

  /**
   * 配置优化插件
   */
  private async configureOptimizationPlugins(context: BuildContext, _requirements: any, plugins: Plugin[]): Promise<void> {
    const isProduction = (context.options.mode || 'production') === 'production'

    if (isProduction) {
      // 代码压缩
      const terserPlugin = await this.createPlugin('terser', context)
      if (terserPlugin) {
        plugins.push(terserPlugin)
      }

      // 移除调试代码
      const stripPlugin = await this.createPlugin('strip', context)
      if (stripPlugin) {
        plugins.push(stripPlugin)
      }
    }

    // 环境变量替换
    const replacePlugin = await this.createPlugin('replace', context)
    if (replacePlugin) {
      plugins.push(replacePlugin)
    }

    // 文件大小分析
    if ((context.options as any).analyze) {
      const filesizePlugin = await this.createPlugin('filesize', context)
      if (filesizePlugin) {
        plugins.push(filesizePlugin)
      }
    }
  }

  /**
   * 配置开发插件
   */
  private async configureDevelopmentPlugins(context: BuildContext, _requirements: any, plugins: Plugin[]): Promise<void> {
    const isDevelopment = context.options.mode === 'development'
    const isWatch = context.options.watch

    if (isDevelopment || isWatch) {
      // 开发服务器
      if ((context.options as any).serve) {
        const servePlugin = await this.createPlugin('serve', context)
        if (servePlugin) {
          plugins.push(servePlugin)
        }
      }

      // 热重载
      if ((context.options as any).livereload) {
        const livereloadPlugin = await this.createPlugin('livereload', context)
        if (livereloadPlugin) {
          plugins.push(livereloadPlugin)
        }
      }
    }
  }

  /**
   * 创建插件实例
   */
  private async createPlugin(name: string, context: BuildContext): Promise<Plugin | null> {
    const factory = this.pluginRegistry.get(name)
    if (!factory) {
      logger.warn(`插件 ${name} 未注册`)
      return null
    }

    try {
      return await factory(context)
    }
    catch (error) {
      logger.warn(`创建插件 ${name} 失败:`, error)
      return null
    }
  }

  // ============ 插件工厂函数 ============

  /**
   * 创建 Node Resolve 插件
   */
  private createNodeResolvePlugin: PluginFactory = async (context) => {
    try {
      const { nodeResolve } = await import('@rollup/plugin-node-resolve')
      return nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json'],
        ...context.options.nodeResolve,
      })
    }
    catch {
      logger.warn('无法加载 @rollup/plugin-node-resolve')
      return null
    }
  }

  /**
   * 创建 CommonJS 插件
   */
  private createCommonJSPlugin: PluginFactory = async (context) => {
    try {
      const { default: commonjs } = await import('@rollup/plugin-commonjs')
      return commonjs({
        include: ['node_modules/**'],
        ...context.options.commonjs,
      })
    }
    catch {
      logger.warn('无法加载 @rollup/plugin-commonjs')
      return null
    }
  }

  /**
   * 创建 JSON 插件
   */
  private createJsonPlugin: PluginFactory = async (context) => {
    try {
      const { default: json } = await import('@rollup/plugin-json')
      return json(context.options.json)
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-json')
      return null
    }
  }

  /**
   * 创建 Alias 插件
   */
  private createAliasPlugin: PluginFactory = async (context) => {
    try {
      const { default: alias } = await import('@rollup/plugin-alias')
      return alias({
        entries: context.options.alias || {},
        ...context.options.aliasOptions,
      })
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-alias')
      return null
    }
  }

  /**
   * 创建 TypeScript 插件
   */
  private createTypeScriptPlugin: PluginFactory = async (context) => {
    try {
      const { default: typescript } = await import('@rollup/plugin-typescript')
      return typescript({
        tsconfig: context.options.typescript?.tsconfig || 'tsconfig.json',
        include: [/(\.tsx?|\.vue)(\?.*)?$/], // 包含 Vue 文件
        declaration: false, // 由单独的类型生成器处理
        declarationMap: false,
        noEmitOnError: false,
        skipLibCheck: true,
        compilerOptions: {
          skipLibCheck: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          jsx: 'preserve', // 保留 JSX 语法，让 Vue 插件处理
          ...context.options.typescript?.compilerOptions,
        },
        ...context.options.typescript,
      })
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-typescript')
      return null
    }
  }

  /**
   * 创建 Babel 插件
   */
  private createBabelPlugin: PluginFactory = async (context) => {
    try {
      const { default: babel } = await import('@rollup/plugin-babel')
      return babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: [
          ['@babel/preset-env', { modules: false }],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
        ...context.options.babel,
      })
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-babel')
      return null
    }
  }

  /**
   * 创建 ESBuild 插件
   */
  private createEsbuildPlugin: PluginFactory = async (context) => {
    try {
      const { default: esbuild } = await import('rollup-plugin-esbuild')
      return esbuild({
        target: 'es2015',
        jsx: context.scanResult.projectType === 'react' ? 'automatic' : 'preserve',
        tsconfig: false, // 禁用自动查找 tsconfig，避免路径问题
        tsconfigRaw: {
          compilerOptions: {
            target: 'es2020',
            module: 'esnext',
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            jsx: 'preserve',
            strict: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            forceConsistentCasingInFileNames: true
          }
        },
        ...context.options.esbuild,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-esbuild')
      return null
    }
  }

  /**
   * 创建 PostCSS 插件
   */
  private createPostCSSPlugin: PluginFactory = async (context) => {
    try {
      const postcss = await import('rollup-plugin-postcss')

      // 始终启用 Less 支持，以处理 Vue SFC 中的 <style lang="less">
      const use = [
        ['less', {
          javascriptEnabled: true,
          math: 'always',
          modifyVars: {},
          relativeUrls: true,
        }]
      ] as Array<[string, Record<string, unknown>]>

      return postcss.default({
        extract: 'index.css',
        minimize: context.options.mode === 'production',
        use,
        // 仅处理独立样式文件，排除 Vue 的样式虚拟模块（由我们自定义插件处理）
        include: /\.(css|less|scss|sass|styl|stylus)$/,
        exclude: [/\.vue$/, /\?vue&type=style/],
        sourceMap: context.options.sourcemap !== false,
        inject: false,
        loaderOptions: {
          less: {
            javascriptEnabled: true,
            math: 'always',
          },
        },
        ...context.options.postcss,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-postcss')
      return null
    }
  }

  /**
   * 创建 Sass 插件
   */
  private createSassPlugin: PluginFactory = async (context) => {
    try {
      const { default: sass } = await import('rollup-plugin-sass')
      return sass({
        output: true,
        ...context.options.sass,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-sass')
      return null
    }
  }

  /**
   * 创建 Less 插件（已废弃，由 PostCSS 插件统一处理）
   */
  private createLessPlugin: PluginFactory = async (_context) => {
    // Less 处理已经集成到 PostCSS 插件中，这里返回 null
    logger.info('Less 处理已集成到 PostCSS 插件中')
    return null
  }

  /**
   * 创建 Stylus 插件
   */
  private createStylusPlugin: PluginFactory = async (context) => {
    try {
      const { default: stylus } = await import('rollup-plugin-stylus')
      return stylus({
        output: true,
        ...context.options.stylus,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-stylus')
      return null
    }
  }

  /**
   * 创建 Vue 样式移除插件
   */
  private createVueStyleStripPlugin(): Plugin {
    return {
      name: 'vue-style-strip',
      transform(code: string, id: string) {
        if (id.endsWith('.vue') && !id.includes('?vue&type=')) {
          logger.info(`[vue-style-strip] 处理文件: ${id}`)

          // 移除 Vue SFC 中的 <style> 块，包括各种属性（CSS、Less、Sass等）
          const styleRegex = /<style[^>]*(?:\s+lang=["'](?:css|less|scss|sass|stylus)["'])?[^>]*>[\s\S]*?<\/style>/gi
          const originalLength = code.length
          const cleanedCode = code.replace(styleRegex, (match) => {
            // 保留样式块的基本结构信息用于调试
            const langMatch = match.match(/lang=["']([^"']+)["']/)
            const lang = langMatch ? langMatch[1] : 'css'
            return `<!-- style block (${lang}) removed -->`
          })
          const newLength = cleanedCode.length

          if (originalLength !== newLength) {
            logger.info(`[vue-style-strip] 移除了样式块，文件大小从 ${originalLength} 减少到 ${newLength}`)
            return {
              code: cleanedCode,
              map: { mappings: '' } // 提供空的 sourcemap 而不是 null
            }
          }
        }
        return null
      }
    }
  }

  /**
   * 创建 Vue 样式提取插件
   */
  // 提取 Vue SFC 样式内容并合并为独立的 index.css 文件
  private createVueStyleExtractPlugin(_context: BuildContext): Plugin {
    const extractedStyles: string[] = []

    return {
      name: 'vue-style-extract',
      async transform(code: string, id: string) {
        if (id.endsWith('.vue') && !id.includes('?vue&type=')) {
          logger.info(`[vue-style-extract] 处理文件: ${id}`)

          // 提取 Vue SFC 中的 <style> 块（更健壮的属性解析，支持任意顺序）
          const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi
          let match: RegExpExecArray | null
          let hasStyles = false

          while ((match = styleRegex.exec(code)) !== null) {
            const attr = match[1] || ''
            const langMatch = attr.match(/lang=["']([^"']+)["']/i)
            const langAttr = (langMatch?.[1] || '').toLowerCase()
            let styleContent = match[2].trim()
            // 兼容性判断：未声明 lang 但包含 Less 语法（变量或嵌套 &），也按 Less 处理
            const maybeLessSyntax = /(^|[;{\s])@[\w-]+\s*:/.test(styleContent) || /&[\w-]|\.[\w-]+\s*\{[\s\S]*?&/.test(styleContent)
            const isLess = langAttr === 'less' || maybeLessSyntax

            if (styleContent) {
              hasStyles = true
              const label = isLess ? 'less' : (langAttr || 'css')
              logger.info(`[vue-style-extract] 提取 ${label} 样式，长度: ${styleContent.length}`)

              if (isLess) {
                // 编译 Less 为 CSS，避免后续 PostCSS 误解析
                try {
                  const lessMod: any = await import('less')
                  const less = (lessMod && (lessMod.default || lessMod)) as any
                  const result = await less.render(styleContent, {
                    javascriptEnabled: true,
                    // 避免 calc() 等与 Less 数学运算冲突
                    math: 'parens-division',
                    relativeUrls: true,
                  })
                  styleContent = result.css
                } catch (e) {
                  logger.warn('[vue-style-extract] Less 编译失败，按原样输出', e)
                }
              }

              extractedStyles.push(styleContent)
            }
          }

          if (hasStyles) {
            logger.info(`[vue-style-extract] 从 ${id} 提取了样式`)
          }
        }
        return null
      },

      async generateBundle(_options, bundle) {
        if (extractedStyles.length > 0) {
          // 合并所有提取的样式
          const allStyles = extractedStyles.join('\n\n')

          // 使用 Less 再编译一次（支持嵌套语法、变量等），纯 CSS 也兼容
          let finalCss = allStyles
          try {
            const lessMod: any = await import('less')
            const less = (lessMod && (lessMod.default || lessMod)) as any
            const result = await less.render(allStyles, {
              javascriptEnabled: true,
              math: 'always',
              filename: 'bundle.less',
              relativeUrls: true,
            })
            finalCss = result.css
          } catch (e) {
            logger.warn('[vue-style-extract] 汇总 Less 编译失败，按原样输出', e)
          }

          // 创建 CSS 文件
          const cssFileName = 'index.css'
            ; (bundle as any)[cssFileName] = {
              type: 'asset',
              fileName: cssFileName,
              source: finalCss,
              needsCodeReference: false,
              name: undefined,
              names: [],
              originalFileName: null,
              originalFileNames: []
            }

          logger.info(`[vue-style-extract] 生成 CSS 文件: ${cssFileName}，大小: ${finalCss.length} 字符`)
        }
      }
    }
  }

  /**
   * 创建 Vue 文件名优化插件
   */
  private createVueFilenamePlugin(): Plugin {
    return {
      name: 'vue-filename-optimizer',
      // 使用 generateBundle 钩子，在生成 bundle 时修改文件名，并同步修正引用路径
      generateBundle(_options, bundle) {
        // 遍历所有生成的文件
        const filesToRename: Array<{ oldName: string; newName: string }> = []

        for (const [fileName] of Object.entries(bundle)) {
          // 处理所有包含 .vue 的 JavaScript 文件
          if (fileName.includes('.vue') && fileName.endsWith('.js')) {
            // 更全面的文件名处理
            let newFileName = fileName

            // 处理 .vue2.js -> 2.js 的情况
            newFileName = newFileName.replace(/\.vue(\d+)\.js$/, '$1.js')
            // 处理 .vue.js -> .js 的情况
            newFileName = newFileName.replace(/\.vue\.js$/, '.js')

            if (newFileName !== fileName) {
              filesToRename.push({ oldName: fileName, newName: newFileName })
            }
          }
        }

        // 执行重命名操作
        for (const { oldName, newName } of filesToRename) {
          logger.info(`[vue-filename-optimizer] 重命名文件: ${oldName} -> ${newName}`)

          // 重命名主文件
          const chunk = bundle[oldName]
          if (chunk) {
            // 修改 chunk 的 fileName 属性
            if (chunk.type === 'chunk') {
              (chunk as any).fileName = newName
            } else if (chunk.type === 'asset') {
              (chunk as any).fileName = newName
            }
            bundle[newName] = chunk
            delete bundle[oldName]
          }

          // 重命名对应的 sourcemap 文件
          const mapFileName = oldName + '.map'
          const newMapFileName = newName + '.map'
          if (bundle[mapFileName]) {
            const mapChunk = bundle[mapFileName]
            if (mapChunk.type === 'asset') {
              (mapChunk as any).fileName = newMapFileName
            }
            bundle[newMapFileName] = mapChunk
            delete bundle[mapFileName]
            logger.info(`[vue-filename-optimizer] 重命名 sourcemap: ${mapFileName} -> ${newMapFileName}`)
          }
        }

        // 二次遍历：修正所有 chunk 内部对旧文件名的引用（静态与动态）
        for (const [, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk') {
            let code = (chunk as any).code as string
            let modified = false

            for (const { oldName, newName } of filesToRename) {
              // 计算相对路径片段（只替换文件名部分）
              const oldBase = path.posix.basename(oldName)
              const newBase = path.posix.basename(newName)

              // 替换 import 语句文本中的 .vue*.js 片段
              const before = code
              code = code.replace(new RegExp(oldBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newBase)
              if (code !== before) modified = true

              // 同步修正 Rollup 记录的 imports/dynamicImports 数组
              const c: any = chunk
              if (Array.isArray(c.imports)) {
                c.imports = c.imports.map((imp: string) => imp === oldName ? newName : imp)
              }
              if (Array.isArray(c.dynamicImports)) {
                c.dynamicImports = c.dynamicImports.map((imp: string) => imp === oldName ? newName : imp)
              }
              if (Array.isArray(c.referencedFiles)) {
                c.referencedFiles = c.referencedFiles.map((f: string) => f === oldName ? newName : f)
              }
            }

            // 兜底：对所有 .vue*.js 与 .map 片段做安全替换，防止遗漏
            const before2 = code
            code = code.replace(/\.vue(\d+)\.js/g, '$1.js')
            code = code.replace(/\.vue\.js/g, '.js')
            code = code.replace(/\.vue(\d+)\.js\.map/g, '$1.js.map')
            code = code.replace(/\.vue\.js\.map/g, '.js.map')
            if (code !== before2) modified = true

            if (modified) {
              (chunk as any).code = code
            }
          }
        }
      }
    }
  }

  /**
   * 创建 Vue 插件
   */
  private createVuePlugin: PluginFactory = async (context) => {
    try {
      // 按需求强制使用 unplugin-vue（避免 @vitejs/plugin-vue 在 Rollup 环境的兼容性问题）
      const { default: vue } = await import('unplugin-vue/rollup')
      logger.info('使用 unplugin-vue/rollup')

      const vueConfig: any = {
        include: [/\.vue$/],
        script: {
          defineModel: true,
          propsDestructure: false,
        },
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith('router-'),
          },
        },
        // 不让该插件处理样式，统一交由自定义样式提取与 PostCSS 处理
        // unplugin-vue 本身没有 style 选项，这里只作说明
        ...context.options.vue,
      }

      const pluginCandidate: any = vue(vueConfig)
      // 兼容返回数组的情况，优先取第一个插件
      return Array.isArray(pluginCandidate) ? pluginCandidate[0] : pluginCandidate
    }
    catch (error) {
      logger.warn('无法加载 unplugin-vue/rollup，回退到 rollup-plugin-vue')
      try {
        const { default: vue } = await import('rollup-plugin-vue')
        const vueConfig: any = {
          include: [/\.vue$/],
          compileTemplate: {
            compilerOptions: {
              isCustomElement: (tag: string) => tag.startsWith('router-'),
            },
          },
          style: {
            extract: context.options.css !== false,
          },
          ...context.options.vue,
        }
        return vue(vueConfig)
      } catch (fallbackError) {
        logger.warn('无法加载 rollup-plugin-vue:', fallbackError)
        return null
      }
    }
  }

  /**
   * 创建 Vue JSX 插件
   */
  private createVueJsxPlugin: PluginFactory = async (context) => {
    try {
      const { default: vueJsx } = await import('unplugin-vue-jsx/rollup')
      const plugin = vueJsx({
        include: /\.[jt]sx$/,
        ...context.options.vueJsx,
      })
      // 确保返回单个插件而不是数组
      return Array.isArray(plugin) ? plugin[0] : plugin
    }
    catch (error) {
      logger.warn('无法加载 unplugin-vue-jsx')
      return null
    }
  }

  /**
   * 创建 React 插件
   */
  private createReactPlugin: PluginFactory = async (_context) => {
    // React 主要通过 Babel 或 ESBuild 处理，这里可以添加特定的 React 优化
    return null
  }

  /**
   * 创建 Svelte 插件
   */
  private createSveltePlugin: PluginFactory = async (_context) => {
    try {
      const { default: svelte } = await import('rollup-plugin-svelte')
      return svelte({})
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-svelte')
      return null
    }
  }

  /**
   * 创建 Terser 插件
   */
  private createTerserPlugin: PluginFactory = async (context) => {
    try {
      const { default: terser } = await import('@rollup/plugin-terser')
      return terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        ...context.options.terser,
      })
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-terser')
      return null
    }
  }

  /**
   * 创建 Replace 插件
   */
  private createReplacePlugin: PluginFactory = async (context) => {
    try {
      const { default: replace } = await import('@rollup/plugin-replace')
      return replace({
        'preventAssignment': true,
        'process.env.NODE_ENV': JSON.stringify(context.options.mode || 'production'),
        ...context.options.replace,
      })
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-replace')
      return null
    }
  }

  /**
   * 创建 Strip 插件
   */
  private createStripPlugin: PluginFactory = async (context) => {
    try {
      const { default: strip } = await import('@rollup/plugin-strip')
      return strip({
        functions: ['console.*', 'assert.*'],
        ...context.options.strip,
      })
    }
    catch (error) {
      logger.warn('无法加载 @rollup/plugin-strip')
      return null
    }
  }

  /**
   * 创建 Filesize 插件
   */
  private createFilesizePlugin: PluginFactory = async (context) => {
    try {
      const { default: filesize } = await import('rollup-plugin-filesize')
      return filesize({
        showMinifiedSize: true,
        showGzippedSize: true,
        ...context.options.filesize,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-filesize')
      return null
    }
  }

  /**
   * 创建 Serve 插件
   */
  private createServePlugin: PluginFactory = async (context) => {
    try {
      const { default: serve } = await import('rollup-plugin-serve')
      return serve({
        open: true,
        contentBase: 'dist',
        port: 3000,
        ...context.options.serve,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-serve')
      return null
    }
  }

  /**
   * 创建 Livereload 插件
   */
  private createLivereloadPlugin: PluginFactory = async (context) => {
    try {
      const { default: livereload } = await import('rollup-plugin-livereload')
      return livereload({
        watch: 'dist',
        ...context.options.livereload,
      })
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-livereload')
      return null
    }
  }
}
