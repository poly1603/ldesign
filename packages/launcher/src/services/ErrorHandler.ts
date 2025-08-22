/**
 * @fileoverview 错误处理器实现类
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type {
  IErrorHandler,
  LauncherError,
  ErrorCode,
  ErrorSeverity,
  ErrorHandlingStrategy,
} from '../types'
import { ERROR_CODES } from '../types'
import { logger } from '../utils'

/**
 * 错误处理器实现类
 * 负责处理、格式化和记录启动器运行过程中的错误
 * 
 * @example
 * ```typescript
 * const errorHandler = new ErrorHandler()
 * 
 * try {
 *   // 一些可能出错的操作
 * } catch (error) {
 *   const launcherError = errorHandler.handleError(error, 'operation context')
 *   console.error(launcherError.message)
 * }
 * ```
 */
export class ErrorHandler implements IErrorHandler {
  private readonly errorSuggestions: Map<ErrorCode, string>
  private readonly errorSeverities: Map<ErrorCode, ErrorSeverity>
  private strategy: ErrorHandlingStrategy = 'throw'

  constructor() {
    this.errorSuggestions = new Map()
    this.errorSeverities = new Map()
    this.initializeErrorMappings()
  }

  /**
   * 初始化错误映射表
   */
  private initializeErrorMappings(): void {
    // 错误建议映射
    const suggestions: Array<[ErrorCode, string]> = [
      [ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED, '请检查项目目录是否包含有效的配置文件，如 package.json'],
      [ERROR_CODES.INVALID_CONFIG, '请检查 Vite 配置文件语法是否正确'],
      [ERROR_CODES.PLUGIN_LOAD_FAILED, '请检查插件是否已正确安装，或尝试重新安装依赖'],
      [ERROR_CODES.BUILD_FAILED, '请检查代码语法错误，或查看详细的构建日志'],
      [ERROR_CODES.DEV_SERVER_START_FAILED, '请检查端口是否被占用，或尝试使用其他端口'],
      [ERROR_CODES.PREVIEW_SERVER_START_FAILED, '请确保构建输出目录存在，或先运行构建命令'],
      [ERROR_CODES.CONFIG_MERGE_FAILED, '请检查配置文件格式是否正确，避免类型冲突'],
      [ERROR_CODES.DEPENDENCY_NOT_FOUND, '请运行 npm install 或相应的包管理器安装命令'],
      [ERROR_CODES.UNSUPPORTED_FRAMEWORK, '请使用支持的框架类型，或添加自定义框架支持'],
      [ERROR_CODES.INVALID_PROJECT_ROOT, '请确保项目根目录路径正确且可访问'],
      [ERROR_CODES.BUILD_OUTPUT_NOT_FOUND, '请先运行构建命令生成输出文件'],
      [ERROR_CODES.PERMISSION_DENIED, '请检查文件权限，或以管理员身份运行'],
      [ERROR_CODES.NETWORK_ERROR, '请检查网络连接，或尝试使用代理'],
      [ERROR_CODES.TIMEOUT_ERROR, '操作超时，请检查网络或增加超时时间'],
      [ERROR_CODES.VALIDATION_ERROR, '请检查输入参数是否符合要求'],
    ]

    suggestions.forEach(([code, suggestion]) => {
      this.errorSuggestions.set(code, suggestion)
    })

    // 错误严重级别映射
    const severities: Array<[ErrorCode, ErrorSeverity]> = [
      [ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED, 'medium'],
      [ERROR_CODES.INVALID_CONFIG, 'high'],
      [ERROR_CODES.PLUGIN_LOAD_FAILED, 'high'],
      [ERROR_CODES.BUILD_FAILED, 'high'],
      [ERROR_CODES.DEV_SERVER_START_FAILED, 'high'],
      [ERROR_CODES.PREVIEW_SERVER_START_FAILED, 'medium'],
      [ERROR_CODES.CONFIG_MERGE_FAILED, 'medium'],
      [ERROR_CODES.DEPENDENCY_NOT_FOUND, 'high'],
      [ERROR_CODES.UNSUPPORTED_FRAMEWORK, 'medium'],
      [ERROR_CODES.INVALID_PROJECT_ROOT, 'high'],
      [ERROR_CODES.BUILD_OUTPUT_NOT_FOUND, 'medium'],
      [ERROR_CODES.PERMISSION_DENIED, 'critical'],
      [ERROR_CODES.NETWORK_ERROR, 'medium'],
      [ERROR_CODES.TIMEOUT_ERROR, 'medium'],
      [ERROR_CODES.VALIDATION_ERROR, 'low'],
    ]

    severities.forEach(([code, severity]) => {
      this.errorSeverities.set(code, severity)
    })
  }

  /**
   * 创建标准的启动器错误
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情
   * @param context 错误上下文
   * @returns 启动器错误
   */
  createError(
    code: ErrorCode,
    message: string,
    details?: string,
    context?: Record<string, unknown>
  ): LauncherError {
    const error = new Error(message) as LauncherError
    error.code = code
    error.message = message
    error.details = details
    error.suggestion = this.getSuggestion(code)
    error.docUrl = this.getDocumentationUrl(code)
    error.severity = this.errorSeverities.get(code) || 'medium'
    error.context = context
    error.timestamp = new Date()

    return error
  }

  /**
   * 处理错误
   * @param error 原始错误对象
   * @param context 错误上下文
   * @returns 处理后的启动器错误
   */
  handleError(error: Error, context?: string): LauncherError {
    // 如果已经是 LauncherError，直接返回
    if (this.isLauncherError(error)) {
      return error
    }

    // 根据错误信息推断错误代码
    const errorCode = this.inferErrorCode(error)
    
    const launcherError = this.createError(
      errorCode,
      error.message || '未知错误',
      context ? `Context: ${context}` : error.stack,
      { originalErrorName: error.name, context }
    )
    
    launcherError.originalError = error

    // 根据策略处理错误
    this.handleErrorByStrategy(launcherError)

    return launcherError
  }

  /**
   * 格式化错误信息
   * @param error 启动器错误
   * @returns 格式化后的错误信息
   */
  formatError(error: LauncherError): string {
    const timestamp = error.timestamp.toISOString()
    const severity = error.severity.toUpperCase()
    
    let formatted = `[${timestamp}] [${severity}] [${error.code}] ${error.message}`

    if (error.details) {
      formatted += `\n详情: ${error.details}`
    }

    if (error.suggestion) {
      formatted += `\n建议: ${error.suggestion}`
    }

    if (error.docUrl) {
      formatted += `\n文档: ${error.docUrl}`
    }

    if (error.context && Object.keys(error.context).length > 0) {
      formatted += `\n上下文: ${JSON.stringify(error.context, null, 2)}`
    }

    return formatted
  }

  /**
   * 记录错误日志
   * @param error 启动器错误
   */
  logError(error: LauncherError): void {
    const formattedError = this.formatError(error)
    
    // 根据错误严重级别选择日志方法
    switch (error.severity) {
      case 'critical':
        logger.error(`💥 CRITICAL ERROR: ${formattedError}`)
        break
      case 'high':
        logger.error(`❌ ERROR: ${formattedError}`)
        break
      case 'medium':
        logger.warn(`⚠️  WARNING: ${formattedError}`)
        break
      case 'low':
        logger.info(`ℹ️  NOTICE: ${formattedError}`)
        break
      default:
        logger.error(`❌ ERROR: ${formattedError}`)
    }

    // 在开发环境下输出原始错误堆栈
    if (process.env.NODE_ENV === 'development' && error.originalError?.stack) {
      logger.debug('原始错误堆栈:', error.originalError.stack)
    }
  }

  /**
   * 获取错误建议
   * @param errorCode 错误代码
   * @returns 错误建议
   */
  getSuggestion(errorCode: ErrorCode): string | undefined {
    return this.errorSuggestions.get(errorCode)
  }

  /**
   * 设置错误处理策略
   * @param strategy 错误处理策略
   */
  setErrorStrategy(strategy: ErrorHandlingStrategy): void {
    this.strategy = strategy
    logger.debug(`Error handling strategy set to: ${strategy}`)
  }

  /**
   * 根据策略处理错误
   * @param error 启动器错误
   */
  private handleErrorByStrategy(error: LauncherError): void {
    switch (this.strategy) {
      case 'throw':
        // 默认行为，不做额外处理
        break
      case 'log':
        this.logError(error)
        break
      case 'ignore':
        // 静默忽略，只在调试模式下记录
        logger.debug(`Ignored error: ${error.code} - ${error.message}`)
        break
      case 'retry':
        logger.info(`Error occurred, consider implementing retry logic for: ${error.code}`)
        this.logError(error)
        break
      default:
        this.logError(error)
    }
  }

  /**
   * 检查是否为启动器错误
   * @param error 错误对象
   * @returns 是否为启动器错误
   */
  private isLauncherError(error: unknown): error is LauncherError {
    return (
      error instanceof Error &&
      'code' in error &&
      'severity' in error &&
      'timestamp' in error
    )
  }

  /**
   * 根据错误信息推断错误代码
   * @param error 错误对象
   * @returns 错误代码
   */
  private inferErrorCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // 端口占用错误
    if (message.includes('eaddrinuse') || (message.includes('port') && message.includes('use'))) {
      return ERROR_CODES.DEV_SERVER_START_FAILED
    }

    // 文件不存在错误
    if (message.includes('enoent') || message.includes('no such file')) {
      return ERROR_CODES.BUILD_OUTPUT_NOT_FOUND
    }

    // 权限错误
    if (message.includes('eacces') || message.includes('permission denied')) {
      return ERROR_CODES.PERMISSION_DENIED
    }

    // 网络错误
    if (message.includes('enotfound') || message.includes('network') || message.includes('timeout')) {
      return ERROR_CODES.NETWORK_ERROR
    }

    // 模块未找到错误
    if (message.includes('cannot find module') || message.includes('module not found')) {
      return ERROR_CODES.DEPENDENCY_NOT_FOUND
    }

    // 构建错误
    if (message.includes('build') && (message.includes('failed') || message.includes('error'))) {
      return ERROR_CODES.BUILD_FAILED
    }

    // 配置错误
    if (message.includes('config') && (message.includes('invalid') || message.includes('error'))) {
      return ERROR_CODES.INVALID_CONFIG
    }

    // TypeScript 错误
    if (stack.includes('typescript') || message.includes('ts(')) {
      return ERROR_CODES.BUILD_FAILED
    }

    // 插件错误
    if (message.includes('plugin') && message.includes('failed')) {
      return ERROR_CODES.PLUGIN_LOAD_FAILED
    }

    // 验证错误
    if (message.includes('validation') || message.includes('invalid input')) {
      return ERROR_CODES.VALIDATION_ERROR
    }

    // 超时错误
    if (message.includes('timeout') || message.includes('etimedout')) {
      return ERROR_CODES.TIMEOUT_ERROR
    }

    // 默认配置错误
    return ERROR_CODES.INVALID_CONFIG
  }

  /**
   * 获取文档链接
   * @param errorCode 错误代码
   * @returns 文档链接
   */
  private getDocumentationUrl(errorCode: ErrorCode): string {
    const baseUrl = 'https://vitejs.dev/guide'
    
    const urlMappings: Record<ErrorCode, string> = {
      [ERROR_CODES.PROJECT_TYPE_DETECTION_FAILED]: `${baseUrl}/getting-started.html`,
      [ERROR_CODES.INVALID_CONFIG]: `${baseUrl}/config.html`,
      [ERROR_CODES.PLUGIN_LOAD_FAILED]: `${baseUrl}/using-plugins.html`,
      [ERROR_CODES.BUILD_FAILED]: `${baseUrl}/build.html`,
      [ERROR_CODES.DEV_SERVER_START_FAILED]: `${baseUrl}/dev-server.html`,
      [ERROR_CODES.PREVIEW_SERVER_START_FAILED]: `${baseUrl}/build.html#previewing-the-build`,
      [ERROR_CODES.CONFIG_MERGE_FAILED]: `${baseUrl}/config.html`,
      [ERROR_CODES.DEPENDENCY_NOT_FOUND]: `${baseUrl}/dep-pre-bundling.html`,
      [ERROR_CODES.UNSUPPORTED_FRAMEWORK]: `${baseUrl}/features.html`,
      [ERROR_CODES.INVALID_PROJECT_ROOT]: `${baseUrl}/getting-started.html`,
      [ERROR_CODES.BUILD_OUTPUT_NOT_FOUND]: `${baseUrl}/build.html`,
      [ERROR_CODES.PERMISSION_DENIED]: `${baseUrl}/troubleshooting.html`,
      [ERROR_CODES.NETWORK_ERROR]: `${baseUrl}/troubleshooting.html`,
      [ERROR_CODES.TIMEOUT_ERROR]: `${baseUrl}/troubleshooting.html`,
      [ERROR_CODES.VALIDATION_ERROR]: `${baseUrl}/troubleshooting.html`,
    }

    return urlMappings[errorCode] || `${baseUrl}/troubleshooting.html`
  }

  /**
   * 创建错误的静态方法
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情
   * @returns 启动器错误
   */
  static createError(code: ErrorCode, message: string, details?: string): LauncherError {
    const error = new Error(message) as LauncherError
    error.code = code
    error.message = message
    error.details = details
    error.severity = 'medium'
    error.timestamp = new Date()
    
    return error
  }

  /**
   * 包装异步函数，自动处理错误
   * @param fn 异步函数
   * @param context 错误上下文
   * @returns 包装后的函数
   */
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args)
      } catch (error) {
        const handler = new ErrorHandler()
        const launcherError = handler.handleError(error as Error, context)
        throw launcherError
      }
    }
  }

  /**
   * 创建错误边界装饰器
   * @param context 错误上下文
   * @returns 装饰器函数
   */
  static errorBoundary(context?: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value
      const methodContext = context || `${target.constructor.name}.${propertyKey}`

      descriptor.value = async function (...args: any[]) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          const handler = new ErrorHandler()
          const launcherError = handler.handleError(error as Error, methodContext)
          throw launcherError
        }
      }

      return descriptor
    }
  }
}