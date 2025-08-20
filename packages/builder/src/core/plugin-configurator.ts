/**
 * 插件配置器
 * 智能配置Rollup插件
 */

import { Logger } from '../utils/logger'
import type { 
  ProjectScanResult, 
  BuildOptions, 
  BuildContext
} from '../types'
import type { Plugin } from 'rollup'

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
  async configure(scanResult: ProjectScanResult, buildOptions?: BuildOptions): Promise<Plugin[]> {
    logger.info('开始配置插件...')
    
    const context: BuildContext = {
      options: buildOptions || {},
      scanResult,
      outputConfig: {
        format: 'esm',
        dir: 'dist'
      },
      mode: buildOptions?.mode || 'production',
      isProduction: (buildOptions?.mode || 'production') === 'production',
      root: process.cwd(),
      outDir: buildOptions?.outDir || 'dist'
    }
    
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
      
    } catch (error) {
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
    return {
      projectType: scanResult.projectType,
      hasTypeScript: (scanResult.fileTypes.typescript || 0) > 0,
      hasJSX: scanResult.projectType === 'react' || scanResult.frameworks.includes('react'),
      hasVue: scanResult.projectType === 'vue' || scanResult.frameworks.includes('vue'),
      hasReact: scanResult.projectType === 'react' || scanResult.frameworks.includes('react'),
      hasSvelte: scanResult.frameworks.includes('svelte'),
      hasStyles: (scanResult.fileTypes.css || 0) > 0 || (scanResult.fileTypes.scss || 0) > 0 || (scanResult.fileTypes.less || 0) > 0,
      hasSass: (scanResult.fileTypes.scss || 0) > 0,
      hasLess: (scanResult.fileTypes.less || 0) > 0,
      hasStylus: false, // TODO: 添加 stylus 检测
      fileTypes: scanResult.fileTypes
    }
  }

  /**
   * 配置基础插件
   */
  private async configureBasePlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
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
    if (context.options.external) {
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
      } else {
        // 回退到 TypeScript 插件
        const tsPlugin = await this.createPlugin('typescript', context)
        if (tsPlugin) {
          plugins.push(tsPlugin)
        }
      }
    } else if (requirements.hasJSX) {
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
    if (requirements.hasStyles) {
      // PostCSS（处理 CSS）
      const postcssPlugin = await this.createPlugin('postcss', context)
      if (postcssPlugin) {
        plugins.push(postcssPlugin)
      }
      
      // Sass/SCSS
      if ((requirements.fileTypes.scss || 0) > 0) {
        const sassPlugin = await this.createPlugin('sass', context)
        if (sassPlugin) {
          plugins.push(sassPlugin)
        }
      }
      
      // Less
      if ((requirements.fileTypes.less || 0) > 0) {
        const lessPlugin = await this.createPlugin('less', context)
        if (lessPlugin) {
          plugins.push(lessPlugin)
        }
      }
      
      // Stylus
      if (false) { // Stylus support not implemented yet
        const stylusPlugin = await this.createPlugin('stylus', context)
        if (stylusPlugin) {
          plugins.push(stylusPlugin)
        }
      }
    }
  }

  /**
   * 配置框架插件
   */
  private async configureFrameworkPlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
    if (requirements.projectType === 'vue' || requirements.hasVue) {
      const vuePlugin = await this.createPlugin('vue', context)
      if (vuePlugin) {
        plugins.push(vuePlugin)
      }
    }
    
    if (requirements.projectType === 'react') {
      const reactPlugin = await this.createPlugin('react', context)
      if (reactPlugin) {
        plugins.push(reactPlugin)
      }
    }
    
    if (requirements.projectType === 'svelte') {
      const sveltePlugin = await this.createPlugin('svelte', context)
      if (sveltePlugin) {
        plugins.push(sveltePlugin)
      }
    }
  }

  /**
   * 配置优化插件
   */
  private async configureOptimizationPlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
    const isProduction = context.options.mode === 'production'
    
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
    if (context.options.analyze) {
      const filesizePlugin = await this.createPlugin('filesize', context)
      if (filesizePlugin) {
        plugins.push(filesizePlugin)
      }
    }
  }

  /**
   * 配置开发插件
   */
  private async configureDevelopmentPlugins(context: BuildContext, requirements: any, plugins: Plugin[]): Promise<void> {
    const isDevelopment = context.options.mode === 'development'
    const isWatch = context.options.watch
    
    if (isDevelopment || isWatch) {
      // 开发服务器
      if (context.options.serve) {
        const servePlugin = await this.createPlugin('serve', context)
        if (servePlugin) {
          plugins.push(servePlugin)
        }
      }
      
      // 热重载
      if (context.options.livereload) {
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
    } catch (error) {
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
        ...context.options.nodeResolve
      })
    } catch (error) {
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
        ...context.options.commonjs
      })
    } catch (error) {
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
    } catch (error) {
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
        ...context.options.aliasOptions
      })
    } catch (error) {
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
        tsconfig: 'tsconfig.json',
        declaration: false, // 由单独的类型生成器处理
        ...context.options.typescript
      })
    } catch (error) {
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
          '@babel/preset-typescript'
        ],
        ...context.options.babel
      })
    } catch (error) {
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
        ...context.options.esbuild
      })
    } catch (error) {
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
      return postcss.default({
        extract: true,
        minimize: context.options.mode === 'production',
        ...context.options.postcss
      })
    } catch (error) {
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
        ...context.options.sass
      })
    } catch (error) {
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
      return less({
        output: true,
        ...context.options.less
      })
    } catch (error) {
      logger.warn('无法加载 rollup-plugin-less')
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
        ...context.options.stylus
      })
    } catch (error) {
      logger.warn('无法加载 rollup-plugin-stylus')
      return null
    }
  }

  /**
   * 创建 Vue 插件
   */
  private createVuePlugin: PluginFactory = async (context) => {
    try {
      const { default: vue } = await import('rollup-plugin-vue')
      return vue({
        css: true,
        ...context.options.vue
      })
    } catch (error) {
      logger.warn('无法加载 rollup-plugin-vue')
      return null
    }
  }

  /**
   * 创建 React 插件
   */
  private createReactPlugin: PluginFactory = async (context) => {
    // React 主要通过 Babel 或 ESBuild 处理，这里可以添加特定的 React 优化
    return null
  }

  /**
   * 创建 Svelte 插件
   */
  private createSveltePlugin: PluginFactory = async (context) => {
    try {
      const { default: svelte } = await import('rollup-plugin-svelte')
      return svelte({
        css: css => css.write('dist/bundle.css'),
        ...context.options.svelte
      })
    } catch (error) {
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
          drop_debugger: true
        },
        ...context.options.terser
      })
    } catch (error) {
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
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(context.options.mode || 'production'),
        ...context.options.replace
      })
    } catch (error) {
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
        ...context.options.strip
      })
    } catch (error) {
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
        ...context.options.filesize
      })
    } catch (error) {
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
        ...context.options.serve
      })
    } catch (error) {
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
        ...context.options.livereload
      })
    } catch (error) {
      logger.warn('无法加载 rollup-plugin-livereload')
      return null
    }
  }
}