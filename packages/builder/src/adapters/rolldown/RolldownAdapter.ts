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
  private performanceMonitor: any

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.performanceMonitor = options.performanceMonitor

    // 检查 Rolldown 是否可用
    try {
      const rolldown = this.loadRolldown()
      this.version = rolldown.VERSION || 'unknown'
      this.available = true

      this.logger.debug(`Rolldown 适配器初始化成功 (v${this.version})`)
    } catch (error) {
      this.version = 'unknown'
      this.available = false

      this.logger.warn('Rolldown 不可用:', (error as Error).message)
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
      const rolldown = this.loadRolldown()
      const rolldownConfig = await this.transformConfig(config)

      this.logger.info('开始 Rolldown 构建...')
      const startTime = Date.now()

      // 执行构建
      const result = await rolldown.build(rolldownConfig)

      const duration = Date.now() - startTime

      // 构建结果
      const buildResult: BuildResult = {
        success: true,
        outputs: result.outputs || [],
        duration,
        stats: result.stats || {
          totalSize: 0,
          gzipSize: 0,
          files: [],
          chunks: [],
          assets: [],
          modules: [],
          dependencies: [],
          warnings: [],
          errors: []
        },
        performance: this.getPerformanceMetrics(),
        warnings: result.warnings || [],
        errors: [],
        buildId: `rolldown-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rolldown',
        mode: 'production'
      }

      this.logger.success(`Rolldown 构建完成 (${duration}ms)`)
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
      const rolldown = this.loadRolldown()
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
      plugins: await this.transformPlugins(config.plugins || [])
    }

    // 转换输出配置
    if (config.output) {
      rolldownConfig.output = {
        dir: config.output.dir,
        file: config.output.file,
        format: config.output.format,
        name: config.output.name,
        sourcemap: config.output.sourcemap,
        globals: config.output.globals
      }
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
    if (this.performanceMonitor) {
      return this.performanceMonitor.getPerformanceMetrics()
    }

    // 返回默认指标
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
   * 加载 Rolldown
   */
  private loadRolldown(): any {
    try {
      return require('rolldown')
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
