/**
 * 适配器相关类型定义
 */

import type { BuildResult, BuildWatcher } from './builder'
import type { PerformanceMetrics } from './performance'
import type { UnifiedPlugin, PluginBuild } from './plugin'
import type { WatchOptions } from './common'

/**
 * 打包器功能枚举
 */
export enum BundlerFeature {
  TREE_SHAKING = 'treeshaking',
  CODE_SPLITTING = 'code-splitting',
  DYNAMIC_IMPORT = 'dynamic-import',
  WORKER_SUPPORT = 'worker-support',
  CSS_BUNDLING = 'css-bundling',
  ASSET_PROCESSING = 'asset-processing',
  SOURCEMAP = 'sourcemap',
  MINIFICATION = 'minification',
  HOT_RELOAD = 'hot-reload',
  MODULE_FEDERATION = 'module-federation',
  INCREMENTAL_BUILD = 'incremental-build',
  PARALLEL_BUILD = 'parallel-build',
  CACHE_SUPPORT = 'cache-support',
  PLUGIN_SYSTEM = 'plugin-system',
  CONFIG_FILE = 'config-file'
}

/**
 * 功能支持映射
 */
export type FeatureSupportMap = Record<BundlerFeature, boolean>

/**
 * 统一配置接口
 */
export interface UnifiedConfig {
  // 基础配置
  input: string | string[] | Record<string, string>
  output: UnifiedOutputConfig

  // 外部依赖
  external?: string[] | ((id: string) => boolean)
  globals?: Record<string, string>

  // 插件配置
  plugins?: UnifiedPlugin[]

  // 优化配置
  treeshake?: boolean | TreeshakeOptions
  minify?: boolean | BaseMinifyOptions

  // 开发配置
  sourcemap?: boolean | 'inline' | 'hidden'
  watch?: boolean | WatchOptions

  // 平台配置 (Rolldown 特有)
  platform?: 'browser' | 'node' | 'neutral'

  // 模块格式
  format?: OutputFormat | OutputFormat[]

  // 代码分割
  manualChunks?: Record<string, string[]> | ((id: string) => string | void)

  // 其他选项
  [key: string]: any
}

/**
 * 统一输出配置
 */
export interface UnifiedOutputConfig {
  dir?: string
  file?: string
  format?: OutputFormat | OutputFormat[]
  name?: string
  fileName?: string | ((chunkInfo: ChunkInfo) => string)
  chunkFileNames?: string
  assetFileNames?: string
  sourcemap?: boolean | 'inline' | 'hidden'
  globals?: Record<string, string>
  banner?: string | (() => string | Promise<string>)
  footer?: string | (() => string | Promise<string>)
  intro?: string | (() => string | Promise<string>)
  outro?: string | (() => string | Promise<string>)
}

/**
 * 输出格式
 */
export type OutputFormat = 'esm' | 'cjs' | 'umd' | 'iife' | 'css'

/**
 * Chunk 信息
 */
export interface ChunkInfo {
  isEntry: boolean
  isDynamicEntry: boolean
  name: string
  moduleIds: string[]
  imports: string[]
  dynamicImports: string[]
  exports: string[]
  referencedFiles: string[]
  type: 'chunk' | 'asset'
  fileName: string
  preliminaryFileName: string
}

/**
 * Tree Shaking 选项
 */
export interface TreeshakeOptions {
  annotations?: boolean
  moduleSideEffects?: boolean | string[] | ((id: string) => boolean)
  propertyReadSideEffects?: boolean
  tryCatchDeoptimization?: boolean
  unknownGlobalSideEffects?: boolean
}

/**
 * 基础压缩选项（用于适配器）
 */
export interface BaseMinifyOptions {
  compress?: any
  mangle?: any
  format?: any
  sourceMap?: any
}

// WatchOptions 已在 common.ts 中定义，这里导入
export type { WatchOptions } from './common'

// UnifiedPlugin 已在 plugin.ts 中定义，这里导入
export type { UnifiedPlugin } from './plugin'

// PluginBuild 已在 plugin.ts 中定义，这里导入
export type { PluginBuild } from './plugin'

// RollupPluginConfig 已在 plugin.ts 中定义，这里导入
export type { RollupPluginConfig } from './plugin'

// RolldownPluginConfig 已在 plugin.ts 中定义，这里导入
export type { RolldownPluginConfig } from './plugin'

/**
 * 打包核心适配器接口
 */
export interface IBundlerAdapter {
  /** 适配器名称 */
  readonly name: 'rollup' | 'rolldown'

  /** 适配器版本 */
  readonly version: string

  /** 是否可用 */
  readonly available: boolean

  // 核心构建方法
  build(config: UnifiedConfig): Promise<BuildResult>
  watch(config: UnifiedConfig): Promise<BuildWatcher>

  // 配置转换
  transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig>

  // 插件处理
  transformPlugins(plugins: UnifiedPlugin[]): Promise<BundlerSpecificPlugin[]>

  // 功能检测
  supportsFeature(feature: BundlerFeature): boolean
  getFeatureSupport(): FeatureSupportMap

  // 性能监控
  getPerformanceMetrics(): PerformanceMetrics

  // 生命周期钩子
  onBuildStart?(config: UnifiedConfig): Promise<void> | void
  onBuildEnd?(result: BuildResult): Promise<void> | void
  onError?(error: Error): Promise<void> | void

  // 资源清理
  dispose(): Promise<void>
}

/**
 * 打包器特定配置
 */
export type BundlerSpecificConfig = RollupOptions | RolldownOptions

/**
 * Rollup 配置选项
 */
export interface RollupOptions {
  input: string | string[] | Record<string, string>
  output?: RollupOutputOptions | RollupOutputOptions[]
  external?: string[] | ((id: string) => boolean)
  plugins?: RollupPlugin[]
  treeshake?: boolean | TreeshakeOptions
  watch?: RollupWatchOptions
  [key: string]: any
}

/**
 * Rollup 输出选项
 */
export interface RollupOutputOptions {
  dir?: string
  file?: string
  format?: RollupFormat
  name?: string
  globals?: Record<string, string>
  sourcemap?: boolean | 'inline' | 'hidden'
  entryFileNames?: string | ((chunkInfo: any) => string)
  chunkFileNames?: string
  assetFileNames?: string
  banner?: string | (() => string | Promise<string>)
  footer?: string | (() => string | Promise<string>)
  intro?: string | (() => string | Promise<string>)
  outro?: string | (() => string | Promise<string>)
  [key: string]: any
}

/**
 * Rollup 格式
 */
export type RollupFormat = 'es' | 'cjs' | 'umd' | 'iife' | 'system' | 'amd'

/**
 * Rollup 监听选项
 */
export interface RollupWatchOptions extends Omit<RollupOptions, 'watch'> {
  watch?: {
    include?: string | string[]
    exclude?: string | string[]
    chokidar?: any
    buildDelay?: number
    clearScreen?: boolean
  }
}

/**
 * Rollup 插件
 */
export interface RollupPlugin {
  name: string
  buildStart?: (opts: any) => void | Promise<void>
  resolveId?: (id: string, importer?: string) => string | null | Promise<string | null>
  load?: (id: string) => string | null | Promise<string | null>
  transform?: (code: string, id: string) => any | Promise<any>
  generateBundle?: (opts: any, bundle: any) => void | Promise<void>
  writeBundle?: (opts: any, bundle: any) => void | Promise<void>
  [key: string]: any
}

/**
 * Rolldown 配置选项
 */
export interface RolldownOptions {
  input: string | string[] | Record<string, string>
  output?: RolldownOutputOptions
  external?: string[] | ((id: string) => boolean)
  plugins?: RolldownPlugin[]
  treeshake?: boolean | TreeshakeOptions
  platform?: 'browser' | 'node' | 'neutral'
  watch?: boolean | WatchOptions
  [key: string]: any
}

/**
 * Rolldown 输出选项
 */
export interface RolldownOutputOptions {
  dir?: string
  file?: string
  format?: RolldownFormat
  name?: string
  globals?: Record<string, string>
  sourcemap?: boolean | 'inline' | 'hidden'
  entryFileNames?: string
  chunkFileNames?: string
  assetFileNames?: string
  banner?: string | (() => string | Promise<string>)
  footer?: string | (() => string | Promise<string>)
  intro?: string | (() => string | Promise<string>)
  outro?: string | (() => string | Promise<string>)
  [key: string]: any
}

/**
 * Rolldown 格式
 */
export type RolldownFormat = 'esm' | 'cjs' | 'umd' | 'iife'

/**
 * Rolldown 插件
 */
export interface RolldownPlugin {
  name: string
  setup?: (build: PluginBuild) => void | Promise<void>
  [key: string]: any
}

/**
 * 打包器特定插件
 */
export type BundlerSpecificPlugin = RollupPlugin | RolldownPlugin

/**
 * 适配器选项
 */
export interface AdapterOptions {
  logger: any
  performanceMonitor: any
  cacheDir?: string
  tempDir?: string
}

/**
 * 配置转换器接口
 */
export interface ConfigTransformer {
  transform(config: UnifiedConfig): BundlerSpecificConfig
}

/**
 * 插件转换器接口
 */
export interface PluginTransformer {
  transform(plugins: UnifiedPlugin[]): BundlerSpecificPlugin[]
}

/**
 * 结果转换器接口
 */
export interface ResultTransformer {
  transform(result: any, context: TransformContext): BuildResult
  transformWatcher(watcher: any, context: TransformContext): BuildWatcher
}

/**
 * 转换上下文
 */
export interface TransformContext {
  bundler: string
  config: UnifiedConfig
  duration?: number
  [key: string]: any
}

// PerformanceComparison 已在 performance.ts 中定义，这里导入
export type { PerformanceComparison } from './performance'

/**
 * 性能结果
 */
export interface PerformanceResult {
  adapter: string
  buildTime: number
  memoryUsage: number
  bundleSize: number
  success: boolean
  error?: string
  features: FeatureSupportMap
}

/**
 * 对比报告
 */
export interface ComparisonReport {
  buildTimeComparison: any
  memorySizeComparison: any
  bundleSizeComparison: any
  featureComparison: any
}
