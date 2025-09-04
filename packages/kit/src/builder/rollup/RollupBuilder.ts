/**
 * Rollup 构建器类
 * @module RollupBuilder
 * @description 封装 Rollup 的打包功能，提供灵活的插件配置和多种输出格式支持
 * 
 * @example
 * ```typescript
 * // 创建 Rollup 构建器实例
 * const builder = new RollupBuilder({
 *   input: 'src/index.ts',
 *   output: {
 *     file: 'dist/bundle.js',
 *     format: 'es'
 *   }
 * })
 * 
 * // 执行构建
 * const result = await builder.build()
 * 
 * // 监听模式
 * await builder.watch()
 * ```
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { 
  rollup, 
  watch,
  type RollupBuild,
  type RollupWatcher,
  type RollupOptions,
  type OutputOptions,
  type Plugin as RollupPlugin
} from 'rollup'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { BaseBuilder } from '../base/BaseBuilder'
import type {
  RollupBuilderConfig,
  BuildResult,
  IRollupBuilder,
  BuildMode,
  OutputFormat
} from '../types'

/**
 * Rollup 构建器类
 * @class RollupBuilder
 * @extends BaseBuilder<RollupBuilderConfig>
 * @implements IRollupBuilder
 * @description 提供 Rollup 构建工具的高级封装，支持多种输出格式和高级配置
 */
export class RollupBuilder extends BaseBuilder<RollupBuilderConfig> implements IRollupBuilder {
  /**
   * 监听器实例
   * @private
   * @type {RollupWatcher | undefined}
   */
  private watcher?: RollupWatcher

  /**
   * 当前构建实例
   * @private
   * @type {RollupBuild | undefined}
   */
  private currentBundle?: RollupBuild

  /**
   * 构建缓存
   * @private
   * @type {Map<string, any>}
   */
  private buildCache: Map<string, any> = new Map()

  /**
   * 构造函数
   * @constructor
   * @param {RollupBuilderConfig} config - Rollup 构建器配置
   */
  constructor(config: RollupBuilderConfig) {
    super(config, 'RollupBuilder')
  }

  /**
   * 标准化配置
   * @protected
   * @override
   * @param {RollupBuilderConfig} config - 原始配置
   * @returns {RollupBuilderConfig} 标准化后的配置
   * @description 标准化 Rollup 特定的配置选项，设置默认值
   */
  protected normalizeConfig(config: RollupBuilderConfig): RollupBuilderConfig {
    const root = config.root || process.cwd()
    
    // 标准化输出配置
    const output = this.normalizeOutput(config.output)
    
    // 深度合并默认配置和用户配置
    return this.mergeConfig({
      root,
      env: 'production',
      input: config.input,
      output,
      sourcemap: true,
      minify: true,
      target: 'es2015',
      external: [],
      define: {},
      alias: {},
      cleanOutDir: true,
      plugins: [],
      // 监听模式配置
      watch: {
        clearScreen: true,
        skipWrite: false,
        buildDelay: 200,
        chokidar: {
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 50,
            pollInterval: 10
          }
        }
      },
      // 高级配置
      treeshake: {
        moduleSideEffects: true,
        propertyReadSideEffects: true,
        tryCatchDeoptimization: true,
        unknownGlobalSideEffects: true
      },
      cache: true,
      strictDeprecations: false,
      preserveEntrySignatures: 'strict',
      maxParallelFileOps: 20,
      // 性能配置
      perf: false,
      // 上下文配置
      context: 'undefined',
      moduleContext: {},
      // 危险区域配置
      acorn: undefined,
      acornInjectPlugins: undefined,
      preserveSymlinks: false
    }, config) as RollupBuilderConfig
  }

  /**
   * 标准化输出配置
   * @private
   * @param {OutputOptions | OutputOptions[]} output - 原始输出配置
   * @returns {OutputOptions | OutputOptions[]} 标准化后的输出配置
   */
  private normalizeOutput(output: OutputOptions | OutputOptions[]): OutputOptions | OutputOptions[] {
    const normalizeOne = (opt: OutputOptions): OutputOptions => ({
      format: 'es',
      exports: 'auto',
      sourcemap: this.config.sourcemap,
      sourcemapExcludeSources: false,
      sourcemapFile: undefined,
      sourcemapPathTransform: undefined,
      compact: this.config.minify,
      minifyInternalExports: true,
      hoistTransitiveImports: true,
      manualChunks: undefined,
      inlineDynamicImports: false,
      preserveModules: false,
      preserveModulesRoot: undefined,
      entryFileNames: '[name].js',
      chunkFileNames: '[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
        objectShorthand: true,
        preset: 'es2015',
        reservedNamesAsProps: true,
        symbols: false
      },
      ...opt
    })

    return Array.isArray(output) 
      ? output.map(normalizeOne)
      : normalizeOne(output)
  }

  /**
   * 构建 Rollup 配置
   * @private
   * @param {BuildMode} mode - 构建模式
   * @returns {RollupOptions} Rollup 配置对象
   * @description 根据构建模式生成对应的 Rollup 配置
   */
  private buildRollupConfig(mode: BuildMode = 'build'): RollupOptions {
    const { config } = this
    const isWatch = mode === 'watch'

    // 基础配置
    const rollupConfig: RollupOptions = {
      input: config.input,
      external: this.processExternal(),
      plugins: this.processPlugins(),
      cache: isWatch && config.cache ? this.buildCache : config.cache,
      treeshake: config.treeshake,
      strictDeprecations: config.strictDeprecations,
      preserveEntrySignatures: config.preserveEntrySignatures,
      maxParallelFileOps: config.maxParallelFileOps,
      perf: config.perf,
      context: config.context,
      moduleContext: config.moduleContext,
      preserveSymlinks: config.preserveSymlinks,
      ...config.rollupConfig
    }

    // 监听模式配置
    if (isWatch && config.watch) {
      rollupConfig.watch = {
        ...config.watch,
        include: config.watch.include || ['src/**'],
        exclude: config.watch.exclude || ['node_modules/**']
      }
    }

    // 添加危险区域配置
    if (config.acorn) {
      rollupConfig.acorn = config.acorn
    }
    
    if (config.acornInjectPlugins) {
      rollupConfig.acornInjectPlugins = config.acornInjectPlugins
    }

    // 处理钩子函数
    this.attachHooks(rollupConfig)

    return rollupConfig
  }

  /**
   * 处理外部依赖
   * @private
   * @returns {any} 处理后的外部依赖配置
   */
  private processExternal(): any {
    const { external } = this.config

    if (!external) {
      return []
    }

    // 如果是函数，直接返回
    if (typeof external === 'function') {
      return external
    }

    // 如果是数组，创建匹配函数
    if (Array.isArray(external)) {
      return (id: string) => {
        // 精确匹配
        if (external.includes(id)) {
          return true
        }
        
        // 模块名匹配（处理子路径）
        return external.some(ext => {
          if (ext.endsWith('*')) {
            return id.startsWith(ext.slice(0, -1))
          }
          return id === ext || id.startsWith(ext + '/')
        })
      }
    }

    return external
  }

  /**
   * 处理插件配置
   * @private
   * @returns {RollupPlugin[]} 处理后的插件列表
   */
  private processPlugins(): RollupPlugin[] {
    const plugins: RollupPlugin[] = []

    // 添加配置中的插件
    if (this.config.plugins) {
      plugins.push(...this.config.plugins)
    }

    // 根据配置自动添加插件
    if (this.config.autoPlugins) {
      // 可以在这里根据配置自动添加常用插件
      // 例如：TypeScript、JSON、CommonJS 等插件
    }

    return plugins
  }

  /**
   * 附加钩子函数
   * @private
   * @param {RollupOptions} config - Rollup 配置
   */
  private attachHooks(config: RollupOptions): void {
    // 可以在这里添加全局钩子函数
    // 例如：构建开始、结束、错误处理等
    
    const originalOnwarn = config.onwarn
    
    config.onwarn = (warning, warn) => {
      // 自定义警告处理
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return // 忽略循环依赖警告
      }
      
      // 收集警告信息
      if (this.buildStartTime) {
        // 可以收集警告用于构建报告
      }
      
      // 调用原始警告处理器
      if (originalOnwarn) {
        originalOnwarn(warning, warn)
      } else {
        warn(warning)
      }
    }
  }

  /**
   * 执行构建
   * @override
   * @returns {Promise<BuildResult>} 构建结果
   * @description 执行 Rollup 构建过程
   */
  async build(): Promise<BuildResult> {
    this.checkDestroyed()
    this.emitBuildStart('build')

    try {
      const rollupConfig = this.buildRollupConfig('build')
      
      // 执行构建
      this.currentBundle = await rollup(rollupConfig)
      
      // 获取输出配置
      const outputs = Array.isArray(this.config.output) 
        ? this.config.output 
        : [this.config.output]
      
      // 写入输出文件
      const results = []
      for (const outputConfig of outputs) {
        const { output } = await this.currentBundle.write(outputConfig)
        results.push(...output)
      }

      // 关闭 bundle
      await this.currentBundle.close()
      this.currentBundle = undefined
      
      // 创建构建结果
      const buildResult = this.createBuildResult(
        true,
        this.extractOutputInfo(results),
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
    } finally {
      // 清理 bundle
      if (this.currentBundle) {
        await this.currentBundle.close()
        this.currentBundle = undefined
      }
    }
  }

  /**
   * 构建多个输出格式
   * @param {OutputFormat[]} formats - 输出格式数组
   * @returns {Promise<BuildResult[]>} 构建结果数组
   * @description 为每个格式生成独立的构建输出
   */
  async buildMultiple(formats: OutputFormat[]): Promise<BuildResult[]> {
    this.checkDestroyed()
    
    const results: BuildResult[] = []
    const rollupConfig = this.buildRollupConfig('build')
    
    try {
      // 执行一次构建
      const bundle = await rollup(rollupConfig)
      
      // 为每个格式生成输出
      for (const format of formats) {
        try {
          const outputConfig = this.createOutputConfig(format)
          const { output } = await bundle.write(outputConfig)
          
          results.push(this.createBuildResult(
            true,
            this.extractOutputInfo(output),
            [],
            []
          ))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.push(this.createBuildResult(
            false,
            [],
            [`构建格式 ${format} 失败: ${errorMessage}`],
            []
          ))
        }
      }
      
      // 关闭 bundle
      await bundle.close()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // 如果整体构建失败，为每个格式返回失败结果
      formats.forEach(format => {
        results.push(this.createBuildResult(
          false,
          [],
          [`构建失败: ${errorMessage}`],
          []
        ))
      })
    }

    return results
  }

  /**
   * 创建输出配置
   * @private
   * @param {OutputFormat} format - 输出格式
   * @returns {OutputOptions} 输出配置
   */
  private createOutputConfig(format: OutputFormat): OutputOptions {
    const baseOutput = Array.isArray(this.config.output) 
      ? this.config.output[0] 
      : this.config.output

    // 根据格式调整文件名
    let file = baseOutput.file
    if (file) {
      const ext = this.getExtensionByFormat(format)
      file = file.replace(/\.[^.]+$/, ext)
    }

    return {
      ...baseOutput,
      format,
      file,
      name: format === 'umd' || format === 'iife' ? baseOutput.name || 'Bundle' : undefined
    }
  }

  /**
   * 根据格式获取文件扩展名
   * @private
   * @param {OutputFormat} format - 输出格式
   * @returns {string} 文件扩展名
   */
  private getExtensionByFormat(format: OutputFormat): string {
    const extensions: Record<OutputFormat, string> = {
      es: '.esm.js',
      cjs: '.cjs.js',
      umd: '.umd.js',
      iife: '.iife.js',
      amd: '.amd.js',
      system: '.system.js'
    }
    return extensions[format] || '.js'
  }

  /**
   * 监听模式构建
   * @override
   * @returns {Promise<void>}
   * @description 启动文件监听模式，自动重新构建
   */
  async watch(): Promise<void> {
    this.checkDestroyed()

    // 关闭现有监听器
    if (this.watcher) {
      this.watcher.close()
    }

    const rollupConfig = this.buildRollupConfig('watch')
    this.watcher = watch(rollupConfig)

    this.emitBuildStart('watch')

    // 监听事件
    this.watcher.on('event', (event) => {
      this.handleWatchEvent(event)
    })

    // 返回 Promise，但不会 resolve（监听模式持续运行）
    return new Promise((_, reject) => {
      if (this.watcher) {
        this.watcher.on('event', (event) => {
          if (event.code === 'ERROR') {
            reject(event.error)
          }
        })
      }
    })
  }

  /**
   * 处理监听事件
   * @private
   * @param {any} event - 监听事件
   */
  private handleWatchEvent(event: any): void {
    switch (event.code) {
      case 'START':
        this.emitBuildStart('watch')
        console.log('\n🔄 开始构建...')
        break
        
      case 'BUNDLE_START':
        console.log(`📦 正在打包: ${event.input}`)
        break
        
      case 'BUNDLE_END':
        if (event.result) {
          const buildResult = this.createBuildResult(
            true,
            [],
            [],
            []
          )
          buildResult.duration = event.duration
          this.emitBuildEnd(buildResult)
          console.log(`✅ 构建完成 (${event.duration}ms)`)
          
          // 缓存构建结果
          if (this.config.cache) {
            this.buildCache.set('main', event.result.cache)
          }
          
          event.result.close()
        }
        break
        
      case 'ERROR':
        this.emitBuildError(event.error)
        console.error(`❌ 构建错误:`, event.error.message)
        break
        
      case 'END':
        console.log('👀 监听文件变化...\n')
        break
    }
  }

  /**
   * 提取输出文件信息
   * @private
   * @param {any[]} outputs - Rollup 输出结果
   * @returns {BuildResult['outputs']} 输出文件信息数组
   */
  private extractOutputInfo(outputs: any[]): BuildResult['outputs'] {
    return outputs.map(output => {
      const size = output.type === 'chunk' 
        ? Buffer.byteLength(output.code, 'utf8')
        : Buffer.byteLength(output.source, 'utf8')

      return {
        fileName: output.fileName,
        size,
        compressedSize: output.compressedSize,
        format: (output as any).format || this.detectFormat(output)
      }
    })
  }

  /**
   * 检测输出格式
   * @private
   * @param {any} output - 输出对象
   * @returns {OutputFormat | undefined} 检测到的格式
   */
  private detectFormat(output: any): OutputFormat | undefined {
    // 尝试从文件名推断格式
    const fileName = output.fileName || ''
    
    if (fileName.includes('.esm.')) return 'es'
    if (fileName.includes('.cjs.')) return 'cjs'
    if (fileName.includes('.umd.')) return 'umd'
    if (fileName.includes('.iife.')) return 'iife'
    if (fileName.includes('.amd.')) return 'amd'
    if (fileName.includes('.system.')) return 'system'
    
    return undefined
  }

  /**
   * 获取 Rollup 配置
   * @returns {RollupOptions} Rollup 配置对象
   * @description 获取当前的 Rollup 配置
   */
  getRollupConfig(): RollupOptions {
    return this.buildRollupConfig()
  }

  /**
   * 销毁构建器
   * @override
   * @returns {Promise<void>}
   * @description 清理所有资源，停止监听
   */
  async destroy(): Promise<void> {
    // 关闭监听器
    if (this.watcher) {
      this.watcher.close()
      this.watcher = undefined
    }

    // 关闭当前 bundle
    if (this.currentBundle) {
      await this.currentBundle.close()
      this.currentBundle = undefined
    }

    // 清理缓存
    this.buildCache.clear()

    // 调用父类销毁方法
    await super.destroy()
  }

  /**
   * 获取构建缓存
   * @returns {Map<string, any>} 构建缓存
   */
  getBuildCache(): Map<string, any> {
    return new Map(this.buildCache)
  }

  /**
   * 清理构建缓存
   */
  clearBuildCache(): void {
    this.buildCache.clear()
  }

  /**
   * 获取监听器状态
   * @returns {boolean} 是否正在监听
   */
  isWatching(): boolean {
    return !!this.watcher
  }

  /**
   * 停止监听
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = undefined
      console.log('⏹️  停止监听')
    }
  }

  /**
   * 验证输入文件
   * @returns {boolean} 输入文件是否存在
   */
  validateInput(): boolean {
    const { input } = this.config

    if (typeof input === 'string') {
      const inputPath = resolve(this.config.root || process.cwd(), input)
      return existsSync(inputPath)
    }

    if (Array.isArray(input)) {
      return input.every(file => {
        const inputPath = resolve(this.config.root || process.cwd(), file)
        return existsSync(inputPath)
      })
    }

    if (typeof input === 'object') {
      return Object.values(input).every(file => {
        const inputPath = resolve(this.config.root || process.cwd(), file)
        return existsSync(inputPath)
      })
    }

    return false
  }

  /**
   * 获取插件信息
   * @returns {Array<{name: string, version?: string}>} 插件信息列表
   */
  getPluginInfo(): Array<{name: string, version?: string}> {
    return this.plugins.map((plugin: any) => ({
      name: plugin.name || 'unknown',
      version: plugin.version
    }))
  }
}
