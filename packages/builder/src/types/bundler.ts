/**
 * 打包器相关类型定义
 */

import type { BundlerFeature } from './adapter'

/**
 * 支持的打包器类型
 */
export type BundlerType = 'rollup' | 'rolldown'

/**
 * 打包器状态
 */
export enum BundlerStatus {
  /** 未初始化 */
  UNINITIALIZED = 'uninitialized',
  /** 初始化中 */
  INITIALIZING = 'initializing',
  /** 就绪 */
  READY = 'ready',
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
 * 打包器信息
 */
export interface BundlerInfo {
  /** 打包器名称 */
  name: BundlerType

  /** 打包器版本 */
  version: string

  /** 是否可用 */
  available: boolean

  /** 安装路径 */
  installPath?: string

  /** 支持的功能 */
  features: BundlerFeature[]

  /** 性能特征 */
  performance: BundlerPerformanceProfile

  /** 兼容性信息 */
  compatibility: BundlerCompatibility
}

// BundlerFeature 已在 adapter.ts 中定义，这里导入
export { BundlerFeature } from './adapter'

/**
 * 打包器性能特征
 */
export interface BundlerPerformanceProfile {
  /** 构建速度等级 */
  buildSpeed: 'slow' | 'medium' | 'fast' | 'very-fast'

  /** 内存使用等级 */
  memoryUsage: 'low' | 'medium' | 'high' | 'very-high'

  /** 启动时间 */
  startupTime: 'fast' | 'medium' | 'slow'

  /** 增量构建性能 */
  incrementalBuild: 'excellent' | 'good' | 'fair' | 'poor'

  /** 大型项目支持 */
  largeProjectSupport: 'excellent' | 'good' | 'fair' | 'poor'

  /** 并行处理能力 */
  parallelProcessing: 'excellent' | 'good' | 'fair' | 'poor'
}

/**
 * 打包器兼容性
 */
export interface BundlerCompatibility {
  /** Node.js 版本要求 */
  nodeVersion: string

  /** 操作系统支持 */
  platforms: ('win32' | 'darwin' | 'linux')[]

  /** 架构支持 */
  architectures: ('x64' | 'arm64' | 'ia32')[]

  /** 插件兼容性 */
  pluginCompatibility: {
    /** Rollup 插件兼容性 */
    rollup: 'full' | 'partial' | 'none'
    /** Webpack 插件兼容性 */
    webpack: 'full' | 'partial' | 'none'
    /** Vite 插件兼容性 */
    vite: 'full' | 'partial' | 'none'
  }

  /** 配置兼容性 */
  configCompatibility: {
    /** 与其他工具的配置兼容性 */
    rollup: boolean
    webpack: boolean
    vite: boolean
  }
}

/**
 * 打包器配置
 */
export interface BundlerConfig {
  /** 打包器类型 */
  type: BundlerType

  /** 打包器选项 */
  options?: BundlerOptions

  /** 插件配置 */
  plugins?: any[]

  /** 优化配置 */
  optimization?: OptimizationConfig

  /** 开发配置 */
  development?: DevelopmentConfig

  /** 实验性功能 */
  experimental?: ExperimentalConfig
}

/**
 * 打包器选项
 */
export interface BundlerOptions {
  /** 工作目录 */
  cwd?: string

  /** 缓存目录 */
  cacheDir?: string

  /** 临时目录 */
  tempDir?: string

  /** 日志级别 */
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug'

  /** 是否启用颜色输出 */
  colors?: boolean

  /** 是否清屏 */
  clearScreen?: boolean

  /** 构建超时时间 */
  timeout?: number

  /** 最大内存使用 */
  maxMemory?: string | number

  /** 工作线程数 */
  workers?: number | 'auto'
}

/**
 * 优化配置
 */
export interface OptimizationConfig {
  /** 是否启用 Tree Shaking */
  treeshake?: boolean

  /** 是否启用代码分割 */
  codeSplitting?: boolean

  /** 是否启用压缩 */
  minify?: boolean

  /** 是否启用 gzip 压缩 */
  gzip?: boolean

  /** 是否启用 brotli 压缩 */
  brotli?: boolean

  /** 是否移除未使用的代码 */
  removeUnusedCode?: boolean

  /** 是否内联小文件 */
  inlineSmallFiles?: boolean

  /** 资源优化 */
  assets?: {
    /** 图片优化 */
    images?: boolean
    /** 字体优化 */
    fonts?: boolean
    /** SVG 优化 */
    svg?: boolean
  }
}

/**
 * 开发配置
 */
export interface DevelopmentConfig {
  /** 是否启用热重载 */
  hmr?: boolean

  /** 是否启用实时重载 */
  liveReload?: boolean

  /** 开发服务器配置 */
  server?: {
    /** 端口号 */
    port?: number
    /** 主机名 */
    host?: string
    /** 是否启用 HTTPS */
    https?: boolean
    /** 是否自动打开浏览器 */
    open?: boolean
  }

  /** 是否启用源码映射 */
  sourcemap?: boolean | 'inline'

  /** 是否启用错误覆盖 */
  errorOverlay?: boolean

  /** 是否启用进度显示 */
  progress?: boolean
}

/**
 * 实验性功能配置
 */
export interface ExperimentalConfig {
  /** 是否启用实验性功能 */
  enabled?: boolean

  /** 具体的实验性功能 */
  features?: string[]

  /** 实验性插件 */
  plugins?: any[]

  /** 实验性优化 */
  optimizations?: string[]
}

/**
 * 打包器检测结果
 */
export interface BundlerDetectionResult {
  /** 可用的打包器 */
  available: BundlerInfo[]

  /** 推荐的打包器 */
  recommended: BundlerType

  /** 推荐理由 */
  reason: string

  /** 性能对比 */
  performance: Record<BundlerType, BundlerPerformanceMetrics>

  /** 兼容性分析 */
  compatibility: Record<BundlerType, CompatibilityAnalysis>
}

/**
 * 打包器性能指标
 */
export interface BundlerPerformanceMetrics {
  /** 构建时间 */
  buildTime: number

  /** 内存使用 */
  memoryUsage: number

  /** 启动时间 */
  startupTime: number

  /** 包大小 */
  bundleSize: number

  /** 缓存命中率 */
  cacheHitRate: number

  /** 并行效率 */
  parallelEfficiency: number
}

/**
 * 兼容性分析
 */
export interface CompatibilityAnalysis {
  /** 整体兼容性评分 */
  score: number

  /** 插件兼容性 */
  pluginCompatibility: number

  /** 配置兼容性 */
  configCompatibility: number

  /** 功能兼容性 */
  featureCompatibility: number

  /** 兼容性问题 */
  issues: CompatibilityIssue[]

  /** 解决方案 */
  solutions: string[]
}

/**
 * 兼容性问题
 */
export interface CompatibilityIssue {
  /** 问题类型 */
  type: 'plugin' | 'config' | 'feature' | 'dependency'

  /** 问题描述 */
  description: string

  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical'

  /** 影响范围 */
  impact: string[]

  /** 解决方案 */
  solution?: string

  /** 相关文档 */
  documentation?: string
}

/**
 * 打包器切换选项
 */
export interface BundlerSwitchOptions {
  /** 目标打包器 */
  target: BundlerType

  /** 是否保留配置 */
  preserveConfig?: boolean

  /** 是否迁移插件 */
  migratePlugins?: boolean

  /** 是否备份原配置 */
  backup?: boolean

  /** 迁移策略 */
  migrationStrategy?: 'conservative' | 'aggressive' | 'custom'

  /** 自定义迁移规则 */
  customRules?: MigrationRule[]
}

/**
 * 迁移规则
 */
export interface MigrationRule {
  /** 规则名称 */
  name: string

  /** 源配置路径 */
  from: string

  /** 目标配置路径 */
  to: string

  /** 转换函数 */
  transform?: (value: any) => any

  /** 是否必需 */
  required?: boolean

  /** 默认值 */
  defaultValue?: any
}

/**
 * 打包器切换结果
 */
export interface BundlerSwitchResult {
  /** 是否成功 */
  success: boolean

  /** 新的打包器 */
  newBundler: BundlerType

  /** 迁移的配置 */
  migratedConfig: any

  /** 迁移的插件 */
  migratedPlugins: any[]

  /** 迁移报告 */
  migrationReport: MigrationReport

  /** 警告信息 */
  warnings: string[]

  /** 错误信息 */
  errors: string[]
}

/**
 * 迁移报告
 */
export interface MigrationReport {
  /** 迁移的配置项数量 */
  configItemsMigrated: number

  /** 迁移的插件数量 */
  pluginsMigrated: number

  /** 无法迁移的配置项 */
  unmigratableConfigs: string[]

  /** 无法迁移的插件 */
  unmigratablePlugins: string[]

  /** 需要手动处理的项目 */
  manualActions: ManualAction[]

  /** 迁移时间 */
  migrationTime: number
}

/**
 * 手动操作
 */
export interface ManualAction {
  /** 操作类型 */
  type: 'config' | 'plugin' | 'dependency' | 'file'

  /** 操作描述 */
  description: string

  /** 相关文件 */
  files?: string[]

  /** 建议的操作 */
  suggestedAction: string

  /** 参考文档 */
  documentation?: string
}
