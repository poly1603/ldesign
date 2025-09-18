/**
 * 配置相关类型定义
 */

import type {
  LogLevel,
  BuildMode,
  FilePath,
  ValidationResult,
  ConfigSchema,
  CacheOptions,
  WatchOptions,
  EnvironmentVariables,
  KeyValueMap
} from './common'
import type {
  LibraryType,
  TypeScriptLibraryConfig,
  VueLibraryConfig,
  VueJsxConfig,
  StyleLibraryConfig,
  LibraryBuildOptions
} from './library'
import type { OutputConfig, SourcemapType } from './output'
import type { PerformanceConfig } from './performance'
import type { UnifiedPlugin } from './plugin'
import type { PostBuildValidationConfig } from './validation'
import type { MinifyOptions } from './minify'

/**
 * 构建器主配置接口
 */
export interface BuilderConfig {
  /** 入口文件（可选；未提供时将根据策略自动发现或使用默认值） */
  input?: string | string[] | Record<string, string>

  /** 输出配置 */
  output?: OutputConfig

  /** 是否生成类型声明文件（顶层开关，具体格式可覆盖） */
  dts?: boolean

  /** 是否生成 sourcemap（顶层开关，具体格式可覆盖） */
  sourcemap?: SourcemapType

  /** 打包核心选择 */
  bundler?: 'rollup' | 'rolldown'

  /** 构建模式 */
  mode?: BuildMode

  /** 库类型（自动检测或手动指定） */
  libraryType?: LibraryType

  /** 是否启用 bundleless 模式 */
  bundleless?: boolean

  /** 外部依赖 */
  external?: string[] | ((id: string) => boolean)

  /** 全局变量映射 */
  globals?: Record<string, string>

  /** 排除的文件模式 */
  exclude?: string[]

  /** 插件配置 */
  plugins?: UnifiedPlugin[]

  /** 压缩配置 */
  minify?: boolean | MinifyOptions

  /** UMD 构建配置 */
  umd?: UMDConfig

  /** Babel 转换配置 */
  babel?: BabelConfig

  /** Banner 和 Footer 配置 */
  banner?: BannerConfig

  /** 是否清理输出目录 */
  clean?: boolean

  /** TypeScript 配置 */
  typescript?: TypeScriptLibraryConfig

  /** Vue 配置 */
  vue?: VueLibraryConfig

  /** Vue JSX 配置 */
  vueJsx?: VueJsxConfig

  /** 样式配置 */
  style?: StyleLibraryConfig

  /** 性能配置 */
  performance?: PerformanceConfig

  /** 调试配置 */
  debug?: boolean

  /** 环境特定配置 */
  env?: Record<string, Partial<BuilderConfig>>

  /** 缓存配置 */
  cache?: CacheOptions

  /** 监听配置 */
  watch?: WatchOptions

  /** 自定义环境变量 */
  define?: EnvironmentVariables

  /** 工作目录 */
  cwd?: FilePath

  /** 配置文件路径 */
  configFile?: FilePath

  /** 日志级别 */
  logLevel?: LogLevel

  /** 库构建选项 */
  library?: LibraryBuildOptions

  /** 打包后验证配置 */
  postBuildValidation?: PostBuildValidationConfig

  /** Package.json 自动更新配置 */
  packageUpdate?: PackageUpdateConfig
}

/**
 * 配置管理器选项
 */
export interface ConfigManagerOptions {
  /** 配置文件路径 */
  configFile?: string

  /** 是否监听配置文件变化 */
  watch?: boolean

  /** 配置验证模式 */
  schema?: ConfigSchema

  /** 是否在加载时验证 */
  validateOnLoad?: boolean

  /** 是否冻结配置 */
  freezeConfig?: boolean

  /** 日志记录器 */
  logger?: any

  /** 缓存目录 */
  cacheDir?: string

  /** 环境变量前缀 */
  envPrefix?: string
}

/**
 * 配置加载选项
 */
export interface ConfigLoadOptions {
  /** 配置文件路径 */
  configFile?: string

  /** 是否合并环境变量 */
  mergeEnv?: boolean

  /** 是否应用环境特定配置 */
  applyEnvConfig?: boolean

  /** 是否验证配置 */
  validate?: boolean

  /** 是否使用缓存 */
  useCache?: boolean

  /** 是否自动增强配置（自动检测 libraryType、external、globals 等） */
  autoEnhance?: boolean
}

/**
 * 配置合并选项
 */
export interface ConfigMergeOptions {
  /** 是否深度合并 */
  deep?: boolean

  /** 数组合并策略 */
  arrayMergeStrategy?: 'replace' | 'concat' | 'unique'

  /** 是否合并函数 */
  mergeFunctions?: boolean

  /** 自定义合并函数 */
  customMerger?: (target: any, source: any, key: string) => any
}

/**
 * 配置转换选项
 */
export interface ConfigTransformOptions {
  /** 目标格式 */
  target: 'rollup' | 'rolldown'

  /** 是否保留未知选项 */
  preserveUnknown?: boolean

  /** 是否启用兼容模式 */
  compatMode?: boolean

  /** 自定义转换器 */
  customTransformers?: Record<string, (value: any) => any>
}

/**
 * 配置验证选项
 */
export interface ConfigValidationOptions {
  /** 验证模式 */
  schema?: ConfigSchema

  /** 是否允许额外属性 */
  allowAdditionalProperties?: boolean

  /** 是否启用严格模式 */
  strict?: boolean

  /** 自定义验证器 */
  customValidators?: Record<string, (value: any) => ValidationResult>
}

/**
 * 配置文件类型
 */
export type ConfigFileType = 'ts' | 'js' | 'mjs' | 'json'

/**
 * 配置文件信息
 */
export interface ConfigFileInfo {
  /** 文件路径 */
  path: string

  /** 文件类型 */
  type: ConfigFileType

  /** 是否存在 */
  exists: boolean

  /** 最后修改时间 */
  mtime?: Date

  /** 文件大小 */
  size?: number
}

/**
 * 配置变化回调
 */
export type ConfigChangeCallback = (config: BuilderConfig, configPath: string) => Promise<void> | void

/**
 * 配置预设
 */
export interface ConfigPreset {
  /** 预设名称 */
  name: string

  /** 预设描述 */
  description?: string

  /** 预设配置 */
  config: Partial<BuilderConfig>

  /** 适用条件 */
  condition?: (projectInfo: any) => boolean

  /** 扩展的预设 */
  extends?: string[]
}

/**
 * 配置上下文
 */
export interface ConfigContext {
  /** 当前工作目录 */
  cwd: string

  /** 构建模式 */
  mode: BuildMode

  /** 打包器类型 */
  bundler: 'rollup' | 'rolldown'

  /** 环境变量 */
  env: EnvironmentVariables

  /** 命令行参数 */
  args: KeyValueMap

  /** 项目信息 */
  project?: any
}

/**
 * 配置函数类型
 */
export type ConfigFunction = (context: ConfigContext) => BuilderConfig | Promise<BuilderConfig>

/**
 * 配置定义类型
 */
export type ConfigDefinition = BuilderConfig | ConfigFunction

/**
 * 默认配置
 */
export interface DefaultConfig extends Required<Omit<BuilderConfig, 'env' | 'library'>> {
  env: Record<string, Partial<BuilderConfig>>
  library: Required<LibraryBuildOptions>
}

/**
 * 配置覆盖
 */
export type ConfigOverride = DeepPartial<BuilderConfig>

/**
 * 配置解析结果
 */
export interface ConfigResolveResult {
  /** 解析后的配置 */
  config: BuilderConfig

  /** 配置文件路径 */
  configFile?: string

  /** 配置来源 */
  sources: ConfigSource[]

  /** 验证结果 */
  validation?: ValidationResult
}

/**
 * 配置来源
 */
export interface ConfigSource {
  /** 来源类型 */
  type: 'default' | 'file' | 'env' | 'cli' | 'preset'

  /** 来源路径或名称 */
  source: string

  /** 优先级 */
  priority: number

  /** 配置内容 */
  config: Partial<BuilderConfig>
}

/**
 * UMD 构建配置
 */
export interface UMDConfig {
  /** 是否启用 UMD 构建 */
  enabled?: boolean

  /** UMD 入口文件（默认为 src/index.ts） */
  entry?: string

  /** UMD 全局变量名 */
  name?: string

  /** 是否为多入口项目强制生成 UMD */
  forceMultiEntry?: boolean

  /** UMD 输出文件名 */
  fileName?: string

  /** 外部依赖的全局变量映射 */
  globals?: Record<string, string>

  /** 是否压缩 UMD 文件 */
  minify?: boolean
}

/**
 * Babel 转换配置
 */
export interface BabelConfig {
  /** 是否启用 Babel 转换 */
  enabled?: boolean

  /** Babel 预设 */
  presets?: Array<string | [string, any]>

  /** Babel 插件 */
  plugins?: Array<string | [string, any]>

  /** 目标浏览器 */
  targets?: string | string[] | Record<string, string>

  /** 是否包含 polyfill */
  polyfill?: boolean | 'usage' | 'entry'

  /** 是否启用运行时转换 */
  runtime?: boolean

  /** 自定义 Babel 配置文件路径 */
  configFile?: string | false

  /** 是否忽略 .babelrc 文件 */
  babelrc?: boolean

  /** 排除转换的文件模式 */
  exclude?: string | RegExp | Array<string | RegExp>

  /** 包含转换的文件模式 */
  include?: string | RegExp | Array<string | RegExp>
}

/**
 * Banner 和 Footer 配置
 */
export interface BannerConfig {
  /** 代码前缀（banner） */
  banner?: string | (() => string | Promise<string>)

  /** 代码后缀（footer） */
  footer?: string | (() => string | Promise<string>)

  /** 模块前缀（intro） */
  intro?: string | (() => string | Promise<string>)

  /** 模块后缀（outro） */
  outro?: string | (() => string | Promise<string>)

  /** 是否自动生成版权信息 */
  copyright?: boolean | CopyrightConfig

  /** 是否包含构建信息 */
  buildInfo?: boolean | BuildInfoConfig
}

/**
 * 版权信息配置
 */
export interface CopyrightConfig {
  /** 版权所有者 */
  owner?: string

  /** 版权年份 */
  year?: string | number

  /** 许可证类型 */
  license?: string

  /** 自定义版权模板 */
  template?: string
}

/**
 * 构建信息配置
 */
export interface BuildInfoConfig {
  /** 是否包含版本号 */
  version?: boolean

  /** 是否包含构建时间 */
  buildTime?: boolean

  /** 是否包含构建环境 */
  environment?: boolean

  /** 是否包含 Git 信息 */
  git?: boolean

  /** 自定义构建信息模板 */
  template?: string
}

/**
 * Package.json 自动更新配置
 */
export interface PackageUpdateConfig {
  /** 是否启用 package.json 自动更新 */
  enabled?: boolean

  /** 源码目录，默认为 'src' */
  srcDir?: string

  /** 输出目录配置 */
  outputDirs?: {
    /** ESM 输出目录，默认为 'es' */
    esm?: string
    /** CJS 输出目录，默认为 'lib' */
    cjs?: string
    /** UMD 输出目录，默认为 'dist' */
    umd?: string
    /** 类型声明目录，默认为 'types' 或与 esm 相同 */
    types?: string
  }

  /** 是否启用自动 exports 生成，默认为 true */
  autoExports?: boolean

  /** 是否更新 main/module/types 字段，默认为 true */
  updateEntryPoints?: boolean

  /** 是否更新 files 字段，默认为 true */
  updateFiles?: boolean

  /** 自定义 exports 配置 */
  customExports?: Record<string, any>
}

/**
 * 深度部分类型
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
