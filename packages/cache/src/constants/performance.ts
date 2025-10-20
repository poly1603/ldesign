/**
 * 性能相关常量配置
 * 
 * 将所有魔法数字集中管理，便于维护和调优
 */

/**
 * 缓存大小限制常量
 */
export const CACHE_SIZE = {
  /** 序列化缓存最大条目数（默认） */
  SERIALIZATION_DEFAULT: 500,
  /** 序列化缓存最小条目数 */
  SERIALIZATION_MIN: 100,
  /** 序列化缓存最大条目数 */
  SERIALIZATION_MAX: 5000,
  
  /** 字符串缓存最大条目数 */
  STRING_CACHE_MAX: 500,
  
  /** 大小计算缓存最大条目数 */
  SIZE_CACHE_LIMIT: 1000,
  
  /** 对象池默认最大大小 */
  OBJECT_POOL_DEFAULT: 100,
  /** 对象池最大大小（元数据） */
  OBJECT_POOL_METADATA: 500,
  /** 对象池最大大小（缓存项） */
  OBJECT_POOL_CACHE_ITEM: 500,
  
  /** 事件节流队列最大大小 */
  EVENT_THROTTLE_MAX: 200,
} as const

/**
 * 时间间隔常量（毫秒）
 */
export const TIME_INTERVALS = {
  /** 序列化缓存默认TTL */
  SERIALIZATION_TTL_DEFAULT: 5000,
  /** 序列化缓存最小TTL */
  SERIALIZATION_TTL_MIN: 3000,
  /** 序列化缓存最大TTL */
  SERIALIZATION_TTL_MAX: 30000,
  
  /** 默认清理间隔 */
  CLEANUP_INTERVAL_DEFAULT: 60000,
  /** 最小清理间隔 */
  CLEANUP_INTERVAL_MIN: 10000,
  
  /** 事件节流默认刷新间隔 */
  EVENT_FLUSH_DEFAULT: 100,
  /** 事件节流最小刷新间隔 */
  EVENT_FLUSH_MIN: 10,
  /** 事件节流最大刷新间隔 */
  EVENT_FLUSH_MAX: 200,
  
  /** Vue自动保存默认节流时间 */
  AUTO_SAVE_THROTTLE_DEFAULT: 500,
  /** Vue自动保存默认防抖时间 */
  AUTO_SAVE_DEBOUNCE_DEFAULT: 100,
  
  /** 高压力清理间隔 */
  HIGH_PRESSURE_CLEANUP_INTERVAL: 10000,
} as const

/**
 * 批量操作常量
 */
export const BATCH_CONFIG = {
  /** 默认批量大小 */
  DEFAULT_SIZE: 10,
  /** 最小批量大小 */
  MIN_SIZE: 1,
  /** 最大批量大小 */
  MAX_SIZE: 100,
  
  /** 低性能模式批量大小 */
  LOW_PERFORMANCE: 20,
  /** 高性能模式批量大小 */
  HIGH_PERFORMANCE: 5,
  /** 极致性能模式批量大小 */
  EXTREME_PERFORMANCE: 1,
} as const

/**
 * 内存管理常量
 */
export const MEMORY_CONFIG = {
  /** 默认最大内存（100MB） */
  MAX_DEFAULT: 100 * 1024 * 1024,
  /** 最小内存限制（10MB） */
  MIN_LIMIT: 10 * 1024 * 1024,
  
  /** 高压力阈值（百分比） */
  HIGH_PRESSURE_THRESHOLD: 0.8,
  /** 危急压力阈值（百分比） */
  CRITICAL_PRESSURE_THRESHOLD: 0.95,
  /** 中等压力阈值（百分比） */
  MEDIUM_PRESSURE_THRESHOLD: 0.6,
  
  /** 最大淘汰比例 */
  MAX_EVICTION_RATIO: 0.3,
  /** 最大淘汰比例（一半） */
  HALF_EVICTION_RATIO: 0.5,
  
  /** 对象池清理阈值 */
  POOL_CLEANUP_THRESHOLD: 50,
} as const

/**
 * 字符串和数据大小常量
 */
export const DATA_SIZE = {
  /** 字符串对象基础开销（字节） */
  STRING_OVERHEAD: 24,
  /** 数组基础开销（字节） */
  ARRAY_OVERHEAD: 24,
  /** 对象基础开销（字节） */
  OBJECT_OVERHEAD: 32,
  
  /** 基本类型大小 */
  BOOLEAN_SIZE: 4,
  NUMBER_SIZE: 8,
  NULL_SIZE: 8,
  
  /** 压缩最小大小（1KB） */
  COMPRESSION_MIN_SIZE: 1024,
  /** 压缩块大小（32KB） */
  COMPRESSION_CHUNK_SIZE: 0x8000,
  
  /** 压缩熵值阈值 */
  COMPRESSION_ENTROPY_THRESHOLD: 7.5,
} as const

/**
 * UTF-8字符编码大小常量
 */
export const UTF8_SIZE = {
  /** ASCII字符上限 */
  ASCII_MAX: 128,
  /** 2字节UTF-8字符上限 */
  TWO_BYTE_MAX: 2048,
  /** 3字节UTF-8字符上限 */
  THREE_BYTE_MAX: 65536,
  
  /** 对应的字节大小 */
  ONE_BYTE: 1,
  TWO_BYTES: 2,
  THREE_BYTES: 3,
  FOUR_BYTES: 4,
} as const

/**
 * 引擎配置常量
 */
export const ENGINE_CONFIG = {
  /** 内存引擎默认最大大小（10MB） */
  MEMORY_MAX_SIZE_DEFAULT: 10 * 1024 * 1024,
  /** 内存引擎默认最大项数 */
  MEMORY_MAX_ITEMS_DEFAULT: 1000,
  
  /** Cookie最大大小（4KB） */
  COOKIE_MAX_SIZE: 4 * 1024,
  /** LocalStorage推荐大小限制（5MB） */
  LOCAL_STORAGE_LIMIT: 5 * 1024 * 1024,
  /** SessionStorage推荐大小限制（5MB） */
  SESSION_STORAGE_LIMIT: 5 * 1024 * 1024,
} as const

/**
 * 性能优化阈值常量
 */
export const PERFORMANCE_THRESHOLDS = {
  /** 小文件大小阈值（10KB） */
  SMALL_FILE_SIZE: 10 * 1024,
  /** 大文件大小阈值（1MB） */
  LARGE_FILE_SIZE: 1024 * 1024,
  
  /** 浏览器内存使用率高阈值 */
  BROWSER_MEMORY_HIGH: 0.8,
  /** 浏览器内存使用率中等阈值 */
  BROWSER_MEMORY_MEDIUM: 0.5,
  
  /** 服务器内存使用率高阈值 */
  SERVER_MEMORY_HIGH: 0.7,
  /** 服务器内存使用率中等阈值 */
  SERVER_MEMORY_MEDIUM: 0.8,
  
  /** 高性能CPU核心数阈值 */
  HIGH_PERFORMANCE_CORES: 8,
  /** 中性能CPU核心数阈值 */
  MEDIUM_PERFORMANCE_CORES: 4,
  /** 低性能CPU核心数阈值 */
  LOW_PERFORMANCE_CORES: 2,
} as const

/**
 * 压缩算法相关常量
 */
export const COMPRESSION = {
  /** 默认压缩级别 */
  DEFAULT_LEVEL: 6,
  /** 最小压缩级别 */
  MIN_LEVEL: 1,
  /** 最大压缩级别 */
  MAX_LEVEL: 9,
  
  /** 典型压缩率（用于估算） */
  TYPICAL_RATIO: 0.3,
  /** 无压缩率 */
  NO_COMPRESSION_RATIO: 1,
} as const

/**
 * 哈希和字符串处理常量
 */
export const HASH_CONFIG = {
  /** 哈希位移量 */
  HASH_SHIFT: 5,
  /** 哈希初始值 */
  HASH_INIT: 0,
} as const

/**
 * 调试和日志常量
 * 
 * 注意：在生产环境中应设置为false以获得最佳性能
 */
export const DEBUG_CONFIG = {
  /** 是否启用调试日志（开发环境） */
  ENABLE_DEBUG: false,
  /** 是否启用性能分析 */
  ENABLE_PROFILING: false,
} as const

/**
 * 导出所有常量的类型
 */
export type CacheSizeConstants = typeof CACHE_SIZE
export type TimeIntervalsConstants = typeof TIME_INTERVALS
export type BatchConfigConstants = typeof BATCH_CONFIG
export type MemoryConfigConstants = typeof MEMORY_CONFIG
export type DataSizeConstants = typeof DATA_SIZE
export type UTF8SizeConstants = typeof UTF8_SIZE
export type EngineConfigConstants = typeof ENGINE_CONFIG
export type PerformanceThresholdsConstants = typeof PERFORMANCE_THRESHOLDS
export type CompressionConstants = typeof COMPRESSION
export type HashConfigConstants = typeof HASH_CONFIG
export type DebugConfigConstants = typeof DEBUG_CONFIG

