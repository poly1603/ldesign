/**
 * 错误处理类型定义
 * 包含错误管理器、错误信息等相关类型
 */

import type { ErrorInfo } from './base'

// 错误处理器类型
export type ErrorHandler = (error: ErrorInfo) => void

// 错误管理器接口
export interface ErrorManager {
  onError: (handler: ErrorHandler) => void
  offError: (handler: ErrorHandler) => void
  captureError: (error: Error, component?: unknown, info?: string) => void
  getErrors: () => ErrorInfo[]
  hasErrors: () => boolean
  clearErrors: () => void
  // 处理错误（兼容方法）
  handle: (error: Error, context?: string) => void
}

// 错误边界接口
export interface ErrorBoundary {
  catchError: (error: Error, errorInfo: unknown) => void
  hasError: () => boolean
  getError: () => Error | null
  reset: () => void
}

// 错误报告接口
export interface ErrorReporter {
  report: (error: ErrorInfo) => Promise<void>
  isEnabled: () => boolean
  enable: () => void
  disable: () => void
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 错误聚合接口
export interface ErrorAggregator {
  add: (error: ErrorInfo) => void
  getAggregated: () => Record<string, unknown>
  clear: () => void
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 错误分析接口
export interface ErrorAnalyzer {
  analyze: (errors: ErrorInfo[]) => ErrorAnalysis
  getPatterns: () => string[]
  getFrequentErrors: () => Array<{ error: string; count: number }>
  getStatistics: () => ErrorStatistics
}

// 错误分析结果
export interface ErrorAnalysis {
  patterns: string[]
  frequentErrors: Array<{ error: string; count: number }>
  statistics: ErrorStatistics
  recommendations: string[]
}

// 错误统计信息
export interface ErrorStatistics {
  total: number
  byLevel: Record<string, number>
  byTime: Record<string, number>
  bySource: Record<string, number>
  averageStackDepth: number
  errorRate: number
  warningRate: number
}
