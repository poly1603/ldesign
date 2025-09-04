/**
 * Vite 构建器类
 * @module ViteBuilder
 * @description 封装 Vite 的构建、开发服务器、预览等功能，提供丰富的配置选项和插件系统支持
 * 
 * @example
 * ```typescript
 * // 创建 Vite 构建器实例
 * const builder = new ViteBuilder({
 *   entry: 'src/main.ts',
 *   outDir: 'dist',
 *   server: { port: 3000 }
 * })
 * 
 * // 执行构建
 * const result = await builder.build()
 * 
 * // 启动开发服务器
 * const server = await builder.dev()
 * ```
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { 
  build, 
  createServer, 
  preview, 
  type ViteDevServer, 
  type PreviewServer,
  type InlineConfig,
  type Plugin as VitePlugin
} from 'vite'
import { BaseBuilder } from '../base/BaseBuilder'
import type {
  ViteBuilderConfig,
  BuildResult,
  DevServerResult,
  IViteBuilder,
  BuildMode,
  OutputFormat
} from '../types'

/**
 * Vite 构建器类
 * @class ViteBuilder
 * @extends BaseBuilder<ViteBuilderConfig>
 * @implements IViteBuilder
 * @description 提供 Vite 构建工具的高级封装，支持开发服务器、预览服务器、库构建等多种模式
 */
export class ViteBuilder extends BaseBuilder<ViteBuilderConfig> implements IViteBuilder {
  /**
   * 开发服务器实例
   * @private
   * @type {ViteDevServer | undefined}
   */
  private devServer?: ViteDevServer

  /**
   * 预览服务器实例
   * @private
   * @type {PreviewServer | undefined}
   */
  private previewServer?: PreviewServer

  /**
   * 构建器构造函数
   * @constructor
   * @param {ViteBuilderConfig} config - Vite 构建器配置
   */
  constructor(config: ViteBuilderConfig = {}) {
    super(config, 'ViteBuilder')
  }

  /**
   * 标准化配置
   * @protected
   * @override
   * @param {ViteBuilderConfig} config - 原始配置
   * @returns {ViteBuilderConfig} 标准化后的配置
   * @description 标准化 Vite 特定的配置选项，设置默认值
   */
  protected normalizeConfig(config: ViteBuilderConfig): ViteBuilderConfig {
    const root = config.root || process.cwd()
    
    // 深度合并默认配置和用户配置
    return this.mergeConfig({
      root,
      env: 'production',
      entry: 'src/index.ts',
      outDir: 'dist',
      assetsDir: 'assets',
      base: '/',
      sourcemap: true,
      minify: true,
      target: 'es2015',
      cleanOutDir: true,
      // 开发服务器默认配置
      server: {
        port: 3000,
        host: true,
        open: false,
        https: false,
        cors: true,
        hmr: true,
        strictPort: false,
        fs: {
          strict: true,
          allow: ['.']
        }
      },
      // 预览服务器默认配置
      preview: {
        port: 4173,
        host: true,
        open: false,
        https: false,
        strictPort: false,
        cors: true
      },
      // 构建优化配置
      optimization: {
        treeshake: true,
        sideEffects: true,
        usedExports: true,
        concatenateModules: true,
        splitChunks: true,
        runtimeChunk: false,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic'
      },
      // CSS 配置
      css: {
        extract: true,
        modules: false,
        sourceMap: true,
        loaderOptions: {}
      },
      // 插件配置
      plugins: [],
      external: [],
      define: {},
      alias: {}
    }, config) as ViteBuilderConfig
  }

  /**
   * 构建 Vite 配置
   * @private
   * @param {BuildMode} mode - 构建模式
   * @returns {InlineConfig} Vite 配置对象
   * @description 根据构建模式生成对应的 Vite 配置
   */
  private buildViteConfig(mode: BuildMode = 'build'): InlineConfig {
    const { config } = this
    const isDev = mode === 'dev'
    const isLib = !!config.lib
    const isSSR = !!config.ssr

    // 基础配置
    const viteConfig: InlineConfig = {
      root: config.root,
      base: config.base,
      mode: this.getViteMode(),
      define: this.processDefineConfig(),
      publicDir: config.publicDir || 'public',
      cacheDir: config.cacheDir || 'node_modules/.vite',
      resolve: {
        alias: config.alias,
        extensions: config.resolve?.extensions || ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
        mainFields: config.resolve?.mainFields,
        conditions: config.resolve?.conditions,
        preserveSymlinks: config.resolve?.preserveSymlinks
      },
      css: {
        modules: config.css?.modules,
        postcss: config.css?.postcss,
        preprocessorOptions: config.css?.preprocessorOptions,
        devSourcemap: isDev && config.css?.sourceMap
      },
      json: {
        namedExports: true,
        stringify: false
      },
      esbuild: {
        jsxFactory: config.esbuild?.jsxFactory || 'h',
        jsxFragment: config.esbuild?.jsxFragment || 'Fragment',
        jsxInject: config.esbuild?.jsxInject,
        target: config.target as string || 'es2015'
      },
      assetsInclude: config.assetsInclude,
      logLevel: config.logLevel || 'info',
      clearScreen: config.clearScreen ?? true,
      envDir: config.envDir || '.',
      envPrefix: config.envPrefix || 'VITE_',
      plugins: this.processPlugins(),
      ...config.viteConfig
    }

    // 构建配置
    if (!isDev) {
      viteConfig.build = {
        target: config.target,
        outDir: config.outDir,
        assetsDir: config.assetsDir,
        assetsInlineLimit: config.build?.assetsInlineLimit || 4096,
        cssCodeSplit: config.build?.cssCodeSplit ?? true,
        cssTarget: config.build?.cssTarget || config.target,
        sourcemap: config.sourcemap,
        rollupOptions: {
          external: config.external,
          output: this.buildOutputOptions(),
          input: this.resolveInput(),
          ...config.build?.rollupOptions
        },
        minify: config.minify,
        terserOptions: config.build?.terserOptions,
        write: config.build?.write ?? true,
        emptyOutDir: config.cleanOutDir,
        manifest: config.build?.manifest ?? false,
        ssrManifest: config.build?.ssrManifest ?? false,
        ssr: isSSR ? config.ssr?.entry : undefined,
        reportCompressedSize: config.build?.reportCompressedSize ?? true,
        chunkSizeWarningLimit: config.build?.chunkSizeWarningLimit || 500,
        watch: mode === 'watch' ? {} : null
      }

      // 库模式配置
      if (isLib && config.lib) {
        viteConfig.build!.lib = {
          entry: config.lib.entry,
          name: config.lib.name,
          formats: config.lib.formats || ['es', 'cjs'],
          fileName: config.lib.fileName || ((format) => {
            const ext = format === 'es' ? 'js' : format
            return `index.${ext}`
          })
        }
      }
    }

    // 开发服务器配置
    if (isDev) {
      viteConfig.server = {
        ...config.server,
        middlewareMode: config.server?.middlewareMode
      }
    }

    // 预览服务器配置
    if (mode === 'preview') {
      viteConfig.preview = config.preview
    }

    // SSR 配置
    if (isSSR) {
      viteConfig.ssr = {
        external: config.ssr?.external,
        noExternal: config.ssr?.noExternal,
        target: config.ssr?.target || 'node'
      }
    }

    // 优化配置
    viteConfig.optimizeDeps = {
      include: config.optimizeDeps?.include,
      exclude: config.optimizeDeps?.exclude,
      esbuildOptions: config.optimizeDeps?.esbuildOptions,
      force: config.optimizeDeps?.force
    }

    return viteConfig
  }

  /**
   * 处理插件配置
   * @private
   * @returns {VitePlugin[]} 处理后的插件列表
   */
  private processPlugins(): VitePlugin[] {
    const plugins: VitePlugin[] = []
    
    // 添加配置中的插件
    if (this.config.plugins) {
      plugins.push(...this.config.plugins)
    }

    // 根据配置自动添加插件
    if (this.config.autoPlugins) {
      // 可以在这里根据项目类型自动添加常用插件
      // 例如：Vue、React、SVG 等插件
    }

    return plugins
  }

  /**
   * 处理 define 配置
   * @private
   * @returns {Record<string, any>} 处理后的 define 配置
   */
  private processDefineConfig(): Record<string, any> {
    const define: Record<string, any> = {
      ...this.config.define
    }

    // 添加环境变量
    if (this.config.env) {
      define['process.env.NODE_ENV'] = JSON.stringify(this.config.env)
    }

    // 添加构建时间戳
    define['__BUILD_TIME__'] = JSON.stringify(new Date().toISOString())
    
    // 添加版本信息
    if (this.config.version) {
      define['__VERSION__'] = JSON.stringify(this.config.version)
    }

    return define
  }

  /**
   * 构建输出选项
   * @private
   * @returns {any} Rollup 输出选项
   */
  private buildOutputOptions(): any {
    const { config } = this
    
    return {
      format: config.output?.format || 'es',
      exports: config.output?.exports || 'auto',
      preserveModules: config.output?.preserveModules,
      preserveModulesRoot: config.output?.preserveModulesRoot,
      entryFileNames: config.output?.entryFileNames || '[name].[hash].js',
      chunkFileNames: config.output?.chunkFileNames || '[name].[hash].js',
      assetFileNames: config.output?.assetFileNames || '[name].[hash][extname]',
      manualChunks: config.output?.manualChunks,
      inlineDynamicImports: config.output?.inlineDynamicImports,
      ...config.output
    }
  }

  /**
   * 解析入口配置
   * @private
   * @returns {any} 入口配置
   */
  private resolveInput(): any {
    const { config } = this
    
    if (config.lib && config.lib.entry) {
      return config.lib.entry
    }
    
    if (config.entry) {
      return config.entry
    }
    
    return 'index.html'
  }

  /**
   * 获取 Vite 模式
   * @private
   * @returns {string} Vite 模式
   */
  private getViteMode(): string {
    const envMap: Record<string, string> = {
      development: 'development',
      production: 'production',
      test: 'test'
    }
    
    return envMap[this.config.env || 'production'] || 'production'
  }

  /**
   * 执行构建
   * @override
   * @returns {Promise<BuildResult>} 构建结果
   * @description 执行 Vite 构建过程
   */
  async build(): Promise<BuildResult> {
    this.checkDestroyed()
    this.emitBuildStart('build')

    try {
      const viteConfig = this.buildViteConfig('build')
      const result = await build(viteConfig)
      
      const buildResult = this.createBuildResult(
        true,
        this.extractOutputInfo(result),
        [],
        []
      )

      this.emitBuildEnd(buildResult)
      return buildResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const buildResult = this.createBuildResult(
        false,
        [],
        [errorMessage],
        []
      )

      this.emitBuildError(error as Error)
      return buildResult
    }
  }

  /**
   * 构建库
   * @returns {Promise<BuildResult>} 构建结果
   * @description 以库模式执行构建
   */
  async buildLib(): Promise<BuildResult> {
    if (!this.config.lib) {
      throw new Error('库配置(lib)是必需的，请在配置中提供 lib 选项')
    }
    return this.build()
  }

  /**
   * 构建 SSR 应用
   * @returns {Promise<BuildResult>} 构建结果
   * @description 构建服务端渲染应用
   */
  async buildSSR(): Promise<BuildResult> {
    if (!this.config.ssr) {
      throw new Error('SSR 配置是必需的，请在配置中提供 ssr 选项')
    }
    return this.build()
  }

  /**
   * 启动开发服务器
   * @returns {Promise<DevServerResult>} 开发服务器结果
   * @description 启动 Vite 开发服务器
   */
  async dev(): Promise<DevServerResult> {
    this.checkDestroyed()

    // 关闭现有服务器
    if (this.devServer) {
      await this.devServer.close()
    }

    const viteConfig = this.buildViteConfig('dev')
    this.devServer = await createServer(viteConfig)
    
    await this.devServer.listen()
    
    const serverInfo = this.devServer.config.server
    const protocol = serverInfo.https ? 'https' : 'http'
    const host = this.resolveHost(serverInfo.host)
    const port = this.devServer.config.server.port || 3000
    const url = `${protocol}://${host}:${port}${this.config.base || '/'}`

    const result: DevServerResult = {
      url,
      port,
      host,
      https: !!serverInfo.https,
      close: async () => {
        if (this.devServer) {
          await this.devServer.close()
          this.devServer = undefined
        }
      }
    }

    this.emit('server:start', { server: result })
    
    // 打印服务器信息
    this.printServerInfo(result)
    
    return result
  }

  /**
   * 启动预览服务器
   * @returns {Promise<DevServerResult>} 预览服务器结果
   * @description 启动构建产物预览服务器
   */
  async preview(): Promise<DevServerResult> {
    this.checkDestroyed()

    // 关闭现有服务器
    if (this.previewServer) {
      this.previewServer.close()
    }

    const viteConfig = this.buildViteConfig('preview')
    this.previewServer = await preview(viteConfig)
    
    const serverInfo = this.previewServer.config.preview
    const protocol = serverInfo.https ? 'https' : 'http'
    const host = this.resolveHost(serverInfo.host)
    const port = serverInfo.port || 4173
    const url = `${protocol}://${host}:${port}${this.config.base || '/'}`

    const result: DevServerResult = {
      url,
      port,
      host,
      https: !!serverInfo.https,
      close: async () => {
        if (this.previewServer) {
          this.previewServer.close()
          this.previewServer = undefined
        }
      }
    }

    this.emit('server:start', { server: result })
    
    // 打印服务器信息
    this.printServerInfo(result, true)
    
    return result
  }

  /**
   * 监听模式构建
   * @override
   * @returns {Promise<void>}
   * @description 启动文件监听模式，自动重新构建
   */
  async watch(): Promise<void> {
    this.checkDestroyed()
    this.emitBuildStart('watch')
    
    const viteConfig = this.buildViteConfig('watch')
    
    try {
      await build(viteConfig)
    } catch (error) {
      this.emitBuildError(error as Error)
      throw error
    }
  }

  /**
   * 提取输出文件信息
   * @private
   * @param {any} result - Vite 构建结果
   * @returns {BuildResult['outputs']} 输出文件信息数组
   */
  private extractOutputInfo(result: any): BuildResult['outputs'] {
    if (!result || (!result.output && !Array.isArray(result))) {
      return []
    }

    const outputs = Array.isArray(result) ? result : (result.output || [])
    
    return outputs.map((chunk: any) => ({
      fileName: chunk.fileName,
      size: chunk.type === 'chunk' ? chunk.code.length : (chunk.source?.length || 0),
      compressedSize: chunk.compressedSize,
      format: chunk.format || 'es'
    }))
  }

  /**
   * 解析主机地址
   * @private
   * @param {string | boolean | undefined} host - 主机配置
   * @returns {string} 解析后的主机地址
   */
  private resolveHost(host: string | boolean | undefined): string {
    if (host === true) {
      return 'localhost'
    }
    if (typeof host === 'string') {
      return host
    }
    return 'localhost'
  }

  /**
   * 打印服务器信息
   * @private
   * @param {DevServerResult} server - 服务器信息
   * @param {boolean} isPreview - 是否是预览服务器
   */
  private printServerInfo(server: DevServerResult, isPreview = false): void {
    const type = isPreview ? '预览' : '开发'
    console.log(`\n  🚀 ${type}服务器已启动:\n`)
    console.log(`  ➜  Local:   ${server.url}`)
    
    if (server.host !== 'localhost' && server.host !== '127.0.0.1') {
      console.log(`  ➜  Network: ${server.url.replace('localhost', server.host)}`)
    }
    
    console.log('\n  按 h 显示帮助\n')
  }

  /**
   * 获取 Vite 配置
   * @returns {InlineConfig} Vite 配置对象
   * @description 获取当前的 Vite 配置
   */
  getViteConfig(): InlineConfig {
    return this.buildViteConfig()
  }

  /**
   * 销毁构建器
   * @override
   * @returns {Promise<void>}
   * @description 清理所有资源，关闭服务器
   */
  async destroy(): Promise<void> {
    // 关闭开发服务器
    if (this.devServer) {
      await this.devServer.close()
      this.devServer = undefined
    }

    // 关闭预览服务器
    if (this.previewServer) {
      this.previewServer.close()
      this.previewServer = undefined
    }

    this.emit('server:close', {})
    
    // 调用父类销毁方法
    await super.destroy()
  }

  /**
   * 获取服务器状态
   * @returns {object} 服务器状态信息
   */
  getServerStatus(): {
    devServer: boolean
    previewServer: boolean
    devServerUrl?: string
    previewServerUrl?: string
  } {
    return {
      devServer: !!this.devServer,
      previewServer: !!this.previewServer,
      devServerUrl: this.devServer ? 
        `http://localhost:${this.devServer.config.server.port}` : undefined,
      previewServerUrl: this.previewServer ? 
        `http://localhost:${this.previewServer.config.preview.port}` : undefined
    }
  }

  /**
   * 重启开发服务器
   * @returns {Promise<DevServerResult>} 开发服务器结果
   */
  async restartDev(): Promise<DevServerResult> {
    if (this.devServer) {
      await this.devServer.restart()
      console.log('\n  ♻️  开发服务器已重启\n')
    }
    return this.dev()
  }

  /**
   * 添加服务器中间件
   * @param {any} middleware - 中间件函数
   */
  addServerMiddleware(middleware: any): void {
    if (this.devServer) {
      this.devServer.middlewares.use(middleware)
    }
  }
}
