/**
 * 策略相关类型定义
 */

import type { BuilderConfig } from './config'
import type { UnifiedConfig, UnifiedPlugin } from './adapter'
import type { LibraryType, DetectionEvidence } from './library'
import type { ProjectInfo, DependencyInfo } from './common'

/**
 * 库构建策略接口
 */
export interface ILibraryStrategy {
  /** 策略名称 */
  readonly name: string

  /** 支持的库类型 */
  readonly supportedTypes: LibraryType[]

  /** 策略优先级 */
  readonly priority: number

  /** 应用策略 */
  applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>

  /** 检测是否适用 */
  isApplicable(config: BuilderConfig): boolean | Promise<boolean>

  /** 获取默认配置 */
  getDefaultConfig(): Partial<BuilderConfig>

  /** 获取推荐插件 */
  getRecommendedPlugins(config: BuilderConfig): UnifiedPlugin[]

  /** 验证配置 */
  validateConfig(config: BuilderConfig): StrategyValidationResult

  /** 优化配置 */
  optimizeConfig?(config: BuilderConfig): Promise<BuilderConfig>
}

/**
 * 策略验证结果
 */
export interface StrategyValidationResult {
  /** 是否有效 */
  valid: boolean

  /** 错误信息 */
  errors: string[]

  /** 警告信息 */
  warnings: string[]

  /** 建议 */
  suggestions: string[]
}

/**
 * 策略上下文
 */
export interface StrategyContext {
  /** 项目根目录 */
  projectRoot: string

  /** 构建模式 */
  mode: 'development' | 'production'

  /** 目标平台 */
  platform: 'browser' | 'node' | 'neutral'

  /** 环境变量 */
  env: Record<string, string>

  /** 项目信息 */
  projectInfo: ProjectInfo

  /** 依赖信息 */
  dependencies: DependencyInfo[]
}

// ProjectInfo 已在 common.ts 中定义，这里导入
export type { ProjectInfo } from './common'

/**
 * 框架信息
 */
export interface FrameworkInfo {
  /** 框架名称 */
  name: string

  /** 框架版本 */
  version: string

  /** 框架类型 */
  type: 'ui' | 'backend' | 'fullstack' | 'utility'

  /** 相关插件 */
  plugins: string[]
}

// DependencyInfo 已在 common.ts 中定义，这里导入
export type { DependencyInfo } from './common'

/**
 * 策略选项
 */
export interface StrategyOptions {
  /** 是否启用优化 */
  optimize?: boolean

  /** 是否启用缓存 */
  cache?: boolean

  /** 自定义插件 */
  customPlugins?: UnifiedPlugin[]

  /** 排除的插件 */
  excludePlugins?: string[]

  /** 插件选项覆盖 */
  pluginOptions?: Record<string, any>

  /** 是否启用实验性功能 */
  experimental?: boolean
}

/**
 * TypeScript 策略选项
 */
export interface TypeScriptStrategyOptions extends StrategyOptions {
  /** TypeScript 配置文件路径 */
  tsconfig?: string

  /** 是否生成声明文件 */
  declaration?: boolean

  /** 声明文件输出目录 */
  declarationDir?: string

  /** 是否启用 isolatedDeclarations */
  isolatedDeclarations?: boolean

  /** 是否启用增量编译 */
  incremental?: boolean

  /** 是否启用复合项目 */
  composite?: boolean

  /** 引用的项目 */
  references?: string[]
}

/**
 * Vue 策略选项
 */
export interface VueStrategyOptions extends StrategyOptions {
  /** Vue 版本 */
  version?: 2 | 3

  /** 是否启用 JSX */
  jsx?: boolean

  /** 是否支持按需加载 */
  onDemand?: boolean

  /** 编译器选项 */
  compilerOptions?: VueCompilerOptions

  /** 模板选项 */
  templateOptions?: VueTemplateOptions

  /** 样式选项 */
  styleOptions?: VueStyleOptions
}

/**
 * Vue 编译器选项
 */
export interface VueCompilerOptions {
  /** 是否为生产环境 */
  isProduction?: boolean

  /** 自定义元素判断 */
  isCustomElement?: (tag: string) => boolean

  /** 空白字符处理 */
  whitespace?: 'preserve' | 'condense'

  /** 是否保留注释 */
  comments?: boolean

  /** 指令转换 */
  directiveTransforms?: Record<string, any>
}

/**
 * Vue 模板选项
 */
export interface VueTemplateOptions {
  /** 是否预编译模板 */
  precompile?: boolean

  /** 模板编译器 */
  compiler?: 'vue' | 'vue-tsc'

  /** 模板语言 */
  lang?: 'html' | 'pug'

  /** 模板选项 */
  compilerOptions?: Record<string, any>
}

/**
 * Vue 样式选项
 */
export interface VueStyleOptions {
  /** 预处理器 */
  preprocessor?: 'less' | 'scss' | 'sass' | 'stylus'

  /** 是否启用 CSS 模块 */
  modules?: boolean

  /** 是否启用 scoped 样式 */
  scoped?: boolean

  /** 样式变量文件 */
  variablesFile?: string
}

/**
 * 样式策略选项
 */
export interface StyleStrategyOptions extends StrategyOptions {
  /** 预处理器类型 */
  preprocessor?: 'less' | 'scss' | 'sass' | 'stylus' | 'postcss'

  /** 是否提取 CSS */
  extract?: boolean

  /** 是否压缩 CSS */
  minify?: boolean

  /** 是否启用 autoprefixer */
  autoprefixer?: boolean

  /** 是否启用 CSS 模块 */
  modules?: boolean

  /** PostCSS 插件 */
  postcssPlugins?: any[]

  /** 浏览器兼容性 */
  browserslist?: string | string[]
}

/**
 * 混合策略选项
 */
export interface MixedStrategyOptions extends StrategyOptions {
  /** 主要策略 */
  primaryStrategy: LibraryType

  /** 次要策略 */
  secondaryStrategies: LibraryType[]

  /** 策略权重 */
  strategyWeights?: Record<LibraryType, number>

  /** 策略特定选项 */
  strategyOptions?: {
    typescript?: TypeScriptStrategyOptions
    vue?: VueStrategyOptions
    style?: StyleStrategyOptions
  }
}

/**
 * 策略应用结果
 */
export interface StrategyApplicationResult {
  /** 应用的策略 */
  strategy: ILibraryStrategy

  /** 生成的配置 */
  config: UnifiedConfig

  /** 应用的插件 */
  plugins: UnifiedPlugin[]

  /** 应用时间 */
  duration: number

  /** 警告信息 */
  warnings: string[]

  /** 优化建议 */
  optimizations: string[]
}

/**
 * 策略管理器选项
 */
export interface StrategyManagerOptions {
  /** 默认策略 */
  defaultStrategy?: LibraryType

  /** 策略优先级 */
  strategyPriority?: Record<LibraryType, number>

  /** 是否启用自动检测 */
  autoDetection?: boolean

  /** 自定义策略 */
  customStrategies?: ILibraryStrategy[]

  /** 策略缓存 */
  cache?: boolean

  /** 缓存目录 */
  cacheDir?: string
}

/**
 * 策略检测结果
 */
export interface StrategyDetectionResult {
  /** 检测到的策略 */
  strategy: LibraryType

  /** 置信度 */
  confidence: number

  /** 检测依据 */
  evidence: DetectionEvidence[]

  /** 备选策略 */
  alternatives: Array<{
    strategy: LibraryType
    confidence: number
  }>
}

// DetectionEvidence 已在 library.ts 中定义，这里导入
export type { DetectionEvidence } from './library'

/**
 * 策略性能指标
 */
export interface StrategyPerformanceMetrics {
  /** 策略名称 */
  strategy: string

  /** 应用时间 */
  applicationTime: number

  /** 配置生成时间 */
  configGenerationTime: number

  /** 插件解析时间 */
  pluginResolutionTime: number

  /** 验证时间 */
  validationTime: number

  /** 内存使用 */
  memoryUsage: number

  /** 缓存命中率 */
  cacheHitRate: number
}

/**
 * 策略对比结果
 */
export interface StrategyComparisonResult {
  /** 对比的策略 */
  strategies: LibraryType[]

  /** 性能对比 */
  performance: Record<LibraryType, StrategyPerformanceMetrics>

  /** 功能对比 */
  features: Record<LibraryType, string[]>

  /** 推荐策略 */
  recommended: LibraryType

  /** 推荐理由 */
  reason: string
}
