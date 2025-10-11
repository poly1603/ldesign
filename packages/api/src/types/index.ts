/**
 * @ldesign/api 核心类型定义
 * 提供完整的 TypeScript 类型支持
 */

import type {
  HttpClient,
  HttpClientConfig,
  RequestConfig,
  ResponseData,
} from '@ldesign/http'

/**
 * API 引擎配置
 */
export interface ApiEngineConfig {
  /** 应用名称 */
  appName?: string
  /** 版本号 */
  version?: string
  /** 调试模式 */
  debug?: boolean
  /** HTTP 客户端配置 */
  http?: HttpClientConfig
  /** 缓存配置 */
  cache?: CacheConfig
  /** 防抖配置 */
  debounce?: DebounceConfig
  /** 请求去重配置 */
  deduplication?: DeduplicationConfig
  /** 重试配置 */
  retry?: RetryConfig
  /** 中间件配置 */
  middlewares?: {
    request?: RequestMiddleware[]
    response?: ResponseMiddleware[]
    error?: ErrorMiddleware[]
  }
  /** 请求队列配置（限流/并发控制） */
  queue?: RequestQueueConfig
  /** 智能缓存策略配置 */
  smartCache?: SmartCacheStrategyConfig
  /** 请求分析配置 */
  analytics?: RequestAnalyticsConfig
  /** 请求取消配置 */
  cancellation?: RequestCancellationConfig
}

/**
 * 智能缓存策略配置
 */
export interface SmartCacheStrategyConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最小访问次数阈值 */
  minAccessThreshold?: number
  /** 热点数据TTL倍数 */
  hotDataTTLMultiplier?: number
  /** 冷数据TTL倍数 */
  coldDataTTLMultiplier?: number
  /** 统计窗口大小 */
  statsWindowSize?: number
  /** 自动调整间隔（毫秒） */
  autoAdjustInterval?: number
}

/**
 * 请求分析配置
 */
export interface RequestAnalyticsConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大记录数 */
  maxRecords?: number
  /** 记录保留时间（毫秒） */
  recordRetention?: number
  /** 是否记录请求详情 */
  recordDetails?: boolean
  /** 自动清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 请求取消配置
 */
export interface RequestCancellationConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 自动取消超时时间（毫秒） */
  autoTimeout?: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 默认缓存时间 (毫秒) */
  ttl?: number
  /** 最大缓存条目数 */
  maxSize?: number
  /** 缓存存储类型 */
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'lru'
  /** 缓存键前缀（仅 local/sessionStorage 生效） */
  prefix?: string
  /** 缓存键生成函数 */
  keyGenerator?: (methodName: string, params?: any) => string
}

/**
 * 防抖配置
 */
export interface DebounceConfig {
  /** 是否启用防抖 */
  enabled?: boolean
  /** 防抖延迟时间 (毫秒) */
  delay?: number
}

/**
 * 请求去重配置
 */
export interface DeduplicationConfig {
  /** 是否启用请求去重 */
  enabled?: boolean
  /** 去重键生成函数 */
  keyGenerator?: (methodName: string, params?: any) => string
}

/**
 * 重试配置
 */
export interface CircuitBreakerConfig {
  /** 是否启用断路器 */
  enabled?: boolean
  /** 连续失败阈值，超过后打开断路器 */
  failureThreshold?: number
  /** 半开等待时间（毫秒） */
  halfOpenAfter?: number
  /** 从半开到关闭所需的连续成功次数 */
  successThreshold?: number
}

export interface RetryConfig {
  /** 是否启用重试 */
  enabled?: boolean
  /** 最大重试次数（不含首次） */
  retries?: number
  /** 初始延迟（毫秒） */
  delay?: number
  /** 退避策略 */
  backoff?: 'fixed' | 'exponential'
  /** 最大延迟（毫秒），用于限制指数退避 */
  maxDelay?: number
  /** 抖动比例（0~1），用于打散重试风暴，示例：0.2 表示 ±20% 随机抖动 */
  jitter?: number
  /** 是否针对特定错误进行重试 */
  retryOn?: (error: any, attempt: number) => boolean
  /** 断路器配置 */
  circuitBreaker?: CircuitBreakerConfig
}

/**
 * 中间件上下文
 */
export interface BaseMiddlewareContext {
  /** API 方法名称 */
  methodName: string
  /** 调用参数 */
  params?: any
  /** 引擎实例 */
  engine: ApiEngine
}

export interface RequestContext extends BaseMiddlewareContext {}

export interface ResponseContext extends BaseMiddlewareContext {
  /** 原始请求配置（可选） */
  request?: RequestConfig
}

export interface ErrorContext extends BaseMiddlewareContext {
  /** 当前重试已尝试次数（从0开始） */
  attempt?: number
}

/**
 * 中间件函数类型
 */
export type RequestMiddleware = (
  config: RequestConfig,
  ctx: RequestContext,
) => Promise<RequestConfig> | RequestConfig

export type ResponseMiddleware = (
  response: ResponseData,
  ctx: ResponseContext,
) => Promise<ResponseData> | ResponseData

/**
 * 错误中间件可以选择性返回一个“恢复用”的响应。
 * 如果返回 ResponseData，则视为错误已恢复，后续流程按成功响应处理。
 */
export type ErrorMiddleware = (
  error: any,
  ctx: ErrorContext,
) => Promise<void | ResponseData> | void | ResponseData

/**
 * API 方法配置
 */
export interface ApiMethodConfig {
  /** 方法名称 */
  name: string
  /** HTTP 请求配置 */
  config: RequestConfig | ((params?: any) => RequestConfig)
  /** 数据转换函数 */
  transform?: (response: ResponseData) => any
  /** 数据验证函数 */
  validate?: (data: any) => boolean
  /** 错误处理函数 */
  onError?: (error: any) => void
  /** 成功回调函数 */
  onSuccess?: (data: any) => void
  /** 缓存配置 */
  cache?: Partial<CacheConfig>
  /** 防抖配置 */
  debounce?: Partial<DebounceConfig>
  /** 请求去重配置 */
  deduplication?: Partial<DeduplicationConfig>
  /** 重试配置 */
  retry?: Partial<RetryConfig>
  /** 方法级中间件 */
  middlewares?: {
    request?: RequestMiddleware[]
    response?: ResponseMiddleware[]
    error?: ErrorMiddleware[]
  }
  /** 方法级队列配置 */
  queue?: Partial<RequestQueueConfig>
}

/**
 * API 插件接口
 */
export interface ApiPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** API 方法定义 */
  apis?: Record<string, ApiMethodConfig>
  /** 插件安装函数 */
  install?: (engine: ApiEngine) => void | Promise<void>
  /** 插件卸载函数 */
  uninstall?: (engine: ApiEngine) => void | Promise<void>
}

/**
 * API 调用选项
 */
export interface ApiCallOptions {
  /** 是否跳过缓存 */
  skipCache?: boolean
  /** 是否跳过防抖 */
  skipDebounce?: boolean
  /** 是否跳过去重 */
  skipDeduplication?: boolean
  /** 自定义缓存配置 */
  cache?: Partial<CacheConfig>
  /** 自定义防抖配置 */
  debounce?: Partial<DebounceConfig>
  /** 自定义重试配置 */
  retry?: Partial<RetryConfig>
  /** 临时中间件（仅本次调用有效） */
  middlewares?: {
    request?: RequestMiddleware[]
    response?: ResponseMiddleware[]
    error?: ErrorMiddleware[]
  }
  /** 调用级队列配置 */
  queue?: Partial<RequestQueueConfig>
  /** 调用级优先级（越大优先级越高） */
  priority?: number
  /** 成功回调 */
  onSuccess?: (data: any) => void
  /** 错误回调 */
  onError?: (error: any) => void
}

/**
 * API 引擎接口
 */
export interface ApiEngine {
  /** 配置 */
  readonly config: ApiEngineConfig
  /** HTTP 客户端 */
  readonly httpClient: HttpClient
  /** 已注册的插件 */
  readonly plugins: Map<string, ApiPlugin>
  /** 已注册的方法 */
  readonly methods: Map<string, ApiMethodConfig>

  /**
   * 注册插件
   */
  use: (plugin: ApiPlugin) => Promise<void>

  /**
   * 卸载插件
   */
  unuse: (pluginName: string) => Promise<void>

  /**
   * 注册 API 方法
   */
  register: (methodName: string, config: ApiMethodConfig) => void

  /**
   * 注册多个 API 方法
   */
  registerBatch: (methods: Record<string, ApiMethodConfig>) => void

  /**
   * 取消注册 API 方法
   */
  unregister: (methodName: string) => void

  /**
   * 调用 API 方法
   */
  call: <T = any>(
    methodName: string,
    params?: any,
    options?: ApiCallOptions
  ) => Promise<T>

  /**
   * 批量调用 API 方法
   */
  callBatch: <T = any>(
    calls: Array<{ methodName: string, params?: any, options?: ApiCallOptions }>
  ) => Promise<T[]>

  /**
   * 检查方法是否存在
   */
  hasMethod: (methodName: string) => boolean

  /**
   * 获取所有方法名称
   */
  getMethodNames: () => string[]

  /**
   * 清除缓存
   */
  clearCache: (methodName?: string) => void

  /**
   * 获取缓存统计
   */
  getCacheStats: () => CacheStats

  /**
   * 销毁引擎
   */
  destroy: () => void
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总缓存条目数 */
  totalItems: number
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 缓存命中率 */
  hitRate: number
  /** 缓存大小 (字节) */
  size: number
}

/**
 * 缓存项
 */
export interface CacheItem {
  /** 缓存数据 */
  data: any
  /** 创建时间 */
  timestamp: number
  /** 过期时间 */
  expireTime: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessTime: number
}

/**
 * 防抖管理器
 */
export interface DebounceManager {
  /** 执行防抖函数 */
  execute: <T>(key: string, fn: () => Promise<T>, delay: number) => Promise<T>
  /** 取消防抖 */
  cancel: (key: string) => void
  /** 清除所有防抖 */
  clear: () => void
}

/**
 * 去重管理器
 */
export interface DeduplicationManager {
  /** 执行去重函数 */
  execute: <T>(key: string, fn: () => Promise<T>) => Promise<T>
  /** 清除去重缓存 */
  clear: () => void
}

/** 请求队列配置 */
export interface RequestQueueConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 并发上限 */
  concurrency?: number
  /** 最大排队长度（0 表示无限） */
  maxQueue?: number
}

/**
 * 系统 API 方法名称常量
 */
export const SYSTEM_API_METHODS = {
  /** 获取验证码 */
  GET_CAPTCHA: 'getCaptcha',
  /** 用户登录 */
  LOGIN: 'login',
  /** 用户登出 */
  LOGOUT: 'logout',
  /** 获取用户信息 */
  GET_USER_INFO: 'getUserInfo',
  /** 更新用户信息 */
  UPDATE_USER_INFO: 'updateUserInfo',
  /** 获取系统菜单 */
  GET_MENUS: 'getMenus',
  /** 获取用户权限 */
  GET_PERMISSIONS: 'getPermissions',
  /** 刷新令牌 */
  REFRESH_TOKEN: 'refreshToken',
  /** 修改密码 */
  CHANGE_PASSWORD: 'changePassword',
  /** 获取系统配置 */
  GET_SYSTEM_CONFIG: 'getSystemConfig',
} as const

/**
 * 系统 API 方法名称类型
 */
export type SystemApiMethodName =
  (typeof SYSTEM_API_METHODS)[keyof typeof SYSTEM_API_METHODS]

/**
 * 登录参数
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  captcha?: string
  /** 验证码ID */
  captchaId?: string
  /** 记住我 */
  rememberMe?: boolean
}

/**
 * 登录结果
 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken?: string
  /** 令牌类型 */
  tokenType?: string
  /** 过期时间 (秒) */
  expiresIn?: number
  /** 用户信息 */
  userInfo?: UserInfo
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  id: string | number
  /** 用户名 */
  username: string
  /** 昵称 */
  nickname?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 头像 */
  avatar?: string
  /** 角色 */
  roles?: string[]
  /** 权限 */
  permissions?: string[]
  /** 部门 */
  department?: string
  /** 状态 */
  status?: 'active' | 'inactive' | 'locked'
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/**
 * 菜单项
 */
export interface MenuItem {
  /** 菜单ID */
  id: string | number
  /** 菜单名称 */
  name: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 菜单路径 */
  path?: string
  /** 菜单组件 */
  component?: string
  /** 父菜单ID */
  parentId?: string | number
  /** 排序 */
  sort?: number
  /** 是否隐藏 */
  hidden?: boolean
  /** 子菜单 */
  children?: MenuItem[]
  /** 元数据 */
  meta?: Record<string, any>
}

/**
 * 验证码信息
 */
export interface CaptchaInfo {
  /** 验证码ID */
  captchaId: string
  /** 验证码图片 (base64) */
  captchaImage: string
  /** 过期时间 (秒) */
  expiresIn?: number
}

// 导出错误处理相关类型
export * from '../utils/ApiError'
export * from '../utils/ErrorReporter'

// 导出类型安全的 API 引擎
export * from './typed-api'
