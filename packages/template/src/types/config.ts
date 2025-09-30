/**
 * 配置相关类型定义
 * 定义模板系统的完整配置结构和类型
 */

import type { DeviceType } from './template'

/**
 * 缓存策略类型
 */
export type CacheStrategy = 'lru' | 'fifo' | 'lfu' | 'ttl'

/**
 * 预加载模式类型
 */
export type PreloadMode = 'eager' | 'lazy' | 'intersection' | 'manual'

/**
 * 日志级别类型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * 设备检测配置
 */
export interface DeviceDetectionConfig {
  /** 设备断点配置 */
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  /** 防抖延迟（毫秒） */
  debounceDelay: number
  /** 是否启用窗口大小变化监听 */
  enableResize: boolean
  /** 是否启用屏幕方向变化监听 */
  enableOrientation: boolean
  /** 自定义设备检测函数 */
  customDetector?: (width: number, height: number, userAgent: string) => DeviceType
}

/**
 * 扫描器配置
 */
export interface ScannerConfig {
  /** 最大扫描深度 */
  maxDepth: number
  /** 包含的文件扩展名 */
  includeExtensions: string[]
  /** 排除的模式 */
  excludePatterns: string[]
  /** 是否启用缓存 */
  enableCache: boolean
  /** 是否启用监听模式 */
  watchMode: boolean
  /** 防抖延迟（毫秒） */
  debounceDelay: number
  /** 批处理大小 */
  batchSize: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean
  /** 缓存策略 */
  strategy: CacheStrategy
  /** 最大缓存条目数 */
  maxSize: number
  /** 缓存过期时间（毫秒） */
  ttl: number
  /** 过期检查周期（毫秒） */
  checkPeriod: number
  /** 是否启用压缩 */
  enableCompression: boolean
  /** 是否启用持久化 */
  enablePersistence: boolean
  /** 持久化存储键名 */
  persistenceKey: string
}

/**
 * 预加载策略配置
 */
export interface PreloadStrategyConfig {
  /** 是否启用预加载 */
  enabled: boolean
  /** 预加载模式 */
  mode: PreloadMode
  /** 预加载数量限制 */
  limit: number
  /** 预加载优先级模板列表 */
  priority: string[]
  /** Intersection Observer 配置 */
  intersection: {
    /** 根边距 */
    rootMargin: string
    /** 阈值 */
    threshold: number
  }
  /** 预加载延迟（毫秒） */
  delay: number
}

/**
 * 加载器配置
 */
export interface LoaderConfig {
  /** 加载超时时间（毫秒） */
  timeout: number
  /** 重试次数 */
  retryCount: number
  /** 重试延迟（毫秒） */
  retryDelay: number
  /** 是否启用并行加载 */
  enableParallel: boolean
  /** 最大并发数 */
  maxConcurrent: number
}

/**
 * 文件命名约定配置
 */
export interface FileNamingConfig {
  /** 组件文件名 */
  componentFile: string
  /** 配置文件名模式 */
  configFile: string
  /** 样式文件名模式 */
  styleFile: string
  /** 预览图文件名模式 */
  previewFile: string
  /** 允许的配置文件扩展名 */
  allowedConfigExtensions: string[]
  /** 允许的样式文件扩展名 */
  allowedStyleExtensions: string[]
}

/**
 * 性能优化配置
 */
export interface PerformanceConfig {
  /** 是否启用懒加载 */
  enableLazyLoading: boolean
  /** 是否启用虚拟滚动 */
  enableVirtualScroll: boolean
  /** 分块大小 */
  chunkSize: number
  /** 是否启用性能指标收集 */
  enableMetrics: boolean
  /** 指标收集间隔（毫秒） */
  metricsInterval: number
}

/**
 * 错误处理配置
 */
export interface ErrorHandlingConfig {
  /** 是否启用全局错误处理器 */
  enableGlobalHandler: boolean
  /** 是否启用错误重试 */
  enableRetry: boolean
  /** 最大重试次数 */
  maxRetries: number
  /** 是否启用降级处理 */
  enableFallback: boolean
  /** 降级模板名称 */
  fallbackTemplate: string
  /** 是否启用错误报告 */
  enableReporting: boolean
  /** 日志级别（向后兼容） */
  logLevel?: LogLevel
}

/**
 * 开发工具配置
 */
export interface DevtoolsConfig {
  /** 是否启用开发工具 */
  enabled: boolean
  /** 是否启用检查器 */
  enableInspector: boolean
  /** 是否启用日志记录 */
  enableLogger: boolean
  /** 日志级别 */
  logLevel: LogLevel
  /** 是否启用时间线 */
  enableTimeline: boolean
}

/**
 * 模板系统完整配置
 */
export interface TemplateSystemConfig {
  /** 模板目录路径 */
  templatesDir: string
  /** 是否自动扫描 */
  autoScan: boolean
  /** 是否启用热更新 */
  enableHMR: boolean
  /** 默认设备类型 */
  defaultDevice: DeviceType
  /** 是否启用性能监控 */
  enablePerformanceMonitor: boolean
  /** 是否启用调试模式 */
  debug: boolean
  /** 是否启用缓存（向后兼容） */
  enableCache?: boolean
  /** 是否启用开发工具 */
  enableDevtools?: boolean

  /** 扫描器配置 */
  scanner: ScannerConfig
  /** 缓存配置 */
  cache: CacheConfig
  /** 设备检测配置 */
  deviceDetection: DeviceDetectionConfig
  /** 预加载策略配置 */
  preloadStrategy: PreloadStrategyConfig
  /** 加载器配置 */
  loader: LoaderConfig
  /** 文件命名约定配置 */
  fileNaming: FileNamingConfig
  /** 性能优化配置 */
  performance: PerformanceConfig
  /** 错误处理配置 */
  errorHandling: ErrorHandlingConfig
  /** 开发工具配置 */
  devtools: DevtoolsConfig
  /** 动画配置（向后兼容） */
  animation?: {
    enable?: boolean
    duration?: number
    easing?: string
  }
}

/**
 * 插件配置选项（向后兼容）
 */
export interface TemplatePluginOptions extends Partial<Omit<TemplateSystemConfig, 'cache' | 'preloadStrategy'>> {
  /** @deprecated 使用 cache.enabled 替代 */
  cache?: boolean
  /** @deprecated 使用 preloadStrategy 替代 */
  preloadTemplates?: string[]
  /** @deprecated 使用 cache.maxSize 替代 */
  cacheLimit?: number
  /** @deprecated 使用 deviceDetection.breakpoints 替代 */
  mobileBreakpoint?: number
  /** @deprecated 使用 deviceDetection.breakpoints 替代 */
  tabletBreakpoint?: number
  /** @deprecated 使用 deviceDetection.breakpoints 替代 */
  desktopBreakpoint?: number
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
  /** 已修复的配置 */
  fixedConfig?: TemplateSystemConfig | undefined
}

/**
 * 配置更新事件
 */
export interface ConfigUpdateEvent {
  /** 更新的配置路径 */
  path: string
  /** 旧值 */
  oldValue: unknown
  /** 新值 */
  newValue: unknown
  /** 更新时间戳 */
  timestamp: number
}

/**
 * 配置监听器函数类型
 */
export type ConfigListener = (event: ConfigUpdateEvent) => void

/**
 * 配置管理器接口
 */
export interface ConfigManager {
  /** 获取当前配置 */
  getConfig: () => TemplateSystemConfig
  /** 更新配置 */
  updateConfig: (config: Partial<TemplateSystemConfig>) => void
  /** 重置为默认配置 */
  resetConfig: () => void
  /** 验证配置 */
  validateConfig: (config: Partial<TemplateSystemConfig>) => ConfigValidationResult
  /** 监听配置变化 */
  onConfigChange: (listener: ConfigListener) => () => void
  /** 从文件加载配置 */
  loadFromFile: (filePath: string) => Promise<void>
  /** 保存配置到文件 */
  saveToFile: (filePath: string) => Promise<void>
}
