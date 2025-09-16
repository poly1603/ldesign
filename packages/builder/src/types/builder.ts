/**
 * 构建器相关类型定义
 */

import type { EventEmitter } from 'events'
import type { BuilderConfig } from './config'
import type { OutputFile, BuildStats } from './output'
import type { PerformanceMetrics } from './performance'
import type { ValidationResult } from './common'
import type { ValidationResult as PostBuildValidationResult } from '../types/validation'

/**
 * 构建器状态枚举
 */
export enum BuilderStatus {
  /** 空闲状态 */
  IDLE = 'idle',
  /** 初始化中 */
  INITIALIZING = 'initializing',
  /** 构建中 */
  BUILDING = 'building',
  /** 监听中 */
  WATCHING = 'watching',
  /** 错误状态 */
  ERROR = 'error',
  /** 已销毁 */
  DISPOSED = 'disposed'
}

/**
 * 构建器事件枚举
 */
export enum BuilderEvent {
  /** 构建开始 */
  BUILD_START = 'build:start',
  /** 构建进度 */
  BUILD_PROGRESS = 'build:progress',
  /** 构建结束 */
  BUILD_END = 'build:end',
  /** 构建错误 */
  BUILD_ERROR = 'build:error',
  /** 监听开始 */
  WATCH_START = 'watch:start',
  /** 监听变化 */
  WATCH_CHANGE = 'watch:change',
  /** 监听结束 */
  WATCH_END = 'watch:end',
  /** 配置变化 */
  CONFIG_CHANGE = 'config:change',
  /** 状态变化 */
  STATUS_CHANGE = 'status:change'
}

/**
 * 构建器选项
 */
export interface BuilderOptions {
  /** 工作目录 */
  cwd?: string

  /** 初始配置 */
  config?: BuilderConfig

  /** 事件监听器 */
  listeners?: Partial<BuilderEventListeners>

  /** 日志记录器 */
  logger?: any

  /** 是否自动检测库类型 */
  autoDetect?: boolean

  /** 是否启用缓存 */
  cache?: boolean

  /** 缓存目录 */
  cacheDir?: string

  /** 是否启用性能监控 */
  performance?: boolean
}

/**
 * 构建器事件监听器
 */
export interface BuilderEventListeners {
  [BuilderEvent.BUILD_START]: (data: BuildStartEventData) => void
  [BuilderEvent.BUILD_PROGRESS]: (data: BuildProgressEventData) => void
  [BuilderEvent.BUILD_END]: (data: BuildEndEventData) => void
  [BuilderEvent.BUILD_ERROR]: (data: BuildErrorEventData) => void
  [BuilderEvent.WATCH_START]: (data: WatchStartEventData) => void
  [BuilderEvent.WATCH_CHANGE]: (data: WatchChangeEventData) => void
  [BuilderEvent.WATCH_END]: (data: WatchEndEventData) => void
  [BuilderEvent.CONFIG_CHANGE]: (data: ConfigChangeEventData) => void
  [BuilderEvent.STATUS_CHANGE]: (data: StatusChangeEventData) => void
}

/**
 * 构建开始事件数据
 */
export interface BuildStartEventData {
  /** 配置 */
  config: BuilderConfig
  /** 时间戳 */
  timestamp: number
  /** 构建 ID */
  buildId: string
}

/**
 * 构建进度事件数据
 */
export interface BuildProgressEventData {
  /** 进度百分比 */
  progress: number
  /** 当前阶段 */
  phase: string
  /** 当前文件 */
  currentFile?: string
  /** 已处理文件数 */
  processedFiles: number
  /** 总文件数 */
  totalFiles: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 构建结束事件数据
 */
export interface BuildEndEventData {
  /** 构建结果 */
  result: BuildResult
  /** 持续时间 */
  duration: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 构建错误事件数据
 */
export interface BuildErrorEventData {
  /** 错误信息 */
  error: Error
  /** 错误阶段 */
  phase: string
  /** 相关文件 */
  file?: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 监听开始事件数据
 */
export interface WatchStartEventData {
  /** 监听的文件模式 */
  patterns: string[]
  /** 时间戳 */
  timestamp: number
}

/**
 * 监听变化事件数据
 */
export interface WatchChangeEventData {
  /** 变化类型 */
  type: 'add' | 'change' | 'unlink'
  /** 文件路径 */
  path: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 监听结束事件数据
 */
export interface WatchEndEventData {
  /** 时间戳 */
  timestamp: number
}

/**
 * 配置变化事件数据
 */
export interface ConfigChangeEventData {
  /** 新配置 */
  config: BuilderConfig
  /** 旧配置 */
  oldConfig: BuilderConfig
  /** 配置文件路径 */
  configFile?: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 状态变化事件数据
 */
export interface StatusChangeEventData {
  /** 新状态 */
  status: BuilderStatus
  /** 旧状态 */
  oldStatus: BuilderStatus
  /** 时间戳 */
  timestamp: number
}

/**
 * 构建结果
 */
export interface BuildResult {
  /** 构建是否成功 */
  success: boolean

  /** 输出文件列表 */
  outputs: OutputFile[]

  /** 构建时间（毫秒） */
  duration: number

  /** 构建统计 */
  stats: BuildStats

  /** 性能指标 */
  performance: PerformanceMetrics

  /** 警告信息 */
  warnings: Warning[]

  /** 错误信息 */
  errors: Error[]

  /** 构建 ID */
  buildId: string

  /** 时间戳 */
  timestamp: number

  /** 构建器名称 */
  bundler: string

  /** 构建模式 */
  mode: string

  /** 库类型 */
  libraryType?: string

  /** 缓存信息（若启用缓存） */
  cache?: {
    enabled: boolean
    hit: boolean
    lookupMs?: number
    savedMs?: number
    dir?: string
    ttl?: number
    maxSize?: number
  }

  /** 打包后验证结果 */
  validation?: PostBuildValidationResult
}

/**
 * 警告信息
 */
export interface Warning {
  /** 警告代码 */
  code: string

  /** 警告消息 */
  message: string

  /** 相关文件 */
  file?: string

  /** 行号 */
  line?: number

  /** 列号 */
  column?: number

  /** 建议 */
  suggestion?: string
}

/**
 * 构建监听器
 */
export interface BuildWatcher extends EventEmitter {
  /** 关闭监听器 */
  close(): Promise<void>

  /** 是否正在监听 */
  readonly watching: boolean

  /** 监听的文件模式 */
  readonly patterns: string[]
}

/**
 * 库构建器接口
 */
export interface ILibraryBuilder extends EventEmitter {
  // 构建管理
  build(config?: BuilderConfig): Promise<BuildResult>
  buildWatch(config?: BuilderConfig): Promise<BuildWatcher>

  // 配置管理
  mergeConfig(base: BuilderConfig, override: BuilderConfig): BuilderConfig
  validateConfig(config: BuilderConfig): ValidationResult
  loadConfig(configPath?: string): Promise<BuilderConfig>

  // 核心切换
  setBundler(bundler: 'rollup' | 'rolldown'): void
  getBundler(): 'rollup' | 'rolldown'

  // 库类型管理
  setLibraryType(type: string): void
  detectLibraryType(projectPath: string): Promise<string>

  // 状态管理
  getStatus(): BuilderStatus
  isBuilding(): boolean
  isWatching(): boolean

  // 生命周期
  initialize(): Promise<void>
  dispose(): Promise<void>

  // 统计信息
  getStats(): BuildStats | null
  getPerformanceMetrics(): PerformanceMetrics | null
}

/**
 * 构建上下文
 */
export interface BuildContext {
  /** 构建 ID */
  buildId: string

  /** 开始时间 */
  startTime: number

  /** 配置 */
  config: BuilderConfig

  /** 工作目录 */
  cwd: string

  /** 缓存目录 */
  cacheDir: string

  /** 临时目录 */
  tempDir: string

  /** 是否为监听模式 */
  watch: boolean

  /** 环境变量 */
  env: Record<string, string>

  /** 日志记录器 */
  logger: any

  /** 性能监控器 */
  performanceMonitor: any
}

/**
 * 构建钩子
 */
export interface BuildHooks {
  /** 构建前钩子 */
  beforeBuild?: (context: BuildContext) => Promise<void> | void

  /** 构建后钩子 */
  afterBuild?: (context: BuildContext, result: BuildResult) => Promise<void> | void

  /** 错误钩子 */
  onError?: (context: BuildContext, error: Error) => Promise<void> | void

  /** 监听开始钩子 */
  onWatchStart?: (context: BuildContext) => Promise<void> | void

  /** 文件变化钩子 */
  onFileChange?: (context: BuildContext, file: string, type: string) => Promise<void> | void

  /** 监听结束钩子 */
  onWatchEnd?: (context: BuildContext) => Promise<void> | void
}

/**
 * 构建器工厂选项
 */
export interface BuilderFactoryOptions {
  /** 默认打包器 */
  defaultBundler?: 'rollup' | 'rolldown'

  /** 插件预设 */
  pluginPresets?: Record<string, any[]>

  /** 配置预设 */
  configPresets?: Record<string, Partial<BuilderConfig>>

  /** 是否启用自动检测 */
  autoDetection?: boolean

  /** 缓存配置 */
  cache?: {
    enabled: boolean
    dir: string
    ttl: number
  }
}

/**
 * 构建器实例信息
 */
export interface BuilderInstanceInfo {
  /** 实例 ID */
  id: string

  /** 创建时间 */
  createdAt: number

  /** 最后使用时间 */
  lastUsedAt: number

  /** 构建次数 */
  buildCount: number

  /** 当前状态 */
  status: BuilderStatus

  /** 配置摘要 */
  configSummary: {
    bundler: string
    libraryType?: string
    mode: string
  }
}
