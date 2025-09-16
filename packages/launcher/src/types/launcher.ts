/**
 * ViteLauncher 核心类型定义
 * 
 * 定义 ViteLauncher 类的接口和相关类型
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ViteDevServer, PreviewServer, Plugin } from 'vite'
import type { RollupOutput, RollupWatcher } from 'rollup'
import type { ViteLauncherConfig } from './config'
import type { ValidationResult, EventListener, ErrorHandler } from './common'

/**
 * ViteLauncher 核心接口
 * 定义 ViteLauncher 类的公共 API
 */
export interface IViteLauncher {
  // 开发服务器管理
  startDev(config?: ViteLauncherConfig): Promise<ViteDevServer>
  stopDev(): Promise<void>
  restartDev(): Promise<void>

  // 生产构建
  build(config?: ViteLauncherConfig): Promise<RollupOutput>
  buildWatch(config?: ViteLauncherConfig): Promise<RollupWatcher>

  // 预览服务
  preview(config?: ViteLauncherConfig): Promise<PreviewServer>

  // 配置管理
  mergeConfig(base: ViteLauncherConfig, override: ViteLauncherConfig): ViteLauncherConfig
  validateConfig(config: ViteLauncherConfig): ValidationResult
  loadConfig(configPath?: string): Promise<ViteLauncherConfig>

  // 插件系统（为后续 plugin 包预留接口）
  addPlugin(plugin: Plugin): void
  removePlugin(pluginName: string): void
  getPlugins(): Plugin[]

  // 生命周期钩子
  onReady(callback: () => void): void
  onError(callback: ErrorHandler): void
  onClose(callback: () => void): void

  // 状态管理
  getStatus(): LauncherStatus
  isRunning(): boolean
  getConfig(): ViteLauncherConfig
}

/**
 * Launcher 状态枚举
 * 定义 launcher 的运行状态
 */
export enum LauncherStatus {
  /** 未初始化 */
  IDLE = 'idle',
  /** 正在启动 */
  STARTING = 'starting',
  /** 运行中 */
  RUNNING = 'running',
  /** 正在构建 */
  BUILDING = 'building',
  /** 正在预览 */
  PREVIEWING = 'previewing',
  /** 正在停止 */
  STOPPING = 'stopping',
  /** 已停止 */
  STOPPED = 'stopped',
  /** 错误状态 */
  ERROR = 'error'
}

/**
 * Launcher 事件类型枚举
 * 定义 launcher 可以触发的事件类型
 */
export enum LauncherEvent {
  /** 状态变更事件 */
  STATUS_CHANGE = 'statusChange',
  /** 配置变更事件 */
  CONFIG_CHANGE = 'configChange',
  /** 服务器就绪事件 */
  SERVER_READY = 'serverReady',
  /** 构建开始事件 */
  BUILD_START = 'buildStart',
  /** 构建完成事件 */
  BUILD_END = 'buildEnd',
  /** 错误事件 */
  ERROR = 'error',
  /** 警告事件 */
  WARNING = 'warning',
  /** 日志事件 */
  LOG = 'log'
}

/**
 * 事件数据接口
 * 定义事件携带的数据结构
 */
export interface LauncherEventData {
  [LauncherEvent.STATUS_CHANGE]: {
    from: LauncherStatus
    to: LauncherStatus
    timestamp: number
  }

  [LauncherEvent.CONFIG_CHANGE]: {
    oldConfig: ViteLauncherConfig
    newConfig: ViteLauncherConfig
    timestamp: number
  }

  [LauncherEvent.SERVER_READY]: {
    server: ViteDevServer | PreviewServer
    url: string
    timestamp: number
  }

  [LauncherEvent.BUILD_START]: {
    config: ViteLauncherConfig
    timestamp: number
  }

  [LauncherEvent.BUILD_END]: {
    result: RollupOutput
    duration: number
    timestamp: number
  }

  [LauncherEvent.ERROR]: {
    error: Error
    context?: string
    timestamp: number
  }

  [LauncherEvent.WARNING]: {
    message: string
    context?: string
    timestamp: number
  }

  [LauncherEvent.LOG]: {
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    timestamp: number
  }
}

/**
 * Launcher 选项接口
 * 定义创建 ViteLauncher 实例时的选项
 */
export interface LauncherOptions {
  /** 初始配置 */
  config?: ViteLauncherConfig

  /** 工作目录 */
  cwd?: string

  /** 是否启用调试模式 */
  debug?: boolean

  /** 是否启用自动重启 */
  autoRestart?: boolean

  /** 环境名称 */
  environment?: string

  /** 事件监听器 */
  listeners?: Partial<{
    [K in LauncherEvent]: EventListener<LauncherEventData[K]>
  }>
}

/**
 * 基础服务器信息接口
 * 定义服务器的基本信息
 */
export interface BaseServerInfo {
  /** 服务器类型 */
  type: 'dev' | 'preview'

  /** 服务器实例 */
  server: ViteDevServer | PreviewServer

  /** 访问 URL */
  url: string

  /** 主机地址 */
  host: string

  /** 端口号 */
  port: number

  /** 是否启用 HTTPS */
  https: boolean

  /** 启动时间 */
  startTime: number
}

/**
 * 构建信息接口
 * 定义构建过程的信息
 */
export interface BuildInfo {
  /** 构建类型 */
  type: 'build' | 'watch'

  /** 构建结果 */
  result?: RollupOutput | RollupWatcher

  /** 构建配置 */
  config: ViteLauncherConfig

  /** 开始时间 */
  startTime: number

  /** 结束时间 */
  endTime?: number

  /** 构建持续时间 */
  duration?: number

  /** 构建状态 */
  status: 'pending' | 'building' | 'success' | 'error'

  /** 错误信息 */
  error?: Error
}

/**
 * Launcher 统计信息接口
 * 定义 launcher 的运行统计信息
 */
export interface LauncherStats {
  /** 启动次数 */
  startCount: number

  /** 构建次数 */
  buildCount: number

  /** 错误次数 */
  errorCount: number

  /** 总运行时间 */
  totalRuntime: number

  /** 平均启动时间 */
  averageStartTime: number

  /** 平均构建时间 */
  averageBuildTime: number

  /** 最后活动时间 */
  lastActivity: number
}

/**
 * 基础插件信息接口（为后续 plugin 包预留）
 * 定义插件的基本信息
 */
export interface BasePluginInfo {
  /** 插件名称 */
  name: string

  /** 插件版本 */
  version?: string

  /** 插件实例 */
  plugin: Plugin

  /** 是否启用 */
  enabled: boolean

  /** 插件配置 */
  config?: Record<string, any>

  /** 加载时间 */
  loadTime: number
}

/**
 * 性能监控接口
 * 定义性能监控的数据结构
 */
export interface PerformanceMetrics {
  /** 内存使用情况 */
  memory: {
    used: number
    total: number
    percentage: number
  }

  /** CPU 使用情况 */
  cpu: {
    usage: number
    loadAverage: number[]
  }

  /** 启动时间 */
  startupTime: number

  /** 构建时间 */
  buildTime: number

  /** 热更新时间 */
  hmrTime: number

  /** 文件变更响应时间 */
  fileChangeResponseTime: number
}
