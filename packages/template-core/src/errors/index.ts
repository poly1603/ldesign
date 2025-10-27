/**
 * 错误处理模块
 */

import { ErrorType } from '../types'

/**
 * 模板错误类
 */
export class TemplateError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'TemplateError'
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private static handlers = new Map<ErrorType, (error: TemplateError) => void>()

  /**
   * 注册错误处理器
   */
  static register(type: ErrorType, handler: (error: TemplateError) => void): void {
    this.handlers.set(type, handler)
  }

  /**
   * 处理错误
   */
  static handle(error: TemplateError): void {
    const handler = this.handlers.get(error.type)
    if (handler) {
      handler(error)
    } else {
      console.error(`[TemplateError] ${error.type}: ${error.message}`, error.details)
    }
  }

  /**
   * 清除所有处理器
   */
  static clear(): void {
    this.handlers.clear()
  }
}

export default TemplateError
