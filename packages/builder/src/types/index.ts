/**
 * 核心类型定义
 * 定义智能前端库打包工具的所有接口和数据模型
 */

import { RollupOptions, Plugin } from 'rollup'

// ============= 基础类型 =============

/**
 * 支持的输出格式
 */
export type OutputFormat = 'esm' | 'cjs' | 'iife' | 'umd'

/**
 * 支持的文件类型
 */
export type FileType = 'typescript' | 'tsx' | 'javascript' | 'jsx' | 'vue' | 'css' | 'scss' | 'less' | 'stylus' | 'json' | 'markdown' | 'html' | 'xml' | 'yaml' | 'toml' | 'svg' | 'image' | 'font' | 'config' | 'test' | 'other'

/**
 * 项目类型
 */
export type ProjectType = 'vue' | 'react' | 'angular' | 'svelte' | 'typescript' | 'javascript'

/**
 * 构建模式
 */
export type BuildMode = 'development' | 'production'

// ============= 配置接口 =============

/**
 * 构建配置选项
 */
export interface BuildOptions {
  /** 项目根目录 */
  root?: string
  /** 入口文件或文件数组 */
  input: string | string[] | Record<string, string>
  /** 输出目录 */
  outDir?: string
  /** 输出格式 */
  formats?: OutputFormat[]
  /** 构建模式 */
  mode?: BuildMode
  /** 是否生成类型声明文件，或类型声明生成配置 */
  dts?: boolean | TypeGenerationOptions
  /** 类型声明文件输出目录 */
  dtsDir?: string
  /** 是否压缩代码 */
  minify?: boolean
  /** 是否生成 source map */
  sourcemap?: boolean | 'inline' | 'hidden'
  /** 外部依赖 */
  external?: string[] | ((id: string) => boolean)
  /** 全局变量映射 */
  globals?: Record<string, string>
  /** 自定义 Rollup 配置 */
  rollupOptions?: Partial<RollupOptions>
  /** 插件配置（高级）*/
  plugins?: PluginConfig[]
  /** 是否启用详细日志 */
  verbose?: boolean
  /** 是否清理输出目录 */
  clean?: boolean
  /** 库模式 */
  lib?: boolean
  /** UMD/IIFE 名称 */
  name?: string
  /** 监听配置 */
  watchOptions?: Record<string, any>
  /** 是否在产物分析时展示文件体积 */
  analyze?: boolean
  /** 开发服务、热更等可选项占位（保持向后兼容） */
  serve?: Record<string, any>
  livereload?: Record<string, any>
  /** 允许附加自定义字段（用于插件细粒度配置） */
  [key: string]: any
}

// ============= 类型生成相关 =============

export interface TypeGenerationOptions {
  bundled?: boolean
  outDir?: string
  fileName?: string
  includePrivate?: boolean
  followSymlinks?: boolean
}

export interface TypeGenerationResult {
  success: boolean
  generatedFiles: string[]
  errors: string[]
  generationTime: number
}

/**
 * 构建产物验证结果
 */
export interface ValidationResult {
  success: boolean
  foundArtifacts: import('../core/build-validator').ExpectedArtifact[]
  missingArtifacts: import('../core/build-validator').ExpectedArtifact[]
  errors: string[]
  warnings: string[]
  validationTime: number
  summary: string
}

/**
 * 单个插件配置
 */
export interface PluginConfig {
  /** 插件名称 */
  name: string
  /** 插件选项 */
  options?: Record<string, any>
  /** 是否启用 */
  enabled?: boolean
  /** 应用条件 */
  condition?: (context: BuildContext) => boolean
}

/**
 * 插件配置集合
 */
export interface PluginConfiguration {
  /** 插件数组 */
  plugins: Plugin[]
  /** Rollup配置选项 */
  rollupOptions?: Partial<RollupOptions>
}

/**
 * 输出配置
 */
export interface OutputConfig {
  /** 输出格式 */
  format: OutputFormat
  /** 输出文件名 */
  file?: string
  /** 输出目录 */
  dir?: string
  /** 入口文件名模式 */
  entryFileNames?: string
  /** 代码块文件名模式 */
  chunkFileNames?: string
  /** 资源文件名模式 */
  assetFileNames?: string
  /** 全局变量映射 */
  globals?: Record<string, string>
  /** 是否压缩 */
  minify?: boolean
  /** source map 配置 */
  sourcemap?: boolean | 'inline' | 'hidden'
}

// ============= 项目扫描相关 =============

/**
 * 文件信息
 */
export interface FileInfo {
  /** 文件路径 */
  path: string
  /** 相对路径 */
  relativePath: string
  /** 文件类型 */
  type: FileType
  /** 文件大小 */
  size: number
  /** 是否为入口文件 */
  isEntry?: boolean
  /** 依赖的文件 */
  dependencies?: string[]
  /** 基名（不含扩展名）*/
  name?: string
  /** 扩展名（.ts/.js 等）*/
  extension?: string
  /** 最后修改时间 */
  lastModified?: Date
  /** 导出符号（静态分析）*/
  exports?: string[]
}

/**
 * 项目扫描结果
 */
export interface ProjectScanResult {
  /** 项目类型 */
  projectType: ProjectType
  /** 项目根目录 */
  root: string
  /** 入口文件路径 */
  entryPoints: string[]
  /** 所有文件 */
  files: FileInfo[]
  /** 包配置信息 */
  packageInfo?: PackageInfo
  /** 依赖关系图 */
  dependencyGraph: DependencyGraph
  /** 扫描耗时 */
  scanTime: number
}

/**
 * 包配置信息
 */
export interface PackageInfo {
  /** 包名 */
  name?: string
  /** 版本 */
  version?: string
  /** 描述 */
  description?: string
  /** 主入口 */
  main?: string
  /** ES模块入口 */
  module?: string
  /** 类型声明入口 */
  types?: string
  /** 导出配置 */
  exports?: any
  /** 依赖 */
  dependencies?: Record<string, string>
  /** 开发依赖 */
  devDependencies?: Record<string, string>
  /** 对等依赖 */
  peerDependencies?: Record<string, string>
  /** 脚本 */
  scripts?: Record<string, string>
  /** 关键词 */
  keywords?: string[]
  /** 作者 */
  author?: string
  /** 许可证 */
  license?: string
  /** 仓库 */
  repository?: any
  /** 问题反馈 */
  bugs?: any
  /** 主页 */
  homepage?: string
}

/**
 * 依赖关系图
 */
export interface DependencyGraph {
  /** 节点映射 */
  nodes: Map<string, DependencyNode>
  /** 边集合 */
  edges: DependencyEdge[]
}

/**
 * 依赖节点
 */
export interface DependencyNode {
  /** 文件路径 */
  id: string
  /** 文件信息 */
  file: FileInfo
  /** 入度 */
  inDegree: number
  /** 出度 */
  outDegree: number
}

/**
 * 依赖边
 */
export interface DependencyEdge {
  /** 源文件 */
  from: string
  /** 目标文件 */
  to: string
  /** 依赖类型 */
  type: 'import' | 'require' | 'dynamic'
}

// ============= 插件系统相关 =============

/**
 * 插件注册表
 */
export interface PluginRegistry {
  /** 已注册的插件 */
  plugins: Map<string, PluginFactory>
  /** 注册插件 */
  register(name: string, factory: PluginFactory): void
  /** 获取插件 */
  get(name: string): PluginFactory | undefined
  /** 创建插件实例 */
  create(config: PluginConfig, context: BuildContext): Plugin | undefined
}

/**
 * 插件工厂函数
 */
export type PluginFactory = (options?: Record<string, any>) => Plugin

/**
 * 构建上下文
 */
export interface BuildContext {
  /** 构建选项 */
  options: BuildOptions
  /** 项目扫描结果 */
  scanResult: ProjectScanResult
  /** 当前输出配置 */
  outputConfig: OutputConfig
  /** 构建模式 */
  mode: BuildMode
  /** 是否为生产模式 */
  isProduction: boolean
  /** 项目根目录 */
  root: string
  /** 输出目录 */
  outDir: string
}

// ============= 构建结果相关 =============

/**
 * 构建结果
 */
export interface BuildResult {
  /** 是否成功 */
  success: boolean
  /** 构建时间 */
  duration: number
  /** 输出文件 */
  outputs: OutputFile[]
  /** 错误信息 */
  errors: BuildError[]
  /** 警告信息 */
  warnings: BuildWarning[]
  /** 构建统计 */
  stats: BuildStats
}

/**
 * 输出文件信息
 */
export interface OutputFile {
  /** 文件路径 */
  path: string
  /** 文件大小 */
  size: number
  /** 压缩后大小 */
  gzipSize?: number
  /** 输出格式 */
  format: OutputFormat
  /** 是否为入口文件 */
  isEntry: boolean
  /** 源文件 */
  source?: string
}

/**
 * 构建错误
 */
export interface BuildError {
  /** 错误消息 */
  message: string
  /** 错误代码 */
  code?: string
  /** 文件路径 */
  file?: string
  /** 行号 */
  line?: number
  /** 列号 */
  column?: number
  /** 错误堆栈 */
  stack?: string
}

/**
 * 构建警告
 */
export interface BuildWarning {
  /** 警告消息 */
  message: string
  /** 警告代码 */
  code?: string
  /** 文件路径 */
  file?: string
  /** 行号 */
  line?: number
  /** 列号 */
  column?: number
}

/**
 * 构建统计
 */
export interface BuildStats {
  /** 总文件数 */
  totalFiles: number
  /** 总大小 */
  totalSize: number
  /** 压缩后总大小 */
  totalGzipSize: number
  /** 各格式统计 */
  formatStats: Record<OutputFormat, FormatStats>
}

/**
 * 格式统计
 */
export interface FormatStats {
  /** 文件数 */
  fileCount: number
  /** 总大小 */
  totalSize: number
  /** 压缩后总大小 */
  totalGzipSize: number
}

// ============= 日志系统相关 =============

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 日志记录
 */
export interface LogRecord {
  /** 日志级别 */
  level: LogLevel
  /** 日志消息 */
  message: string
  /** 时间戳 */
  timestamp: Date
  /** 标签 */
  tag?: string
  /** 额外数据 */
  data?: any
}

/**
 * 日志条目
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel
  /** 日志消息 */
  message: string
  /** 时间戳 */
  timestamp: Date
  /** 日志器名称 */
  logger?: string
  /** 额外参数 */
  args?: any[]
}

/**
 * 日志器选项
 */
export interface LoggerOptions {
  /** 日志级别 */
  level?: LogLevel
  /** 是否启用静默模式 */
  silent?: boolean
  /** 是否显示时间戳 */
  timestamp?: boolean
  /** 是否启用颜色 */
  colors?: boolean
  /** 输出流 */
  output?: NodeJS.WriteStream
  /** 错误输出流 */
  errorOutput?: NodeJS.WriteStream
}

/**
 * 日志器接口
 */
export interface Logger {
  /** 调试日志 */
  debug(message: string, data?: any): void
  /** 信息日志 */
  info(message: string, data?: any): void
  /** 警告日志 */
  warn(message: string, data?: any): void
  /** 错误日志 */
  error(message: string, data?: any): void
  /** 成功日志 */
  success(message: string, data?: any): void
  /** 设置日志级别 */
  setLevel(level: LogLevel): void
  /** 添加标签 */
  withTag(tag: string): Logger
}

// ============= CLI相关 =============

/**
 * CLI命令选项
 */
export interface CliOptions {
  /** 配置文件路径 */
  config?: string
  /** 是否启用详细日志 */
  verbose?: boolean
  /** 是否启用静默模式 */
  silent?: boolean
}

/**
 * 监听选项
 */
export interface WatchOptions extends BuildOptions {
  /** 忽略的文件模式 */
  ignored?: string | string[]
  /** 延迟时间 */
  delay?: number
  /** 是否启用轮询 */
  usePolling?: boolean
  /** 轮询间隔 */
  interval?: number
}

/**
 * 初始化选项
 */
export interface InitOptions {
  /** 项目名称 */
  name?: string
  /** 模板类型 */
  template?: 'vue' | 'react' | 'vanilla'
  /** 是否使用TypeScript */
  typescript?: boolean
  /** 包管理器 */
  packageManager?: 'npm' | 'yarn' | 'pnpm'
  /** 是否强制覆盖 */
  force?: boolean
}

// 删除重复的 CliOptions 定义，保留上方定义

/**
 * 分析选项
 */
export interface AnalyzeOptions {
  /** 项目根目录 */
  root?: string
  /** 是否显示详细信息 */
  verbose?: boolean
  /** 输出格式 */
  format?: 'table' | 'json'
  /** 是否检查循环依赖 */
  checkCircular?: boolean
}

/**
 * CLI命令处理器
 */
export interface CommandHandler {
  /** 命令名称 */
  name: string
  /** 命令描述 */
  description: string
  /** 处理函数 */
  handler: (options: CliOptions) => Promise<void>
}
