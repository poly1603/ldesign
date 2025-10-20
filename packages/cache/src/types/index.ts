/**
 * 存储引擎类型
 */
export type StorageEngine =
  | 'localStorage'
  | 'sessionStorage'
  | 'cookie'
  | 'indexedDB'
  | 'memory'

/**
 * 数据类型
 */
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'binary'

/**
 * 可序列化的值类型
 */
export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableObject
  | SerializableArray

/**
 * 可序列化的对象类型
 */
export interface SerializableObject {
  [key: string]: SerializableValue
}

/**
 * 可序列化的数组类型
 */
export interface SerializableArray extends Array<SerializableValue> {}

/**
 * 缓存键类型
 */
export type CacheKey = string | number | symbol

/**
 * 缓存项元数据
 */
export interface CacheMetadata {
  /** 创建时间戳 */
  createdAt: number
  /** 最后访问时间戳 */
  lastAccessedAt: number
  /** 过期时间戳 */
  expiresAt?: number
  /** 数据类型 */
  dataType: DataType
  /** 数据大小（字节） */
  size: number
  /** 访问次数 */
  accessCount: number
  /** 存储引擎 */
  engine: StorageEngine
  /** 是否加密 */
  encrypted: boolean
}

/**
 * 缓存项
 */
export interface CacheItem<T = SerializableValue> {
  /** 缓存键 */
  key: string
  /** 缓存值 */
  value: T
  /** 元数据 */
  metadata: CacheMetadata
}

/**
 * 加密配置
 */
export interface EncryptionConfig {
  /** 是否启用加密 */
  enabled: boolean
  /** 加密算法 */
  algorithm?: 'AES' | 'DES' | 'custom'
  /** 加密密钥 */
  secretKey?: string
  /** 自定义加密函数 */
  customEncrypt?: (data: string) => string
  /** 自定义解密函数 */
  customDecrypt?: (data: string) => string
}

/**
 * 键名混淆配置
 */
export interface ObfuscationConfig {
  /** 是否启用键名混淆 */
  enabled: boolean
  /** 混淆前缀 */
  prefix?: string
  /** 混淆算法 */
  algorithm?: 'hash' | 'base64' | 'custom'
  /** 自定义混淆函数 */
  customObfuscate?: (key: string) => string
  /** 自定义反混淆函数 */
  customDeobfuscate?: (key: string) => string
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  /** 加密配置 */
  encryption: EncryptionConfig
  /** 键名混淆配置 */
  obfuscation: ObfuscationConfig
}

/**
 * 基础引擎配置选项
 */
export interface BaseEngineOptions {
  /** 是否启用该引擎 */
  enabled?: boolean
  /** 最大存储大小（字节） */
  maxSize?: number
}

/**
 * localStorage 引擎配置
 */
export interface LocalStorageEngineOptions extends BaseEngineOptions {
  /** 键前缀 */
  keyPrefix?: string
}

/**
 * sessionStorage 引擎配置
 */
export interface SessionStorageEngineOptions extends BaseEngineOptions {
  /** 键前缀 */
  keyPrefix?: string
}

/**
 * Cookie 引擎配置
 */
export interface CookieEngineOptions extends BaseEngineOptions {
  /** 域名 */
  domain?: string
  /** 路径 */
  path?: string
  /** 是否安全传输 */
  secure?: boolean
  /** SameSite 策略 */
  sameSite?: 'strict' | 'lax' | 'none'
  /** HttpOnly */
  httpOnly?: boolean
}

/**
 * IndexedDB 引擎配置
 */
export interface IndexedDBEngineOptions extends BaseEngineOptions {
  /** 数据库名称 */
  dbName?: string
  /** 数据库版本 */
  version?: number
  /** 对象存储名称 */
  storeName?: string
}

/**
 * Memory 引擎配置
 */
export interface MemoryEngineOptions extends BaseEngineOptions {
  /** 最大项数 */
  maxItems?: number
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 淘汰策略：'LRU' | 'LFU' | 'FIFO' | 'MRU' | 'Random' | 'TTL' | 'ARC' */
  evictionStrategy?: string
}

/**
 * 存储引擎配置
 */
export interface StorageEngineConfig {
  /** localStorage 配置 */
  localStorage?: LocalStorageEngineOptions
  /** sessionStorage 配置 */
  sessionStorage?: SessionStorageEngineOptions
  /** Cookie 配置 */
  cookie?: CookieEngineOptions
  /** IndexedDB 配置 */
  indexedDB?: IndexedDBEngineOptions
  /** Memory 配置 */
  memory?: MemoryEngineOptions
}

/**
 * 通用引擎选项类型（用于向后兼容）
 */
export type EngineOptions =
  | LocalStorageEngineOptions
  | SessionStorageEngineOptions
  | CookieEngineOptions
  | IndexedDBEngineOptions
  | MemoryEngineOptions

/**
 * 智能存储策略配置
 */
export interface StorageStrategyConfig {
  /** 是否启用智能策略 */
  enabled: boolean
  /** 数据大小阈值配置 */
  sizeThresholds?: {
    /** 小数据阈值（字节），小于此值优先使用 localStorage */
    small: number
    /** 中等数据阈值（字节），小于此值使用 sessionStorage */
    medium: number
    /** 大数据阈值（字节），大于此值使用 IndexedDB */
    large: number
  }
  /** TTL 阈值配置 */
  ttlThresholds?: {
    /** 短期缓存阈值（毫秒），小于此值使用 sessionStorage */
    short: number
    /** 中期缓存阈值（毫秒），小于此值使用 localStorage */
    medium: number
    /** 长期缓存阈值（毫秒），大于此值使用 IndexedDB */
    long: number
  }
  /** 优先级配置 */
  enginePriority?: StorageEngine[]
}

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 最大内存限制（字节） */
  maxMemory?: number
  /** 启用预取 */
  enablePrefetch?: boolean
  /** 预取配置 */
  prefetch?: {
    /** 预取策略 */
    strategy?: 'markov' | 'lru' | 'association'
    /** 预取数据获取函数 */
    fetcher?: (key: string) => Promise<SerializableValue>
  }
  /** 默认存储引擎 */
  defaultEngine?: StorageEngine
  /** 默认过期时间（毫秒） */
  defaultTTL?: number
  /** 键前缀 */
  keyPrefix?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 安全配置 */
  security?: Partial<SecurityConfig>
  /** 存储引擎配置 */
  engines?: Partial<StorageEngineConfig>
  /** 智能存储策略配置 */
  strategy?: Partial<StorageStrategyConfig>
  /** 最大缓存项数量 */
  maxItems?: number
  /** 自动清理过期项间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 存储引擎接口
 */
export interface IStorageEngine {
  /** 引擎名称 */
  readonly name: StorageEngine
  /** 是否可用 */
  readonly available: boolean
  /** 最大存储容量（字节） */
  readonly maxSize: number
  /** 当前使用容量（字节） */
  readonly usedSize: number

  /**
   * 设置缓存项
   */
  setItem: (key: string, value: string, ttl?: number) => Promise<void>

  /**
   * 获取缓存项
   */
  getItem: (key: string) => Promise<string | null>

  /**
   * 删除缓存项
   */
  removeItem: (key: string) => Promise<void>

  /**
   * 清空所有缓存项
   */
  clear: () => Promise<void>

  /**
   * 获取所有键名
   */
  keys: () => Promise<string[]>

  /**
   * 检查键是否存在
   */
  hasItem: (key: string) => Promise<boolean>

  /**
   * 获取缓存项数量
   */
  length: () => Promise<number>

  /**
   * 清理过期项
   */
  cleanup: () => Promise<void>
}

/**
 * 缓存管理器接口
 */
export interface ICacheManager {
  /**
   * 设置缓存项
   */
  set: <T extends SerializableValue = SerializableValue>(key: string, value: T, options?: SetOptions) => Promise<void>

  /**
   * 获取缓存项
   */
  get: <T extends SerializableValue = SerializableValue>(key: string) => Promise<T | null>

  /**
   * 删除缓存项
   */
  remove: (key: string) => Promise<void>

  /**
   * 清空所有缓存项
   */
  clear: (engine?: StorageEngine) => Promise<void>

  /**
   * 检查键是否存在
   */
  has: (key: string) => Promise<boolean>

  /**
   * 获取所有键名
   */
  keys: (engine?: StorageEngine) => Promise<string[]>

  /**
   * 获取缓存项元数据
   */
  getMetadata: (key: string) => Promise<CacheMetadata | null>

  /**
   * 获取缓存统计信息
   */
  getStats: () => Promise<CacheStats>

  /**
   * 清理过期项
   */
  cleanup: () => Promise<void>

  /**
   * 销毁缓存管理器
   */
  destroy: () => Promise<void>
}

/**
 * 设置选项
 */
export interface SetOptions {
  /** 过期时间（毫秒） */
  ttl?: number
  /** 指定存储引擎 */
  engine?: StorageEngine
  /** 是否加密 */
  encrypt?: boolean
  /** 是否混淆键名 */
  obfuscateKey?: boolean
  /** 数据类型提示 */
  dataType?: DataType
}

/**
 * 获取选项
 */
export interface GetOptions {
  /** 指定存储引擎 */
  engine?: StorageEngine
  /** 是否解密 */
  decrypt?: boolean
  /** 默认值（当缓存不存在时返回） */
  defaultValue?: SerializableValue
}

/**
 * 删除选项
 */
export interface RemoveOptions {
  /** 指定存储引擎 */
  engine?: StorageEngine
}

/**
 * 清空选项
 */
export interface ClearOptions {
  /** 指定存储引擎 */
  engine?: StorageEngine
  /** 是否清空所有引擎 */
  all?: boolean
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总缓存项数量 */
  totalItems: number
  /** 总存储大小（字节） */
  totalSize: number
  /** 各引擎统计 */
  engines: Record<StorageEngine, EngineStats>
  /** 命中率 */
  hitRate: number
  /** 过期项数量 */
  expiredItems: number
}

/**
 * 存储引擎统计信息
 */
export interface EngineStats {
  /** 缓存项数量 */
  itemCount: number
  /** 存储大小（字节） */
  size: number
  /** 是否可用 */
  available: boolean
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
}

/**
 * 存储策略结果
 */
export interface StorageStrategyResult {
  /** 推荐的存储引擎 */
  engine: StorageEngine
  /** 推荐原因 */
  reason: string
  /** 置信度 (0-1) */
  confidence: number
}

/**
 * 事件类型
 */
export type CacheEventType =
  | 'set'
  | 'get'
  | 'remove'
  | 'clear'
  | 'expired'
  | 'error'
  | 'strategy'

/**
 * 缓存事件
 */
export interface CacheEvent<T = any> {
  /** 事件类型 */
  type: CacheEventType
  /** 缓存键 */
  key: string
  /** 缓存值 */
  value?: T
  /** 存储引擎 */
  engine: StorageEngine
  /** 时间戳 */
  timestamp: number
  /** 错误信息（如果有） */
  error?: Error
  /** 策略选择信息（如果有） */
  strategy?: {
    reason: string
    confidence: number
    dataSize: number
    dataType: string
    ttl?: number
  }
}

/**
 * 事件监听器
 */
export type CacheEventListener<T = any> = (event: CacheEvent<T>) => void

/**
 * 事件映射类型
 */
export interface EventMap {
  set: CacheEvent
  get: CacheEvent
  remove: CacheEvent
  clear: CacheEvent
  expired: CacheEvent
  error: CacheEvent
  strategy: CacheEvent
}

/**
 * 事件监听器类型
 */
export type EventListener<K extends keyof EventMap = keyof EventMap> = (event: EventMap[K]) => void

/**
 * 错误类型
 */
export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'SERIALIZATION_ERROR'
  | 'ENCRYPTION_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * 缓存错误接口
 */
export interface CacheError extends Error {
  /** 错误类型 */
  type: ErrorType
  /** 错误代码 */
  code?: string
  /** 原始错误 */
  originalError?: Error
  /** 错误上下文 */
  context?: Record<string, unknown>
}

/**
 * Vue 组合式函数选项
 */
export interface UseCacheOptions extends Omit<CacheOptions, 'keyPrefix'> {
  /** 键前缀 */
  keyPrefix?: string
  /** 是否立即初始化 */
  immediate?: boolean
  /** 是否在组件卸载时清理 */
  cleanupOnUnmount?: boolean
}

// ============================================================================
// 类型守卫函数
// ============================================================================

/**
 * 检查值是否为可序列化的值
 */
export function isSerializableValue(value: unknown): value is SerializableValue {
  if (value === null || value === undefined) {
    return true
  }

  const type = typeof value
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isSerializableValue)
  }

  if (type === 'object' && value.constructor === Object) {
    return Object.values(value as Record<string, unknown>).every(isSerializableValue)
  }

  return false
}

/**
 * 检查是否为有效的存储引擎
 */
export function isValidStorageEngine(engine: string): engine is StorageEngine {
  return ['localStorage', 'sessionStorage', 'cookie', 'indexedDB', 'memory'].includes(engine)
}

/**
 * 检查是否为有效的数据类型
 */
export function isValidDataType(type: string): type is DataType {
  return ['string', 'number', 'boolean', 'object', 'array', 'binary'].includes(type)
}

/**
 * 检查是否为有效的缓存事件类型
 */
export function isValidCacheEventType(type: string): type is CacheEventType {
  return ['set', 'get', 'remove', 'clear', 'expired', 'error', 'strategy'].includes(type)
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 提取对象中指定键的类型
 */
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

/**
 * 排除对象中指定键的类型
 */
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 严格的对象类型（不允许额外属性）
 */
export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never
