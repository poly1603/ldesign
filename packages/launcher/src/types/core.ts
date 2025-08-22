/**
 * @fileoverview 核心类型定义
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type { InlineConfig, ViteDevServer, PluginOption } from 'vite'

/**
 * 基础枚举类型
 */

/** 日志级别枚举 */
export type LogLevel = 'error' | 'warn' | 'info' | 'silent'

/** 运行模式枚举 */
export type RunMode = 'development' | 'production' | 'test'

/** 前端框架类型枚举 */
export type FrameworkType = 
  | 'vue2' 
  | 'vue3' 
  | 'react' 
  | 'svelte' 
  | 'lit' 
  | 'angular'
  | 'vanilla' 
  | 'vanilla-ts'

/** 项目类型枚举（更详细的分类） */
export type ProjectType = 
  | FrameworkType 
  | 'react-next' 
  | 'unknown'

/** CSS预处理器类型枚举 */
export type CSSPreprocessor = 'sass' | 'less' | 'stylus' | 'postcss'

/** 包管理器类型枚举 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

/** 构建工具类型枚举 */
export type BuildTool = 'vite' | 'webpack' | 'rollup' | 'parcel'

/**
 * 核心配置接口
 */

/** 启动器配置选项接口 */
export interface LauncherOptions {
  /** 项目根目录路径 */
  readonly root?: string
  /** 运行模式 */
  readonly mode?: RunMode
  /** 日志级别 */
  readonly logLevel?: LogLevel
  /** Vite配置文件路径，false表示不使用配置文件 */
  readonly configFile?: string | false
  /** 自定义插件列表 */
  readonly plugins?: readonly PluginOption[]
  /** 是否启用自动项目类型检测 */
  readonly autoDetect?: boolean
  /** 强制指定项目类型，跳过自动检测 */
  readonly forceFramework?: FrameworkType
  /** 是否启用性能监控 */
  readonly enablePerformanceMonitoring?: boolean
  /** 自定义环境变量 */
  readonly env?: Readonly<Record<string, string>>
}

/** 开发服务器配置选项接口 */
export interface DevOptions {
  /** 服务器端口号 */
  readonly port?: number
  /** 服务器主机地址 */
  readonly host?: string | boolean
  /** 是否自动打开浏览器 */
  readonly open?: boolean | string
  /** 是否启用HTTPS */
  readonly https?: boolean
  /** 代理配置 */
  readonly proxy?: Readonly<Record<string, string | object>>
  /** CORS配置 */
  readonly cors?: boolean | object
  /** 是否启用HMR */
  readonly hmr?: boolean | object
  /** 中间件配置 */
  readonly middlewareMode?: boolean | 'html' | 'ssr'
}

/** 构建配置选项接口 */
export interface BuildOptions {
  /** 输出目录 */
  readonly outDir?: string
  /** 是否压缩代码 */
  readonly minify?: boolean | 'terser' | 'esbuild'
  /** 是否生成sourcemap */
  readonly sourcemap?: boolean | 'inline' | 'hidden'
  /** 是否清空输出目录 */
  readonly emptyOutDir?: boolean
  /** 构建目标 */
  readonly target?: string | readonly string[]
  /** 是否生成构建报告 */
  readonly reportCompressedSize?: boolean
  /** 是否生成分析报告 */
  readonly analyzeBundle?: boolean
  /** 资源内联阈值 */
  readonly assetsInlineLimit?: number
}

/** 预览服务器配置选项接口 */
export interface PreviewOptions {
  /** 服务器端口号 */
  readonly port?: number
  /** 服务器主机地址 */
  readonly host?: string | boolean
  /** 是否自动打开浏览器 */
  readonly open?: boolean | string
  /** 是否启用HTTPS */
  readonly https?: boolean
  /** 代理配置 */
  readonly proxy?: Readonly<Record<string, string | object>>
  /** CORS配置 */
  readonly cors?: boolean | object
  /** 输出目录 */
  readonly outDir?: string
  /** 静态文件服务配置 */
  readonly staticOptions?: object
}

/**
 * 项目信息接口
 */

/** 项目基础信息接口 */
export interface ProjectInfo {
  /** 项目名称 */
  readonly name: string
  /** 项目版本 */
  readonly version: string
  /** 前端框架类型 */
  readonly framework: FrameworkType
  /** 是否使用TypeScript */
  readonly typescript: boolean
  /** CSS预处理器 */
  readonly cssPreprocessor?: CSSPreprocessor
  /** 包管理器类型 */
  readonly packageManager: PackageManager
  /** 项目依赖列表 */
  readonly dependencies: readonly string[]
  /** 开发依赖列表 */
  readonly devDependencies: readonly string[]
  /** 检测置信度 (0-1) */
  readonly confidence: number
  /** 项目根目录路径 */
  readonly rootPath: string
  /** 项目描述 */
  readonly description?: string
}

/** 项目统计信息接口 */
export interface ProjectStats {
  /** 源码文件数量 */
  readonly sourceFileCount: number
  /** 测试文件数量 */
  readonly testFileCount: number
  /** 资源文件数量 */
  readonly assetFileCount: number
  /** 项目总大小（字节） */
  readonly totalSize: number
  /** 代码行数 */
  readonly linesOfCode: number
  /** 最后修改时间 */
  readonly lastModified: Date
}

/**
 * 构建结果接口
 */

/** 构建统计信息接口 */
export interface BuildStats {
  /** 入口文件数量 */
  readonly entryCount: number
  /** 模块数量 */
  readonly moduleCount: number
  /** 资源文件数量 */
  readonly assetCount: number
  /** 代码分割块数量 */
  readonly chunkCount: number
  /** 构建产物总大小（字节） */
  readonly totalSize: number
  /** 压缩前大小（字节） */
  readonly originalSize: number
  /** 压缩比例 */
  readonly compressionRatio: number
}

/** 构建结果接口 */
export interface BuildResult {
  /** 构建是否成功 */
  readonly success: boolean
  /** 输出文件列表 */
  readonly outputFiles: readonly string[]
  /** 构建耗时（毫秒） */
  readonly duration: number
  /** 构建产物总大小（字节） */
  readonly size: number
  /** 错误信息列表 */
  readonly errors?: readonly string[]
  /** 警告信息列表 */
  readonly warnings?: readonly string[]
  /** 构建统计信息 */
  readonly stats?: BuildStats
  /** 构建开始时间 */
  readonly startTime: Date
  /** 构建结束时间 */
  readonly endTime: Date
}

/**
 * 性能监控接口
 */

/** 性能指标接口 */
export interface PerformanceMetrics {
  /** 启动时间（毫秒） */
  readonly startupTime: number
  /** 内存使用量（字节） */
  readonly memoryUsage: number
  /** CPU使用率（百分比） */
  readonly cpuUsage: number
  /** 文件变更检测时间（毫秒） */
  readonly fileWatchTime: number
  /** 热更新时间（毫秒） */
  readonly hmrTime: number
}

/** 性能监控配置接口 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  readonly enabled: boolean
  /** 采样间隔（毫秒） */
  readonly sampleInterval: number
  /** 是否记录详细日志 */
  readonly verbose: boolean
  /** 性能报告输出路径 */
  readonly reportPath?: string
}

/**
 * 通用工具类型
 */

/** 深度只读类型 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/** 可选键类型 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** 必需键类型 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/** 非空类型 */
export type NonNullable<T> = T extends null | undefined ? never : T

/** 函数类型提取 */
export type FunctionType<T> = T extends (...args: infer A) => infer R ? (...args: A) => R : never

/** 异步函数返回类型 */
export type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer U> ? U : never