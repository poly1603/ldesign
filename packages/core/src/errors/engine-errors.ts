/**
 * 引擎错误基类
 * 
 * @description
 * 所有引擎相关错误的基类,提供统一的错误处理接口
 * 
 * @example
 * ```typescript
 * throw new EngineError('INVALID_CONFIG', '配置无效', {
 *   config: invalidConfig,
 *   suggestions: ['检查配置格式', '参考文档示例']
 * })
 * ```
 */
export class EngineError extends Error {
  /**
   * 错误代码
   */
  public readonly code: string

  /**
   * 错误详情
   */
  public readonly details?: Record<string, any>

  /**
   * 错误发生时间
   */
  public readonly timestamp: number

  constructor(
    code: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'EngineError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    let str = `${this.name} [${this.code}]: ${this.message}`
    
    if (this.details) {
      str += `\n详情: ${JSON.stringify(this.details, null, 2)}`
    }
    
    return str
  }
}

/**
 * 插件错误
 */
export class PluginError extends EngineError {
  public readonly pluginName: string

  constructor(
    code: string,
    message: string,
    pluginName: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, pluginName })
    this.name = 'PluginError'
    this.pluginName = pluginName
  }
}

/**
 * 中间件错误
 */
export class MiddlewareError extends EngineError {
  public readonly middlewareName: string

  constructor(
    code: string,
    message: string,
    middlewareName: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, middlewareName })
    this.name = 'MiddlewareError'
    this.middlewareName = middlewareName
  }
}

/**
 * 缓存错误
 */
export class CacheError extends EngineError {
  public readonly key?: string

  constructor(
    code: string,
    message: string,
    key?: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, key })
    this.name = 'CacheError'
    this.key = key
  }
}

/**
 * 状态错误
 */
export class StateError extends EngineError {
  public readonly path?: string

  constructor(
    code: string,
    message: string,
    path?: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, path })
    this.name = 'StateError'
    this.path = path
  }
}

/**
 * 事件错误
 */
export class EventError extends EngineError {
  public readonly eventName?: string

  constructor(
    code: string,
    message: string,
    eventName?: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, eventName })
    this.name = 'EventError'
    this.eventName = eventName
  }
}

/**
 * 生命周期错误
 */
export class LifecycleError extends EngineError {
  public readonly phase?: string

  constructor(
    code: string,
    message: string,
    phase?: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, phase })
    this.name = 'LifecycleError'
    this.phase = phase
  }
}

/**
 * 依赖注入错误
 */
export class DIError extends EngineError {
  public readonly serviceName?: string

  constructor(
    code: string,
    message: string,
    serviceName?: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, serviceName })
    this.name = 'DIError'
    this.serviceName = serviceName
  }
}

/**
 * 配置错误
 */
export class ConfigError extends EngineError {
  public readonly configKey?: string

  constructor(
    code: string,
    message: string,
    configKey?: string,
    details?: Record<string, any>
  ) {
    super(code, message, { ...details, configKey })
    this.name = 'ConfigError'
    this.configKey = configKey
  }
}

/**
 * 错误代码常量
 */
export const ErrorCodes = {
  // 插件错误 (1000-1999)
  PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
  PLUGIN_ALREADY_REGISTERED: 'PLUGIN_ALREADY_REGISTERED',
  PLUGIN_DEPENDENCY_MISSING: 'PLUGIN_DEPENDENCY_MISSING',
  PLUGIN_CIRCULAR_DEPENDENCY: 'PLUGIN_CIRCULAR_DEPENDENCY',
  PLUGIN_INSTALL_FAILED: 'PLUGIN_INSTALL_FAILED',
  PLUGIN_UNINSTALL_FAILED: 'PLUGIN_UNINSTALL_FAILED',
  PLUGIN_INVALID_CONFIG: 'PLUGIN_INVALID_CONFIG',

  // 缓存错误 (2000-2999)
  CACHE_INVALID_KEY: 'CACHE_INVALID_KEY',
  CACHE_MEMORY_LIMIT_EXCEEDED: 'CACHE_MEMORY_LIMIT_EXCEEDED',
  CACHE_SERIALIZATION_FAILED: 'CACHE_SERIALIZATION_FAILED',
  CACHE_DESERIALIZATION_FAILED: 'CACHE_DESERIALIZATION_FAILED',
  CACHE_OPERATION_FAILED: 'CACHE_OPERATION_FAILED',

  // 状态错误 (3000-3999)
  STATE_INVALID_PATH: 'STATE_INVALID_PATH',
  STATE_PATH_TOO_DEEP: 'STATE_PATH_TOO_DEEP',
  STATE_READONLY: 'STATE_READONLY',
  STATE_INVALID_VALUE: 'STATE_INVALID_VALUE',
  STATE_WATCHER_FAILED: 'STATE_WATCHER_FAILED',

  // 事件错误 (4000-4999)
  EVENT_INVALID_NAME: 'EVENT_INVALID_NAME',
  EVENT_LISTENER_LIMIT_EXCEEDED: 'EVENT_LISTENER_LIMIT_EXCEEDED',
  EVENT_HANDLER_FAILED: 'EVENT_HANDLER_FAILED',
  EVENT_NAMESPACE_NOT_FOUND: 'EVENT_NAMESPACE_NOT_FOUND',
  EVENT_EMIT_FAILED: 'EVENT_EMIT_FAILED',

  // 中间件错误 (5000-5999)
  MIDDLEWARE_ALREADY_REGISTERED: 'MIDDLEWARE_ALREADY_REGISTERED',
  MIDDLEWARE_NOT_FOUND: 'MIDDLEWARE_NOT_FOUND',
  MIDDLEWARE_EXECUTION_FAILED: 'MIDDLEWARE_EXECUTION_FAILED',
  MIDDLEWARE_INVALID_CONFIG: 'MIDDLEWARE_INVALID_CONFIG',

  // 生命周期错误 (6000-6999)
  LIFECYCLE_INVALID_PHASE: 'LIFECYCLE_INVALID_PHASE',
  LIFECYCLE_HOOK_FAILED: 'LIFECYCLE_HOOK_FAILED',
  LIFECYCLE_HOOK_ALREADY_REGISTERED: 'LIFECYCLE_HOOK_ALREADY_REGISTERED',

  // 依赖注入错误 (7000-7999)
  DI_SERVICE_NOT_FOUND: 'DI_SERVICE_NOT_FOUND',
  DI_SERVICE_ALREADY_REGISTERED: 'DI_SERVICE_ALREADY_REGISTERED',
  DI_CIRCULAR_DEPENDENCY: 'DI_CIRCULAR_DEPENDENCY',
  DI_INVALID_FACTORY: 'DI_INVALID_FACTORY',
  DI_RESOLUTION_FAILED: 'DI_RESOLUTION_FAILED',

  // 配置错误 (8000-8999)
  CONFIG_INVALID_KEY: 'CONFIG_INVALID_KEY',
  CONFIG_INVALID_VALUE: 'CONFIG_INVALID_VALUE',
  CONFIG_READONLY: 'CONFIG_READONLY',
  CONFIG_VALIDATION_FAILED: 'CONFIG_VALIDATION_FAILED',

  // 通用错误 (9000-9999)
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  OPERATION_FAILED: 'OPERATION_FAILED',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

/**
 * 错误代码类型
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

