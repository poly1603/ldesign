/**
 * 性能相关类型定义
 */

import type { TemplateMetadata } from './template'

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled?: boolean
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 缓冲区大小 */
  bufferSize?: number
  /** 是否启用内存监控 */
  enableMemoryMonitoring?: boolean
  /** 内存检查间隔（毫秒） */
  memoryCheckInterval?: number
}

/**
 * 性能指标
 */
export interface PerformanceMetric {
  /** 指标名称 */
  name: string
  /** 指标值 */
  value: number
  /** 时间戳 */
  timestamp: number
  /** 标签 */
  tags?: Record<string, string>
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  /** 总数 */
  count: number
  /** 平均值 */
  avg: number
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 标准差 */
  stdDev?: number
  /** 百分位数 */
  percentiles?: {
    p50: number
    p90: number
    p95: number
    p99: number
  }
}

/**
 * 智能预加载器配置
 */
export interface IntelligentPreloaderConfig {
  /** 最大并发数 */
  maxConcurrent?: number
  /** 优先级列表 */
  priority?: string[]
  /** 延迟时间（毫秒） */
  delayMs?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 是否启用交叉观察器 */
  enableIntersectionObserver?: boolean
  /** 预加载策略 */
  strategy?: 'eager' | 'lazy' | 'idle' | 'viewport'
}

/**
 * 预加载状态
 */
export interface PreloadStatus {
  /** 模板键 */
  templateKey: string
  /** 状态 */
  status: 'pending' | 'loading' | 'loaded' | 'failed'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 错误信息 */
  error?: Error
  /** 重试次数 */
  retryCount: number
}

/**
 * 内存使用信息
 */
export interface MemoryUsage {
  /** 已使用内存（字节） */
  used: number
  /** 总内存（字节） */
  total: number
  /** 内存限制（字节） */
  limit: number
  /** 使用率 (0-1) */
  ratio: number
}

/**
 * 缓存性能指标
 */
export interface CachePerformanceMetrics {
  /** 命中率 */
  hitRate: number
  /** 平均访问时间（毫秒） */
  avgAccessTime: number
  /** 内存使用量（字节） */
  memoryUsage: number
  /** 驱逐次数 */
  evictionCount: number
  /** 压缩节省的空间（字节） */
  compressionSavings: number
}

/**
 * 组件加载性能
 */
export interface ComponentLoadPerformance {
  /** 组件名称 */
  componentName: string
  /** 加载时间（毫秒） */
  loadTime: number
  /** 文件大小（字节） */
  fileSize?: number
  /** 是否来自缓存 */
  fromCache: boolean
  /** 加载方式 */
  loadMethod: 'sync' | 'async' | 'preload'
}

/**
 * 虚拟滚动性能配置
 */
export interface VirtualScrollPerformanceConfig {
  /** 缓冲区大小 */
  bufferSize?: number
  /** 是否启用动态高度 */
  enableDynamicHeight?: boolean
  /** 预估项目高度 */
  estimatedItemHeight?: number
  /** 是否启用平滑滚动 */
  enableSmoothScrolling?: boolean
  /** 滚动防抖延迟（毫秒） */
  scrollDebounceDelay?: number
}

/**
 * 性能监控事件
 */
export interface PerformanceEvent {
  /** 事件类型 */
  type: 'metric' | 'warning' | 'error' | 'info'
  /** 事件名称 */
  name: string
  /** 事件数据 */
  data: unknown
  /** 时间戳 */
  timestamp: number
  /** 来源 */
  source: string
}

/**
 * 性能监控器接口
 */
export interface IPerformanceMonitor {
  /** 记录指标 */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void
  
  /** 获取统计信息 */
  getStats(name: string): PerformanceStats | null
  
  /** 监控组件加载 */
  monitorComponentLoad(templateName: string): () => void
  
  /** 清除指标 */
  clearMetrics(name?: string): void
  
  /** 获取所有指标名称 */
  getMetricNames(): string[]
}

/**
 * 智能预加载器接口
 */
export interface IIntelligentPreloader {
  /** 添加到预加载队列 */
  addToQueue(templates: TemplateMetadata[]): void
  
  /** 获取预加载状态 */
  getPreloadStatus(): Map<string, PreloadStatus>
  
  /** 清除预加载队列 */
  clearQueue(): void
  
  /** 暂停预加载 */
  pause(): void
  
  /** 恢复预加载 */
  resume(): void
}
