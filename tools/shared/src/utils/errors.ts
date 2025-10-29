/**
 * 错误处理工具
 */

import { ERROR_CODES } from '../constants'

/**
 * 基础错误类
 */
export class BaseError extends Error {
  public readonly code: string
  public readonly details?: any

  constructor(message: string, code: string = ERROR_CODES.UNKNOWN, details?: any) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    }
  }
}

/**
 * 参数错误
 */
export class InvalidParamsError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, ERROR_CODES.INVALID_PARAMS, details)
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, ERROR_CODES.NOT_FOUND, details)
  }
}

/**
 * 已存在错误
 */
export class AlreadyExistsError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, ERROR_CODES.ALREADY_EXISTS, details)
  }
}

/**
 * 项目未找到错误
 */
export class ProjectNotFoundError extends NotFoundError {
  constructor(projectId: string) {
    super(`项目未找到: ${projectId}`, { projectId })
    Object.defineProperty(this, 'code', {
      value: ERROR_CODES.PROJECT_NOT_FOUND,
      writable: false,
    })
  }
}

/**
 * 项目已存在错误
 */
export class ProjectAlreadyExistsError extends AlreadyExistsError {
  constructor(path: string) {
    super(`项目已存在: ${path}`, { path })
    Object.defineProperty(this, 'code', {
      value: ERROR_CODES.PROJECT_ALREADY_EXISTS,
      writable: false,
    })
  }
}

/**
 * 工具未找到错误
 */
export class ToolNotFoundError extends NotFoundError {
  constructor(toolName: string) {
    super(`工具未找到: ${toolName}`, { toolName })
    this.code = ERROR_CODES.TOOL_NOT_FOUND
  }
}

/**
 * 工具执行失败错误
 */
export class ToolExecutionError extends BaseError {
  constructor(toolName: string, action: string, originalError?: Error) {
    super(
      `工具执行失败: ${toolName}.${action}`,
      ERROR_CODES.TOOL_EXECUTION_FAILED,
      { toolName, action, originalError: originalError?.message }
    )
  }
}

/**
 * 工具未初始化错误
 */
export class ToolNotInitializedError extends BaseError {
  constructor(toolName: string) {
    super(`工具未初始化: ${toolName}`, ERROR_CODES.TOOL_NOT_INITIALIZED, { toolName })
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends BaseError {
  constructor(operation: string, timeout: number) {
    super(`操作超时: ${operation} (${timeout}ms)`, ERROR_CODES.TIMEOUT, { operation, timeout })
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends BaseError {
  constructor(message: string, originalError?: Error) {
    super(message, ERROR_CODES.DATABASE_ERROR, { originalError: originalError?.message })
  }
}

/**
 * 网络错误
 */
export class NetworkError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, ERROR_CODES.NETWORK_ERROR, details)
  }
}

/**
 * 错误处理辅助函数
 */
export function isBaseError(error: any): error is BaseError {
  return error instanceof BaseError
}

export function toBaseError(error: unknown): BaseError {
  if (isBaseError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new BaseError(error.message, ERROR_CODES.UNKNOWN, {
      originalError: error,
      stack: error.stack,
    })
  }

  return new BaseError(String(error), ERROR_CODES.UNKNOWN)
}

export function createErrorResponse(error: unknown) {
  const baseError = toBaseError(error)
  return {
    success: false,
    error: {
      code: baseError.code,
      message: baseError.message,
      details: baseError.details,
    },
    timestamp: Date.now(),
  }
}

