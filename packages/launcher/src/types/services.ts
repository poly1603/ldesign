/**
 * @fileoverview 服务接口类型定义
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type { InlineConfig, ViteDevServer, PluginOption } from 'vite'
import type {
  BuildOptions,
  BuildResult,
  DevOptions,
  FrameworkType,
  LauncherOptions,
  PreviewOptions,
  ProjectInfo,
  ProjectType,
  PerformanceMetrics,
} from './core'

/**
 * 错误处理相关类型
 */

/** 错误代码枚举 */
export const ERROR_CODES = {
  PROJECT_TYPE_DETECTION_FAILED: 'E001',
  INVALID_CONFIG: 'E002',
  PLUGIN_LOAD_FAILED: 'E003',
  BUILD_FAILED: 'E004',
  DEV_SERVER_START_FAILED: 'E005',
  PREVIEW_SERVER_START_FAILED: 'E006',
  CONFIG_MERGE_FAILED: 'E007',
  DEPENDENCY_NOT_FOUND: 'E008',
  UNSUPPORTED_FRAMEWORK: 'E009',
  INVALID_PROJECT_ROOT: 'E010',
  BUILD_OUTPUT_NOT_FOUND: 'E011',
  PERMISSION_DENIED: 'E012',
  NETWORK_ERROR: 'E013',
  TIMEOUT_ERROR: 'E014',
  VALIDATION_ERROR: 'E015',
} as const

/** 错误代码类型 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/** 错误严重级别 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/** 启动器错误接口 */
export interface LauncherError extends Error {
  /** 错误代码 */
  readonly code: ErrorCode
  /** 错误消息 */
  readonly message: string
  /** 错误详情 */
  readonly details?: string
  /** 解决建议 */
  readonly suggestion?: string
  /** 相关文档链接 */
  readonly docUrl?: string
  /** 原始错误对象 */
  readonly originalError?: Error
  /** 错误严重级别 */
  readonly severity: ErrorSeverity
  /** 错误上下文信息 */
  readonly context?: Record<string, unknown>
  /** 错误发生时间 */
  readonly timestamp: Date
}

/**
 * 项目检测相关类型
 */

/** 检测步骤信息接口 */
export interface DetectionStep {
  /** 步骤名称 */
  readonly name: string
  /** 步骤描述 */
  readonly description?: string
  /** 步骤结果 */
  readonly result: 'success' | 'failed' | 'skipped'
  /** 步骤消息 */
  readonly message: string
  /** 是否成功 */
  readonly success?: boolean
  /** 错误信息 */
  readonly error?: string
  /** 步骤耗时（毫秒） */
  readonly duration: number
  /** 步骤开始时间 */
  readonly startTime: Date
}

/** 项目检测报告接口 */
export interface DetectionReport {
  /** 检测到的文件列表 */
  readonly detectedFiles: readonly string[]
  /** 检测到的依赖包 */
  readonly detectedDependencies: readonly string[]
  /** 生产依赖 */
  readonly dependencies: Readonly<Record<string, string>>
  /** 开发依赖 */
  readonly devDependencies: Readonly<Record<string, string>>
  /** 检测置信度 (0-100) */
  readonly confidence: number
  /** 检测步骤日志 */
  readonly steps: readonly DetectionStep[]
  /** 检测耗时（毫秒） */
  readonly duration: number
  /** 检测开始时间 */
  readonly startTime: Date
  /** 项目根目录 */
  readonly projectRoot: string
}

/** 项目检测结果接口 */
export interface DetectionResult {
  /** 检测到的项目类型 */
  readonly projectType: ProjectType
  /** 框架类型 */
  readonly framework: FrameworkType
  /** 检测置信度 */
  readonly confidence: number
  /** 检测报告 */
  readonly report: DetectionReport
  /** 错误信息 */
  readonly error?: LauncherError
  /** 检测是否成功 */
  readonly success: boolean
}

/**
 * 配置管理相关类型
 */

/** 配置合并选项接口 */
export interface ConfigMergeOptions {
  /** 是否深度合并 */
  readonly deep?: boolean
  /** 是否覆盖数组 */
  readonly overrideArrays?: boolean
  /** 自定义合并函数 */
  readonly customMerger?: (target: unknown, source: unknown, key: string) => unknown
  /** 是否验证合并结果 */
  readonly validate?: boolean
}

/** 预设配置信息接口 */
export interface PresetConfig {
  /** 配置名称 */
  readonly name: string
  /** 适用的框架类型 */
  readonly framework: FrameworkType
  /** Vite配置对象 */
  readonly config: InlineConfig
  /** 配置优先级 */
  readonly priority: number
  /** 配置描述 */
  readonly description?: string
  /** 配置版本 */
  readonly version: string
  /** 是否为默认配置 */
  readonly isDefault: boolean
}

/**
 * 插件管理相关类型
 */

/** 插件配置信息接口 */
export interface PluginConfig {
  /** 插件名称 */
  readonly name: string
  /** 插件包名 */
  readonly packageName: string
  /** 适用的框架类型 */
  readonly frameworks: readonly FrameworkType[]
  /** 支持的框架类型（别名） */
  readonly supportedFrameworks: readonly FrameworkType[]
  /** 插件版本 */
  readonly version: string
  /** 插件选项 */
  readonly options?: Readonly<Record<string, unknown>>
  /** 默认选项 */
  readonly defaultOptions?: Readonly<Record<string, unknown>>
  /** 是否必需 */
  readonly required: boolean
  /** 插件描述 */
  readonly description?: string
  /** 插件官方文档链接 */
  readonly docUrl?: string
  /** 插件加载优先级 */
  readonly priority: number
}

/**
 * 核心服务接口
 */

/** 启动器实例接口 */
export interface IViteLauncher {
  /** 创建新项目 */
  create(projectPath: string, projectType: ProjectType, options?: CreateProjectOptions): Promise<void>
  /** 启动开发服务器 */
  dev(projectPath?: string, options?: DevOptions): Promise<ViteDevServer>
  /** 执行构建任务 */
  build(projectPath?: string, options?: BuildOptions): Promise<BuildResult>
  /** 启动预览服务器 */
  preview(projectPath?: string, options?: PreviewOptions): Promise<ViteDevServer>
  /** 获取当前配置 */
  getConfig(): InlineConfig
  /** 获取项目类型信息 */
  getProjectType(): ProjectType
  /** 获取项目详细信息 */
  getProjectInfo(projectPath?: string): Promise<ProjectInfo>
  /** 更新配置 */
  configure(config: Partial<InlineConfig>): void
  /** 停止当前服务器 */
  stop(): Promise<void>
  /** 销毁实例 */
  destroy(): Promise<void>
  /** 获取性能指标 */
  getPerformanceMetrics(): Promise<PerformanceMetrics>
}

/** 项目检测器接口 */
export interface IProjectDetector {
  /** 检测项目类型 */
  detectProjectType(root: string): Promise<DetectionResult>
  /** 检测框架类型 */
  detectFramework(root: string): Promise<FrameworkType>
  /** 检测TypeScript使用情况 */
  detectTypeScript(root: string): Promise<boolean>
  /** 检测CSS预处理器 */
  detectCSSPreprocessor(root: string): Promise<string | undefined>
  /** 检测包管理器 */
  detectPackageManager(root: string): Promise<string>
  /** 验证项目结构 */
  validateProjectStructure(root: string): Promise<boolean>
}

/** 配置管理器接口 */
export interface IConfigManager {
  /** 加载预设配置 */
  loadPreset(framework: FrameworkType): Promise<PresetConfig>
  /** 加载项目配置 */
  loadProjectConfig(projectRoot: string): Promise<InlineConfig>
  /** 合并配置 */
  mergeConfig(base: InlineConfig, override: Partial<InlineConfig>, options?: ConfigMergeOptions): InlineConfig
  /** 验证配置 */
  validateConfig(config: InlineConfig): Promise<boolean>
  /** 获取所有预设配置 */
  getAllPresets(): Promise<readonly PresetConfig[]>
  /** 生成配置文件 */
  generateConfigFile(projectType: ProjectType): Promise<string>
  /** 保存配置到文件 */
  saveConfigToFile(config: InlineConfig, filePath: string): Promise<void>
}

/** 插件管理器接口 */
export interface IPluginManager {
  /** 加载框架插件 */
  loadFrameworkPlugins(framework: FrameworkType): Promise<readonly PluginOption[]>
  /** 创建项目插件 */
  createPluginsForProject(projectType: ProjectType): Promise<readonly PluginOption[]>
  /** 注册自定义插件 */
  registerPlugin(plugin: PluginConfig): void
  /** 获取所有可用插件 */
  getAvailablePlugins(): Promise<readonly PluginConfig[]>
  /** 获取必需插件 */
  getRequiredPlugins(framework: FrameworkType): readonly PluginConfig[]
  /** 解析插件选项 */
  resolvePluginOptions(pluginName: string, options?: Record<string, unknown>): Record<string, unknown>
  /** 验证插件兼容性 */
  validatePluginCompatibility(plugin: PluginConfig, framework: FrameworkType): boolean
}

/** 错误处理器接口 */
export interface IErrorHandler {
  /** 处理错误 */
  handleError(error: Error, context?: string): LauncherError
  /** 创建错误 */
  createError(code: ErrorCode, message: string, details?: string): LauncherError
  /** 格式化错误信息 */
  formatError(error: LauncherError): string
  /** 记录错误日志 */
  logError(error: LauncherError): void
  /** 获取错误建议 */
  getSuggestion(errorCode: ErrorCode): string | undefined
  /** 设置错误处理策略 */
  setErrorStrategy(strategy: ErrorHandlingStrategy): void
}

/**
 * 扩展类型定义
 */

/** 创建项目选项接口 */
export interface CreateProjectOptions {
  /** 模板名称 */
  readonly template?: string
  /** 是否强制覆盖现有文件 */
  readonly force?: boolean
  /** 是否安装依赖 */
  readonly installDependencies?: boolean
  /** 包管理器选择 */
  readonly packageManager?: string
  /** 额外的配置选项 */
  readonly extraConfig?: Record<string, unknown>
}

/** 错误处理策略 */
export type ErrorHandlingStrategy = 'throw' | 'log' | 'ignore' | 'retry'

/** 日志记录器接口 */
export interface ILogger {
  /** 记录信息日志 */
  info(message: string, ...args: unknown[]): void
  /** 记录警告日志 */
  warn(message: string, ...args: unknown[]): void
  /** 记录错误日志 */
  error(message: string, ...args: unknown[]): void
  /** 记录调试日志 */
  debug(message: string, ...args: unknown[]): void
  /** 设置日志级别 */
  setLevel(level: string): void
}