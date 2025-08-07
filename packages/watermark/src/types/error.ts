/**
 * 错误相关类型定义
 */

// 错误代码枚举
export enum WatermarkErrorCode {
  // 配置错误 1000-1099
  INVALID_CONFIG = 1000,
  MISSING_CONTENT = 1001,
  INVALID_CONTAINER = 1002,
  INVALID_STYLE = 1003,
  INVALID_LAYOUT = 1004,
  INVALID_ANIMATION = 1005,
  INVALID_SECURITY = 1006,

  // 渲染错误 1100-1199
  RENDER_FAILED = 1100,
  RENDERER_NOT_FOUND = 1101,
  CANVAS_NOT_SUPPORTED = 1102,
  SVG_NOT_SUPPORTED = 1103,
  IMAGE_LOAD_FAILED = 1104,
  LAYOUT_CALCULATION_FAILED = 1105,
  STYLE_APPLICATION_FAILED = 1106,

  // 实例错误 1200-1299
  INSTANCE_NOT_FOUND = 1200,
  INSTANCE_ALREADY_EXISTS = 1201,
  INSTANCE_CREATION_FAILED = 1202,
  INSTANCE_UPDATE_FAILED = 1203,
  INSTANCE_DESTROY_FAILED = 1204,
  INVALID_INSTANCE_STATE = 1205,

  // 安全错误 1300-1399
  SECURITY_VIOLATION = 1300,
  SECURITY_INIT_FAILED = 1301,
  MUTATION_OBSERVER_FAILED = 1302,
  STYLE_PROTECTION_FAILED = 1303,
  CANVAS_PROTECTION_FAILED = 1304,

  // 动画错误 1400-1499
  ANIMATION_FAILED = 1400,
  ANIMATION_NOT_SUPPORTED = 1401,
  ANIMATION_TIMEOUT = 1402,
  INVALID_ANIMATION_CONFIG = 1403,
  ANIMATION_NOT_FOUND = 1404,

  // 响应式错误 1500-1599
  RESPONSIVE_INIT_FAILED = 1500,
  BREAKPOINT_NOT_FOUND = 1501,
  MEDIA_QUERY_FAILED = 1502,
  RESIZE_OBSERVER_FAILED = 1503,

  // 事件错误 1600-1699
  EVENT_HANDLER_FAILED = 1600,
  EVENT_LISTENER_FAILED = 1601,
  EVENT_LISTENER_ERROR = 1601,
  EVENT_EMISSION_FAILED = 1602,
  INVALID_EVENT_TYPE = 1603,
  EVENT_TIMEOUT = 1604,

  // 性能错误 1700-1799
  MEMORY_LEAK = 1700,
  PERFORMANCE_DEGRADATION = 1701,
  RESOURCE_EXHAUSTED = 1702,
  TIMEOUT = 1703,

  // 浏览器兼容性错误 1800-1899
  BROWSER_NOT_SUPPORTED = 1800,
  FEATURE_NOT_SUPPORTED = 1801,
  API_NOT_AVAILABLE = 1802,

  // 网络错误 1900-1999
  NETWORK_ERROR = 1900,
  IMAGE_FETCH_FAILED = 1901,
  RESOURCE_LOAD_FAILED = 1902,

  // 未知错误 9999
  UNKNOWN_ERROR = 9999,
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误类别
export enum ErrorCategory {
  CONFIG = 'config',
  RENDER = 'render',
  INSTANCE = 'instance',
  SECURITY = 'security',
  ANIMATION = 'animation',
  RESPONSIVE = 'responsive',
  EVENT = 'event',
  PERFORMANCE = 'performance',
  COMPATIBILITY = 'compatibility',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

// 水印错误基类
export class WatermarkError extends Error {
  /** 错误代码 */
  public readonly code: WatermarkErrorCode
  /** 错误严重程度 */
  public readonly severity: ErrorSeverity
  /** 错误类别 */
  public readonly category: ErrorCategory
  /** 实例ID */
  public readonly instanceId?: string
  /** 错误上下文 */
  public readonly context?: Record<string, any>
  /** 原始错误 */
  public readonly originalError?: Error
  /** 错误时间戳 */
  public readonly timestamp: number
  /** 堆栈跟踪 */
  public readonly stackTrace?: string

  constructor(
    message: string,
    code: WatermarkErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: {
      instanceId?: string
      context?: Record<string, any>
      originalError?: Error
      category?: ErrorCategory
    }
  ) {
    super(message)
    this.name = 'WatermarkError'
    this.code = code
    this.severity = severity
    this.category = options?.category || this.getCategoryFromCode(code)
    this.instanceId = options?.instanceId
    this.context = options?.context
    this.originalError = options?.originalError
    this.timestamp = Date.now()
    this.stackTrace = this.stack

    // 保持原型链
    Object.setPrototypeOf(this, WatermarkError.prototype)
  }

  private getCategoryFromCode(code: WatermarkErrorCode): ErrorCategory {
    if (code >= 1000 && code < 1100) return ErrorCategory.CONFIG
    if (code >= 1100 && code < 1200) return ErrorCategory.RENDER
    if (code >= 1200 && code < 1300) return ErrorCategory.INSTANCE
    if (code >= 1300 && code < 1400) return ErrorCategory.SECURITY
    if (code >= 1400 && code < 1500) return ErrorCategory.ANIMATION
    if (code >= 1500 && code < 1600) return ErrorCategory.RESPONSIVE
    if (code >= 1600 && code < 1700) return ErrorCategory.EVENT
    if (code >= 1700 && code < 1800) return ErrorCategory.PERFORMANCE
    if (code >= 1800 && code < 1900) return ErrorCategory.COMPATIBILITY
    if (code >= 1900 && code < 2000) return ErrorCategory.NETWORK
    return ErrorCategory.UNKNOWN
  }

  /** 转换为JSON格式 */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      instanceId: this.instanceId,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stackTrace,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    }
  }

  /** 获取用户友好的错误信息 */
  getUserFriendlyMessage(): string {
    const messages: Partial<Record<WatermarkErrorCode, string>> = {
      [WatermarkErrorCode.INVALID_CONFIG]: '水印配置无效，请检查配置参数',
      [WatermarkErrorCode.MISSING_CONTENT]: '缺少水印内容，请提供文本或图片',
      [WatermarkErrorCode.INVALID_CONTAINER]:
        '容器元素无效，请提供有效的DOM元素',
      [WatermarkErrorCode.RENDER_FAILED]: '水印渲染失败，请检查配置和环境',
      [WatermarkErrorCode.CANVAS_NOT_SUPPORTED]:
        '浏览器不支持Canvas，请使用其他渲染模式',
      [WatermarkErrorCode.SVG_NOT_SUPPORTED]:
        '浏览器不支持SVG，请使用其他渲染模式',
      [WatermarkErrorCode.IMAGE_LOAD_FAILED]: '图片加载失败，请检查图片地址',
      [WatermarkErrorCode.INSTANCE_NOT_FOUND]: '水印实例不存在',
      [WatermarkErrorCode.SECURITY_VIOLATION]: '检测到安全违规行为',
      [WatermarkErrorCode.ANIMATION_FAILED]: '动画执行失败',
      [WatermarkErrorCode.BROWSER_NOT_SUPPORTED]:
        '浏览器版本过低，不支持此功能',
      [WatermarkErrorCode.NETWORK_ERROR]: '网络错误，请检查网络连接',
      [WatermarkErrorCode.UNKNOWN_ERROR]: '未知错误',
    }

    return messages[this.code] || this.message
  }
}

// 错误处理器接口
export interface ErrorHandler {
  /** 处理错误 */
  handle(error: WatermarkError): void | Promise<void>
  /** 是否可以处理此错误 */
  canHandle(error: WatermarkError): boolean
  /** 处理器优先级 */
  priority: number
}

// 错误恢复策略
export interface ErrorRecoveryStrategy {
  /** 策略名称 */
  name: string
  /** 是否可以恢复 */
  canRecover(error: WatermarkError): boolean
  /** 执行恢复 */
  recover(error: WatermarkError): Promise<boolean>
  /** 恢复超时时间 */
  timeout?: number
}

// 错误报告接口
export interface ErrorReport {
  /** 错误信息 */
  error: WatermarkError
  /** 用户代理 */
  userAgent: string
  /** 页面URL */
  url: string
  /** 时间戳 */
  timestamp: number
  /** 用户ID(如果有) */
  userId?: string
  /** 会话ID */
  sessionId?: string
  /** 额外信息 */
  extra?: Record<string, any>
}

// 错误管理器接口
export interface ErrorManager {
  /** 注册错误处理器 */
  registerHandler(category: ErrorCategory, handler: ErrorHandler): string
  /** 注销错误处理器 */
  unregisterHandler(category: ErrorCategory, handler: ErrorHandler): boolean
  /** 注册恢复策略 */
  registerRecoveryStrategy(
    errorCode: WatermarkErrorCode,
    strategy: ErrorRecoveryStrategy
  ): void
  /** 处理错误 */
  handleError(error: WatermarkError): Promise<void>
  /** 尝试恢复错误 */
  tryRecover(error: WatermarkError): Promise<boolean>
  /** 报告错误 */
  reportError(error: WatermarkError): Promise<void>
  /** 获取错误统计 */
  getErrorStats(): ErrorStats
  /** 清空错误历史 */
  clearErrorHistory(): void
}

// 错误统计信息
export interface ErrorStats {
  /** 总错误数 */
  totalErrors: number
  /** 各类别错误数 */
  errorsByCategory: Record<ErrorCategory, number>
  /** 各严重程度错误数 */
  errorsBySeverity: Record<ErrorSeverity, number>
  /** 最近错误 */
  recentErrors: WatermarkError[]
  /** 错误率 */
  errorRate: number
  /** 恢复成功率 */
  recoveryRate: number
}

// 错误配置
export interface ErrorConfig {
  /** 是否启用错误处理 */
  enabled?: boolean
  /** 是否自动恢复 */
  autoRecover?: boolean
  /** 是否报告错误 */
  reportErrors?: boolean
  /** 报告URL */
  reportUrl?: string
  /** 最大错误历史数量 */
  maxErrorHistory?: number
  /** 是否在控制台输出错误 */
  logErrors?: boolean
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  /** 自定义错误处理器 */
  customHandlers?: ErrorHandler[]
  /** 自定义恢复策略 */
  customRecoveryStrategies?: ErrorRecoveryStrategy[]
}

// 默认错误配置
export const DEFAULT_ERROR_CONFIG: Required<
  Omit<ErrorConfig, 'reportUrl' | 'customHandlers' | 'customRecoveryStrategies'>
> = {
  enabled: true,
  autoRecover: true,
  reportErrors: false,
  maxErrorHistory: 50,
  logErrors: true,
  logLevel: 'error',
}
