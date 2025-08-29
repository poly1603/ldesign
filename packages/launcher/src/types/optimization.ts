/**
 * 开发与构建环境优化相关类型定义
 */

/**
 * 热重载优化配置
 */
export interface HotReloadOptimizationConfig {
  /** 是否启用快速刷新 */
  fastRefresh?: boolean
  /** 是否启用状态保持 */
  preserveState?: boolean
  /** 更新延迟（毫秒） */
  updateDelay?: number
  /** 是否启用智能重载 */
  smartReload?: boolean
  /** 忽略的文件模式 */
  ignored?: string[]
  /** 自定义重载策略 */
  customStrategies?: Record<string, (file: string) => boolean>
}

/**
 * 错误提示优化配置
 */
export interface ErrorDisplayConfig {
  /** 是否启用错误覆盖层 */
  overlay?: boolean
  /** 是否显示源码位置 */
  showSourceLocation?: boolean
  /** 是否显示堆栈跟踪 */
  showStackTrace?: boolean
  /** 错误过滤器 */
  errorFilter?: (error: Error) => boolean
  /** 自定义错误格式化 */
  customFormatter?: (error: Error) => string
  /** 是否启用错误建议 */
  suggestions?: boolean
}

/**
 * 构建分析配置
 */
export interface BuildAnalysisConfig {
  /** 是否启用构建时间分析 */
  buildTime?: boolean
  /** 是否启用包大小分析 */
  bundleSize?: boolean
  /** 是否启用依赖分析 */
  dependencies?: boolean
  /** 是否启用重复代码检测 */
  duplicateDetection?: boolean
  /** 是否启用未使用代码检测 */
  deadCodeDetection?: boolean
  /** 分析报告格式 */
  reportFormat?: 'console' | 'json' | 'html'
  /** 输出目录 */
  outputDir?: string
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitoringConfig {
  /** 是否启用性能监控 */
  enabled?: boolean
  /** 监控指标 */
  metrics?: {
    /** 构建时间 */
    buildTime?: boolean
    /** 内存使用 */
    memoryUsage?: boolean
    /** CPU 使用 */
    cpuUsage?: boolean
    /** 文件系统操作 */
    fileSystemOps?: boolean
  }
  /** 性能预算 */
  budget?: {
    /** 最大构建时间（秒） */
    maxBuildTime?: number
    /** 最大内存使用（MB） */
    maxMemoryUsage?: number
    /** 最大包大小（KB） */
    maxBundleSize?: number
  }
  /** 报告间隔（毫秒） */
  reportInterval?: number
}

/**
 * 缓存优化配置
 */
export interface CacheOptimizationConfig {
  /** 是否启用文件系统缓存 */
  filesystem?: boolean
  /** 是否启用内存缓存 */
  memory?: boolean
  /** 缓存目录 */
  cacheDir?: string
  /** 缓存策略 */
  strategy?: 'aggressive' | 'conservative' | 'custom'
  /** 缓存失效规则 */
  invalidation?: {
    /** 文件变化时失效 */
    onFileChange?: boolean
    /** 依赖变化时失效 */
    onDependencyChange?: boolean
    /** 配置变化时失效 */
    onConfigChange?: boolean
  }
  /** 缓存大小限制（MB） */
  maxSize?: number
}

/**
 * 开发服务器优化配置
 */
export interface DevServerOptimizationConfig {
  /** 预构建优化 */
  prebuild?: {
    /** 是否启用预构建 */
    enabled?: boolean
    /** 预构建包含的依赖 */
    include?: string[]
    /** 预构建排除的依赖 */
    exclude?: string[]
    /** 强制预构建 */
    force?: boolean
  }
  /** 文件监听优化 */
  watch?: {
    /** 是否使用轮询 */
    usePolling?: boolean
    /** 轮询间隔（毫秒） */
    interval?: number
    /** 忽略的文件模式 */
    ignored?: string[]
  }
  /** 中间件优化 */
  middleware?: {
    /** 是否启用压缩 */
    compression?: boolean
    /** 是否启用缓存 */
    cache?: boolean
    /** 自定义中间件 */
    custom?: any[]
  }
}

/**
 * 构建优化配置
 */
export interface BuildOptimizationConfig {
  /** 代码分割优化 */
  codeSplitting?: {
    /** 分割策略 */
    strategy?: 'size' | 'usage' | 'vendor' | 'custom'
    /** 最小块大小 */
    minChunkSize?: number
    /** 最大块大小 */
    maxChunkSize?: number
    /** 并行限制 */
    maxParallelRequests?: number
  }
  /** 压缩优化 */
  minification?: {
    /** JavaScript 压缩器 */
    js?: 'terser' | 'esbuild' | 'swc'
    /** CSS 压缩器 */
    css?: 'cssnano' | 'lightningcss'
    /** HTML 压缩 */
    html?: boolean
    /** 压缩选项 */
    options?: Record<string, any>
  }
  /** Tree Shaking 优化 */
  treeShaking?: {
    /** 是否启用 */
    enabled?: boolean
    /** 副作用标记 */
    sideEffects?: boolean | string[]
    /** 未使用导出检测 */
    unusedExports?: boolean
  }
}

/**
 * 环境优化配置
 */
export interface EnvironmentOptimizationConfig {
  /** 热重载优化 */
  hotReload?: HotReloadOptimizationConfig
  /** 错误提示优化 */
  errorDisplay?: ErrorDisplayConfig
  /** 构建分析 */
  buildAnalysis?: BuildAnalysisConfig
  /** 性能监控 */
  performance?: PerformanceMonitoringConfig
  /** 缓存优化 */
  cache?: CacheOptimizationConfig
  /** 开发服务器优化 */
  devServer?: DevServerOptimizationConfig
  /** 构建优化 */
  build?: BuildOptimizationConfig
}

/**
 * 优化统计信息
 */
export interface OptimizationStats {
  /** 构建统计 */
  build: {
    /** 构建时间（毫秒） */
    buildTime: number
    /** 包大小（字节） */
    bundleSize: number
    /** 压缩率 */
    compressionRatio: number
    /** 代码块数量 */
    chunkCount: number
  }
  /** 开发统计 */
  development: {
    /** 热重载次数 */
    hotReloads: number
    /** 平均重载时间（毫秒） */
    avgReloadTime: number
    /** 错误次数 */
    errorCount: number
    /** 警告次数 */
    warningCount: number
  }
  /** 性能统计 */
  performance: {
    /** 内存使用（MB） */
    memoryUsage: number
    /** CPU 使用率（%） */
    cpuUsage: number
    /** 文件系统操作次数 */
    fsOperations: number
  }
  /** 缓存统计 */
  cache: {
    /** 缓存命中率（%） */
    hitRate: number
    /** 缓存大小（MB） */
    size: number
    /** 缓存条目数量 */
    entries: number
  }
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 建议类型 */
  type: 'performance' | 'size' | 'development' | 'cache'
  /** 建议标题 */
  title: string
  /** 建议描述 */
  description: string
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high'
  /** 预期收益 */
  impact: string
  /** 实施难度 */
  difficulty: 'easy' | 'medium' | 'hard'
  /** 相关配置 */
  config?: string
  /** 参考链接 */
  reference?: string
}

/**
 * 环境优化管理器接口
 */
export interface IEnvironmentOptimizer {
  /** 应用优化配置 */
  applyOptimizations(config: EnvironmentOptimizationConfig): void
  
  /** 分析构建性能 */
  analyzeBuildPerformance(): Promise<OptimizationStats>
  
  /** 获取优化建议 */
  getOptimizationSuggestions(): OptimizationSuggestion[]
  
  /** 启用热重载优化 */
  enableHotReloadOptimization(config?: HotReloadOptimizationConfig): void
  
  /** 配置错误显示 */
  configureErrorDisplay(config: ErrorDisplayConfig): void
  
  /** 启用构建分析 */
  enableBuildAnalysis(config?: BuildAnalysisConfig): void
  
  /** 启用性能监控 */
  enablePerformanceMonitoring(config?: PerformanceMonitoringConfig): void
  
  /** 优化缓存策略 */
  optimizeCache(config?: CacheOptimizationConfig): void
  
  /** 获取统计信息 */
  getStats(): OptimizationStats
  
  /** 重置优化配置 */
  reset(): void
}

/**
 * 优化事件类型
 */
export type OptimizationEventType = 'build-start' | 'build-end' | 'hot-reload' | 'error-occurred' | 'performance-warning'

/**
 * 优化事件数据
 */
export interface OptimizationEventData {
  /** 事件类型 */
  type: OptimizationEventType
  /** 时间戳 */
  timestamp: number
  /** 事件数据 */
  data?: any
  /** 性能指标 */
  metrics?: {
    duration?: number
    memoryUsage?: number
    cpuUsage?: number
  }
}
