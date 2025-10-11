/**
 * Logger module - 提供createLogger函数
 */

import { getLogger } from './unified-logger'
import type { LogLevel } from '../types/logger'

/**
 * 创建日志记录器
 * @param level 日志级别
 * @returns 日志记录器实例
 */
export function createLogger(level?: LogLevel | string) {
  // 创建一个日志记录器实例
  const logger = getLogger('Engine')
  
  // 如果提供了级别，设置日志级别
  if (level) {
    // TODO: 实现设置日志级别的逻辑
    // logger.setLevel(level)
  }
  
  return logger
}

// 重新导出类型和其他函数
export { getLogger } from './unified-logger'
export type { Logger, LogLevel } from '../types/logger'