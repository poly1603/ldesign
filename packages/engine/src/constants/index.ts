/**
 * 引擎常量定义
 * 包含系统中使用的各种常量值
 */

/**
 * 默认配置常量
 * 🎯 提供引擎的默认配置值
 */
export const DEFAULT_CONFIG = {
  debug: false,
  appName: 'Vue3 Engine App',
  version: '1.0.0',
} as const

/**
 * 性能优化常量
 * 🚀 统一管理性能优化相关的配置值
 */
export const PERFORMANCE_CONSTANTS = {
  // 批处理配置
  BATCH_PROCESSOR: {
    DEFAULT_BATCH_SIZE: 20,
    DEFAULT_INTERVAL: 5000, // 5秒
    MAX_WAIT_TIME: 10000, // 10秒
  },

  // 缓存优化
  CACHE_OPTIMIZATION: {
    CLEANUP_BATCH_SIZE: 20,
    CLEANUP_INTERVAL: 5000, // 5秒
    STATS_CLEANUP_INTERVAL: 300000, // 5分钟
    MAX_SIZE_DEFAULT: 100,
    DEFAULT_TTL: 300000, // 5分钟
  },

  // 事件优化
  EVENT_OPTIMIZATION: {
    STATS_CLEANUP_INTERVAL: 300000, // 5分钟
    BATCH_REMOVE_THRESHOLD: 10,
    MAX_LISTENERS_DEFAULT: 100,
  },

  // 内存管理
  MEMORY_MANAGEMENT: {
    OBJECT_POOL_MAX_SIZE: 100,
    GC_THRESHOLD: 1000, // 触发垃圾回收的阈值
  },

  // 性能阈值
  THRESHOLDS: {
    // 响应时间阈值（毫秒）
    RESPONSE_TIME: {
      EXCELLENT: 50,
      GOOD: 100,
      ACCEPTABLE: 500,
      POOR: 1000,
    },

    // FPS阈值
    FPS: {
      EXCELLENT: 60,
      GOOD: 45,
      ACCEPTABLE: 30,
      POOR: 15,
    },

    // 内存使用阈值（MB）
    MEMORY: {
      LOW: 50,
      WARNING: 100,
      CRITICAL: 200,
      EMERGENCY: 500,
    },

    // 缓存命中率阈值
    CACHE_HIT_RATE: {
      EXCELLENT: 0.9,
      GOOD: 0.8,
      ACCEPTABLE: 0.6,
      POOR: 0.4,
    },
  },
} as const

/**
 * 事件名称常量
 * 📡 定义引擎系统中所有事件的标准名称
 */
export const EVENTS = {
  // 引擎生命周期事件
  ENGINE_MOUNTED: 'engine:mounted',
  ENGINE_UNMOUNTED: 'engine:unmounted',
  ENGINE_ERROR: 'engine:error',
  ENGINE_READY: 'engine:ready',
  ENGINE_DESTROYED: 'engine:destroyed',

  // 插件相关事件
  PLUGIN_REGISTERED: 'plugin:registered',
  PLUGIN_UNREGISTERED: 'plugin:unregistered',
  PLUGIN_INSTALLED: 'plugin:installed',
  PLUGIN_UNINSTALLED: 'plugin:uninstalled',
  PLUGIN_ERROR: 'plugin:error',

  // 中间件相关事件
  MIDDLEWARE_ADDED: 'middleware:added',
  MIDDLEWARE_REMOVED: 'middleware:removed',
  MIDDLEWARE_EXECUTED: 'middleware:executed',

  // 状态管理事件
  STATE_CHANGED: 'state:changed',
  STATE_RESET: 'state:reset',

  // 错误处理事件
  ERROR_CAPTURED: 'error:captured',
  ERROR_HANDLED: 'error:handled',

  // 通知相关事件
  NOTIFICATION_SHOWN: 'notification:shown',
  NOTIFICATION_HIDDEN: 'notification:hidden',
  NOTIFICATION_CLICKED: 'notification:clicked',

  // 性能监控事件
  PERFORMANCE_MARK: 'performance:mark',
  PERFORMANCE_MEASURE: 'performance:measure',
  PERFORMANCE_THRESHOLD_VIOLATION: 'performance:threshold:violation',

  // 缓存相关事件
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  CACHE_EVICTED: 'cache:evicted',

  // 安全相关事件
  SECURITY_VIOLATION: 'security:violation',
  SECURITY_BLOCKED: 'security:blocked',

  // 配置相关事件
  CONFIG_CHANGED: 'config:changed',
  CONFIG_SAVED: 'config:saved',
  CONFIG_LOADED: 'config:loaded',

  // 生命周期事件
  LIFECYCLE_BEFORE_INIT: 'lifecycle:before:init',
  LIFECYCLE_AFTER_INIT: 'lifecycle:after:init',
  LIFECYCLE_BEFORE_START: 'lifecycle:before:start',
  LIFECYCLE_AFTER_START: 'lifecycle:after:start',
  LIFECYCLE_BEFORE_STOP: 'lifecycle:before:stop',
  LIFECYCLE_AFTER_STOP: 'lifecycle:after:stop',
  LIFECYCLE_BEFORE_DESTROY: 'lifecycle:before:destroy',
  LIFECYCLE_AFTER_DESTROY: 'lifecycle:after:destroy',
} as const

/**
 * 日志级别常量
 * 📝 定义日志系统的标准级别
 */
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const

/**
 * 通知类型常量
 * 🔔 定义通知系统的标准类型
 */
export const NOTIFICATION_TYPES = [
  'success',
  'error',
  'warning',
  'info',
] as const

/**
 * 通知位置常量
 * 📍 定义通知显示的标准位置
 */
export const NOTIFICATION_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

/**
 * 通知动画常量
 * ✨ 定义通知显示的标准动画效果
 */
export const NOTIFICATION_ANIMATIONS = [
  'slide',
  'fade',
  'bounce',
  'scale',
  'flip',
] as const

/**
 * 通知主题常量
 * 🎨 定义通知显示的标准主题
 */
export const NOTIFICATION_THEMES = ['light', 'dark', 'auto'] as const

/**
 * 缓存策略常量
 * 💾 定义缓存系统的标准策略
 */
export const CACHE_STRATEGIES = ['lru', 'lfu', 'fifo', 'ttl'] as const

/**
 * 环境类型常量
 * 🌍 定义系统支持的标准环境
 */
export const ENVIRONMENTS = ['development', 'production', 'test'] as const

/**
 * 功能开关常量
 * 🎛️ 定义引擎功能的标准开关名称
 */
export const FEATURE_FLAGS = {
  ENABLE_HOT_RELOAD: 'enableHotReload',
  ENABLE_DEV_TOOLS: 'enableDevTools',
  ENABLE_PERFORMANCE_MONITORING: 'enablePerformanceMonitoring',
  ENABLE_ERROR_REPORTING: 'enableErrorReporting',
  ENABLE_SECURITY_PROTECTION: 'enableSecurityProtection',
  ENABLE_CACHING: 'enableCaching',
  ENABLE_NOTIFICATIONS: 'enableNotifications',
} as const

/**
 * 性能阈值常量
 * ⚡ 定义性能监控的标准阈值
 */
export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME: {
    GOOD: 100, // 100ms
    POOR: 1000, // 1s
  },
  FPS: {
    GOOD: 60, // 60fps
    POOR: 30, // 30fps
  },
  MEMORY: {
    WARNING: 50, // 50MB
    CRITICAL: 100, // 100MB
  },
} as const

/**
 * 安全配置常量
 * 🔒 定义安全系统的标准配置
 */
export const SECURITY_CONFIG = {
  XSS: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'div', 'p'],
    ALLOWED_ATTRIBUTES: {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'title'],
    },
  },
  CSP: {
    DIRECTIVES: {
      'default-src': ['self'],
      'script-src': ['self', 'unsafe-inline'],
      'style-src': ['self', 'unsafe-inline'],
      'img-src': ['self', 'data:', 'https:'],
    },
  },
} as const

/**
 * 存储键常量
 * 🔑 定义本地存储使用的标准键名
 */
export const STORAGE_KEYS = {
  ENGINE_CONFIG: 'engine-config',
  ENGINE_LOGS: 'engine-logs',
  ENGINE_CACHE: 'engine-cache',
  ENGINE_STATE: 'engine-state',
  ENGINE_NOTIFICATIONS: 'engine-notifications',
} as const

/**
 * 错误代码常量
 * 🚨 定义系统错误的标准代码
 */
export const ERROR_CODES = {
  // 配置相关错误
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_MISSING: 'CONFIG_MISSING',
  CONFIG_VALIDATION_FAILED: 'CONFIG_VALIDATION_FAILED',

  // 插件相关错误
  PLUGIN_INSTALL_FAILED: 'PLUGIN_INSTALL_FAILED',
  PLUGIN_DEPENDENCY_MISSING: 'PLUGIN_DEPENDENCY_MISSING',
  PLUGIN_CONFLICT: 'PLUGIN_CONFLICT',

  // 中间件相关错误
  MIDDLEWARE_EXECUTION_FAILED: 'MIDDLEWARE_EXECUTION_FAILED',
  MIDDLEWARE_NOT_FOUND: 'MIDDLEWARE_NOT_FOUND',

  // 状态相关错误
  STATE_INVALID: 'STATE_INVALID',
  STATE_ACCESS_DENIED: 'STATE_ACCESS_DENIED',

  // 缓存相关错误
  CACHE_FULL: 'CACHE_FULL',
  CACHE_INVALID_KEY: 'CACHE_INVALID_KEY',

  // 安全相关错误
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  SECURITY_BLOCKED: 'SECURITY_BLOCKED',

  // 性能相关错误
  PERFORMANCE_THRESHOLD_EXCEEDED: 'PERFORMANCE_THRESHOLD_EXCEEDED',
  PERFORMANCE_MONITORING_FAILED: 'PERFORMANCE_MONITORING_FAILED',
} as const

/**
 * 版本常量
 * 📦 定义引擎版本相关信息
 */
export const VERSION = {
  CURRENT: '0.1.0',
  MIN_SUPPORTED: '0.1.0',
  API_VERSION: '1.0.0',
} as const

/**
 * 时间常量
 * ⏰ 定义系统中使用的标准时间值
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,

  // 默认间隔
  DEFAULT_AUTO_SAVE_INTERVAL: 30000, // 30秒
  DEFAULT_CACHE_CLEANUP_INTERVAL: 60000, // 1分钟
  DEFAULT_PERFORMANCE_CHECK_INTERVAL: 5000, // 5秒
  DEFAULT_HEALTH_CHECK_INTERVAL: 30000, // 30秒
} as const

/**
 * 大小限制常量
 * 📏 定义系统中各种大小限制
 */
export const LIMITS = {
  // 缓存限制
  MAX_CACHE_SIZE: 1000,
  MAX_CACHE_ENTRY_SIZE: 1024 * 1024, // 1MB

  // 日志限制
  MAX_LOG_ENTRIES: 10000,
  MAX_LOG_ENTRY_SIZE: 1024, // 1KB

  // 通知限制
  MAX_NOTIFICATIONS: 100,
  MAX_NOTIFICATION_DURATION: 10000, // 10秒

  // 插件限制
  MAX_PLUGINS: 100,
  MAX_PLUGIN_DEPENDENCIES: 50,

  // 中间件限制
  MAX_MIDDLEWARE: 100,
  MAX_MIDDLEWARE_PRIORITY: 1000,

  // 状态限制
  MAX_STATE_KEYS: 10000,
  MAX_STATE_VALUE_SIZE: 1024 * 1024, // 1MB
} as const
