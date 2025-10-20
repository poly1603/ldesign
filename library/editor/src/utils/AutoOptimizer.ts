/**
 * 自动优化器
 * 根据性能监控自动调整配置以优化性能
 */

import { getPerformanceMonitor, type PerformanceMetrics } from './PerformanceMonitor'
import { getFeatureFlags } from '../core/FeatureFlags'
import { getLazyLoader } from '../core/LazyLoader'
import { EventEmitter } from '../core/EventEmitter'

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  type: 'feature' | 'memory' | 'loading' | 'rendering'
  severity: 'critical' | 'warning' | 'info'
  message: string
  action: string
  autoFixable: boolean
  fix?: () => void
}

/**
 * 优化配置
 */
export interface AutoOptimizerConfig {
  enabled: boolean
  checkInterval: number // 检查间隔（ms）
  autoFix: boolean      // 是否自动修复
  thresholds: {
    minFPS: number
    maxMemory: number
    maxLoadTime: number
  }
}

/**
 * 自动优化器类
 */
export class AutoOptimizer extends EventEmitter {
  private config: AutoOptimizerConfig
  private monitor = getPerformanceMonitor()
  private features = getFeatureFlags()
  private loader = getLazyLoader()
  private checkTimer: any = null
  private suggestions: OptimizationSuggestion[] = []
  
  constructor(config: Partial<AutoOptimizerConfig> = {}) {
    super()
    
    this.config = {
      enabled: true,
      checkInterval: 30000, // 30秒
      autoFix: false,
      thresholds: {
        minFPS: 50,
        maxMemory: 100,
        maxLoadTime: 2000
      },
      ...config
    }
  }
  
  /**
   * 启动自动优化
   */
  start(): void {
    if (!this.config.enabled) return
    
    this.checkTimer = setInterval(() => {
      this.check()
    }, this.config.checkInterval)
    
    // 立即执行一次检查
    this.check()
  }
  
  /**
   * 停止自动优化
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
  }
  
  /**
   * 检查并生成建议
   */
  check(): void {
    this.suggestions = []
    
    const metrics = this.monitor.getMetrics()
    const featureStats = this.features.getStats()
    const loaderStats = this.loader.getStats()
    
    // 检查FPS
    this.checkFPS(metrics)
    
    // 检查内存
    this.checkMemory(metrics)
    
    // 检查加载时间
    this.checkLoadTime(metrics)
    
    // 检查功能使用
    this.checkFeatureUsage(featureStats, loaderStats)
    
    // 触发事件
    if (this.suggestions.length > 0) {
      this.emit('suggestions', this.suggestions)
      
      // 自动修复
      if (this.config.autoFix) {
        this.autoFix()
      }
    }
  }
  
  /**
   * 检查FPS
   */
  private checkFPS(metrics: PerformanceMetrics): void {
    if (metrics.fps < this.config.thresholds.minFPS) {
      this.suggestions.push({
        type: 'rendering',
        severity: metrics.fps < 40 ? 'critical' : 'warning',
        message: `FPS过低 (${metrics.fps})，影响用户体验`,
        action: '禁用不常用的功能，启用虚拟滚动',
        autoFixable: true,
        fix: () => {
          // 禁用非核心功能
          this.features.disable('video')
          this.features.disable('audio')
          this.features.disable('collaboration')
        }
      })
    }
  }
  
  /**
   * 检查内存
   */
  private checkMemory(metrics: PerformanceMetrics): void {
    if (metrics.memoryUsage > this.config.thresholds.maxMemory) {
      this.suggestions.push({
        type: 'memory',
        severity: metrics.memoryUsage > 150 ? 'critical' : 'warning',
        message: `内存使用过高 (${metrics.memoryUsage}MB)`,
        action: '清理缓存，禁用不必要的功能',
        autoFixable: true,
        fix: () => {
          // 清理缓存
          const iconManager = require('../icons/IconManager').getIconManager()
          if (iconManager) {
            // 清理图标缓存的方法需要暴露
          }
          
          // 禁用高内存功能
          this.features.disable('collaboration')
          this.features.disable('version-control')
        }
      })
    }
  }
  
  /**
   * 检查加载时间
   */
  private checkLoadTime(metrics: PerformanceMetrics): void {
    if (metrics.loadTime > this.config.thresholds.maxLoadTime) {
      this.suggestions.push({
        type: 'loading',
        severity: metrics.loadTime > 3000 ? 'critical' : 'warning',
        message: `加载时间过长 (${metrics.loadTime}ms)`,
        action: '启用懒加载，减少初始加载的功能',
        autoFixable: true,
        fix: () => {
          // 将更多功能设置为懒加载
          const allFeatures = this.features.getAllFeatures()
          allFeatures.forEach(f => {
            if (!['basic-editing', 'selection', 'history', 'bold', 'italic'].includes(f.id)) {
              f.lazy = true
            }
          })
        }
      })
    }
  }
  
  /**
   * 检查功能使用
   */
  private checkFeatureUsage(featureStats: any, loaderStats: any): void {
    // 检查已启用但未使用的功能
    const enabledButNotLoaded = featureStats.enabled - featureStats.loaded
    
    if (enabledButNotLoaded > 5) {
      this.suggestions.push({
        type: 'feature',
        severity: 'info',
        message: `有${enabledButNotLoaded}个已启用的功能未被使用`,
        action: '考虑禁用这些功能以节省资源',
        autoFixable: false
      })
    }
    
    // 检查加载队列
    if (loaderStats.queued > 3) {
      this.suggestions.push({
        type: 'loading',
        severity: 'warning',
        message: `加载队列过长 (${loaderStats.queued}个)`,
        action: '增加并发加载数量或减少启用的功能',
        autoFixable: false
      })
    }
  }
  
  /**
   * 自动修复
   */
  private autoFix(): void {
    const fixable = this.suggestions.filter(s => s.autoFixable)
    
    fixable.forEach(suggestion => {
      if (suggestion.fix) {
        try {
          suggestion.fix()
          this.emit('auto-fixed', suggestion)
        } catch (error) {
          console.error('Auto-fix failed:', error)
        }
      }
    })
  }
  
  /**
   * 获取建议
   */
  getSuggestions(): OptimizationSuggestion[] {
    return [...this.suggestions]
  }
  
  /**
   * 应用建议
   */
  applySuggestion(index: number): void {
    const suggestion = this.suggestions[index]
    
    if (suggestion && suggestion.fix) {
      suggestion.fix()
      this.emit('suggestion-applied', suggestion)
    }
  }
  
  /**
   * 生成优化报告
   */
  generateReport(): string {
    let report = '自动优化报告\n'
    report += '============\n\n'
    
    const metrics = this.monitor.getMetrics()
    report += `当前性能:\n`
    report += `  FPS: ${metrics.fps}\n`
    report += `  内存: ${metrics.memoryUsage}MB\n`
    report += `  加载时间: ${metrics.loadTime}ms\n\n`
    
    if (this.suggestions.length === 0) {
      report += '✅ 性能良好，无需优化\n'
    } else {
      report += `优化建议 (${this.suggestions.length}条):\n`
      
      const critical = this.suggestions.filter(s => s.severity === 'critical')
      const warnings = this.suggestions.filter(s => s.severity === 'warning')
      const info = this.suggestions.filter(s => s.severity === 'info')
      
      if (critical.length > 0) {
        report += `\n🔴 严重 (${critical.length}):\n`
        critical.forEach(s => {
          report += `  • ${s.message}\n`
          report += `    → ${s.action}\n`
        })
      }
      
      if (warnings.length > 0) {
        report += `\n🟡 警告 (${warnings.length}):\n`
        warnings.forEach(s => {
          report += `  • ${s.message}\n`
          report += `    → ${s.action}\n`
        })
      }
      
      if (info.length > 0) {
        report += `\n🟢 提示 (${info.length}):\n`
        info.forEach(s => {
          report += `  • ${s.message}\n`
        })
      }
    }
    
    return report
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    this.stop()
    this.removeAllListeners()
  }
}

// 全局实例
let optimizerInstance: AutoOptimizer | null = null

/**
 * 获取自动优化器
 */
export function getAutoOptimizer(config?: Partial<AutoOptimizerConfig>): AutoOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new AutoOptimizer(config)
  }
  return optimizerInstance
}

/**
 * 启动自动优化
 */
export function startAutoOptimization(config?: Partial<AutoOptimizerConfig>): void {
  getAutoOptimizer(config).start()
}

/**
 * 停止自动优化
 */
export function stopAutoOptimization(): void {
  if (optimizerInstance) {
    optimizerInstance.stop()
  }
}



