/**
 * 插件相关类型定义
 */

/**
 * 插件类型枚举
 */
export enum PluginType {
  /** 核心插件 */
  CORE = 'core',
  /** 转换插件 */
  TRANSFORM = 'transform',
  /** 优化插件 */
  OPTIMIZATION = 'optimization',
  /** 工具插件 */
  UTILITY = 'utility',
  /** 开发插件 */
  DEVELOPMENT = 'development',
  /** 自定义插件 */
  CUSTOM = 'custom'
}

/**
 * 插件阶段枚举
 */
export enum PluginPhase {
  /** 构建开始前 */
  PRE_BUILD = 'pre-build',
  /** 模块解析 */
  RESOLVE = 'resolve',
  /** 模块加载 */
  LOAD = 'load',
  /** 代码转换 */
  TRANSFORM = 'transform',
  /** 代码生成 */
  GENERATE = 'generate',
  /** 构建完成后 */
  POST_BUILD = 'post-build'
}

/**
 * 统一插件接口
 */
export interface UnifiedPlugin {
  /** 插件名称 */
  name: string

  /** 插件类型 */
  type?: PluginType

  /** 插件版本 */
  version?: string

  /** 插件描述 */
  description?: string

  /** 插件作者 */
  author?: string

  /** 插件优先级 */
  priority?: number

  /** 插件依赖 */
  dependencies?: string[]

  /** 插件选项 */
  options?: Record<string, any>

  /** 是否启用 */
  enabled?: boolean

  /** 应用条件 */
  condition?: (context: PluginContext) => boolean

  // 通用钩子
  setup?: (build: PluginBuild) => void | Promise<void>

  // Rollup 兼容钩子
  buildStart?: (opts: any) => void | Promise<void>
  resolveId?: (id: string, importer?: string) => string | null | Promise<string | null>
  load?: (id: string) => string | null | Promise<string | null>
  transform?: (code: string, id: string) => any | Promise<any>
  generateBundle?: (opts: any, bundle: any) => void | Promise<void>
  writeBundle?: (opts: any, bundle: any) => void | Promise<void>

  // 生命周期钩子
  onInit?: (context: PluginContext) => void | Promise<void>
  onDestroy?: (context: PluginContext) => void | Promise<void>
  onError?: (error: Error, context: PluginContext) => void | Promise<void>

  // 适配器特定配置
  rollup?: RollupPluginConfig
  rolldown?: RolldownPluginConfig

  // 插件元数据
  meta?: PluginMetadata
}

/**
 * 插件构建接口
 */
export interface PluginBuild {
  /** 构建开始时调用 */
  onStart(callback: () => void | Promise<void>): void

  /** 模块解析时调用 */
  onResolve(options: ResolveOptions, callback: ResolveCallback): void

  /** 模块加载时调用 */
  onLoad(options: LoadOptions, callback: LoadCallback): void

  /** 代码转换时调用 */
  onTransform(options: TransformOptions, callback: TransformCallback): void

  /** 构建结束时调用 */
  onEnd(callback: () => void | Promise<void>): void

  /** 获取构建上下文 */
  getContext(): PluginContext

  /** 添加监听文件 */
  addWatchFile(file: string): void

  /** 发出资源文件 */
  emitFile(file: EmittedFile): string

  /** 获取文件名 */
  getFileName(referenceId: string): string
}

/**
 * 解析选项
 */
export interface ResolveOptions {
  /** 文件过滤器 */
  filter: RegExp

  /** 命名空间 */
  namespace?: string
}

/**
 * 解析回调
 */
export type ResolveCallback = (args: ResolveArgs) => ResolveResult | Promise<ResolveResult>

/**
 * 解析参数
 */
export interface ResolveArgs {
  /** 模块 ID */
  path: string

  /** 导入者 */
  importer: string

  /** 命名空间 */
  namespace: string

  /** 解析目录 */
  resolveDir: string

  /** 导入类型 */
  kind: ImportKind
}

/**
 * 导入类型
 */
export type ImportKind =
  | 'entry-point'
  | 'import-statement'
  | 'require-call'
  | 'dynamic-import'
  | 'require-resolve'
  | 'import-rule'
  | 'url-token'

/**
 * 解析结果
 */
export interface ResolveResult {
  /** 解析后的路径 */
  path?: string

  /** 外部模块 */
  external?: boolean

  /** 命名空间 */
  namespace?: string

  /** 后缀 */
  suffix?: string

  /** 插件数据 */
  pluginData?: any

  /** 错误信息 */
  errors?: Message[]

  /** 警告信息 */
  warnings?: Message[]

  /** 监听文件 */
  watchFiles?: string[]

  /** 监听目录 */
  watchDirs?: string[]
}

/**
 * 加载选项
 */
export interface LoadOptions {
  /** 文件过滤器 */
  filter: RegExp

  /** 命名空间 */
  namespace?: string
}

/**
 * 加载回调
 */
export type LoadCallback = (args: LoadArgs) => LoadResult | Promise<LoadResult>

/**
 * 加载参数
 */
export interface LoadArgs {
  /** 文件路径 */
  path: string

  /** 命名空间 */
  namespace: string

  /** 后缀 */
  suffix: string

  /** 插件数据 */
  pluginData: any
}

/**
 * 加载结果
 */
export interface LoadResult {
  /** 文件内容 */
  contents?: string | Uint8Array

  /** 加载器 */
  loader?: Loader

  /** 解析目录 */
  resolveDir?: string

  /** 插件数据 */
  pluginData?: any

  /** 错误信息 */
  errors?: Message[]

  /** 警告信息 */
  warnings?: Message[]

  /** 监听文件 */
  watchFiles?: string[]

  /** 监听目录 */
  watchDirs?: string[]
}

/**
 * 加载器类型
 */
export type Loader =
  | 'js'
  | 'jsx'
  | 'ts'
  | 'tsx'
  | 'css'
  | 'json'
  | 'text'
  | 'base64'
  | 'dataurl'
  | 'file'
  | 'binary'
  | 'copy'

/**
 * 转换选项
 */
export interface TransformOptions {
  /** 文件过滤器 */
  filter: RegExp

  /** 命名空间 */
  namespace?: string
}

/**
 * 转换回调
 */
export type TransformCallback = (args: TransformArgs) => TransformResult | Promise<TransformResult>

/**
 * 转换参数
 */
export interface TransformArgs {
  /** 文件路径 */
  path: string

  /** 命名空间 */
  namespace: string

  /** 文件内容 */
  contents: string

  /** 加载器 */
  loader: Loader

  /** 插件数据 */
  pluginData: any
}

/**
 * 转换结果
 */
export interface TransformResult {
  /** 转换后的内容 */
  contents?: string

  /** 加载器 */
  loader?: Loader

  /** 插件数据 */
  pluginData?: any

  /** 错误信息 */
  errors?: Message[]

  /** 警告信息 */
  warnings?: Message[]

  /** 监听文件 */
  watchFiles?: string[]

  /** 监听目录 */
  watchDirs?: string[]
}

/**
 * 消息
 */
export interface Message {
  /** 消息 ID */
  id?: string

  /** 插件名称 */
  pluginName: string

  /** 消息文本 */
  text: string

  /** 位置信息 */
  location?: Location

  /** 注释 */
  notes?: Note[]

  /** 详细信息 */
  detail?: any
}

/**
 * 位置信息
 */
export interface Location {
  /** 文件路径 */
  file: string

  /** 命名空间 */
  namespace: string

  /** 行号 */
  line: number

  /** 列号 */
  column: number

  /** 行内容 */
  lineText: string

  /** 建议 */
  suggestion: string
}

/**
 * 注释
 */
export interface Note {
  /** 注释文本 */
  text: string

  /** 位置信息 */
  location?: Location
}

/**
 * 发出的文件
 */
export interface EmittedFile {
  /** 文件类型 */
  type: 'asset' | 'chunk'

  /** 文件名 */
  fileName?: string

  /** 文件名模式 */
  name?: string

  /** 文件内容 */
  source?: string | Uint8Array

  /** 入口点 */
  id?: string

  /** 是否保留签名 */
  preserveSignature?: 'strict' | 'allow-extension' | 'exports-only' | false
}

/**
 * 插件上下文
 */
export interface PluginContext {
  /** 构建 ID */
  buildId: string

  /** 插件名称 */
  pluginName: string

  /** 工作目录 */
  cwd: string

  /** 构建模式 */
  mode: 'development' | 'production'

  /** 目标平台 */
  platform: 'browser' | 'node' | 'neutral'

  /** 环境变量 */
  env: Record<string, string>

  /** 配置信息 */
  config: any

  /** 缓存目录 */
  cacheDir: string

  /** 临时目录 */
  tempDir: string

  /** 日志记录器 */
  logger: any

  /** 性能监控器 */
  performanceMonitor: any
}

/**
 * Rollup 插件配置
 */
export interface RollupPluginConfig {
  /** 插件选项 */
  [key: string]: any
}

/**
 * Rolldown 插件配置
 */
export interface RolldownPluginConfig {
  /** 插件选项 */
  [key: string]: any
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /** 插件标签 */
  tags?: string[]

  /** 插件分类 */
  category?: string

  /** 插件主页 */
  homepage?: string

  /** 插件仓库 */
  repository?: string

  /** 插件许可证 */
  license?: string

  /** 插件关键词 */
  keywords?: string[]

  /** 插件兼容性 */
  compatibility?: {
    rollup?: string
    rolldown?: string
    node?: string
  }

  /** 插件配置模式 */
  configSchema?: any
}

/**
 * 插件管理器选项
 */
export interface PluginManagerOptions {
  /** 插件目录 */
  pluginDir?: string

  /** 是否启用缓存 */
  cache?: boolean

  /** 缓存目录 */
  cacheDir?: string

  /** 是否启用热重载 */
  hotReload?: boolean

  /** 插件加载超时时间 */
  timeout?: number

  /** 最大插件数量 */
  maxPlugins?: number

  /** 插件白名单 */
  whitelist?: string[]

  /** 插件黑名单 */
  blacklist?: string[]
}

/**
 * 插件加载结果
 */
export interface PluginLoadResult {
  /** 加载的插件 */
  plugin: UnifiedPlugin

  /** 加载时间 */
  loadTime: number

  /** 是否成功 */
  success: boolean

  /** 错误信息 */
  error?: Error

  /** 警告信息 */
  warnings?: string[]
}

// PluginPerformanceStats 已在 performance.ts 中定义，这里导入
export type { PluginPerformanceStats } from './performance'

// HookPerformance 已在 performance.ts 中定义，这里导入
export type { HookPerformance } from './performance'
