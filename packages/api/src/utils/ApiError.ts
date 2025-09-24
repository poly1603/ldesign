/**
 * 增强的API错误处理系统
 * 提供更好的错误分类、调试信息和用户友好的错误消息
 */

/**
 * API错误类型枚举
 */
export enum ApiErrorType {
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 超时错误 */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  /** 请求取消 */
  CANCELLED_ERROR = 'CANCELLED_ERROR',
  /** 服务器错误 (5xx) */
  SERVER_ERROR = 'SERVER_ERROR',
  /** 客户端错误 (4xx) */
  CLIENT_ERROR = 'CLIENT_ERROR',
  /** 认证错误 (401) */
  AUTH_ERROR = 'AUTH_ERROR',
  /** 权限错误 (403) */
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  /** 资源不存在 (404) */
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  /** 数据验证错误 */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** 插件错误 */
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  /** 配置错误 */
  CONFIG_ERROR = 'CONFIG_ERROR',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  /** 低 - 用户可以继续操作 */
  LOW = 'LOW',
  /** 中 - 影响部分功能 */
  MEDIUM = 'MEDIUM',
  /** 高 - 严重影响用户体验 */
  HIGH = 'HIGH',
  /** 严重 - 系统不可用 */
  CRITICAL = 'CRITICAL',
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** API方法名 */
  methodName?: string
  /** 请求参数 */
  params?: unknown
  /** 请求配置 */
  config?: unknown
  /** 重试次数 */
  retryCount?: number
  /** 时间戳 */
  timestamp?: number
  /** 用户代理 */
  userAgent?: string
  /** 请求ID */
  requestId?: string
}

/**
 * 增强的API错误类
 */
export class ApiError extends Error {
  /** 错误类型 */
  public readonly type: ApiErrorType
  /** 错误代码 */
  public readonly code: string | number
  /** 严重程度 */
  public readonly severity: ErrorSeverity
  /** 原始错误 */
  public readonly originalError?: Error
  /** 错误上下文 */
  public readonly context: ErrorContext
  /** 用户友好的错误消息 */
  public readonly userMessage: string
  /** 开发者错误消息 */
  public readonly developerMessage: string
  /** 建议的解决方案 */
  public readonly suggestions: string[]
  /** 是否可重试 */
  public readonly retryable: boolean
  /** 时间戳 */
  public readonly timestamp: number

  constructor(options: {
    type: ApiErrorType
    code?: string | number
    message: string
    userMessage?: string
    developerMessage?: string
    suggestions?: string[]
    severity?: ErrorSeverity
    retryable?: boolean
    originalError?: Error
    context?: ErrorContext
  }) {
    super(options.message)

    this.name = 'ApiError'
    this.type = options.type
    this.code = options.code ?? 'UNKNOWN'
    this.severity = options.severity ?? this.inferSeverity(options.type)
    this.originalError = options.originalError
    this.context = options.context ?? {}
    this.userMessage = options.userMessage ?? this.generateUserMessage(options.type)
    this.developerMessage = options.developerMessage ?? options.message
    this.suggestions = options.suggestions ?? this.generateSuggestions(options.type)
    this.retryable = options.retryable ?? this.inferRetryable(options.type)
    this.timestamp = Date.now()

    // 保持错误堆栈
    if (options.originalError?.stack) {
      this.stack = options.originalError.stack
    }
  }

  /**
   * 推断错误严重程度
   */
  private inferSeverity(type: ApiErrorType): ErrorSeverity {
    switch (type) {
      case ApiErrorType.NETWORK_ERROR:
      case ApiErrorType.SERVER_ERROR:
        return ErrorSeverity.HIGH
      case ApiErrorType.AUTH_ERROR:
      case ApiErrorType.PERMISSION_ERROR:
        return ErrorSeverity.MEDIUM
      case ApiErrorType.TIMEOUT_ERROR:
      case ApiErrorType.CLIENT_ERROR:
      case ApiErrorType.NOT_FOUND_ERROR:
        return ErrorSeverity.MEDIUM
      case ApiErrorType.CANCELLED_ERROR:
      case ApiErrorType.VALIDATION_ERROR:
        return ErrorSeverity.LOW
      case ApiErrorType.CONFIG_ERROR:
      case ApiErrorType.PLUGIN_ERROR:
        return ErrorSeverity.CRITICAL
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  /**
   * 生成用户友好的错误消息
   */
  private generateUserMessage(type: ApiErrorType): string {
    switch (type) {
      case ApiErrorType.NETWORK_ERROR:
        return '网络连接失败，请检查网络设置'
      case ApiErrorType.TIMEOUT_ERROR:
        return '请求超时，请稍后重试'
      case ApiErrorType.CANCELLED_ERROR:
        return '请求已取消'
      case ApiErrorType.SERVER_ERROR:
        return '服务器暂时不可用，请稍后重试'
      case ApiErrorType.AUTH_ERROR:
        return '身份验证失败，请重新登录'
      case ApiErrorType.PERMISSION_ERROR:
        return '权限不足，无法执行此操作'
      case ApiErrorType.NOT_FOUND_ERROR:
        return '请求的资源不存在'
      case ApiErrorType.VALIDATION_ERROR:
        return '数据格式不正确，请检查输入'
      case ApiErrorType.CLIENT_ERROR:
        return '请求参数错误'
      default:
        return '操作失败，请稍后重试'
    }
  }

  /**
   * 生成解决建议
   */
  private generateSuggestions(type: ApiErrorType): string[] {
    switch (type) {
      case ApiErrorType.NETWORK_ERROR:
        return [
          '检查网络连接',
          '尝试刷新页面',
          '联系网络管理员',
        ]
      case ApiErrorType.TIMEOUT_ERROR:
        return [
          '稍后重试',
          '检查网络速度',
          '减少请求数据量',
        ]
      case ApiErrorType.AUTH_ERROR:
        return [
          '重新登录',
          '检查账号状态',
          '联系管理员',
        ]
      case ApiErrorType.PERMISSION_ERROR:
        return [
          '联系管理员获取权限',
          '检查账号角色',
          '使用其他账号',
        ]
      case ApiErrorType.VALIDATION_ERROR:
        return [
          '检查输入格式',
          '查看字段要求',
          '重新填写表单',
        ]
      default:
        return [
          '稍后重试',
          '刷新页面',
          '联系技术支持',
        ]
    }
  }

  /**
   * 推断是否可重试
   */
  private inferRetryable(type: ApiErrorType): boolean {
    switch (type) {
      case ApiErrorType.NETWORK_ERROR:
      case ApiErrorType.TIMEOUT_ERROR:
      case ApiErrorType.SERVER_ERROR:
        return true
      case ApiErrorType.AUTH_ERROR:
      case ApiErrorType.PERMISSION_ERROR:
      case ApiErrorType.NOT_FOUND_ERROR:
      case ApiErrorType.VALIDATION_ERROR:
      case ApiErrorType.CLIENT_ERROR:
      case ApiErrorType.CANCELLED_ERROR:
      case ApiErrorType.CONFIG_ERROR:
      case ApiErrorType.PLUGIN_ERROR:
        return false
      default:
        return false
    }
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      developerMessage: this.developerMessage,
      severity: this.severity,
      suggestions: this.suggestions,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `${this.name} [${this.type}]: ${this.message}`
  }
}

/**
 * 错误工厂函数
 */
export class ApiErrorFactory {
  /**
   * 从HTTP响应创建错误
   */
  static fromHttpResponse(response: any, context?: ErrorContext): ApiError {
    const status = response?.status || response?.response?.status
    const statusText = response?.statusText || response?.response?.statusText
    const data = response?.data || response?.response?.data

    let type: ApiErrorType
    const code = status || 'UNKNOWN'
    let message = statusText || 'Unknown error'

    if (status >= 500) {
      type = ApiErrorType.SERVER_ERROR
    }
    else if (status === 401) {
      type = ApiErrorType.AUTH_ERROR
      message = '身份验证失败'
    }
    else if (status === 403) {
      type = ApiErrorType.PERMISSION_ERROR
      message = '权限不足'
    }
    else if (status === 404) {
      type = ApiErrorType.NOT_FOUND_ERROR
      message = '资源不存在'
    }
    else if (status >= 400) {
      type = ApiErrorType.CLIENT_ERROR
    }
    else {
      type = ApiErrorType.UNKNOWN_ERROR
    }

    // 尝试从响应数据中获取更详细的错误信息
    if (data?.message) {
      message = data.message
    }
    else if (data?.error) {
      message = data.error
    }

    return new ApiError({
      type,
      code,
      message,
      developerMessage: `HTTP ${status}: ${statusText}`,
      context,
      originalError: response,
    })
  }

  /**
   * 从网络错误创建错误
   */
  static fromNetworkError(error: Error, context?: ErrorContext): ApiError {
    if (error.name === 'AbortError' || error.message.includes('cancelled')) {
      return new ApiError({
        type: ApiErrorType.CANCELLED_ERROR,
        message: '请求已取消',
        context,
        originalError: error,
      })
    }

    if (error.message.includes('timeout')) {
      return new ApiError({
        type: ApiErrorType.TIMEOUT_ERROR,
        message: '请求超时',
        context,
        originalError: error,
      })
    }

    return new ApiError({
      type: ApiErrorType.NETWORK_ERROR,
      message: error.message || '网络错误',
      context,
      originalError: error,
    })
  }

  /**
   * 从验证错误创建错误
   */
  static fromValidationError(message: string, context?: ErrorContext): ApiError {
    return new ApiError({
      type: ApiErrorType.VALIDATION_ERROR,
      message,
      context,
    })
  }

  /**
   * 从配置错误创建错误
   */
  static fromConfigError(message: string, context?: ErrorContext): ApiError {
    return new ApiError({
      type: ApiErrorType.CONFIG_ERROR,
      message,
      severity: ErrorSeverity.CRITICAL,
      context,
    })
  }

  /**
   * 从插件错误创建错误
   */
  static fromPluginError(message: string, context?: ErrorContext): ApiError {
    return new ApiError({
      type: ApiErrorType.PLUGIN_ERROR,
      message,
      severity: ErrorSeverity.CRITICAL,
      context,
    })
  }

  /**
   * 从未知错误创建错误
   */
  static fromUnknownError(error: unknown, context?: ErrorContext): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    if (error instanceof Error) {
      return new ApiError({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: error.message,
        context,
        originalError: error,
      })
    }

    return new ApiError({
      type: ApiErrorType.UNKNOWN_ERROR,
      message: String(error),
      context,
    })
  }
}
