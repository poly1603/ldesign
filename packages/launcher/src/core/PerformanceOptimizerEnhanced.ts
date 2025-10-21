/**
 * 增强的性能优化器
 * 
 * 提供全方位的性能监控和优化功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { performance } from 'perf_hooks'
import os from 'os'
import { Logger } from '../utils/logger'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { gzipSync, brotliCompressSync } from 'zlib'
import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'path'

// 性能指标接口
export interface PerformanceMetrics {
  startupTime: number
  buildTime: number
  hmrTime: number[]
  memory: {
    used: number
    total: number
    percentage: number
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  cpu: {
    usage: number
    loadAverage: number[]
    cores: number
  }
  network: {
    requestCount: number
    averageResponseTime: number
    totalDataTransferred: number
  }
  cache: {
    hitRate: number
    size: number
    entries: number
  }
  bundle: {
    totalSize: number
    chunksCount: number
    assetsCount: number
    largestChunk: number
    treeshaking: {
      removed: number
      percentage: number
    }
  }
}

// 优化建议接口
export interface OptimizationSuggestion {
  id: string
  category: 'startup' | 'build' | 'runtime' | 'bundle' | 'cache'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  solution: string
  autoFix?: () => Promise<void>
}

// 优化配置接口
export interface OptimizationConfig {
  enableCache?: boolean
  enableParallelBuild?: boolean
  enableCompression?: boolean
  enablePreload?: boolean
  enablePrefetch?: boolean
  enableCodeSplitting?: boolean
  enableTreeShaking?: boolean
  enableMinification?: boolean
  enableSourceMap?: boolean
  cacheTTL?: number
  maxWorkers?: number
  compressionThreshold?: number
  chunkSizeLimit?: number
}

/**
 * 增强的性能优化器类
 */
export class EnhancedPerformanceOptimizer {
  private logger: Logger
  private metrics: PerformanceMetrics
  private config: OptimizationConfig
  private cacheDir: string
  private startTime: number = 0
  private buildStartTime: number = 0
  private hmrTimes: number[] = []
  private requestMetrics = {
    count: 0,
    totalTime: 0,
    totalData: 0
  }
  private cacheMetrics = {
    hits: 0,
    misses: 0,
    entries: new Map<string, any>()
  }

  constructor(config: OptimizationConfig = {}) {
    this.logger = new Logger('PerformanceOptimizer', {
      level: 'info',
      compact: false,
      showPerformance: true
    })
    
    this.config = {
      enableCache: true,
      enableParallelBuild: true,
      enableCompression: true,
      enablePreload: true,
      enablePrefetch: true,
      enableCodeSplitting: true,
      enableTreeShaking: true,
      enableMinification: true,
      enableSourceMap: false, // 生产环境默认关闭
      cacheTTL: 7 * 24 * 60 * 60 * 1000, // 7天
      maxWorkers: os.cpus().length,
      compressionThreshold: 1024, // 1KB
      chunkSizeLimit: 500 * 1024, // 500KB
      ...config
    }
    
    this.cacheDir = path.join(process.cwd(), 'node_modules', '.launcher-cache')
    
    this.metrics = this.initializeMetrics()
  }

  /**
   * 初始化性能指标
   */
  private initializeMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    
    return {
      startupTime: 0,
      buildTime: 0,
      hmrTime: [],
      memory: {
        used: totalMem - freeMem,
        total: totalMem,
        percentage: ((totalMem - freeMem) / totalMem) * 100,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      cpu: {
        usage: 0,
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      network: {
        requestCount: 0,
        averageResponseTime: 0,
        totalDataTransferred: 0
      },
      cache: {
        hitRate: 0,
        size: 0,
        entries: 0
      },
      bundle: {
        totalSize: 0,
        chunksCount: 0,
        assetsCount: 0,
        largestChunk: 0,
        treeshaking: {
          removed: 0,
          percentage: 0
        }
      }
    }
  }

  /**
   * 开始记录启动时间
   */
  startupBegin(): void {
    this.startTime = performance.now()
    this.logger.time('startup')
  }

  /**
   * 结束记录启动时间
   */
  startupEnd(): void {
    this.metrics.startupTime = performance.now() - this.startTime
    this.logger.timeEnd('startup', `服务器启动完成`)
    this.logMemoryUsage()
  }

  /**
   * 开始记录构建时间
   */
  buildBegin(): void {
    this.buildStartTime = performance.now()
    this.logger.time('build')
  }

  /**
   * 结束记录构建时间
   */
  buildEnd(): void {
    this.metrics.buildTime = performance.now() - this.buildStartTime
    this.logger.timeEnd('build', `构建完成`)
    this.logMemoryUsage()
  }

  /**
   * 记录HMR时间
   */
  recordHMR(duration: number): void {
    this.hmrTimes.push(duration)
    this.metrics.hmrTime = this.hmrTimes
    
    if (this.hmrTimes.length > 100) {
      this.hmrTimes.shift() // 保持最近100次记录
    }
    
    const avgHMR = this.hmrTimes.reduce((a, b) => a + b, 0) / this.hmrTimes.length
    this.logger.info(`HMR 更新完成`, { 
      duration: `${duration.toFixed(2)}ms`,
      average: `${avgHMR.toFixed(2)}ms`
    })
  }

  /**
   * 记录网络请求
   */
  recordRequest(responseTime: number, dataSize: number): void {
    this.requestMetrics.count++
    this.requestMetrics.totalTime += responseTime
    this.requestMetrics.totalData += dataSize
    
    this.metrics.network.requestCount = this.requestMetrics.count
    this.metrics.network.averageResponseTime = this.requestMetrics.totalTime / this.requestMetrics.count
    this.metrics.network.totalDataTransferred = this.requestMetrics.totalData
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(key: string): void {
    this.cacheMetrics.hits++
    this.updateCacheMetrics()
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(key: string): void {
    this.cacheMetrics.misses++
    this.updateCacheMetrics()
  }

  /**
   * 更新缓存指标
   */
  private updateCacheMetrics(): void {
    const total = this.cacheMetrics.hits + this.cacheMetrics.misses
    this.metrics.cache.hitRate = total > 0 ? (this.cacheMetrics.hits / total) * 100 : 0
    this.metrics.cache.entries = this.cacheMetrics.entries.size
  }

  /**
   * 记录内存使用
   */
  private logMemoryUsage(): void {
    const memUsage = process.memoryUsage()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    
    this.metrics.memory = {
      used: totalMem - freeMem,
      total: totalMem,
      percentage: ((totalMem - freeMem) / totalMem) * 100,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    }
    
    this.logger.debug('内存使用情况', {
      heap: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
      system: `${this.metrics.memory.percentage.toFixed(1)}%`
    })
  }

  /**
   * 分析性能并生成优化建议
   */
  async analyze(): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []
    
    // 分析启动时间
    if (this.metrics.startupTime > 5000) {
      suggestions.push({
        id: 'slow-startup',
        category: 'startup',
        severity: 'high',
        title: '启动时间过长',
        description: `当前启动时间 ${(this.metrics.startupTime / 1000).toFixed(2)}s，超过建议值 5s`,
        impact: '影响开发体验',
        solution: '启用预构建缓存，减少插件数量，使用更快的解析器'
      })
    }
    
    // 分析构建时间
    if (this.metrics.buildTime > 30000) {
      suggestions.push({
        id: 'slow-build',
        category: 'build',
        severity: 'high',
        title: '构建时间过长',
        description: `当前构建时间 ${(this.metrics.buildTime / 1000).toFixed(2)}s，超过建议值 30s`,
        impact: '影响部署效率',
        solution: '启用并行构建，优化代码分割策略，使用构建缓存'
      })
    }
    
    // 分析内存使用
    if (this.metrics.memory.percentage > 80) {
      suggestions.push({
        id: 'high-memory',
        category: 'runtime',
        severity: 'critical',
        title: '内存使用率过高',
        description: `当前内存使用率 ${this.metrics.memory.percentage.toFixed(1)}%，超过建议值 80%`,
        impact: '可能导致系统不稳定',
        solution: '增加系统内存，优化内存使用，减少缓存大小'
      })
    }
    
    // 分析缓存命中率
    if (this.metrics.cache.hitRate < 60 && this.metrics.cache.entries > 0) {
      suggestions.push({
        id: 'low-cache-hit',
        category: 'cache',
        severity: 'medium',
        title: '缓存命中率低',
        description: `当前缓存命中率 ${this.metrics.cache.hitRate.toFixed(1)}%，低于建议值 60%`,
        impact: '增加重复计算，降低性能',
        solution: '优化缓存策略，增加缓存时间，预热缓存'
      })
    }
    
    // 分析包体积
    if (this.metrics.bundle.largestChunk > this.config.chunkSizeLimit!) {
      suggestions.push({
        id: 'large-chunk',
        category: 'bundle',
        severity: 'medium',
        title: '存在过大的代码块',
        description: `最大代码块 ${(this.metrics.bundle.largestChunk / 1024).toFixed(2)}KB，超过限制 ${(this.config.chunkSizeLimit! / 1024).toFixed(0)}KB`,
        impact: '影响首屏加载速度',
        solution: '启用代码分割，异步加载大型依赖，使用动态导入'
      })
    }
    
    return suggestions
  }

  /**
   * 创建性能优化插件
   */
  createOptimizationPlugin(): Plugin {
    const self = this
    
    return {
      name: 'launcher:performance-optimizer',
      
      configResolved(config: ResolvedConfig) {
        // 应用优化配置
        if (self.config.enableMinification && config.build) {
          config.build.minify = 'terser'
          config.build.terserOptions = {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log']
            }
          }
        }
        
        if (self.config.enableSourceMap === false && config.build) {
          config.build.sourcemap = false
        }
        
        if (self.config.enableCodeSplitting && config.build?.rollupOptions) {
          config.build.rollupOptions.output = {
            ...config.build.rollupOptions.output as any,
            manualChunks: (id: string) => {
              // 智能代码分割
              if (id.includes('node_modules')) {
                if (id.includes('vue') || id.includes('react')) {
                  return 'framework'
                }
                if (id.includes('lodash') || id.includes('moment')) {
                  return 'utils'
                }
                return 'vendor'
              }
            }
          }
        }
      },
      
      configureServer(server: ViteDevServer) {
        // 监控HMR性能
        server.ws.on('vite:beforeUpdate', () => {
          self.logger.time('hmr')
        })
        
        server.ws.on('vite:afterUpdate', () => {
          const duration = performance.now()
          self.logger.timeEnd('hmr')
          self.recordHMR(duration)
        })
        
        // 监控请求性能
        server.middlewares.use((req, res, next) => {
          const start = performance.now()
          const originalEnd = res.end
          
          res.end = function(...args: any[]) {
            const duration = performance.now() - start
            const size = res.getHeader('content-length') as string || '0'
            self.recordRequest(duration, parseInt(size))
            return originalEnd.apply(res, args)
          }
          
          next()
        })
      },
      
      async buildStart() {
        self.buildBegin()
      },
      
      async buildEnd() {
        self.buildEnd()
      },
      
      async writeBundle(_, bundle) {
        // 分析构建产物
        let totalSize = 0
        let chunksCount = 0
        let assetsCount = 0
        let largestChunk = 0
        
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk') {
            chunksCount++
            const size = chunk.code.length
            totalSize += size
            largestChunk = Math.max(largestChunk, size)
          } else {
            assetsCount++
            totalSize += (chunk as any).source.length
          }
        }
        
        self.metrics.bundle = {
          totalSize,
          chunksCount,
          assetsCount,
          largestChunk,
          treeshaking: self.metrics.bundle.treeshaking
        }
        
        self.logger.info('构建分析', {
          totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
          chunks: chunksCount,
          assets: assetsCount,
          largestChunk: `${(largestChunk / 1024).toFixed(2)}KB`
        })
      }
    }
  }

  /**
   * 获取性能报告
   */
  getReport(): string {
    const report = []
    
    report.push('=== 性能报告 ===\n')
    
    // 启动性能
    report.push('📊 启动性能:')
    report.push(`  • 启动时间: ${(this.metrics.startupTime / 1000).toFixed(2)}s`)
    report.push(`  • 构建时间: ${(this.metrics.buildTime / 1000).toFixed(2)}s`)
    if (this.metrics.hmrTime.length > 0) {
      const avgHMR = this.metrics.hmrTime.reduce((a, b) => a + b, 0) / this.metrics.hmrTime.length
      report.push(`  • 平均HMR时间: ${avgHMR.toFixed(2)}ms`)
    }
    report.push('')
    
    // 内存使用
    report.push('💾 内存使用:')
    report.push(`  • 堆内存: ${(this.metrics.memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(this.metrics.memory.heapTotal / 1024 / 1024).toFixed(2)}MB`)
    report.push(`  • RSS: ${(this.metrics.memory.rss / 1024 / 1024).toFixed(2)}MB`)
    report.push(`  • 系统内存: ${this.metrics.memory.percentage.toFixed(1)}%`)
    report.push('')
    
    // 网络性能
    report.push('🌐 网络性能:')
    report.push(`  • 请求数: ${this.metrics.network.requestCount}`)
    report.push(`  • 平均响应时间: ${this.metrics.network.averageResponseTime.toFixed(2)}ms`)
    report.push(`  • 数据传输量: ${(this.metrics.network.totalDataTransferred / 1024 / 1024).toFixed(2)}MB`)
    report.push('')
    
    // 缓存性能
    report.push('🗃️ 缓存性能:')
    report.push(`  • 命中率: ${this.metrics.cache.hitRate.toFixed(1)}%`)
    report.push(`  • 缓存项: ${this.metrics.cache.entries}`)
    report.push('')
    
    // 构建产物
    if (this.metrics.bundle.totalSize > 0) {
      report.push('📦 构建产物:')
      report.push(`  • 总大小: ${(this.metrics.bundle.totalSize / 1024 / 1024).toFixed(2)}MB`)
      report.push(`  • 代码块数: ${this.metrics.bundle.chunksCount}`)
      report.push(`  • 资源数: ${this.metrics.bundle.assetsCount}`)
      report.push(`  • 最大块: ${(this.metrics.bundle.largestChunk / 1024).toFixed(2)}KB`)
    }
    
    return report.join('\n')
  }

  /**
   * 导出性能指标
   */
  exportMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    if (await fs.pathExists(this.cacheDir)) {
      await fs.remove(this.cacheDir)
      this.logger.success('缓存已清理')
    }
    this.cacheMetrics.entries.clear()
    this.updateCacheMetrics()
  }
}

/**
 * 创建性能优化器实例
 */
export function createPerformanceOptimizer(config?: OptimizationConfig): EnhancedPerformanceOptimizer {
  return new EnhancedPerformanceOptimizer(config)
}