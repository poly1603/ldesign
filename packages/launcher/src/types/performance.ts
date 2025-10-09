/**
 * 性能相关类型定义
 * 
 * 统一所有性能监控和优化相关的类型定义
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  /** 已使用的堆内存 (bytes) */
  heapUsed: number
  /** 总堆内存 (bytes) */
  heapTotal: number
  /** 外部内存 (bytes) */
  external: number
  /** 常驻集大小 (bytes) */
  rss?: number
}

/**
 * 包大小信息
 */
export interface BundleSize {
  /** 总大小 (bytes) */
  total: number
  /** JavaScript大小 (bytes) */
  js: number
  /** CSS大小 (bytes) */
  css: number
  /** 资源大小 (bytes) */
  assets: number
  /** 各个chunk的大小 */
  chunks?: Record<string, number>
}

/**
 * 文件系统操作统计
 */
export interface FileSystemStats {
  /** 读取次数 */
  reads: number
  /** 写入次数 */
  writes: number
  /** 总读取时间 (ms) */
  totalReadTime: number
  /** 总写入时间 (ms) */
  totalWriteTime: number
  /** 平均读取时间 (ms) */
  averageReadTime?: number
  /** 平均写入时间 (ms) */
  averageWriteTime?: number
}

/**
 * 插件性能统计
 */
export interface PluginPerformanceStats {
  /** 插件名称 */
  name: string
  /** 加载时间 (ms) */
  loadTime: number
  /** 转换时间 (ms) */
  transformTime: number
  /** 生成时间 (ms) */
  generateTime: number
  /** 总时间 (ms) */
  totalTime?: number
  /** 调用次数 */
  callCount?: number
}

/**
 * HMR统计信息
 */
export interface HMRStats {
  /** 更新次数 */
  updateCount: number
  /** 平均更新时间 (ms) */
  averageUpdateTime: number
  /** 总更新时间 (ms) */
  totalUpdateTime: number
  /** 最慢的更新时间 (ms) */
  slowestUpdate?: number
  /** 最快的更新时间 (ms) */
  fastestUpdate?: number
}

/**
 * 构建阶段性能
 */
export interface BuildPhaseMetrics {
  /** 依赖预构建时间 (ms) */
  preBuild?: number
  /** 模块解析时间 (ms) */
  moduleResolution?: number
  /** 代码转换时间 (ms) */
  transformation?: number
  /** 代码生成时间 (ms) */
  generation?: number
  /** 资源处理时间 (ms) */
  assetProcessing?: number
  /** 代码压缩时间 (ms) */
  minification?: number
  /** 其他阶段 */
  [phase: string]: number | undefined
}

/**
 * 性能指标（完整版）
 */
export interface PerformanceMetrics {
  /** 构建开始时间 (timestamp) */
  buildStartTime?: number
  /** 构建结束时间 (timestamp) */
  buildEndTime?: number
  /** 总构建时间 (ms) */
  totalBuildTime?: number
  /** 构建时间 (ms) - 兼容旧版本 */
  buildTime?: number
  
  /** 各阶段耗时 */
  phases?: BuildPhaseMetrics
  
  /** 内存使用情况 */
  memoryUsage?: MemoryUsage
  
  /** 包大小信息 */
  bundleSize?: BundleSize
  
  /** 文件系统操作统计 */
  fileSystemStats?: FileSystemStats
  
  /** 插件性能统计 */
  pluginStats?: PluginPerformanceStats[]
  
  /** 缓存命中率 (0-1) */
  cacheHitRate?: number
  
  /** HMR统计 */
  hmrStats?: HMRStats
  
  /** 模块数量 */
  moduleCount?: number
  
  /** 优化建议 */
  suggestions?: string[]
  
  /** 自定义指标 */
  custom?: Record<string, any>
}

/**
 * 性能评分
 */
export interface PerformanceScore {
  /** 总体评分 (0-100) */
  overall: number
  /** 构建速度评分 (0-100) */
  buildSpeed: number
  /** 包大小评分 (0-100) */
  bundleSize: number
  /** 内存使用评分 (0-100) */
  memoryUsage: number
  /** 缓存效率评分 (0-100) */
  cacheEfficiency?: number
  /** HMR性能评分 (0-100) */
  hmrPerformance?: number
}

/**
 * 优化建议类型
 */
export type RecommendationType = 'error' | 'warning' | 'info' | 'success'

/**
 * 优化建议分类
 */
export type RecommendationCategory = 
  | 'build-speed' 
  | 'bundle-size' 
  | 'memory' 
  | 'cache' 
  | 'plugins' 
  | 'dependencies'
  | 'configuration'
  | 'code-quality'

/**
 * 优化建议
 */
export interface PerformanceRecommendation {
  /** 建议类型 */
  type: RecommendationType
  /** 建议分类 */
  category: RecommendationCategory
  /** 建议标题 */
  title: string
  /** 详细描述 */
  description: string
  /** 解决方案 */
  solution: string
  /** 预期收益 */
  impact?: string
  /** 优先级 (1-5, 5最高) */
  priority?: number
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 报告时间戳 */
  timestamp: number
  /** 项目信息 */
  projectInfo?: {
    name: string
    size: number
    fileCount: number
    dependencies?: number
  }
  /** 性能指标 */
  metrics: PerformanceMetrics
  /** 性能评分 */
  score: PerformanceScore
  /** 优化建议 */
  recommendations: PerformanceRecommendation[]
  /** 历史对比 */
  comparison?: {
    previous?: PerformanceMetrics
    improvement?: Record<string, number>
  }
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled?: boolean
  /** 采样间隔 (ms) */
  sampleInterval?: number
  /** 是否收集详细信息 */
  detailed?: boolean
  /** 是否监控内存 */
  monitorMemory?: boolean
  /** 是否监控文件系统 */
  monitorFileSystem?: boolean
  /** 是否监控插件 */
  monitorPlugins?: boolean
  /** 内存警告阈值 (MB) */
  memoryWarningThreshold?: number
  /** 是否自动生成报告 */
  autoReport?: boolean
  /** 报告输出路径 */
  reportPath?: string
}

/**
 * 性能优化配置
 */
export interface PerformanceOptimizationConfig {
  /** 启用自动代码分割 */
  enableAutoSplitting?: boolean
  /** 启用预加载优化 */
  enablePreloading?: boolean
  /** 启用资源压缩 */
  enableCompression?: boolean
  /** 启用缓存优化 */
  enableCaching?: boolean
  /** 启用并行构建 */
  enableParallelBuild?: boolean
  /** 启用树摇优化 */
  enableTreeShaking?: boolean
  /** 启用懒加载 */
  enableLazyLoading?: boolean
  /** 启用资源内联 */
  enableInlining?: boolean
  /** 内联资源大小限制 (bytes) */
  inlineLimit?: number
  /** 代码分割策略 */
  splitStrategy?: 'vendor' | 'modules' | 'custom'
  /** 自定义分割规则 */
  customSplitRules?: Record<string, (id: string) => boolean>
  /** 是否自动应用优化 */
  autoApply?: boolean
}

/**
 * 性能事件类型
 */
export type PerformanceEventType = 
  | 'monitoring:start'
  | 'monitoring:stop'
  | 'monitoring:update'
  | 'optimization:start'
  | 'optimization:complete'
  | 'optimization:error'
  | 'memory:warning'
  | 'memory:critical'
  | 'cache:hit'
  | 'cache:miss'
  | 'build:start'
  | 'build:end'
  | 'hmr:update'

/**
 * 性能事件数据
 */
export interface PerformanceEventData {
  /** 事件类型 */
  type: PerformanceEventType
  /** 时间戳 */
  timestamp: number
  /** 事件数据 */
  data?: any
  /** 相关指标 */
  metrics?: Partial<PerformanceMetrics>
}

