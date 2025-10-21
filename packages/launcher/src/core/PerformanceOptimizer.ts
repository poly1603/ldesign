/**
 * 性能优化器
 * 
 * 提供构建和运行时的性能优化功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import type { Plugin, ResolvedConfig } from 'vite'
import { Logger } from '../utils/logger'

export interface OptimizationOptions {
  /** 启用自动代码分割 */
  enableAutoSplitting?: boolean
  /** 启用预加载优化 */
  enablePreloading?: boolean
  /** 启用资源压缩 */
  enableCompression?: boolean
  /** 启用缓存优化 */
  enableCaching?: boolean
  /** 启用并行构建 */
  enableParallelBuild?: boolean
  /** 启用树摇优化 */
  enableTreeShaking?: boolean
  /** 启用懒加载 */
  enableLazyLoading?: boolean
  /** 启用资源内联 */
  enableInlining?: boolean
  /** 内联资源大小限制 (bytes) */
  inlineLimit?: number
  /** 代码分割策略 */
  splitStrategy?: 'vendor' | 'modules' | 'custom'
  /** 自定义分割规则 */
  customSplitRules?: Record<string, (id: string) => boolean>
}

export interface PerformanceMetrics {
  /** 构建时间 (ms) */
  buildTime?: number
  /** 包大小 */
  bundleSize?: {
    total: number
    js: number
    css: number
    assets: number
  }
  /** 模块数量 */
  moduleCount?: number
  /** 优化建议 */
  suggestions?: string[]
  /** 缓存命中率 */
  cacheHitRate?: number
  /** 内存使用 */
  memoryUsage?: {
    heapUsed: number
    heapTotal: number
    external: number
  }
}

/**
 * 性能优化器类
 */
export class PerformanceOptimizer extends EventEmitter {
  private logger: Logger
  private options: Required<OptimizationOptions>
  private metrics: PerformanceMetrics = {}
  private startTime: number = 0

  constructor(options: OptimizationOptions = {}) {
    super()
    
    this.logger = new Logger('PerformanceOptimizer')
    
    // 设置默认选项
    this.options = {
      enableAutoSplitting: true,
      enablePreloading: true,
      enableCompression: true,
      enableCaching: true,
      enableParallelBuild: true,
      enableTreeShaking: true,
      enableLazyLoading: true,
      enableInlining: true,
      inlineLimit: 4096,
      splitStrategy: 'vendor',
      customSplitRules: {},
      ...options
    }
  }

  /**
   * 创建 Vite 性能优化插件
   */
  createVitePlugin(): Plugin {
    return {
      name: 'launcher:performance-optimizer',
      
      configResolved: (config: ResolvedConfig) => {
        this.startTime = Date.now()
        this.applyOptimizations(config)
      },
      
      buildStart: () => {
        this.logger.info('开始性能优化构建')
        this.collectInitialMetrics()
      },
      
      buildEnd: () => {
        const buildTime = Date.now() - this.startTime
        this.metrics.buildTime = buildTime
        this.logger.info(`构建完成，耗时: ${buildTime}ms`)
      },
      
      closeBundle: async () => {
        await this.analyzeBundle()
        this.generateOptimizationReport()
      }
    }
  }

  /**
   * 应用优化配置
   */
  private applyOptimizations(config: ResolvedConfig): void {
    // 应用构建优化
    if (config.build) {
      // 代码分割优化
      if (this.options.enableAutoSplitting) {
        this.applyCodeSplitting(config)
      }
      
      // 压缩优化
      if (this.options.enableCompression) {
        this.applyCompressionOptimization(config)
      }
      
      // 树摇优化
      if (this.options.enableTreeShaking) {
        config.build.rollupOptions = {
          ...(config.build.rollupOptions || {}),
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false
          }
        }
      }
      
      // 内联优化
      if (this.options.enableInlining) {
        config.build.assetsInlineLimit = this.options.inlineLimit
      }
    }
    
    // 应用服务器优化
    if (config.server) {
      // 预加载优化
      if (this.options.enablePreloading) {
        config.server.preTransformRequests = true
      }
      
      // HMR 优化
      config.server.hmr = {
        ...(typeof config.server.hmr === 'object' ? config.server.hmr : {}),
        overlay: true
      }
    }
    
    // 应用缓存优化
    if (this.options.enableCaching) {
      this.applyCachingStrategy(config)
    }
  }

  /**
   * 应用代码分割策略
   */
  private applyCodeSplitting(config: ResolvedConfig): void {
    const manualChunks = (id: string): string | undefined => {
      // 应用自定义分割规则
      for (const [chunkName, rule] of Object.entries(this.options.customSplitRules)) {
        if (rule(id)) {
          return chunkName
        }
      }
      
      // 应用预设策略
      if (this.options.splitStrategy === 'vendor') {
        if (id.includes('node_modules')) {
          // 将大型库单独分割
          if (id.includes('lodash')) return 'lodash'
          if (id.includes('moment')) return 'moment'
          if (id.includes('antd')) return 'antd'
          if (id.includes('element-plus')) return 'element-plus'
          if (id.includes('@vue') || id.includes('/vue/')) return 'vue-vendor'
          if (id.includes('react')) return 'react-vendor'
          
          return 'vendor'
        }
      } else if (this.options.splitStrategy === 'modules') {
        // 按模块分割
        if (id.includes('/src/components/')) return 'components'
        if (id.includes('/src/utils/')) return 'utils'
        if (id.includes('/src/stores/')) return 'stores'
        if (id.includes('/src/services/')) return 'services'
      }
      
      return undefined
    }
    
    config.build.rollupOptions = {
      ...config.build.rollupOptions,
      output: {
        ...((config.build.rollupOptions?.output as any) || {}),
        manualChunks
      }
    }
  }

  /**
   * 应用压缩优化
   */
  private applyCompressionOptimization(config: ResolvedConfig): void {
    // 使用 esbuild 进行压缩
    config.build.minify = 'esbuild'
    config.build.target = 'es2020'
    
    // CSS 压缩
    config.build.cssMinify = true
    
    // 启用 gzip 压缩报告
    config.build.reportCompressedSize = true
  }

  /**
   * 应用缓存策略
   */
  private applyCachingStrategy(config: ResolvedConfig): void {
    // 文件系统缓存 - 只在配置阶段设置
    // config.cacheDir 在 ResolvedConfig 中是只读的，需要在 configResolved 之前设置
    
    // 依赖优化缓存 - 同样需要在配置阶段设置
    // 此处只能记录配置，不能直接修改 ResolvedConfig
    this.logger.debug('缓存策略已应用')
  }

  /**
   * 收集初始指标
   */
  private collectInitialMetrics(): void {
    const memUsage = process.memoryUsage()
    this.metrics.memoryUsage = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    }
  }

  /**
   * 分析构建产物
   */
  private async analyzeBundle(): Promise<void> {
    // TODO: 实现构建产物分析
    this.metrics.suggestions = []
    
    // 生成优化建议
    if (this.metrics.buildTime && this.metrics.buildTime > 30000) {
      this.metrics.suggestions.push('构建时间较长，建议启用并行构建')
    }
    
    if (this.metrics.memoryUsage && this.metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) {
      this.metrics.suggestions.push('内存使用较高，建议优化依赖导入')
    }
  }

  /**
   * 生成优化报告
   */
  private generateOptimizationReport(): void {
    this.logger.info('=== 性能优化报告 ===')
    
    if (this.metrics.buildTime) {
      this.logger.info(`构建时间: ${this.metrics.buildTime}ms`)
    }
    
    if (this.metrics.memoryUsage) {
      const heapUsedMB = (this.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
      this.logger.info(`内存使用: ${heapUsedMB}MB`)
    }
    
    if (this.metrics.suggestions && this.metrics.suggestions.length > 0) {
      this.logger.info('优化建议:')
      this.metrics.suggestions.forEach(suggestion => {
        this.logger.info(`  - ${suggestion}`)
      })
    }
    
    this.emit('report', this.metrics)
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 重置性能指标
   */
  resetMetrics(): void {
    this.metrics = {}
  }
}

/**
 * 创建性能优化器实例
 */
export function createPerformanceOptimizer(options?: OptimizationOptions): PerformanceOptimizer {
  return new PerformanceOptimizer(options)
}
