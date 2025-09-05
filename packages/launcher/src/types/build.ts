/**
 * 构建相关类型定义
 * 
 * 定义构建过程的相关类型和接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { RollupOutput, RollupWatcher } from 'rollup'
import type { AsyncResult, FilePath } from './common'
import type { ViteLauncherConfig } from './config'

/**
 * 构建类型枚举
 * 定义构建的类型
 */
export enum BuildType {
  /** 生产构建 */
  PRODUCTION = 'production',
  /** 开发构建 */
  DEVELOPMENT = 'development',
  /** 监听模式构建 */
  WATCH = 'watch',
  /** 分析模式构建 */
  ANALYZE = 'analyze'
}

/**
 * 构建状态枚举
 * 定义构建过程的状态
 */
export enum BuildStatus {
  /** 未开始 */
  IDLE = 'idle',
  /** 准备中 */
  PREPARING = 'preparing',
  /** 构建中 */
  BUILDING = 'building',
  /** 构建成功 */
  SUCCESS = 'success',
  /** 构建失败 */
  FAILED = 'failed',
  /** 已取消 */
  CANCELLED = 'cancelled'
}

/**
 * 构建配置接口
 * 定义构建过程的配置选项
 */
export interface BuildConfig {
  /** 构建类型 */
  type: BuildType

  /** 输出目录 */
  outDir?: FilePath

  /** 是否生成 sourcemap */
  sourcemap?: boolean | 'inline' | 'hidden'

  /** 是否压缩代码 */
  minify?: boolean | 'terser' | 'esbuild'

  /** 是否启用监听模式 */
  watch?: boolean

  /** 是否清空输出目录 */
  emptyOutDir?: boolean

  /** 构建目标 */
  target?: string | string[]

  /** 是否生成构建报告 */
  reportCompressedSize?: boolean

  /** 是否生成构建分析报告 */
  analyze?: boolean

  /** 输出格式 */
  formats?: OutputFormat[]

  /** 外部依赖 */
  external?: string[]

  /** 全局变量映射 */
  globals?: Record<string, string>

  /** 是否拆分代码 */
  codeSplitting?: boolean

  /** 代码拆分策略 */
  chunkStrategy?: ChunkStrategy

  /** 资源处理配置 */
  assets?: AssetsConfig

  /** 环境变量 */
  env?: Record<string, string>

  /** 构建钩子 */
  hooks?: BuildHooks
}

/**
 * 输出格式枚举
 * 定义构建输出的格式
 */
export enum OutputFormat {
  /** ES 模块 */
  ES = 'es',
  /** CommonJS */
  CJS = 'cjs',
  /** UMD */
  UMD = 'umd',
  /** IIFE */
  IIFE = 'iife',
  /** AMD */
  AMD = 'amd',
  /** SystemJS */
  SYSTEM = 'system'
}

/**
 * 代码拆分策略枚举
 * 定义代码拆分的策略
 */
export enum ChunkStrategy {
  /** 单文件 */
  SINGLE = 'single',
  /** 按模块拆分 */
  MODULE = 'module',
  /** 按依赖拆分 */
  VENDOR = 'vendor',
  /** 自定义拆分 */
  CUSTOM = 'custom'
}

/**
 * 资源处理配置接口
 * 定义静态资源的处理配置
 */
export interface AssetsConfig {
  /** 资源内联阈值（字节） */
  inlineLimit?: number

  /** 资源输出目录 */
  assetsDir?: string

  /** 资源文件名模板 */
  assetFileNames?: string

  /** 代码块文件名模板 */
  chunkFileNames?: string

  /** 入口文件名模板 */
  entryFileNames?: string

  /** 是否启用资源哈希 */
  hash?: boolean

  /** 哈希长度 */
  hashLength?: number
}

/**
 * 构建钩子接口
 * 定义构建过程中的钩子函数
 */
export interface BuildHooks {
  /** 构建开始前钩子 */
  beforeBuild?: () => Promise<void> | void

  /** 构建完成后钩子 */
  afterBuild?: (result: BuildResult) => Promise<void> | void

  /** 构建失败钩子 */
  onBuildError?: (error: Error) => Promise<void> | void

  /** 文件变更钩子（监听模式） */
  onFileChange?: (file: string) => Promise<void> | void

  /** 构建进度钩子 */
  onProgress?: (progress: BuildProgress) => Promise<void> | void
}

/**
 * 构建结果接口
 * 定义构建过程的结果
 */
export interface BuildResult {
  /** 构建状态 */
  status: BuildStatus

  /** 构建类型 */
  type: BuildType

  /** 构建配置 */
  config: BuildConfig

  /** Rollup 输出结果 */
  output?: RollupOutput | RollupWatcher

  /** 构建开始时间 */
  startTime: number

  /** 构建结束时间 */
  endTime?: number

  /** 构建持续时间 */
  duration?: number

  /** 构建统计信息 */
  stats?: BuildStats

  /** 错误信息 */
  error?: Error

  /** 警告信息 */
  warnings?: string[]

  /** 构建产物信息 */
  artifacts?: BuildArtifact[]
}

/**
 * 构建统计信息接口
 * 定义构建过程的统计数据
 */
export interface BuildStats {
  /** 输入文件数量 */
  inputFiles: number

  /** 输出文件数量 */
  outputFiles: number

  /** 总输入大小（字节） */
  totalInputSize: number

  /** 总输出大小（字节） */
  totalOutputSize: number

  /** 压缩比例 */
  compressionRatio: number

  /** 处理的模块数量 */
  moduleCount: number

  /** 代码块数量 */
  chunkCount: number

  /** 资源文件数量 */
  assetCount: number

  /** 构建缓存命中率 */
  cacheHitRate?: number

  /** 内存使用峰值 */
  peakMemoryUsage?: number
}

/**
 * 构建产物接口
 * 定义构建产物的信息
 */
export interface BuildArtifact {
  /** 文件名 */
  fileName: string

  /** 文件路径 */
  filePath: string

  /** 文件类型 */
  type: ArtifactType

  /** 文件大小（字节） */
  size: number

  /** 压缩后大小（字节） */
  compressedSize?: number

  /** 是否为入口文件 */
  isEntry?: boolean

  /** 是否为代码块 */
  isChunk?: boolean

  /** 是否为资源文件 */
  isAsset?: boolean

  /** 依赖的模块 */
  dependencies?: string[]

  /** 源映射文件 */
  sourcemap?: string
}

/**
 * 产物类型枚举
 * 定义构建产物的类型
 */
export enum ArtifactType {
  /** JavaScript 文件 */
  JS = 'js',
  /** CSS 文件 */
  CSS = 'css',
  /** HTML 文件 */
  HTML = 'html',
  /** 图片文件 */
  IMAGE = 'image',
  /** 字体文件 */
  FONT = 'font',
  /** 其他资源文件 */
  ASSET = 'asset',
  /** 源映射文件 */
  SOURCEMAP = 'sourcemap'
}

/**
 * 构建进度接口
 * 定义构建过程的进度信息
 */
export interface BuildProgress {
  /** 当前阶段 */
  phase: BuildPhase

  /** 进度百分比（0-100） */
  percentage: number

  /** 当前处理的文件 */
  currentFile?: string

  /** 已处理的文件数量 */
  processedFiles: number

  /** 总文件数量 */
  totalFiles: number

  /** 当前阶段描述 */
  message?: string

  /** 估计剩余时间（毫秒） */
  estimatedTimeRemaining?: number
}

/**
 * 构建阶段枚举
 * 定义构建过程的阶段
 */
export enum BuildPhase {
  /** 初始化 */
  INITIALIZING = 'initializing',
  /** 解析依赖 */
  RESOLVING = 'resolving',
  /** 转换代码 */
  TRANSFORMING = 'transforming',
  /** 生成代码 */
  GENERATING = 'generating',
  /** 优化代码 */
  OPTIMIZING = 'optimizing',
  /** 写入文件 */
  WRITING = 'writing',
  /** 完成 */
  FINISHED = 'finished'
}

/**
 * 构建事件类型枚举
 * 定义构建相关的事件类型
 */
export enum BuildEvent {
  /** 构建开始事件 */
  BUILD_START = 'buildStart',
  /** 构建结束事件 */
  BUILD_END = 'buildEnd',
  /** 构建错误事件 */
  BUILD_ERROR = 'buildError',
  /** 构建进度事件 */
  BUILD_PROGRESS = 'buildProgress',
  /** 文件变更事件 */
  FILE_CHANGE = 'fileChange',
  /** 构建警告事件 */
  BUILD_WARNING = 'buildWarning'
}

/**
 * 构建事件数据接口
 * 定义构建事件携带的数据
 */
export interface BuildEventData {
  [BuildEvent.BUILD_START]: {
    type: BuildType
    config: BuildConfig
    timestamp: number
  }

  [BuildEvent.BUILD_END]: {
    result: BuildResult
    timestamp: number
  }

  [BuildEvent.BUILD_ERROR]: {
    error: Error
    phase: BuildPhase
    timestamp: number
  }

  [BuildEvent.BUILD_PROGRESS]: {
    progress: BuildProgress
    timestamp: number
  }

  [BuildEvent.FILE_CHANGE]: {
    file: string
    changeType: 'add' | 'change' | 'unlink'
    timestamp: number
  }

  [BuildEvent.BUILD_WARNING]: {
    message: string
    file?: string
    timestamp: number
  }
}

/**
 * 构建管理器接口
 * 定义构建管理器的功能
 */
export interface IBuildManager {
  /** 执行构建 */
  build(config?: ViteLauncherConfig): Promise<AsyncResult<BuildResult>>

  /** 启动监听模式构建 */
  watch(config?: ViteLauncherConfig): Promise<AsyncResult<RollupWatcher>>

  /** 停止构建 */
  stop(): Promise<AsyncResult>

  /** 获取构建状态 */
  getStatus(): BuildStatus

  /** 获取构建结果 */
  getResult(): BuildResult | null

  /** 清理构建产物 */
  clean(outDir?: string): Promise<AsyncResult>

  /** 分析构建产物 */
  analyze(result: BuildResult): Promise<AsyncResult<BuildAnalysis>>

  /** 验证构建配置 */
  validateConfig(config: BuildConfig): AsyncResult
}

/**
 * 构建分析结果接口
 * 定义构建分析的结果
 */
export interface BuildAnalysis {
  /** 总体统计 */
  summary: BuildStats

  /** 文件大小分析 */
  sizeAnalysis: SizeAnalysis

  /** 依赖分析 */
  dependencyAnalysis: DependencyAnalysis

  /** 性能分析 */
  performanceAnalysis: PerformanceAnalysis

  /** 建议优化项 */
  recommendations: OptimizationRecommendation[]
}

/**
 * 文件大小分析接口
 * 定义文件大小的分析结果
 */
export interface SizeAnalysis {
  /** 最大的文件 */
  largestFiles: BuildArtifact[]

  /** 文件大小分布 */
  sizeDistribution: Record<ArtifactType, number>

  /** 压缩效果 */
  compressionEffectiveness: number

  /** 大小趋势 */
  sizeTrend?: number[]
}

/**
 * 依赖分析接口
 * 定义依赖关系的分析结果
 */
export interface DependencyAnalysis {
  /** 依赖图 */
  dependencyGraph: DependencyNode[]

  /** 循环依赖 */
  circularDependencies: string[][]

  /** 未使用的依赖 */
  unusedDependencies: string[]

  /** 重复的依赖 */
  duplicatedDependencies: string[]
}

/**
 * 依赖节点接口
 * 定义依赖图中的节点
 */
export interface DependencyNode {
  /** 模块名称 */
  name: string

  /** 模块大小 */
  size: number

  /** 依赖的模块 */
  dependencies: string[]

  /** 被依赖的模块 */
  dependents: string[]

  /** 依赖深度 */
  depth: number
}

/**
 * 性能分析接口
 * 定义性能相关的分析结果
 */
export interface PerformanceAnalysis {
  /** 构建时间分析 */
  buildTimeAnalysis: {
    totalTime: number
    phaseTime: Record<BuildPhase, number>
    bottlenecks: string[]
  }

  /** 内存使用分析 */
  memoryUsageAnalysis: {
    peakUsage: number
    averageUsage: number
    memoryLeaks: boolean
  }

  /** 缓存效率分析 */
  cacheEfficiencyAnalysis: {
    hitRate: number
    missRate: number
    cacheSize: number
  }
}

/**
 * 优化建议接口
 * 定义优化建议的结构
 */
export interface OptimizationRecommendation {
  /** 建议类型 */
  type: 'size' | 'performance' | 'dependency' | 'cache'

  /** 建议标题 */
  title: string

  /** 建议描述 */
  description: string

  /** 预期收益 */
  expectedBenefit: string

  /** 实施难度 */
  difficulty: 'easy' | 'medium' | 'hard'

  /** 相关文件 */
  relatedFiles?: string[]
}
