/**
 * 性能相关类型定义
 */

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 是否启用打包分析器 */
  bundleAnalyzer?: boolean | BundleAnalyzerConfig

  /** 大小限制 */
  sizeLimit?: string | number | SizeLimitConfig

  /** 是否启用 Tree Shaking */
  treeshaking?: boolean | TreeShakingConfig

  /** 是否启用代码压缩 */
  minify?: boolean | MinifyConfig

  /** 缓存配置 */
  cache?: boolean | CacheConfig

  /** 并行处理配置 */
  parallel?: boolean | ParallelConfig

  /** 内存限制 */
  memoryLimit?: string | number

  /** 构建超时时间 */
  timeout?: number

  /** 最大文件大小限制（字节） */
  maxFileSize?: number

  /** 是否启用性能监控 */
  monitoring?: boolean | MonitoringConfig
}

/**
 * 打包分析器配置
 */
export interface BundleAnalyzerConfig {
  /** 是否启用 */
  enabled?: boolean

  /** 输出格式 */
  format?: 'html' | 'json' | 'static'

  /** 输出文件路径 */
  outputFile?: string

  /** 是否自动打开浏览器 */
  openBrowser?: boolean

  /** 服务器端口 */
  port?: number

  /** 分析模式 */
  mode?: 'server' | 'static' | 'json'

  /** 是否显示 gzip 大小 */
  showGzip?: boolean

  /** 是否显示 brotli 大小 */
  showBrotli?: boolean
}

/**
 * 大小限制配置
 */
export interface SizeLimitConfig {
  /** 总大小限制 */
  total?: string | number

  /** 单文件大小限制 */
  perFile?: string | number

  /** 按格式的大小限制 */
  byFormat?: Record<string, string | number>

  /** 是否在超出限制时失败 */
  failOnExceed?: boolean

  /** 警告阈值 */
  warningThreshold?: number
}

/**
 * Tree Shaking 配置
 */
export interface TreeShakingConfig {
  /** 是否启用 */
  enabled?: boolean

  /** 预设配置 */
  preset?: 'recommended' | 'aggressive' | 'safe'

  /** 模块副作用配置 */
  moduleSideEffects?: boolean | string[] | ((id: string) => boolean)

  /** 属性读取副作用 */
  propertyReadSideEffects?: boolean

  /** 未知全局副作用 */
  unknownGlobalSideEffects?: boolean

  /** 注解配置 */
  annotations?: boolean

  /** 手动标记纯函数 */
  pureFunctions?: string[]
}

/**
 * 代码压缩配置
 */
export interface MinifyConfig {
  /** 是否启用 */
  enabled?: boolean

  /** 压缩器类型 */
  minifier?: 'terser' | 'esbuild' | 'swc'

  /** 是否压缩 HTML */
  html?: boolean

  /** 是否压缩 CSS */
  css?: boolean

  /** 是否压缩 JavaScript */
  js?: boolean

  /** 是否移除注释 */
  removeComments?: boolean

  /** 是否移除控制台输出 */
  dropConsole?: boolean

  /** 是否移除调试器语句 */
  dropDebugger?: boolean

  /** 自定义压缩选项 */
  options?: Record<string, any>
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用 */
  enabled?: boolean

  /** 缓存目录 */
  dir?: string

  /** 缓存策略 */
  strategy?: 'filesystem' | 'memory' | 'hybrid'

  /** 缓存键生成函数 */
  keyGenerator?: (input: any) => string

  /** 缓存过期时间 */
  ttl?: number

  /** 最大缓存大小 */
  maxSize?: string | number

  /** 是否压缩缓存 */
  compress?: boolean

  /** 缓存版本 */
  version?: string
}

/**
 * 并行处理配置
 */
export interface ParallelConfig {
  /** 是否启用 */
  enabled?: boolean

  /** 工作线程数量 */
  workers?: number | 'auto'

  /** 最小并行文件数 */
  minFileSize?: number

  /** 并行处理的任务类型 */
  tasks?: ('transform' | 'minify' | 'compress')[]
}

/**
 * 监控配置
 */
export interface MonitoringConfig {
  /** 是否启用 */
  enabled?: boolean

  /** 监控指标 */
  metrics?: ('buildTime' | 'memoryUsage' | 'bundleSize' | 'cacheHitRate')[]

  /** 报告格式 */
  reportFormat?: 'console' | 'json' | 'html'

  /** 报告输出路径 */
  reportPath?: string

  /** 是否实时监控 */
  realtime?: boolean

  /** 监控间隔 */
  interval?: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 构建时间（毫秒） */
  buildTime: number

  /** 内存使用情况 */
  memoryUsage: MemoryUsage

  /** 缓存统计 */
  cacheStats: CacheStats

  /** 文件处理统计 */
  fileStats: FileProcessingStats

  /** 插件性能 */
  pluginPerformance: PluginPerformanceStats[]

  /** 系统资源使用 */
  systemResources: SystemResourceUsage

  /** 打包大小（字节） */
  bundleSize?: number
}

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  /** 堆内存使用 */
  heapUsed: number

  /** 堆内存总量 */
  heapTotal: number

  /** 外部内存使用 */
  external: number

  /** RSS 内存 */
  rss: number

  /** 峰值内存使用 */
  peak: number

  /** 内存使用趋势 */
  trend: MemoryTrend[]
}

/**
 * 内存趋势
 */
export interface MemoryTrend {
  /** 时间戳 */
  timestamp: number

  /** 内存使用量 */
  usage: number

  /** 阶段名称 */
  phase: string
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number

  /** 缓存未命中次数 */
  misses: number

  /** 缓存命中率 */
  hitRate: number

  /** 缓存大小 */
  size: number

  /** 缓存条目数 */
  entries: number

  /** 缓存节省的时间 */
  timeSaved: number
}

/**
 * 文件处理统计
 */
export interface FileProcessingStats {
  /** 处理的文件总数 */
  totalFiles: number

  /** 按类型分组的文件数 */
  filesByType: Record<string, number>

  /** 平均处理时间 */
  averageProcessingTime: number

  /** 最慢的文件 */
  slowestFiles: FileProcessingInfo[]

  /** 处理速度（文件/秒） */
  processingRate: number
}

/**
 * 文件处理信息
 */
export interface FileProcessingInfo {
  /** 文件路径 */
  path: string

  /** 处理时间 */
  processingTime: number

  /** 文件大小 */
  size: number

  /** 处理阶段 */
  phases: ProcessingPhase[]
}

/**
 * 处理阶段
 */
export interface ProcessingPhase {
  /** 阶段名称 */
  name: string

  /** 开始时间 */
  startTime: number

  /** 结束时间 */
  endTime: number

  /** 持续时间 */
  duration: number
}

/**
 * 插件性能统计
 */
export interface PluginPerformanceStats {
  /** 插件名称 */
  name: string

  /** 总执行时间 */
  totalTime: number

  /** 调用次数 */
  callCount: number

  /** 平均执行时间 */
  averageTime: number

  /** 最长执行时间 */
  maxTime: number

  /** 钩子性能 */
  hookPerformance: Record<string, HookPerformance>
}

/**
 * 钩子性能
 */
export interface HookPerformance {
  /** 钩子名称 */
  name: string

  /** 执行次数 */
  callCount: number

  /** 总执行时间 */
  totalTime: number

  /** 平均执行时间 */
  averageTime: number

  /** 最长执行时间 */
  maxTime: number
}

/**
 * 系统资源使用
 */
export interface SystemResourceUsage {
  /** CPU 使用率 */
  cpuUsage: number

  /** 可用内存 */
  availableMemory: number

  /** 磁盘使用情况 */
  diskUsage: DiskUsage

  /** 网络使用情况 */
  networkUsage?: NetworkUsage
}

/**
 * 磁盘使用情况
 */
export interface DiskUsage {
  /** 总空间 */
  total: number

  /** 已使用空间 */
  used: number

  /** 可用空间 */
  available: number

  /** 使用率 */
  usagePercent: number
}

/**
 * 网络使用情况
 */
export interface NetworkUsage {
  /** 下载字节数 */
  bytesReceived: number

  /** 上传字节数 */
  bytesSent: number

  /** 网络延迟 */
  latency: number
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 报告生成时间 */
  timestamp: number

  /** 构建配置摘要 */
  buildSummary: BuildSummary

  /** 性能指标 */
  metrics: PerformanceMetrics

  /** 性能对比 */
  comparison?: PerformanceComparison

  /** 优化建议 */
  recommendations: PerformanceRecommendation[]

  /** 详细分析 */
  analysis: PerformanceAnalysis
}

/**
 * 构建摘要
 */
export interface BuildSummary {
  /** 打包器类型 */
  bundler: string

  /** 构建模式 */
  mode: string

  /** 入口文件数 */
  entryCount: number

  /** 输出文件数 */
  outputCount: number

  /** 总大小 */
  totalSize: number

  /** 构建时间 */
  buildTime: number
}

/**
 * 性能对比
 */
export interface PerformanceComparison {
  /** 对比基准 */
  baseline: PerformanceMetrics

  /** 当前指标 */
  current: PerformanceMetrics

  /** 改进百分比 */
  improvement: Record<string, number>

  /** 回归项目 */
  regressions: string[]
}

/**
 * 性能建议
 */
export interface PerformanceRecommendation {
  /** 建议类型 */
  type: 'speed' | 'memory' | 'size' | 'cache'

  /** 建议标题 */
  title: string

  /** 建议描述 */
  description: string

  /** 预期改进 */
  expectedImprovement: string

  /** 实施难度 */
  difficulty: 'easy' | 'medium' | 'hard'

  /** 相关配置 */
  configChanges?: Record<string, any>
}

/**
 * 性能分析
 */
export interface PerformanceAnalysis {
  /** 瓶颈分析 */
  bottlenecks: BottleneckAnalysis[]

  /** 资源使用分析 */
  resourceAnalysis: ResourceAnalysis

  /** 缓存效率分析 */
  cacheAnalysis: CacheEfficiencyAnalysis

  /** 并行化机会 */
  parallelizationOpportunities: ParallelizationOpportunity[]
}

/**
 * 瓶颈分析
 */
export interface BottleneckAnalysis {
  /** 瓶颈类型 */
  type: 'cpu' | 'memory' | 'io' | 'network'

  /** 瓶颈描述 */
  description: string

  /** 影响程度 */
  impact: 'low' | 'medium' | 'high'

  /** 相关组件 */
  components: string[]

  /** 解决方案 */
  solutions: string[]
}

/**
 * 资源分析
 */
export interface ResourceAnalysis {
  /** CPU 使用效率 */
  cpuEfficiency: number

  /** 内存使用效率 */
  memoryEfficiency: number

  /** 磁盘 I/O 效率 */
  ioEfficiency: number

  /** 资源浪费点 */
  wastePoints: string[]
}

/**
 * 缓存效率分析
 */
export interface CacheEfficiencyAnalysis {
  /** 整体缓存效率 */
  overallEfficiency: number

  /** 缓存策略建议 */
  strategyRecommendations: string[]

  /** 缓存配置优化 */
  configOptimizations: Record<string, any>
}

/**
 * 并行化机会
 */
export interface ParallelizationOpportunity {
  /** 任务名称 */
  task: string

  /** 当前并行度 */
  currentParallelism: number

  /** 建议并行度 */
  recommendedParallelism: number

  /** 预期加速比 */
  expectedSpeedup: number
}
