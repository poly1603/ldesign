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
      await this.configureBasePlugins(context, requirements, plugins)

      // 配置语言插件
      await this.configureLanguagePlugins(context, requirements, plugins)

      // 配置样式插件
      await this.configureStylePlugins(context, requirements, plugins)

      // 配置框架插件
      await this.configureFrameworkPlugins(context, requirements, plugins)

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
    const hasStyles = files.some(f => ['css', 'scss', 'less', 'stylus'].includes(f.type as string))

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
    logger.info('配置样式插件，requirements:', requirements)

    // 检查是否禁用了样式处理
    if (context.options.css === false) {
      logger.info('样式处理已禁用 (css: false)')
      return
    }

    if (requirements.hasStyles) {
      // PostCSS（处理 CSS）
      const postcssPlugin = await this.createPlugin('postcss', context)
      if (postcssPlugin) {
        plugins.push(postcssPlugin)
      }

      // Sass/SCSS
      if ((requirements.fileTypes.scss || 0) > 0) {
        logger.info(`发现 ${requirements.fileTypes.scss} 个 SCSS 文件`)
        const sassPlugin = await this.createPlugin('sass', context)
        if (sassPlugin) {
          plugins.push(sassPlugin)
        }
      }

      // Less - 暂时跳过 Less 文件处理
      if (requirements.hasLess) {
        logger.warn(`发现 Less 文件，但暂时跳过处理以避免构建错误`)
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
      }

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

      // 检查是否需要处理 Less 文件
      const hasLess = context.scanResult.files.some(file => file.path.endsWith('.less'))
      const use = []

      if (hasLess) {
        // 添加 Less 处理器配置
        use.push(['less', { javascriptEnabled: true }])
        logger.info('PostCSS 配置包含 Less 处理器')
      }

      return postcss.default({
        extract: true,
        minimize: context.options.mode === 'production',
        use: use.length > 0 ? use : undefined,
        // 确保 Less 文件被正确处理
        include: hasLess ? /\.(css|less)$/ : /\.css$/,
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
   * 创建 Less 插件
   */
  private createLessPlugin: PluginFactory = async (context) => {
    try {
      const { default: less } = await import('rollup-plugin-less')
      logger.info('成功加载 rollup-plugin-less')
      const plugin = less({
        output: context.options.less?.output || false, // 不输出到文件，而是内联到 JS 中
        insert: true, // 插入到 DOM 中
        ...context.options.less,
      })
      logger.info('Less 插件配置完成')
      return plugin
    }
    catch (error) {
      logger.warn('无法加载 rollup-plugin-less:', error)
      return null
    }
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
          // 移除 Vue SFC 中的 <style> 块，包括各种属性
          const styleRegex = /<style[^>]*(?:\s+lang=["'][^"']*["'])?[^>]*>[\s\S]*?<\/style>/gi
          const originalLength = code.length
          const cleanedCode = code.replace(styleRegex, '<!-- style block removed -->')
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
   * 创建 Vue 插件
   */
  private createVuePlugin: PluginFactory = async (context) => {
    try {
      const { default: vue } = await import('unplugin-vue/rollup')
      const vueConfig: any = {
        include: [/\.vue$/], // 只处理 Vue 文件，不处理 TSX
        script: {
          defineModel: true,
          propsDestructure: true,
        },
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith('router-'),
          },
        },
        ...context.options.vue,
      }

      // 样式处理现在由专门的样式移除插件处理

      return vue(vueConfig)
    }
    catch (error) {
      logger.warn('无法加载 unplugin-vue')
      return null
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
