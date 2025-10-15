/**
 * 常量定义
 */

/**
 * 默认设备断点
 */
export const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1920,
} as const

/**
 * 默认缓存配置
 */
export const DEFAULT_CACHE_CONFIG = {
  enabled: true,
  strategy: 'lru',
  maxSize: 50,
  ttl: 0,
} as const

/**
 * 默认日志配置
 */
export const DEFAULT_LOGGER_CONFIG = {
  level: 'info',
  prefix: '[Template]',
  enabled: true,
} as const

/**
 * 默认动画持续时间(ms)
 */
export const DEFAULT_ANIMATION_DURATION = 300

/**
 * 默认预加载配置
 */
export const DEFAULT_PRELOAD_CONFIG = {
  maxConcurrent: 3,
  delay: 100,
  maxRetries: 2,
  enableIntersectionObserver: true,
} as const

/**
 * 模板ID分隔符
 */
export const TEMPLATE_ID_SEPARATOR = ':'

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  TEMPLATE_NOT_FOUND: 'Template not found',
  TEMPLATE_LOAD_FAILED: 'Failed to load template',
  TEMPLATE_ALREADY_REGISTERED: 'Template already registered',
  INVALID_TEMPLATE_ID: 'Invalid template ID',
  INVALID_DEVICE_TYPE: 'Invalid device type',
  CACHE_FULL: 'Cache is full',
} as const

/**
 * 性能监控阈值
 */
export const PERFORMANCE_THRESHOLDS = {
  SLOW_LOAD: 1000, // 1秒
  VERY_SLOW_LOAD: 3000, // 3秒
} as const

/**
 * 插件版本
 */
export const PLUGIN_VERSION = '1.0.0'

/**
 * 包版本
 */
export const VERSION = '1.0.0'
