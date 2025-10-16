/**
 * 日志类型定义
 * 包含日志管理器、日志条目等相关类型
 */

import type { LogEntry, LogLevel } from './base'

// 重新导出基础日志类型
export type { LogEntry, LogLevel } from './base'

// 日志管理器接口
export interface Logger {
  debug: (message: string, data?: unknown) => void
  info: (message: string, data?: unknown) => void
  warn: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
  setLevel: (level: LogLevel) => void
  getLevel: () => LogLevel
  getLogs: () => LogEntry[]
  clearLogs: () => void
  clear: () => void
  setMaxLogs: (max: number) => void
  getMaxLogs: () => number
}

// 日志配置接口
export interface LogConfig {
  level?: LogLevel
  maxLogs?: number
  showTimestamp?: boolean
  showContext?: boolean
  prefix?: string
}

// 日志选项接口（兼容性导出）
export type LoggerOptions = LogConfig

// 日志传输器接口
export interface LogTransport {
  name: string
  send: (entry: LogEntry) => Promise<void>
  isAvailable: () => boolean
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 日志格式化器接口
export interface LogFormatter {
  name: string
  format: (entry: LogEntry) => string
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 日志过滤器接口
export interface LogFilter {
  name: string
  shouldLog: (entry: LogEntry) => boolean
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 日志聚合器接口
export interface LogAggregator {
  add: (entry: LogEntry) => void
  getAggregated: () => Record<string, unknown>
  clear: () => void
  getConfig: () => Record<string, unknown>
  setConfig: (config: Record<string, unknown>) => void
}

// 日志分析器接口
export interface LogAnalyzer {
  analyze: (logs: LogEntry[]) => LogAnalysis
  getPatterns: () => string[]
  getAnomalies: () => LogEntry[]
  getStatistics: () => LogStatistics
}

// 日志分析结果
export interface LogAnalysis {
  patterns: string[]
  anomalies: LogEntry[]
  statistics: LogStatistics
  recommendations: string[]
}

// 日志统计信息
export interface LogStatistics {
  total: number
  byLevel: Record<LogLevel, number>
  byTime: Record<string, number>
  bySource: Record<string, number>
  averageMessageLength: number
  errorRate: number
  warningRate: number
}
