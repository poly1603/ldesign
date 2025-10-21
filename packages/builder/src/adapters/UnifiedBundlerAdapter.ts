/**
 * 统一打包器适配器
 * 支持Rollup和Rolldown无缝切换，优化性能和内存使用
 */

import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions,
  BundlerSpecificConfig,
  BundlerFeature,
  FeatureSupportMap,
  UnifiedPlugin,
  BundlerSpecificPlugin
} from '../types/adapter'
import type { BuildResult, BuildWatcher } from '../types/builder'
import type { BuilderConfig } from '../types/config'
import type { PerformanceMetrics } from '../types/performance'
import { RollupAdapter } from './rollup/RollupAdapter'
import { RolldownAdapter } from './rolldown/RolldownAdapter'
import { Logger } from '../utils/logger'
import { MemoryOptimizer } from '../utils/memory-optimizer'
import { performance } from 'perf_hooks'
import path from 'path'
import fs from 'fs-extra'

export type BundlerType = 'rollup' | 'rolldown'

export interface UnifiedAdapterOptions {
  bundler?: BundlerType
  memoryConfig?: {
    maxHeapUsage?: number
    gcThreshold?: number
    enableAutoGC?: boolean
  }
  parallel?: boolean // 是否启用并行构建
  cache?: boolean // 是否启用缓存
  logger?: Logger
  performanceMonitor?: any
}

/**
 * 统一打包器适配器
 * 提供Rollup和Rolldown的统一接口
 */
export class UnifiedBundlerAdapter implements IBundlerAdapter {
  name: BundlerType
  version: string = '1.0.0'
  available: boolean = true
  
  private adapter: IBundlerAdapter
  private logger: Logger
  private memoryOptimizer: MemoryOptimizer
  private options: UnifiedAdapterOptions
  private buildCache: Map<string, BuildResult> = new Map()

  constructor(options: UnifiedAdapterOptions = {}) {
    this.options = {
      bundler: options.bundler || 'rollup',
      parallel: options.parallel ?? true,
      cache: options.cache ?? true,
      ...options
    }
    
    this.name = this.options.bundler!
    this.logger = options.logger || new Logger({ 
      prefix: `[${this.name.toUpperCase()}]`
    })
    
    // 初始化内存优化器
    this.memoryOptimizer = new MemoryOptimizer({
      maxHeapUsage: options.memoryConfig?.maxHeapUsage || 1024,
      gcThreshold: options.memoryConfig?.gcThreshold || 512,
      enableAutoGC: options.memoryConfig?.enableAutoGC ?? true
    }, this.logger)
    
    // 初始化适配器
    this.adapter = this.createAdapter(this.name)
  }

  /**
   * 切换打包器
   */
  switchBundler(bundler: BundlerType): void {
    if (bundler === this.name) {
      return
    }
    
    this.logger.info(`切换打包器: ${this.name} -> ${bundler}`)
    this.name = bundler
    this.adapter = this.createAdapter(bundler)
    
    // 清理缓存
    if (this.buildCache.size > 0) {
      this.buildCache.clear()
      this.logger.debug('已清理构建缓存')
    }
  }

  /**
   * 创建适配器实例
   */
  private createAdapter(bundler: BundlerType): IBundlerAdapter {
    const adapterOptions: AdapterOptions = {
      logger: this.logger,
      performanceMonitor: this.options.performanceMonitor
    }
    
    switch (bundler) {
      case 'rollup':
        return new RollupAdapter(adapterOptions)
      case 'rolldown':
        return new RolldownAdapter(adapterOptions)
      default:
        throw new Error(`不支持的打包器: ${bundler}`)
    }
  }

  /**
   * 检查打包器是否可用
   */
  async checkAvailability(): Promise<boolean> {
    try {
      // 简单检查adapter是否可用
      return this.adapter.available
    } catch (error) {
      this.logger.warn(`${this.name} 不可用: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 执行构建（带性能优化）
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    const startTime = performance.now()
    const buildId = `${this.name}-${Date.now()}`
    
    // 开始内存监控
    this.memoryOptimizer.startMonitoring()
    
    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(config)
      
      // 检查缓存
      if (this.options.cache && this.buildCache.has(cacheKey)) {
        const cachedResult = this.buildCache.get(cacheKey)!
        const cacheAge = Date.now() - cachedResult.timestamp
        
        // 缓存有效期5分钟
        if (cacheAge < 5 * 60 * 1000) {
          this.logger.info('使用缓存的构建结果')
          return cachedResult
        }
      }
      
      // 优化配置
      const optimizedConfig = await this.optimizeConfig(config)
      
      // 记录构建开始
      this.logger.info('='.repeat(60))
      this.logger.info(`开始构建 [${this.name.toUpperCase()}]`)
      this.logger.info(`输入: ${optimizedConfig.input}`)
      this.logger.info(`输出: ${optimizedConfig.output?.dir || optimizedConfig.output?.file}`)
      
      // 执行构建
      let result: BuildResult
      
      if (this.options.parallel && this.canUseParallel(optimizedConfig)) {
        result = await this.buildParallel(optimizedConfig)
      } else {
        result = await this.adapter.build(optimizedConfig)
      }
      
      // 添加构建元信息
      result.buildId = buildId
      result.bundler = this.name
      result.duration = performance.now() - startTime
      
      // 获取内存报告
      const memoryReport = this.memoryOptimizer.getMemoryReport()
      
      // 记录构建完成
      this.logger.success(`构建完成 [${result.duration.toFixed(2)}ms]`)
      this.logger.info(`输出文件: ${result.outputs.length} 个`)
      this.logger.info(`内存峰值: ${memoryReport.peak.toFixed(2)}MB`)
      this.logger.info('='.repeat(60))
      
      // 缓存结果
      if (this.options.cache) {
        this.buildCache.set(cacheKey, result)
        
        // 限制缓存大小
        if (this.buildCache.size > 10) {
          const firstKey = this.buildCache.keys().next().value
          if (firstKey) {
            this.buildCache.delete(firstKey)
          }
        }
      }
      
      return result
      
    } finally {
      // 停止内存监控
      this.memoryOptimizer.stopMonitoring()
      
      // 清理内存
      this.memoryOptimizer.clearCache()
    }
  }

  /**
   * 并行构建（适用于多格式输出）
   */
  private async buildParallel(config: UnifiedConfig): Promise<BuildResult> {
    const outputs = Array.isArray(config.output) ? config.output : [config.output]
    
    if (outputs.length <= 1) {
      return this.adapter.build(config)
    }
    
    this.logger.info(`启用并行构建 (${outputs.length} 个输出配置)`)
    
    // 为每个输出创建独立的构建任务
    const buildTasks = outputs.map(async (output, index) => {
      const singleConfig = {
        ...config,
        output
      }
      
      this.logger.debug(`并行任务 ${index + 1}/${outputs.length} 开始`)
      const result = await this.adapter.build(singleConfig)
      this.logger.debug(`并行任务 ${index + 1}/${outputs.length} 完成`)
      
      return result
    })
    
    // 等待所有任务完成
    const results = await Promise.all(buildTasks)
    
    // 合并结果
    return this.mergeResults(results)
  }

  /**
   * 检查是否可以使用并行构建
   */
  private canUseParallel(config: UnifiedConfig): boolean {
    // Rolldown暂不支持并行构建
    if (this.name === 'rolldown') {
      return false
    }
    
    // 检查是否有多个输出配置
    const outputs = Array.isArray(config.output) ? config.output : [config.output]
    return outputs.length > 1
  }

  /**
   * 优化构建配置
   */
  private async optimizeConfig(config: UnifiedConfig): Promise<UnifiedConfig> {
    const optimized = { ...config }
    
    // 优化treeshake配置
    if (!optimized.treeshake) {
      optimized.treeshake = {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        annotations: true
      }
    }
    
    // 优化输出配置
    if (optimized.output) {
      const output = Array.isArray(optimized.output) ? optimized.output[0] : optimized.output
      
      // 启用压缩
      if (!output.compact) {
        output.compact = true
      }
      
      // 优化sourcemap
      if (output.sourcemap === true) {
        output.sourcemap = 'hidden' // 生成但不包含在bundle中
      }
    }
    
    return optimized
  }

  /**
   * 合并多个构建结果
   */
  private mergeResults(results: BuildResult[]): BuildResult {
    const merged: BuildResult = {
      success: results.every(r => r.success),
      outputs: results.flatMap(r => r.outputs),
      duration: Math.max(...results.map(r => r.duration)),
      stats: this.mergeStats(results.map(r => r.stats)),
      performance: results[0].performance, // 使用第一个结果的性能数据
      warnings: results.flatMap(r => r.warnings || []),
      errors: results.flatMap(r => r.errors || []),
      buildId: results[0].buildId,
      timestamp: Date.now(),
      bundler: this.name,
      mode: results[0].mode
    }
    
    return merged
  }

  /**
   * 合并统计信息
   */
  private mergeStats(stats: any[]): any {
    // 简单合并，实际使用时需要根据具体结构优化
    return stats[0] || {}
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(config: UnifiedConfig): string {
    const key = {
      bundler: this.name,
      input: config.input,
      output: config.output,
      plugins: config.plugins?.map(p => (p as any).name || 'unknown')
    }
    
    return JSON.stringify(key)
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    this.logger.info(`启动监听模式 [${this.name.toUpperCase()}]`)
    
    // 开始内存监控
    this.memoryOptimizer.startMonitoring()
    
    const watcher = await this.adapter.watch(config)
    
    // 包装watcher以添加内存清理
    const originalClose = watcher.close.bind(watcher)
    watcher.close = async () => {
      this.memoryOptimizer.stopMonitoring()
      this.memoryOptimizer.clearCache()
      await originalClose()
    }
    
    return watcher
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig> {
    return this.adapter.transformConfig(config)
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const memoryReport = this.memoryOptimizer.getMemoryReport()
    const baseMetrics = this.adapter.getPerformanceMetrics()
    
    return {
      ...baseMetrics,
      memory: {
        peak: memoryReport.peak,
        average: memoryReport.average,
        current: memoryReport.current.heapUsed,
        gcCount: memoryReport.gcCount,
        trend: memoryReport.trend
      },
      bundler: this.name
    } as PerformanceMetrics
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: UnifiedPlugin[]): Promise<BundlerSpecificPlugin[]> {
    // 委托给具体的适配器
    if ('transformPlugins' in this.adapter) {
      return this.adapter.transformPlugins(plugins)
    }
    // 默认直接返回
    return plugins as any[]
  }

  /**
   * 检查功能支持
   */
  supportsFeature(feature: BundlerFeature): boolean {
    if ('supportsFeature' in this.adapter) {
      return this.adapter.supportsFeature(feature)
    }
    // 默认返回true
    return true
  }

  /**
   * 获取功能支持映射
   */
  getFeatureSupport(): FeatureSupportMap {
    if ('getFeatureSupport' in this.adapter) {
      return this.adapter.getFeatureSupport()
    }
    // 默认返回空对象
    return {} as FeatureSupportMap
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    // 停止内存监控
    this.memoryOptimizer.stopMonitoring()
    
    // 清理缓存
    this.buildCache.clear()
    
    // 委托给具体的适配器
    if ('dispose' in this.adapter) {
      await this.adapter.dispose()
    }
  }
}
