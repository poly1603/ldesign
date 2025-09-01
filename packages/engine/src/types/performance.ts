/**
 * 性能监控类型定义
 * 包含性能指标、监控器等相关类型
 */

import type { PerformanceMetrics } from './base'

// 性能监控器接口
export interface PerformanceMonitor {
  start: (name: string) => void
  end: (name: string) => void
  measure: (name: string, fn: () => unknown) => unknown
  measureAsync: <T>(name: string, fn: () => Promise<T>) => Promise<T>
  getMetrics: () => PerformanceMetrics
  getMetricsByName: (name: string) => PerformanceMetrics[]
  clear: () => void
  export: () => PerformanceReport
  setThreshold: (name: string, threshold: number) => void
  getThreshold: (name: string) => number | undefined
}

// 性能管理器接口（别名，保持向后兼容性）
export interface PerformanceManager extends PerformanceMonitor {
  // 继承PerformanceMonitor的所有方法
  getReport: () => PerformanceReport
}

// 性能指标收集器接口
export interface MetricsCollector {
  collect: () => PerformanceMetrics
  collectMemory: () => MemoryMetrics
  collectCPU: () => CPUMetrics
  collectNetwork: () => NetworkMetrics
  collectDOM: () => DOMMetrics
  collectCustom: (name: string, value: number) => void
}

// 内存指标
export interface MemoryMetrics {
  used: number
  total: number
  available: number
  percentage: number
  timestamp: number
}

// CPU指标
export interface CPUMetrics {
  usage: number
  cores: number
  load: number
  timestamp: number
}

// 网络指标
export interface NetworkMetrics {
  bandwidth: number
  latency: number
  packetLoss: number
  timestamp: number
}

// DOM指标
export interface DOMMetrics {
  nodeCount: number
  depth: number
  renderTime: number
  repaintTime: number
  timestamp: number
}

// 性能报告
export interface PerformanceReport {
  summary: PerformanceSummary
  details: PerformanceDetails
  recommendations: string[]
  timestamp: number
}

// 性能摘要
export interface PerformanceSummary {
  totalTime: number
  averageTime: number
  slowestOperation: string
  fastestOperation: string
  totalOperations: number
  performanceScore: number
}

// 性能详情
export interface PerformanceDetails {
  operations: Array<{
    name: string
    duration: number
    timestamp: number
    metadata?: Record<string, unknown>
  }>
  memory: MemoryMetrics[]
  cpu: CPUMetrics[]
  network: NetworkMetrics[]
  dom: DOMMetrics[]
}

// 性能分析器接口
export interface PerformanceAnalyzer {
  analyze: (metrics: PerformanceMetrics[]) => PerformanceAnalysis
  identifyBottlenecks: (metrics: PerformanceMetrics[]) => string[]
  suggestOptimizations: (metrics: PerformanceMetrics[]) => string[]
  compare: (
    baseline: PerformanceMetrics,
    current: PerformanceMetrics
  ) => PerformanceComparison
}

// 性能分析结果
export interface PerformanceAnalysis {
  bottlenecks: string[]
  optimizations: string[]
  trends: PerformanceTrend[]
  alerts: PerformanceAlert[]
}

// 性能趋势
export interface PerformanceTrend {
  metric: string
  direction: 'improving' | 'degrading' | 'stable'
  change: number
  period: string
}

// 性能告警
export interface PerformanceAlert {
  level: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metric: string
  threshold: number
  current: number
  timestamp: number
}

// 性能比较结果
export interface PerformanceComparison {
  improved: string[]
  degraded: string[]
  unchanged: string[]
  overallChange: number
  recommendations: string[]
}

// 性能配置
export interface PerformanceConfig {
  enabled: boolean
  samplingRate: number
  maxMetrics: number
  thresholds: Record<string, number>
  autoCleanup: boolean
  exportInterval: number
}
