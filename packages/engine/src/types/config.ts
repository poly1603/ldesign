/**
 * 配置管理类型定义
 * 包含配置管理器、配置Schema等相关类型
 */

import type {
  ConfigPath,
  ConfigSchema,
  ConfigValue,
  UnwatchFunction,
  ValidationResult,
} from './base'

// 重新导出基础配置类型
export type { EngineConfig } from './base'

// 严格类型的配置接口
export interface StrictEngineConfig {
  readonly app: {
    readonly name: string
    readonly version: string
    readonly description?: string
    readonly author?: string
    readonly homepage?: string
  }
  readonly environment: 'development' | 'production' | 'test'
  readonly debug: boolean
  readonly features: Readonly<{
    enableHotReload: boolean
    enableDevTools: boolean
    enablePerformanceMonitoring: boolean
    enableErrorReporting: boolean
    enableSecurityProtection: boolean
    enableCaching: boolean
    enableNotifications: boolean
  }>
  readonly logger: Readonly<LoggerConfig>
  readonly cache: Readonly<CacheConfig>
  readonly security: Readonly<SecurityConfig>
  readonly performance: Readonly<PerformanceConfig>
  readonly notifications: Readonly<NotificationConfig>
  readonly env: Readonly<Record<string, string | undefined>>
  readonly custom: Readonly<Record<string, unknown>>
}

// 增强的配置接口
export interface EnhancedEngineConfig {
  // 应用信息
  app: {
    name: string
    version: string
    description?: string
    author?: string
    homepage?: string
  }

  // 环境配置
  environment: 'development' | 'production' | 'test'
  debug: boolean

  // 功能开关
  features: {
    enableHotReload: boolean
    enableDevTools: boolean
    enablePerformanceMonitoring: boolean
    enableErrorReporting: boolean
    enableSecurityProtection: boolean
    enableCaching: boolean
    enableNotifications: boolean
  }

  // 各模块配置
  logger: LoggerConfig
  cache: CacheConfig
  security: SecurityConfig
  performance: PerformanceConfig
  notifications: NotificationConfig

  // 环境变量映射
  env: {
    [key: string]: string | undefined
  }

  // 自定义配置
  custom: Record<string, unknown>
}

// 配置快照
export interface ConfigSnapshot {
  timestamp: number
  config: Record<string, unknown>
  environment: 'development' | 'production' | 'test'
  version: string
}

// 配置监听器类型
export type ConfigWatcher = (
  newValue: unknown,
  oldValue: unknown,
  path: string
) => void

// 类型安全的配置管理器接口
export interface ConfigManager<TConfig = Record<string, unknown>> {
  // 基础操作（类型安全）
  get: (<P extends ConfigPath<TConfig>>(
    path: P,
    defaultValue?: ConfigValue<TConfig, P>
  ) => ConfigValue<TConfig, P>) &
  (<T = unknown>(path: string, defaultValue?: T) => T)

  set: (<P extends ConfigPath<TConfig>>(
    path: P,
    value: ConfigValue<TConfig, P>
  ) => void) &
  ((path: string, value: unknown) => void)

  has: (path: string) => boolean
  remove: (path: string) => void
  clear: () => void

  // 配置合并
  merge: (config: Partial<Record<string, unknown>>) => void
  reset: (path?: string) => void

  // 环境管理
  setEnvironment: (env: 'development' | 'production' | 'test') => void
  getEnvironment: () => string

  // 配置验证
  validate: (schema?: ConfigSchema) => ValidationResult
  setSchema: (schema: ConfigSchema) => void
  getSchema: () => ConfigSchema | undefined

  // 配置监听
  watch: (path: string, callback: ConfigWatcher) => UnwatchFunction
  unwatch: (path: string, callback?: ConfigWatcher) => void
  on: (event: string, callback: (...args: unknown[]) => void) => () => void

  // 持久化
  save: () => Promise<void>
  load: () => Promise<void>
  enableAutoSave: (interval?: number) => void
  disableAutoSave: () => void

  // 配置快照
  createSnapshot: () => ConfigSnapshot
  restoreSnapshot: (snapshot: ConfigSnapshot) => void
  getSnapshots: () => ConfigSnapshot[]

  // 配置统计
  getStats: () => {
    totalKeys: number
    watchers: number
    snapshots: number
    lastModified: number
    memoryUsage: string
  }

  // 配置导入导出
  export: (format?: 'json' | 'yaml') => string
  import: (data: string, format?: 'json' | 'yaml') => void

  // 命名空间
  namespace: (name: string) => ConfigManager
}

// 各模块配置接口
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  maxLogs: number
  enableConsole: boolean
  enableStorage: boolean
  storageKey: string
  transports: string[]
}

export interface CacheConfig {
  enabled: boolean
  maxSize: number
  defaultTTL: number
  strategy: 'lru' | 'lfu' | 'fifo' | 'ttl'
  enableStats: boolean
  cleanupInterval: number
}

export interface SecurityConfig {
  xss: {
    enabled: boolean
    allowedTags: string[]
    allowedAttributes: Record<string, string[]>
  }
  csrf: {
    enabled: boolean
    tokenName: string
    headerName: string
  }
  csp: {
    enabled: boolean
    directives: Record<string, string[]>
    reportOnly: boolean
  }
}

export interface PerformanceConfig {
  enabled: boolean
  sampleRate: number
  maxEntries: number
  thresholds: {
    responseTime: { good: number; poor: number }
    fps: { good: number; poor: number }
    memory: { warning: number; critical: number }
  }
}

export interface NotificationConfig {
  enabled: boolean
  maxNotifications: number
  defaultDuration: number
  defaultPosition:
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  defaultTheme: 'light' | 'dark' | 'auto'
}

// 配置验证器接口
export interface ConfigValidator {
  validate: (
    config: Record<string, unknown>,
    schema: ConfigSchema
  ) => ValidationResult
  sanitize: (
    config: Record<string, unknown>,
    schema: ConfigSchema
  ) => Record<string, unknown>
  merge: (
    base: Record<string, unknown>,
    override: Record<string, unknown>
  ) => Record<string, unknown>
}

// 配置持久化接口
export interface ConfigPersistence {
  save: (config: Record<string, unknown>, key: string) => Promise<void>
  load: (key: string) => Promise<Record<string, unknown> | null>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

// 配置加密接口
export interface ConfigEncryption {
  encrypt: (data: string, key: string) => string
  decrypt: (data: string, key: string) => string
  generateKey: () => string
  validateKey: (key: string) => boolean
}

// 配置同步接口
export interface ConfigSync {
  sync: (config: Record<string, unknown>) => Promise<void>
  getLastSync: () => Date | null
  isSyncing: () => boolean
  onSync: (callback: (config: Record<string, unknown>) => void) => () => void
  onSyncError: (callback: (error: Error) => void) => void
}

// 配置迁移接口
export interface ConfigMigration {
  migrate: (
    fromVersion: string,
    toVersion: string,
    config: Record<string, unknown>
  ) => Promise<Record<string, unknown>>
  getMigrationPath: (fromVersion: string, toVersion: string) => string[]
  validateMigration: (migration: Record<string, unknown>) => boolean
  rollback: (
    config: Record<string, unknown>,
    targetVersion: string
  ) => Promise<Record<string, unknown>>
}
