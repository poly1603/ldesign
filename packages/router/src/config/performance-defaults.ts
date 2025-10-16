/**
 * @ldesign/router 性能优化默认配置
 *
 * 提供优化后的默认配置值，以获得更好的性能和内存使用
 */

import { AnimationType, CacheStrategy, PreloadStrategy } from '../core/constants'

// Define MemoryThresholds type locally
interface MemoryThresholds {
  warning: number
  critical: number
  maxCache: number
  maxListeners: number
}

// ==================== 缓存配置 ====================

/**
 * 优化后的缓存配置
 * - 减少默认缓存大小以降低内存占用
 * - 使用 LRU 策略自动淘汰最少使用的项
 */
export const OPTIMIZED_CACHE_CONFIG = {
  /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
  maxSize: 3,
  /** 缓存策略 - 使用 LRU（最近最少使用）策略 */
  strategy: CacheStrategy.MEMORY,
  /** 最大缓存项数量 */
  maxItems: 50,
  /** 缓存过期时间（毫秒） */
  ttl: 5 * 60 * 1000, // 5分钟
  /** 是否自动清理过期项 */
  autoCleanup: true,
  /** 清理间隔（毫秒） */
  cleanupInterval: 60000, // 1分钟
}

// ==================== 内存管理配置 ====================

/**
 * 优化后的内存阈值配置
 * - 更早触发警告和清理
 * - 减少监控开销
 */
export const OPTIMIZED_MEMORY_THRESHOLDS: MemoryThresholds = {
  /** 警告阈值（MB） - 从 30MB 降低到 15MB */
  warning: 15,
  /** 严重阈值（MB） - 从 60MB 降低到 30MB */
  critical: 30,
  /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
  maxCache: 3,
  /** 最大监听器数量 - 从 500 降低到 200 */
  maxListeners: 200,
}

/**
 * 内存监控配置
 */
export const MEMORY_MONITOR_CONFIG = {
  /** 监控间隔（毫秒） - 从 30秒 增加到 2分钟，减少CPU占用 */
  monitorInterval: 120000,
  /** 是否启用自动GC */
  enableAutoGC: false, // 默认关闭，避免性能影响
  /** GC触发阈值（MB） */
  gcThreshold: 25,
  /** 清理策略 */
  cleanupStrategy: 'moderate' as const,
}

// ==================== 预加载配置 ====================

/**
 * 优化后的预加载配置
 * - 限制并发预加载数量
 * - 增加空闲超时时间
 */
export const OPTIMIZED_PRELOAD_CONFIG = {
  /** 是否启用预加载 */
  enabled: true,
  /** 预加载策略 */
  strategy: PreloadStrategy.IDLE,
  /** 最大并发预加载数 - 从 5 降低到 2 */
  maxConcurrent: 2,
  /** 空闲超时时间（毫秒） - 从 1秒 增加到 2秒 */
  idleTimeout: 2000,
  /** 预加载优先级队列大小 */
  queueSize: 10,
  /** 是否自动预加载相关路由 */
  autoPreloadRelated: false, // 默认关闭以节省资源
  /** 网络状态检查 */
  checkNetworkStatus: true,
  /** 只在 WiFi 下预加载 */
  wifiOnly: false,
}

// ==================== 动画配置 ====================

/**
 * 优化后的动画配置
 * - 使用性能更好的默认动画
 * - 减少动画时长
 */
export const OPTIMIZED_ANIMATION_CONFIG = {
  /** 是否启用动画 */
  enabled: true,
  /** 默认动画类型 */
  defaultAnimation: AnimationType.FADE,
  /** 动画时长（毫秒） - 从 300ms 降低到 200ms */
  duration: 200,
  /** 是否使用 CSS 动画（性能更好） */
  useCSS: true,
  /** 是否启用硬件加速 */
  hardwareAcceleration: true,
  /** 是否在低端设备禁用动画 */
  disableOnLowEnd: true,
}

// ==================== 性能监控配置 ====================

/**
 * 优化后的性能监控配置
 */
export const OPTIMIZED_PERFORMANCE_CONFIG = {
  /** 是否启用性能监控 */
  enabled: true,
  /** 警告阈值（毫秒） */
  warningThreshold: 500, // 从 1000ms 降低到 500ms
  /** 错误阈值（毫秒） */
  errorThreshold: 2000, // 从 3000ms 降低到 2000ms
  /** 采样率（0-1） */
  sampleRate: 0.1, // 只采样 10% 的导航以减少开销
  /** 是否记录详细信息 */
  detailed: false, // 默认关闭详细记录
  /** 最大记录数量 */
  maxRecords: 100,
  /** 是否发送到服务器 */
  sendToServer: false,
}

// ==================== 路由器优化配置 ====================

/**
 * 优化后的路由器配置
 */
export const OPTIMIZED_ROUTER_CONFIG = {
  /** 是否启用严格模式 */
  strict: false, // 关闭严格模式以提高性能
  /** 是否启用路径大小写敏感 */
  sensitive: false,
  /** 最大路由深度 */
  maxDepth: 5,
  /** 最大动态段数量 */
  maxDynamicSegments: 3,
  /** 是否启用路由缓存 */
  enableCache: true,
  /** 路由缓存大小 */
  routeCacheSize: 100,
  /** 是否启用智能匹配 */
  smartMatching: true,
  /** 是否启用路由压缩 */
  compress: true,
}

// ==================== 开发环境配置 ====================

/**
 * 开发环境特定配置
 */
export const DEV_CONFIG = {
  /** 是否启用调试模式 */
  debug: (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) || false,
  /** 是否启用性能分析 */
  profiling: false,
  /** 是否启用详细日志 */
  verboseLogging: false,
  /** 是否启用热重载 */
  hotReload: true,
  /** 是否显示性能指标 */
  showMetrics: false,
}

// ==================== 生产环境配置 ====================

/**
 * 生产环境优化配置
 */
export const PROD_CONFIG = {
  /** 是否压缩资源 */
  compress: true,
  /** 是否启用 CDN */
  useCDN: false,
  /** 是否启用服务工作器 */
  serviceWorker: false,
  /** 是否启用预渲染 */
  prerender: false,
  /** 是否启用代码分割 */
  codeSplitting: true,
  /** 是否内联关键 CSS */
  inlineCSS: false,
}

// ==================== 导出统一配置 ====================

/**
 * 获取优化后的完整配置
 * @param env - 环境：'development' | 'production'
 */
export function getOptimizedConfig(env: 'development' | 'production' = 'production') {
  const isDev = env === 'development'

  return {
    cache: OPTIMIZED_CACHE_CONFIG,
    memory: {
      thresholds: OPTIMIZED_MEMORY_THRESHOLDS,
      monitor: MEMORY_MONITOR_CONFIG,
    },
    preload: OPTIMIZED_PRELOAD_CONFIG,
    animation: OPTIMIZED_ANIMATION_CONFIG,
    performance: {
      ...OPTIMIZED_PERFORMANCE_CONFIG,
      enabled: !isDev || DEV_CONFIG.showMetrics,
    },
    router: OPTIMIZED_ROUTER_CONFIG,
    env: isDev ? DEV_CONFIG : PROD_CONFIG,
  }
}

/**
 * 性能优化建议
 */
export const PERFORMANCE_TIPS = {
  cache: '使用 LRU 缓存策略，限制缓存大小在 3MB 以内',
  memory: '监控内存使用，超过 15MB 时触发警告',
  preload: '限制并发预加载数为 2，只在空闲时预加载',
  animation: '使用 CSS 动画，启用硬件加速',
  monitoring: '生产环境只采样 10% 的导航数据',
  general: [
    '使用代码分割减少初始包大小',
    '启用路由级别的懒加载',
    '避免深层嵌套路由（超过5层）',
    '定期清理未使用的路由和缓存',
    '在低端设备上禁用动画和预加载',
  ],
}

export default getOptimizedConfig()
