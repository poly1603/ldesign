/**
 * 统一错误处理
 */

import { logger } from './logger'
import { ERROR_CODES } from '../config/constants'

/**
 * 编辑器错误类
 */
export class EditorError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'EditorError'
    
    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EditorError)
    }
  }
}

/**
 * 文件错误类
 */
export class FileError extends EditorError {
  constructor(message: string, code: string, public file?: File, details?: any) {
    super(message, code, details)
    this.name = 'FileError'
  }
}

/**
 * 命令错误类
 */
export class CommandError extends EditorError {
  constructor(message: string, public commandName: string, details?: any) {
    super(message, ERROR_CODES.COMMAND_EXECUTION_FAILED, details)
    this.name = 'CommandError'
  }
}

/**
 * 插件错误类
 */
export class PluginError extends EditorError {
  constructor(message: string, public pluginName: string, details?: any) {
    super(message, ERROR_CODES.PLUGIN_INIT_FAILED, details)
    this.name = 'PluginError'
  }
}

/**
 * AI 错误类
 */
export class AIError extends EditorError {
  constructor(message: string, code: string = ERROR_CODES.AI_PROVIDER_ERROR, details?: any) {
    super(message, code, details)
    this.name = 'AIError'
  }
}

/**
 * 错误处理器
 */
export function handleError(error: Error, context?: string): void {
  const prefix = context ? `[${context}]` : ''
  
  if (error instanceof EditorError) {
    logger.error(`${prefix} ${error.name}: ${error.message}`, {
      code: error.code,
      details: error.details,
      stack: error.stack
    })
  } else {
    logger.error(`${prefix} Unexpected error:`, error)
  }
  
  // 在开发环境下，可以选择抛出错误以便调试
  if (process.env.NODE_ENV === 'development') {
    // 可以在这里添加更详细的调试信息
  }
}

/**
 * 异步错误处理器
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  context?: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    handleError(error as Error, context)
    return fallback
  }
}

/**
 * 同步错误处理器
 */
export function handleSyncError<T>(
  fn: () => T,
  context?: string,
  fallback?: T
): T | undefined {
  try {
    return fn()
  } catch (error) {
    handleError(error as Error, context)
    return fallback
  }
}

/**
 * 文件验证
 */
export function validateFile(file: File): void {
  const { MAX_FILE_SIZE, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, SUPPORTED_AUDIO_TYPES } = 
    require('../config/constants').FILE_CONFIG
  
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new FileError(
      `文件大小超过限制（最大 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB）`,
      ERROR_CODES.FILE_TOO_LARGE,
      file,
      { maxSize: MAX_FILE_SIZE, actualSize: file.size }
    )
  }
  
  // 检查文件类型
  const allSupportedTypes = [
    ...SUPPORTED_IMAGE_TYPES,
    ...SUPPORTED_VIDEO_TYPES,
    ...SUPPORTED_AUDIO_TYPES
  ]
  
  if (!allSupportedTypes.includes(file.type)) {
    throw new FileError(
      '不支持的文件类型',
      ERROR_CODES.INVALID_FILE_TYPE,
      file,
      { supportedTypes: allSupportedTypes, actualType: file.type }
    )
  }
}

/**
 * URL 验证
 */
export function validateURL(url: string): void {
  const { URL: URL_REGEX } = require('../config/constants').REGEX
  
  if (!URL_REGEX.test(url)) {
    throw new EditorError(
      '无效的 URL 格式',
      ERROR_CODES.INVALID_URL,
      { url }
    )
  }
}

/**
 * 创建用户友好的错误消息
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof FileError) {
    switch (error.code) {
      case ERROR_CODES.FILE_TOO_LARGE:
        return '文件太大，请选择较小的文件'
      case ERROR_CODES.INVALID_FILE_TYPE:
        return '不支持该文件类型'
      case ERROR_CODES.UPLOAD_FAILED:
        return '上传失败，请重试'
      default:
        return '文件处理失败'
    }
  }
  
  if (error instanceof CommandError) {
    return `命令执行失败：${error.commandName}`
  }
  
  if (error instanceof PluginError) {
    return `插件加载失败：${error.pluginName}`
  }
  
  if (error instanceof AIError) {
    return 'AI 服务出错，请稍后重试'
  }
  
  return '操作失败，请重试'
}













