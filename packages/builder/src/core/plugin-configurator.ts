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

    // 对于 Vue 项目：添加样式提取插件
    if (requirements.hasVue) {
      const vueStyleExtractPlugin = this.createVueStyleExtractPlugin(context)
      plugins.push(vueStyleExtractPlugin)
      logger.info('Vue 样式提取插件配置成功')
    }

    // 配置主要的 CSS 提取插件（处理独立样式文件和 Vue 提取的样式）
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
      logger.info('配置 Vue 插件')

      const vuePlugin = await this.createPlugin('vue', context)
      if (vuePlugin != null) {
        plugins.push(vuePlugin as Plugin)
      }

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
        requireReturnsDefault: 'auto',
        defaultIsModuleExports: true,
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
      const autoprefixer = (await import('autoprefixer')).default

      // 始终启用 Less 支持，以处理 Vue SFC 中的 <style lang="less">
      const use = [
        ['less', {
          javascriptEnabled: true,
          math: 'always',
          modifyVars: {},
          relativeUrls: true,
        }]
      ] as Array<[string, Record<string, unknown>]>

      // 暂时跳过 cssnano 集成，专注于核心功能验证
      const plugins = [autoprefixer()]

      return postcss.default({
        extract: true, // 提取所有 CSS 到单独文件
        minimize: context.options.mode === 'production',
        plugins,
        use,
        // 处理所有样式文件，包括 Vue 生成的 CSS
        include: /\.(css|less|scss|sass|styl|stylus)$/,
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
   * 创建 Vue 样式提取插件
   */
  private createVueStyleExtractPlugin(_context: BuildContext): Plugin {
    const extractedStyles: string[] = []

    return {
      name: 'vue-style-extract',
      async transform(code: string, id: string) {
        if (id.endsWith('.vue') && !id.includes('?vue&type=')) {
          logger.info(`[vue-style-extract] 处理文件: ${id}`)

          // 提取 Vue SFC 中的 <style> 块
          const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi
          let match: RegExpExecArray | null
          let hasStyles = false

          while ((match = styleRegex.exec(code)) !== null) {
            const attr = match[1] || ''
            const langMatch = attr.match(/lang=["']([^"']+)["']/i)
            const langAttr = (langMatch?.[1] || '').toLowerCase()
            let styleContent = match[2].trim()

            if (styleContent) {
              hasStyles = true
              const label = langAttr || 'css'
              logger.info(`[vue-style-extract] 提取 ${label} 样式，长度: ${styleContent.length}`)

              // 如果是 Less，编译为 CSS
              if (langAttr === 'less') {
                try {
                  const lessMod: any = await import('less')
                  const less = (lessMod && (lessMod.default || lessMod)) as any
                  const result = await less.render(styleContent, {
                    javascriptEnabled: true,
                    math: 'always',
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
            // 移除样式块，返回清理后的代码
            const cleanedCode = code.replace(styleRegex, '<!-- style extracted -->')
            return {
              code: cleanedCode,
              map: { mappings: '' }
            }
          }
        }
        return null
      },

      async generateBundle(_options, bundle) {
        if (extractedStyles.length > 0) {
          // 合并所有提取的样式
          const allStyles = extractedStyles.join('\n\n')

          // 创建 CSS 文件
          const cssFileName = 'index.css'
          const existing = (bundle as any)[cssFileName]
          if (existing && existing.type === 'asset') {
            const prev = typeof existing.source === 'string' ? existing.source : String(existing.source || '')
            const merged = prev && prev.trim().length > 0 ? `${prev}\n\n${allStyles}` : allStyles
            existing.source = merged
            logger.info(`[vue-style-extract] 合并到已存在的 CSS: ${cssFileName}`)
          } else {
            ; (bundle as any)[cssFileName] = {
              type: 'asset',
              fileName: cssFileName,
              source: allStyles,
              needsCodeReference: false,
              name: undefined,
              names: [],
              originalFileName: null,
              originalFileNames: []
            }
            logger.info(`[vue-style-extract] 生成 CSS 文件: ${cssFileName}`)
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
      // 优先使用 unplugin-vue，它对 TypeScript 支持更好
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
        // 禁用样式处理，让 PostCSS 插件处理
        style: false,
        ...context.options.vue,
      }

      const pluginCandidate: any = vue(vueConfig)
      return Array.isArray(pluginCandidate) ? pluginCandidate[0] : pluginCandidate
    }
    catch (error) {
      logger.warn('无法加载 unplugin-vue/rollup，尝试 rollup-plugin-vue')
      try {
        const { default: vue } = await import('rollup-plugin-vue')
        const fs = await import('fs')
        logger.info('使用 rollup-plugin-vue')

        const vueConfig: any = {
          include: [/\.vue$/],
          compileTemplate: {
            compilerOptions: {
              isCustomElement: (tag: string) => tag.startsWith('router-'),
            },
          },
          // 提供 fs 选项以支持 TypeScript 类型解析
          compileScript: {
            fs: {
              fileExists: fs.existsSync,
              readFile: (file: string) => fs.readFileSync(file, 'utf-8'),
              realpath: fs.realpathSync,
            },
          },
          style: {
            // 简化样式处理：所有样式都提取到单独的 CSS 文件
            extract: true,
            preprocessOptions: {
              less: {
                javascriptEnabled: true,
                math: 'always',
              },
            },
          },
          ...context.options.vue,
        }

        return vue(vueConfig)
      } catch (fallbackError) {
        logger.warn('无法加载任何 Vue 插件:', fallbackError)
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
