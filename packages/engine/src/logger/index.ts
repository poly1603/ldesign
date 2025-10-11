/**
 * Logger 模块主导出文件
 * 📝 统一的日志系统
 */

// 导出统一日志器
// 创建默认实例
import { createUnifiedLogger } from './unified-logger'

// 从 types 导出基础类型
export type {
  Logger as ILogger,
  LogEntry,
  LoggerOptions,
  LogLevel
} from '../types/logger'

export {
  createLogger,
  createUnifiedLogger,
  ErrorTrackingPlugin,
  // 类型
  type LogConfig,

  Logger,
  type LogPlugin,
  type LogStats,
  type LogTransport,

  // 内置插件
  PerformancePlugin,
  SamplingPlugin,
  UnifiedLogger
} from './unified-logger'

export const defaultLogger = createUnifiedLogger({
  level: 'info',
  format: 'pretty',
  console: true
})
