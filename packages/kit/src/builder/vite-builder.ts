/**
 * Vite 构建器类
 * 封装 Vite 的构建、开发服务器、预览等功能
 */

import { build, createServer, preview, type ViteDevServer, type PreviewServer } from 'vite'
import { EventEmitter } from 'events'
import type {
  ViteBuilderConfig,
  BuildResult,
  DevServerResult,
  IViteBuilder,
  BuildMode,
  OutputFormat
} from './types'

/**
 * Vite 构建器类
 * 提供 Vite 构建工具的高级封装
 */
export class ViteBuilder extends EventEmitter implements IViteBuilder {
  private config: ViteBuilderConfig
  private devServer?: ViteDevServer
  private previewServer?: PreviewServer
  private isDestroyed = false

  /**
   * 构造函数
   * @param config Vite 构建器配置
   */
  constructor(config: ViteBuilderConfig = {}) {
    super()
    this.config = this.normalizeConfig(config)
  }

  /**
   * 标准化配置
   * @param config 原始配置
   * @returns 标准化后的配置
   */
  private normalizeConfig(config: ViteBuilderConfig): ViteBuilderConfig {
    const root = config.root || process.cwd()
    
    return {
      root,
      env: config.env || 'production',
      entry: config.entry || 'src/index.ts',
      outDir: config.outDir || 'dist',
      assetsDir: config.assetsDir || 'assets',
      base: config.base || '/',
      sourcemap: config.sourcemap ?? true,
      minify: config.minify ?? true,
      target: config.target || 'es2015',
      cleanOutDir: config.cleanOutDir ?? true,
      server: {
        port: 3000,
        host: true,
        open: false,
        https: false,
        cors: true,
        hmr: true,
        ...config.server
      },
      preview: {
        port: 4173,
        host: true,
        open: false,
        https: false,
        ...config.preview
      },
      plugins: config.plugins || [],
      external: config.external || [],
      define: config.define || {},
      alias: config.alias || {},
      css: {
        extract: true,
        modules: false,
        ...config.css
      },
      ...config
    }
  }

  /**
   * 构建 Vite 配置
   * @param mode 构建模式
   * @returns Vite 配置对象
   */
  private buildViteConfig(mode: BuildMode = 'build') {
    const { config } = this
    const isDev = mode === 'dev'
    const isLib = !!config.lib

    // 基础配置
    const viteConfig: any = {
      root: config.root,
      base: config.base,
      mode: config.env,
      define: config.define,
      resolve: {
        alias: config.alias
      },
      plugins: config.plugins,
      css: {
        modules: config.css?.modules,
        postcss: config.css?.postcss,
        preprocessorOptions: config.css?.preprocessorOptions
      },
      ...config.viteConfig
    }

    // 构建配置
    if (!isDev) {
      viteConfig.build = {
        outDir: config.outDir,
        assetsDir: config.assetsDir,
        sourcemap: config.sourcemap,
        minify: config.minify,
        target: config.target,
        emptyOutDir: config.cleanOutDir,
        rollupOptions: {
          external: config.external
        }
      }

      // 库模式配置
      if (isLib && config.lib) {
        viteConfig.build.lib = {
          entry: config.lib.entry,
          name: config.lib.name,
          formats: config.lib.formats || ['es', 'cjs'],
          fileName: config.lib.fileName
        }
      } else if (typeof config.entry === 'string') {
        viteConfig.build.rollupOptions.input = config.entry
      } else if (typeof config.entry === 'object') {
        viteConfig.build.rollupOptions.input = config.entry
      }
    }

    // 开发服务器配置
    if (isDev) {
      viteConfig.server = config.server
    }

    // 预览服务器配置
    if (mode === 'preview') {
      viteConfig.preview = config.preview
    }

    return viteConfig
  }

  /**
   * 构建项目
   * @returns 构建结果
   */
  async build(): Promise<BuildResult> {
    if (this.isDestroyed) {
      throw new Error('ViteBuilder has been destroyed')
    }

    const startTime = Date.now()
    this.emit('build:start', { mode: 'build', config: this.config })

    try {
      const viteConfig = this.buildViteConfig('build')
      const result = await build(viteConfig)
      
      const duration = Date.now() - startTime
      const buildResult: BuildResult = {
        success: true,
        duration,
        outputs: this.extractOutputInfo(result),
        errors: [],
        warnings: []
      }

      this.emit('build:end', { result: buildResult })
      return buildResult
    } catch (error) {
      const buildResult: BuildResult = {
        success: false,
        duration: Date.now() - startTime,
        outputs: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      }

      this.emit('build:error', { error: error as Error })
      return buildResult
    }
  }

  /**
   * 构建库
   * @returns 构建结果
   */
  async buildLib(): Promise<BuildResult> {
    if (!this.config.lib) {
      throw new Error('Library configuration is required for buildLib()')
    }
    return this.build()
  }

  /**
   * 启动开发服务器
   * @returns 开发服务器结果
   */
  async dev(): Promise<DevServerResult> {
    if (this.isDestroyed) {
      throw new Error('ViteBuilder has been destroyed')
    }

    if (this.devServer) {
      await this.devServer.close()
    }

    const viteConfig = this.buildViteConfig('dev')
    this.devServer = await createServer(viteConfig)
    
    await this.devServer.listen()
    
    const serverInfo = this.devServer.config.server
    const protocol = serverInfo.https ? 'https' : 'http'
    const host = serverInfo.host === true ? 'localhost' : (serverInfo.host || 'localhost')
    const port = this.devServer.config.server.port || 3000
    const url = `${protocol}://${host}:${port}`

    const result: DevServerResult = {
      url,
      port,
      host: host as string,
      https: !!serverInfo.https,
      close: async () => {
        if (this.devServer) {
          await this.devServer.close()
          this.devServer = undefined
        }
      }
    }

    this.emit('server:start', { server: result })
    return result
  }

  /**
   * 启动预览服务器
   * @returns 预览服务器结果
   */
  async preview(): Promise<DevServerResult> {
    if (this.isDestroyed) {
      throw new Error('ViteBuilder has been destroyed')
    }

    if (this.previewServer) {
      this.previewServer.close()
    }

    const viteConfig = this.buildViteConfig('preview')
    this.previewServer = await preview(viteConfig)
    
    const serverInfo = this.previewServer.config.preview
    const protocol = serverInfo.https ? 'https' : 'http'
    const host = serverInfo.host === true ? 'localhost' : (serverInfo.host || 'localhost')
    const port = serverInfo.port || 4173
    const url = `${protocol}://${host}:${port}`

    const result: DevServerResult = {
      url,
      port,
      host: host as string,
      https: !!serverInfo.https,
      close: async () => {
        if (this.previewServer) {
          this.previewServer.close()
          this.previewServer = undefined
        }
      }
    }

    this.emit('server:start', { server: result })
    return result
  }

  /**
   * 监听模式构建
   */
  async watch(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('ViteBuilder has been destroyed')
    }

    const viteConfig = this.buildViteConfig('watch')
    viteConfig.build = {
      ...viteConfig.build,
      watch: {}
    }

    this.emit('build:start', { mode: 'watch', config: this.config })
    
    try {
      await build(viteConfig)
    } catch (error) {
      this.emit('build:error', { error: error as Error })
      throw error
    }
  }

  /**
   * 提取输出文件信息
   * @param result Vite 构建结果
   * @returns 输出文件信息数组
   */
  private extractOutputInfo(result: any): BuildResult['outputs'] {
    if (!result || !result.output) {
      return []
    }

    return result.output.map((chunk: any) => ({
      fileName: chunk.fileName,
      size: chunk.type === 'chunk' ? chunk.code.length : chunk.source.length,
      format: chunk.format
    }))
  }

  /**
   * 获取配置
   * @returns 当前配置
   */
  getConfig(): ViteBuilderConfig {
    return { ...this.config }
  }

  /**
   * 获取 Vite 配置
   * @returns Vite 配置对象
   */
  getViteConfig() {
    return this.buildViteConfig()
  }

  /**
   * 设置配置
   * @param config 新配置
   */
  setConfig(config: Partial<ViteBuilderConfig>): void {
    this.config = this.normalizeConfig({ ...this.config, ...config })
  }

  /**
   * 添加插件
   * @param plugin Vite 插件
   */
  addPlugin(plugin: any): void {
    this.config.plugins = this.config.plugins || []
    this.config.plugins.push(plugin)
  }

  /**
   * 移除插件
   * @param pluginName 插件名称
   */
  removePlugin(pluginName: string): void {
    if (this.config.plugins) {
      this.config.plugins = this.config.plugins.filter(
        plugin => plugin.name !== pluginName
      )
    }
  }

  /**
   * 销毁构建器
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true

    if (this.devServer) {
      await this.devServer.close()
      this.devServer = undefined
    }

    if (this.previewServer) {
      this.previewServer.close()
      this.previewServer = undefined
    }

    this.emit('server:close', {})
    this.removeAllListeners()
  }
}
