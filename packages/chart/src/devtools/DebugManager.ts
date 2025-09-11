/**
 * 调试管理器
 * 
 * 提供图表调试功能，包括性能监控、错误追踪、配置验证等
 */

import type { ChartConfig, ChartData } from '../core/types'
import { EventEmitter } from '../events/EventManager'

/**
 * 调试级别
 */
export type DebugLevel = 'error' | 'warn' | 'info' | 'debug'

/**
 * 调试日志
 */
export interface DebugLog {
  /** 时间戳 */
  timestamp: number
  /** 级别 */
  level: DebugLevel
  /** 消息 */
  message: string
  /** 数据 */
  data?: any
  /** 堆栈信息 */
  stack?: string
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 初始化时间 */
  initTime: number
  /** 渲染时间 */
  renderTime: number
  /** 数据处理时间 */
  dataProcessTime: number
  /** 内存使用 */
  memoryUsage: number
  /** FPS */
  fps: number
  /** 数据点数量 */
  dataPointCount: number
}

/**
 * 配置问题
 */
export interface ConfigIssue {
  /** 问题类型 */
  type: 'error' | 'warning' | 'suggestion'
  /** 问题描述 */
  message: string
  /** 问题路径 */
  path: string
  /** 建议修复 */
  suggestion?: string
}

/**
 * 调试配置
 */
export interface DebugConfig {
  /** 是否启用调试 */
  enabled?: boolean
  /** 调试级别 */
  level?: DebugLevel
  /** 最大日志数量 */
  maxLogs?: number
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用配置验证 */
  enableConfigValidation?: boolean
  /** 是否启用错误追踪 */
  enableErrorTracking?: boolean
}

/**
 * 调试管理器
 */
export class DebugManager extends EventEmitter {
  private _config: Required<DebugConfig>
  private _logs: DebugLog[] = []
  private _performanceMetrics: PerformanceMetrics = {
    initTime: 0,
    renderTime: 0,
    dataProcessTime: 0,
    memoryUsage: 0,
    fps: 0,
    dataPointCount: 0
  }
  private _startTimes: Map<string, number> = new Map()
  private _configIssues: ConfigIssue[] = []

  constructor(config: DebugConfig = {}) {
    super()
    
    this._config = {
      enabled: config.enabled ?? false,
      level: config.level ?? 'info',
      maxLogs: config.maxLogs ?? 1000,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true,
      enableConfigValidation: config.enableConfigValidation ?? true,
      enableErrorTracking: config.enableErrorTracking ?? true
    }
  }

  /**
   * 启用调试
   */
  enable(): void {
    this._config.enabled = true
    this.log('info', '调试模式已启用')
  }

  /**
   * 禁用调试
   */
  disable(): void {
    this._config.enabled = false
  }

  /**
   * 设置调试级别
   * @param level - 调试级别
   */
  setLevel(level: DebugLevel): void {
    this._config.level = level
    this.log('info', `调试级别设置为: ${level}`)
  }

  /**
   * 记录日志
   * @param level - 级别
   * @param message - 消息
   * @param data - 数据
   */
  log(level: DebugLevel, message: string, data?: any): void {
    if (!this._config.enabled || !this._shouldLog(level)) return

    const log: DebugLog = {
      timestamp: Date.now(),
      level,
      message,
      data,
      stack: level === 'error' ? new Error().stack : undefined
    }

    this._logs.push(log)

    // 限制日志数量
    if (this._logs.length > this._config.maxLogs) {
      this._logs.shift()
    }

    // 发出日志事件
    this.emit('log', log)

    // 在控制台输出
    this._outputToConsole(log)
  }

  /**
   * 开始性能计时
   * @param name - 计时名称
   */
  startTimer(name: string): void {
    if (!this._config.enabled || !this._config.enablePerformanceMonitoring) return
    
    this._startTimes.set(name, performance.now())
  }

  /**
   * 结束性能计时
   * @param name - 计时名称
   * @returns 耗时（毫秒）
   */
  endTimer(name: string): number {
    if (!this._config.enabled || !this._config.enablePerformanceMonitoring) return 0

    const startTime = this._startTimes.get(name)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this._startTimes.delete(name)

    // 更新性能指标
    switch (name) {
      case 'init':
        this._performanceMetrics.initTime = duration
        break
      case 'render':
        this._performanceMetrics.renderTime = duration
        break
      case 'dataProcess':
        this._performanceMetrics.dataProcessTime = duration
        break
    }

    this.log('debug', `性能计时 ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  /**
   * 更新性能指标
   * @param metrics - 性能指标
   */
  updateMetrics(metrics: Partial<PerformanceMetrics>): void {
    if (!this._config.enabled || !this._config.enablePerformanceMonitoring) return

    Object.assign(this._performanceMetrics, metrics)
    this.emit('metricsUpdated', this._performanceMetrics)
  }

  /**
   * 验证配置
   * @param config - 图表配置
   * @returns 配置问题列表
   */
  validateConfig(config: ChartConfig): ConfigIssue[] {
    if (!this._config.enabled || !this._config.enableConfigValidation) return []

    this._configIssues = []

    // 基本验证
    this._validateBasicConfig(config)
    
    // 数据验证
    this._validateData(config.data)
    
    // 性能相关验证
    this._validatePerformanceConfig(config)

    this.log('info', `配置验证完成，发现 ${this._configIssues.length} 个问题`)
    return [...this._configIssues]
  }

  /**
   * 追踪错误
   * @param error - 错误对象
   * @param context - 错误上下文
   */
  trackError(error: Error, context?: any): void {
    if (!this._config.enabled || !this._config.enableErrorTracking) return

    this.log('error', `错误: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    })

    this.emit('error', { error, context })
  }

  /**
   * 获取调试信息
   * @returns 调试信息
   */
  getDebugInfo(): {
    logs: DebugLog[]
    metrics: PerformanceMetrics
    issues: ConfigIssue[]
    config: DebugConfig
  } {
    return {
      logs: [...this._logs],
      metrics: { ...this._performanceMetrics },
      issues: [...this._configIssues],
      config: { ...this._config }
    }
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this._logs = []
    this.log('info', '日志已清空')
  }

  /**
   * 导出调试报告
   * @returns 调试报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      config: this._config,
      metrics: this._performanceMetrics,
      issues: this._configIssues,
      logs: this._logs.slice(-100) // 只导出最近100条日志
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 是否应该记录日志
   * @param level - 日志级别
   * @returns 是否记录
   */
  private _shouldLog(level: DebugLevel): boolean {
    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this._config.level)
    const logLevelIndex = levels.indexOf(level)
    
    return logLevelIndex <= currentLevelIndex
  }

  /**
   * 输出到控制台
   * @param log - 日志
   */
  private _outputToConsole(log: DebugLog): void {
    const timestamp = new Date(log.timestamp).toLocaleTimeString()
    const prefix = `[${timestamp}] [${log.level.toUpperCase()}]`
    
    switch (log.level) {
      case 'error':
        console.error(prefix, log.message, log.data)
        break
      case 'warn':
        console.warn(prefix, log.message, log.data)
        break
      case 'info':
        console.info(prefix, log.message, log.data)
        break
      case 'debug':
        console.debug(prefix, log.message, log.data)
        break
    }
  }

  /**
   * 验证基本配置
   * @param config - 配置
   */
  private _validateBasicConfig(config: ChartConfig): void {
    if (!config.type) {
      this._configIssues.push({
        type: 'error',
        message: '缺少图表类型',
        path: 'type',
        suggestion: '请指定图表类型，如 "line", "bar", "pie" 等'
      })
    }

    if (!config.data) {
      this._configIssues.push({
        type: 'error',
        message: '缺少图表数据',
        path: 'data',
        suggestion: '请提供图表数据'
      })
    }

    if (!config.title) {
      this._configIssues.push({
        type: 'suggestion',
        message: '建议添加图表标题',
        path: 'title',
        suggestion: '添加标题可以提高图表的可读性'
      })
    }
  }

  /**
   * 验证数据
   * @param data - 数据
   */
  private _validateData(data: ChartData): void {
    if (!data) return

    if ('series' in data && Array.isArray(data.series)) {
      if (data.series.length === 0) {
        this._configIssues.push({
          type: 'warning',
          message: '数据系列为空',
          path: 'data.series',
          suggestion: '请确保至少有一个数据系列'
        })
      }

      // 检查数据量
      const totalDataPoints = data.series.reduce((sum, series) => {
        return sum + (Array.isArray(series.data) ? series.data.length : 0)
      }, 0)

      if (totalDataPoints > 10000) {
        this._configIssues.push({
          type: 'warning',
          message: '数据量较大，可能影响性能',
          path: 'data.series',
          suggestion: '考虑启用数据采样或虚拟滚动'
        })
      }
    }
  }

  /**
   * 验证性能配置
   * @param config - 配置
   */
  private _validatePerformanceConfig(config: ChartConfig): void {
    if (!config.performance?.enableMonitoring) {
      this._configIssues.push({
        type: 'suggestion',
        message: '建议启用性能监控',
        path: 'performance.enableMonitoring',
        suggestion: '启用性能监控可以帮助优化图表性能'
      })
    }

    if (!config.responsive) {
      this._configIssues.push({
        type: 'suggestion',
        message: '建议启用响应式功能',
        path: 'responsive',
        suggestion: '启用响应式可以适应不同屏幕尺寸'
      })
    }
  }
}

/**
 * 全局调试管理器实例
 */
export const debugManager = new DebugManager()

/**
 * 创建调试管理器
 * @param config - 调试配置
 * @returns 调试管理器实例
 */
export function createDebugManager(config?: DebugConfig): DebugManager {
  return new DebugManager(config)
}
