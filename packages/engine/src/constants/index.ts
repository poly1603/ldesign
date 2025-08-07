/**
 * 全局常量定义
 */

/**
 * 引擎版本信息
 */
export const ENGINE_VERSION = '0.1.0'

/**
 * 引擎名称
 */
export const ENGINE_NAME = '@ldesign/engine'

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG = {
  // 日志配置
  LOG_LEVEL: 'info' as const,
  LOG_MAX_SIZE: 1000,

  // 缓存配置
  CACHE_MAX_SIZE: 1000,
  CACHE_DEFAULT_TTL: 5 * 60 * 1000, // 5分钟

  // 性能监控配置
  PERFORMANCE_SAMPLE_RATE: 0.1,
  PERFORMANCE_MAX_ENTRIES: 1000,

  // 通知配置
  NOTIFICATION_DEFAULT_DURATION: 3000,
  NOTIFICATION_MAX_COUNT: 5,

  // 插件配置
  PLUGIN_LOAD_TIMEOUT: 10000,

  // 中间件配置
  MIDDLEWARE_TIMEOUT: 5000,
} as const

/**
 * 事件名称常量
 */
export const EVENTS = {
  // 引擎生命周期事件
  ENGINE_INIT: 'engine:init',
  ENGINE_MOUNT: 'engine:mount',
  ENGINE_UNMOUNT: 'engine:unmount',
  ENGINE_DESTROY: 'engine:destroy',
  ENGINE_ERROR: 'engine:error',

  // 插件事件
  PLUGIN_REGISTER: 'plugin:register',
  PLUGIN_UNREGISTER: 'plugin:unregister',
  PLUGIN_ENABLE: 'plugin:enable',
  PLUGIN_DISABLE: 'plugin:disable',
  PLUGIN_ERROR: 'plugin:error',

  // 中间件事件
  MIDDLEWARE_ADD: 'middleware:add',
  MIDDLEWARE_REMOVE: 'middleware:remove',
  MIDDLEWARE_EXECUTE: 'middleware:execute',
  MIDDLEWARE_ERROR: 'middleware:error',

  // 状态管理事件
  STATE_CHANGE: 'state:change',
  STATE_RESET: 'state:reset',
  STATE_ERROR: 'state:error',

  // 缓存事件
  CACHE_SET: 'cache:set',
  CACHE_GET: 'cache:get',
  CACHE_DELETE: 'cache:delete',
  CACHE_CLEAR: 'cache:clear',
  CACHE_EVICT: 'cache:evict',

  // 通知事件
  NOTIFICATION_SHOW: 'notification:show',
  NOTIFICATION_HIDE: 'notification:hide',
  NOTIFICATION_CLEAR: 'notification:clear',

  // 性能事件
  PERFORMANCE_MARK: 'performance:mark',
  PERFORMANCE_MEASURE: 'performance:measure',
  PERFORMANCE_REPORT: 'performance:report',

  // 安全事件
  SECURITY_VIOLATION: 'security:violation',
  SECURITY_SANITIZE: 'security:sanitize',

  // 错误事件
  ERROR_CAPTURE: 'error:capture',
  ERROR_HANDLE: 'error:handle',
  ERROR_REPORT: 'error:report',
} as const

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  // 通用错误
  UNKNOWN_ERROR: 'E_UNKNOWN',
  INVALID_ARGUMENT: 'E_INVALID_ARGUMENT',
  NOT_FOUND: 'E_NOT_FOUND',
  PERMISSION_DENIED: 'E_PERMISSION_DENIED',
  TIMEOUT: 'E_TIMEOUT',

  // 引擎错误
  ENGINE_NOT_INITIALIZED: 'E_ENGINE_NOT_INITIALIZED',
  ENGINE_ALREADY_MOUNTED: 'E_ENGINE_ALREADY_MOUNTED',
  ENGINE_NOT_MOUNTED: 'E_ENGINE_NOT_MOUNTED',

  // 插件错误
  PLUGIN_NOT_FOUND: 'E_PLUGIN_NOT_FOUND',
  PLUGIN_ALREADY_REGISTERED: 'E_PLUGIN_ALREADY_REGISTERED',
  PLUGIN_DEPENDENCY_MISSING: 'E_PLUGIN_DEPENDENCY_MISSING',
  PLUGIN_CIRCULAR_DEPENDENCY: 'E_PLUGIN_CIRCULAR_DEPENDENCY',
  PLUGIN_LOAD_FAILED: 'E_PLUGIN_LOAD_FAILED',
  PLUGIN_INVALID_FORMAT: 'E_PLUGIN_INVALID_FORMAT',

  // 中间件错误
  MIDDLEWARE_NOT_FOUND: 'E_MIDDLEWARE_NOT_FOUND',
  MIDDLEWARE_EXECUTION_FAILED: 'E_MIDDLEWARE_EXECUTION_FAILED',

  // 状态管理错误
  STATE_INVALID_PATH: 'E_STATE_INVALID_PATH',
  STATE_READONLY: 'E_STATE_READONLY',
  STATE_TYPE_MISMATCH: 'E_STATE_TYPE_MISMATCH',

  // 缓存错误
  CACHE_FULL: 'E_CACHE_FULL',
  CACHE_EXPIRED: 'E_CACHE_EXPIRED',
  CACHE_INVALID_KEY: 'E_CACHE_INVALID_KEY',

  // 安全错误
  SECURITY_XSS_DETECTED: 'E_SECURITY_XSS',
  SECURITY_INJECTION_DETECTED: 'E_SECURITY_INJECTION',
  SECURITY_INVALID_INPUT: 'E_SECURITY_INVALID_INPUT',

  // 网络错误
  NETWORK_ERROR: 'E_NETWORK',
  NETWORK_TIMEOUT: 'E_NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'E_NETWORK_OFFLINE',
} as const

/**
 * 日志级别常量
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const

/**
 * 缓存策略常量
 */
export const CACHE_STRATEGIES = {
  LRU: 'lru',
  FIFO: 'fifo',
  TTL: 'ttl',
} as const

/**
 * 通知类型常量
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
} as const

/**
 * 中间件优先级常量
 */
export const MIDDLEWARE_PRIORITIES = {
  HIGHEST: 1000,
  HIGH: 750,
  NORMAL: 500,
  LOW: 250,
  LOWEST: 0,
} as const

/**
 * 性能指标常量
 */
export const PERFORMANCE_METRICS = {
  // 时间指标
  FIRST_PAINT: 'first-paint',
  FIRST_CONTENTFUL_PAINT: 'first-contentful-paint',
  LARGEST_CONTENTFUL_PAINT: 'largest-contentful-paint',
  FIRST_INPUT_DELAY: 'first-input-delay',
  CUMULATIVE_LAYOUT_SHIFT: 'cumulative-layout-shift',

  // 自定义指标
  ENGINE_INIT_TIME: 'engine-init-time',
  PLUGIN_LOAD_TIME: 'plugin-load-time',
  COMPONENT_RENDER_TIME: 'component-render-time',
  API_RESPONSE_TIME: 'api-response-time',
} as const

/**
 * 环境常量
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const

/**
 * 浏览器特性检测常量
 */
export const BROWSER_FEATURES = {
  SUPPORTS_MODULES: 'supportsModules',
  SUPPORTS_DYNAMIC_IMPORT: 'supportsDynamicImport',
  SUPPORTS_WEB_WORKERS: 'supportsWebWorkers',
  SUPPORTS_SERVICE_WORKER: 'supportsServiceWorker',
  SUPPORTS_INTERSECTION_OBSERVER: 'supportsIntersectionObserver',
  SUPPORTS_RESIZE_OBSERVER: 'supportsResizeObserver',
  SUPPORTS_MUTATION_OBSERVER: 'supportsMutationObserver',
} as const

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  ENGINE_CONFIG: 'ldesign_engine_config',
  USER_PREFERENCES: 'ldesign_user_preferences',
  CACHE_DATA: 'ldesign_cache_data',
  PERFORMANCE_DATA: 'ldesign_performance_data',
  ERROR_LOGS: 'ldesign_error_logs',
} as const

/**
 * 正则表达式常量
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^[\d\s\-+()]+$/,
  ALPHANUMERIC: /^[a-z0-9]+$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  VERSION: /^\d+\.\d+\.\d+(?:-[a-z0-9]+)?$/i,
  HEX_COLOR: /^#([A-F0-9]{6}|[A-F0-9]{3})$/i,
  IPV4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/,
} as const

/**
 * HTTP 状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * 键盘按键常量
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const
