/**
 * 输出相关类型定义
 */

// 导入已在其他文件中定义的类型
import type { OutputFormat, ChunkInfo } from './adapter'
import type { OptimizationSuggestion } from './library'
import type { MinifyConfig } from './performance'

// 重新导出以供其他模块使用
export type { OutputFormat, ChunkInfo, OptimizationSuggestion, MinifyConfig }

/**
 * 构建输出文件信息 - 用于替代 any 类型
 */
export interface BuildOutput {
  /** 文件名 */
  fileName: string
  /** 文件大小（字节） */
  size: number
  /** 文件源码内容 */
  source?: string
  /** 输出类型 */
  type: 'chunk' | 'asset'
  /** 模块格式 */
  format?: OutputFormat
  /** 是否为入口文件 */
  isEntry?: boolean
  /** 依赖的模块 */
  imports?: string[]
  /** 导出的内容 */
  exports?: string[]
}

/**
 * Sourcemap 类型
 */
export type SourcemapType = boolean | 'inline' | 'hidden'

/**
 * 格式特定的输出配置
 */
export interface FormatOutputConfig {
  /** 输出目录 */
  dir?: string

  /** 输入文件（支持字符串、数组、通配符） */
  input?: string | string[] | Record<string, string>

  /** 输出格式 */
  format?: OutputFormat

  /** 是否保留目录结构 */
  preserveStructure?: boolean

  /** 是否生成类型声明文件 */
  dts?: boolean

  /** 是否生成 sourcemap */
  sourcemap?: SourcemapType

  /** 导出模式 */
  exports?: 'auto' | 'default' | 'named' | 'none'

  /** 压缩配置 */
  minify?: boolean | MinifyConfig

  /** 文件名模式 */
  fileName?: string | ((chunkInfo: ChunkInfo) => string)

  /** 资源文件名模式 */
  assetFileNames?: string | ((assetInfo: any) => string)

  /** 代码块文件名模式 */
  chunkFileNames?: string | ((chunkInfo: ChunkInfo) => string)

  /** 入口文件名模式 */
  entryFileNames?: string | ((chunkInfo: ChunkInfo) => string)

  /** 全局变量映射 */
  globals?: Record<string, string>

  /** 库名称（UMD/IIFE 格式需要） */
  name?: string
}

/**
 * 输出配置
 */
export interface OutputConfig {
  /** 输出目录 */
  dir?: string

  /** 输出文件（单文件输出时使用） */
  file?: string

  /** 输出格式 */
  format?: OutputFormat | OutputFormat[]

  /** ESM 格式特定配置（true 使用默认配置，false 禁用） */
  esm?: boolean | FormatOutputConfig

  /** CommonJS 格式特定配置（true 使用默认配置，false 禁用） */
  cjs?: boolean | FormatOutputConfig

  /** UMD 格式特定配置（true 使用默认配置，false 禁用） */
  umd?: boolean | (FormatOutputConfig & {
    /** 全局变量名 */
    name?: string
    /** 全局变量映射 */
    globals?: Record<string, string>
  })

  /** 库名称（UMD/IIFE 格式需要） */
  name?: string

  /** 文件名模式 */
  fileName?: string | ((chunkInfo: ChunkInfo) => string)

  /** 是否生成 sourcemap */
  sourcemap?: SourcemapType

  /** 代码分割配置 */
  manualChunks?: Record<string, string[]> | ((id: string) => string | void)

  /** chunk 文件名模式 */
  chunkFileNames?: string

  /** 资源文件名模式 */
  assetFileNames?: string

  /** 全局变量映射（UMD 格式使用） */
  globals?: Record<string, string>

  /** 代码前缀 */
  banner?: string | (() => string | Promise<string>)

  /** 代码后缀 */
  footer?: string | (() => string | Promise<string>)

  /** 模块前缀 */
  intro?: string | (() => string | Promise<string>)

  /** 模块后缀 */
  outro?: string | (() => string | Promise<string>)

  /** 是否保留模块结构 */
  preserveModules?: boolean

  /** 保留模块根目录 */
  preserveModulesRoot?: string

  /** 是否启用严格模式 */
  strict?: boolean

  /** 导出模式 */
  exports?: 'auto' | 'default' | 'named' | 'none'

  /** 外部导入的处理方式 */
  externalLiveBindings?: boolean

  /** 是否冻结命名空间 */
  freeze?: boolean

  /** 缩进字符 */
  indent?: string | boolean

  /** 命名空间分隔符 */
  namespaceToStringTag?: boolean

  /** 是否优先使用 const */
  preferConst?: boolean

  /** 是否启用 interop */
  interop?: 'auto' | 'esModule' | 'default' | 'defaultOnly' | false

  /** 系统 JS 配置 */
  systemNullSetters?: boolean

  /** 是否验证 */
  validate?: boolean

  /** 压缩配置 */
  minify?: boolean | MinifyConfig

  /** 压缩后的文件后缀 */
  minifySuffix?: string
}

// ChunkInfo 已在文件开头导入，这里不需要重复导入

/**
 * 输出文件信息
 */
export interface OutputFile {
  /** 文件名 */
  fileName: string

  /** 文件类型 */
  type: 'chunk' | 'asset'

  /** 文件内容 */
  source: string | Uint8Array

  /** 文件大小（字节） */
  size: number

  /** 压缩后大小 */
  gzipSize?: number

  /** Brotli 压缩后大小 */
  brotliSize?: number

  /** 是否为入口文件 */
  isEntry?: boolean

  /** 是否为动态导入 */
  isDynamicEntry?: boolean

  /** 导入的文件 */
  imports?: string[]

  /** 动态导入的文件 */
  dynamicImports?: string[]

  /** 导出的变量 */
  exports?: string[]

  /** 模块列表 */
  modules?: ModuleInfo[]

  /** sourcemap */
  map?: SourceMap
}

/**
 * 模块信息
 */
export interface ModuleInfo {
  /** 模块 ID */
  id: string

  /** 模块大小 */
  size: number

  /** 渲染后大小 */
  renderedLength: number

  /** 原始大小 */
  originalLength: number

  /** 是否为入口模块 */
  isEntry: boolean

  /** 是否为外部模块 */
  isExternal: boolean

  /** 导入的模块 */
  importedIds: string[]

  /** 动态导入的模块 */
  dynamicallyImportedIds: string[]

  /** 导入该模块的模块 */
  importers: string[]

  /** 动态导入该模块的模块 */
  dynamicImporters: string[]
}

/**
 * SourceMap 信息
 */
export interface SourceMap {
  /** 版本 */
  version: number

  /** 源文件列表 */
  sources: string[]

  /** 源文件内容 */
  sourcesContent?: (string | null)[]

  /** 名称列表 */
  names: string[]

  /** 映射信息 */
  mappings: string

  /** 文件名 */
  file?: string

  /** 源根目录 */
  sourceRoot?: string
}



/**
 * 大小信息
 */
export interface SizeInfo {
  /** 原始大小 */
  raw: number

  /** Gzip 压缩后大小 */
  gzip: number

  /** Brotli 压缩后大小 */
  brotli: number

  /** 按文件类型分组的大小 */
  byType: Record<string, number>

  /** 按格式分组的大小 */
  byFormat: Record<OutputFormat, number>

  /** 最大文件 */
  largest: {
    file: string
    size: number
  }

  /** 总文件数 */
  fileCount: number
}

/**
 * 构建统计信息
 */
export interface BuildStats {
  /** 构建时间 */
  buildTime: number

  /** 文件数量 */
  fileCount: number

  /** 总大小 */
  totalSize: SizeInfo

  /** 按格式分组的统计 */
  byFormat: Record<OutputFormat, {
    fileCount: number
    size: SizeInfo
  }>

  /** 模块统计 */
  modules: {
    total: number
    external: number
    internal: number
    largest: ModuleInfo
  }

  /** 依赖统计 */
  dependencies: {
    total: number
    external: string[]
    bundled: string[]
    circular: string[][]
  }
}

/**
 * 输出分析结果
 */
export interface OutputAnalysis {
  /** 构建统计 */
  stats: BuildStats

  /** 性能指标 */
  performance: {
    /** 构建速度 */
    buildSpeed: number

    /** 内存使用 */
    memoryUsage: number

    /** 缓存命中率 */
    cacheHitRate: number
  }

  /** 优化建议 */
  optimizations: OptimizationSuggestion[]

  /** 警告信息 */
  warnings: string[]

  /** 错误信息 */
  errors: string[]
}

// OptimizationSuggestion 已在文件开头导入，这里不需要重复导入
