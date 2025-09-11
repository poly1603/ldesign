/**
 * Rolldown 适配器
 * 
 * 提供 Rolldown 打包器的适配实现
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions,
  BundlerSpecificConfig,
  BundlerSpecificPlugin
} from '../../types/adapter'
import type { BuildResult, BuildWatcher } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'

/**
 * Rolldown 适配器类
 */
export class RolldownAdapter implements IBundlerAdapter {
  readonly name = 'rolldown' as const
  readonly version: string
  readonly available: boolean

  private logger: Logger

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()

    // 在 ES 模块环境中，我们无法在构造函数中同步加载 rolldown
    // 所以我们假设它是可用的，并在实际使用时进行检查
    try {
      const rolldown = this.loadRolldown()
      this.version = rolldown.VERSION || 'unknown'
      this.available = true
      this.logger.debug(`Rolldown 适配器初始化成功 (v${this.version})`)
    } catch (error) {
      // 同步加载失败，但这在 ES 模块环境中是预期的
      // 我们将在实际使用时尝试异步加载
      this.version = 'unknown'
      this.available = true // 假设可用，在使用时验证
      this.logger.debug('Rolldown 同步加载失败，将在使用时异步加载')
    }
  }

  /**
   * 执行构建
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Rolldown 适配器不可用'
      )
    }

    try {
      // 尝试加载 rolldown，支持异步加载
      const rolldown = await this.ensureRolldownLoaded()

      this.logger.info('开始 Rolldown 构建...')
      const startTime = Date.now()

      // 检查是否需要多格式构建
      const outputConfig = config.output
      const formats = Array.isArray(outputConfig?.format) ? outputConfig.format : [outputConfig?.format || 'esm']

      // Rolldown 目前主要支持 ESM，但我们可以尝试构建多个格式
      const supportedFormats = formats.filter(format => ['esm', 'cjs'].includes(format))
      if (supportedFormats.length === 0) {
        supportedFormats.push('esm') // 默认使用 ESM
      }

      const allResults: any[] = []
      let totalDuration = 0

      // 为每个支持的格式执行构建
      for (const format of supportedFormats) {
        this.logger.info(`构建 ${format.toUpperCase()} 格式...`)

        // 为当前格式创建配置
        const formatConfig = {
          ...config,
          output: {
            ...outputConfig,
            format: format
          }
        }

        const rolldownConfig = await this.transformConfig(formatConfig)
        const formatStartTime = Date.now()

        try {
          const result = await rolldown.build(rolldownConfig)
          const formatDuration = Date.now() - formatStartTime
          totalDuration += formatDuration

          allResults.push({
            format,
            result,
            duration: formatDuration
          })

          this.logger.info(`${format.toUpperCase()} 格式构建完成 (${formatDuration}ms)`)
        } catch (error) {
          this.logger.warn(`${format.toUpperCase()} 格式构建失败: ${(error as Error).message}`)
          // 继续构建其他格式
        }
      }

      const duration = Date.now() - startTime

      // 合并所有构建结果
      const combinedOutputs = allResults.flatMap(r => r.result.outputs || [])
      const combinedWarnings = allResults.flatMap(r => r.result.warnings || [])

      // 构建结果
      const totalRawSize = combinedOutputs.reduce((sum, output) => sum + (output.size || 0), 0)
      const largestOutput = combinedOutputs.reduce((max, o) => (o.size || 0) > (max.size || 0) ? o : max, { size: 0, fileName: '' } as any)

      const buildResult: BuildResult = {
        success: allResults.length > 0,
        outputs: combinedOutputs,
        duration,
        stats: {
          buildTime: duration,
          fileCount: combinedOutputs.length,
          totalSize: {
            raw: totalRawSize,
            gzip: 0,
            brotli: 0,
            byType: {},
            byFormat: {} as any,
            largest: {
              file: largestOutput.fileName || '',
              size: largestOutput.size || 0
            },
            fileCount: combinedOutputs.length
          },
          byFormat: {} as any,
          modules: {
            total: 0,
            external: 0,
            internal: 0,
            largest: {
              id: '',
              size: 0,
              renderedLength: 0,
              originalLength: 0,
              isEntry: false,
              isExternal: false,
              importedIds: [],
              dynamicallyImportedIds: [],
              importers: [],
              dynamicImporters: []
            }
          },
          dependencies: {
            total: 0,
            external: [],
            bundled: [],
            circular: []
          }
        },
        performance: this.getPerformanceMetrics(),
        warnings: combinedWarnings,
        errors: [],
        buildId: `rolldown-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rolldown',
        mode: 'production'
      }

      this.logger.success(`Rolldown 构建完成 (${duration}ms)，成功构建 ${allResults.length}/${supportedFormats.length} 个格式`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Rolldown 构建失败: ${(error as Error).message}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Rolldown 适配器不可用'
      )
    }

    try {
      const rolldown = await this.ensureRolldownLoaded()
      const rolldownConfig = await this.transformConfig(config)

      // 启动监听
      const watcher = await rolldown.watch(rolldownConfig)

      // 创建统一的监听器接口
      const watchOptions = config.watch || {}
      const buildWatcher = {
        patterns: (typeof watchOptions === 'object' && (watchOptions as any).include) || ['src/**/*'],
        watching: true,

        async close() {
          if (watcher && typeof watcher.close === 'function') {
            await watcher.close()
          }
        },

        on(event: string, listener: (...args: any[]) => void) {
          if (watcher && typeof watcher.on === 'function') {
            watcher.on(event, listener)
          }
          return this
        },

        off(event: string, listener: (...args: any[]) => void) {
          if (watcher && typeof watcher.off === 'function') {
            watcher.off(event, listener)
          }
          return this
        },

        emit(event: string, ...args: any[]) {
          if (watcher && typeof watcher.emit === 'function') {
            return watcher.emit(event, ...args)
          }
          return false
        }
      } as BuildWatcher

      this.logger.info('Rolldown 监听模式已启动')
      return buildWatcher

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `启动 Rolldown 监听模式失败: ${(error as Error).message}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig> {
    // 转换为 Rolldown 配置格式
    const rolldownConfig: any = {
      input: config.input,
      external: config.external,
      plugins: [] // 暂时禁用所有插件来测试基本功能
    }

    // 转换输出配置 - 实现标准目录结构
    if (config.output) {
      const outputConfig = config.output
      const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [outputConfig.format]
      const format = formats[0] || 'esm' // Rolldown 目前主要支持 ESM

      // 根据格式确定输出目录，遵循标准目录结构
      const isESM = format === 'esm'
      const isCJS = format === 'cjs'
      const isUMD = format === 'umd'

      let dir: string
      let fileName: string

      if (isESM) {
        dir = 'es'
        fileName = '[name].js'
      } else if (isCJS) {
        dir = 'cjs'
        fileName = '[name].cjs'
      } else if (isUMD) {
        dir = 'dist'
        fileName = '[name].umd.js'
      } else {
        dir = 'dist'
        fileName = '[name].js'
      }

      rolldownConfig.output = {
        dir: outputConfig.dir || dir,
        file: outputConfig.file,
        format: format as any,
        name: outputConfig.name,
        sourcemap: outputConfig.sourcemap,
        globals: outputConfig.globals,
        entryFileNames: fileName,
        chunkFileNames: fileName
      }

      this.logger.info(`Rolldown 输出配置: 格式=${format}, 目录=${dir}, 文件名=${fileName}`)
    }

    // Rolldown 特有配置
    if (config.platform) {
      rolldownConfig.platform = config.platform
    }

    // 转换其他选项
    if (config.treeshake !== undefined) {
      rolldownConfig.treeshake = config.treeshake
    }

    return rolldownConfig
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]> {
    const transformedPlugins: BundlerSpecificPlugin[] = []

    for (const plugin of plugins) {
      try {
        // 如果插件有 plugin 函数，调用它来获取实际插件
        if (plugin.plugin && typeof plugin.plugin === 'function') {
          const actualPlugin = await plugin.plugin()
          transformedPlugins.push(actualPlugin)
        }
        // 如果插件有 rolldown 特定配置，使用它
        else if (plugin.rolldown) {
          transformedPlugins.push({ ...plugin, ...plugin.rolldown })
        }
        // 如果插件有 setup 方法，保持原样
        else if (plugin.setup) {
          transformedPlugins.push(plugin)
        }
        // 尝试转换 Rollup 插件为 Rolldown 格式
        else {
          transformedPlugins.push(this.convertRollupPlugin(plugin))
        }
      } catch (error) {
        this.logger.warn(`插件 ${plugin.name || 'unknown'} 加载失败:`, (error as Error).message)
      }
    }

    return transformedPlugins
  }

  /**
   * 检查功能支持
   */
  supportsFeature(feature: any): boolean {
    // Rolldown 支持的功能
    const supportedFeatures = [
      'treeshaking',
      'code-splitting',
      'dynamic-import',
      'sourcemap',
      'minification',
      'plugin-system',
      'config-file',
      'cache-support',
      'parallel-build',
      'incremental-build'
    ]

    return supportedFeatures.includes(feature)
  }

  /**
   * 获取功能支持映射
   */
  getFeatureSupport(): any {
    return {
      treeshaking: true,
      'code-splitting': true,
      'dynamic-import': true,
      'worker-support': true,
      'css-bundling': true,
      'asset-processing': true,
      sourcemap: true,
      minification: true,
      'hot-reload': false,
      'module-federation': false,
      'incremental-build': true,
      'parallel-build': true,
      'cache-support': true,
      'plugin-system': true,
      'config-file': true
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    // 返回默认指标，因为 PerformanceMonitor 没有直接的 getMetrics 方法
    // 性能指标应该通过 endBuild 方法获取
    return {
      buildTime: 0,
      memoryUsage: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
        peak: 0,
        trend: []
      },
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        entries: 0,
        timeSaved: 0
      },
      fileStats: {
        totalFiles: 0,
        filesByType: {},
        averageProcessingTime: 0,
        slowestFiles: [],
        processingRate: 0
      },
      pluginPerformance: [],
      systemResources: {
        cpuUsage: 0,
        availableMemory: 0,
        diskUsage: {
          total: 0,
          used: 0,
          available: 0,
          usagePercent: 0
        }
      }
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    // Rolldown 适配器没有需要清理的资源
  }

  /**
   * 确保 Rolldown 已加载（支持异步）
   */
  private async ensureRolldownLoaded(): Promise<any> {
    try {
      // 首先尝试同步加载
      return this.loadRolldown()
    } catch (error) {
      // 同步加载失败，尝试异步加载
      try {
        this.logger.debug('尝试异步加载 rolldown...')
        const rolldown = await import('rolldown')
        if (rolldown && (rolldown.VERSION || typeof rolldown.build === 'function')) {
          this.logger.debug(`Rolldown 异步加载成功: ${rolldown.VERSION || 'unknown'}`)
          return rolldown
        }
        throw new Error('Rolldown 模块无效')
      } catch (asyncError) {
        throw new BuilderError(
          ErrorCode.ADAPTER_NOT_AVAILABLE,
          'Rolldown 未安装或无法加载，请运行: npm install rolldown --save-dev',
          { cause: asyncError as Error }
        )
      }
    }
  }

  /**
   * 加载 Rolldown（同步方式）
   */
  private loadRolldown(): any {
    try {
      // 方式1: 在 CommonJS 环境中直接使用 require
      if (typeof require !== 'undefined') {
        return require('rolldown')
      }

      // 方式2: 在 ES 模块环境中，尝试使用 createRequire
      // 由于这是一个同步方法，我们不能使用 async import
      // 但我们可以尝试访问全局的 require 函数

      // 检查是否在 Node.js 环境中
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // 尝试通过 globalThis 访问 require
        const globalRequire = (globalThis as any).require
        if (globalRequire) {
          return globalRequire('rolldown')
        }

        // 尝试通过 global 访问 require
        const nodeGlobal = (global as any)
        if (nodeGlobal && nodeGlobal.require) {
          return nodeGlobal.require('rolldown')
        }
      }

      throw new Error('无法在当前环境中加载 rolldown 模块')
    } catch (error) {
      throw new Error('Rolldown 未安装，请运行: npm install rolldown --save-dev')
    }
  }

  /**
   * 转换 Rollup 插件为 Rolldown 格式
   */
  private convertRollupPlugin(plugin: any): any {
    // 如果插件已经是 Rolldown 格式，直接返回
    if (plugin.setup) {
      return plugin
    }

    // 尝试转换 Rollup 插件
    return {
      name: plugin.name || 'unknown',
      setup(build: any) {
        // 转换 Rollup 钩子为 Rolldown 钩子
        if (plugin.resolveId) {
          build.onResolve({ filter: /.*/ }, plugin.resolveId)
        }

        if (plugin.load) {
          build.onLoad({ filter: /.*/ }, plugin.load)
        }

        if (plugin.transform) {
          build.onTransform({ filter: /.*/ }, plugin.transform)
        }
      }
    }
  }
}
