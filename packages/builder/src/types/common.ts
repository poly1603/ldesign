/**
 * 通用类型定义
 */

/**
 * 日志级别
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'verbose'

/**
 * 构建模式
 */
export type BuildMode = 'development' | 'production'

/**
 * 文件路径类型
 */
export type FilePath = string

/**
 * 可选文件路径类型
 */
export type OptionalFilePath = string | undefined

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
  /** 警告信息列表 */
  warnings: string[]
}

/**
 * 配置模式定义
 */
export interface ConfigSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  [key: string]: any
}

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>

/**
 * 错误信息
 */
export interface ErrorInfo {
  code: string
  message: string
  stack?: string
  suggestion?: string
}

/**
 * 警告信息
 */
export interface WarningInfo {
  code: string
  message: string
  suggestion?: string
}

/**
 * 文件信息
 */
export interface FileInfo {
  path: string
  size: number
  type: string
  content?: string
}

/**
 * 依赖信息
 */
export interface DependencyInfo {
  name: string
  version: string
  type: 'dependency' | 'devDependency' | 'peerDependency'
  optional?: boolean
}

/**
 * 项目信息
 */
export interface ProjectInfo {
  name: string
  version: string
  description?: string
  dependencies: DependencyInfo[]
  framework?: string
  typescript?: boolean
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  enabled?: boolean
  dir?: string
  maxAge?: number
  maxSize?: number
}

/**
 * 监听选项
 */
export interface WatchOptions {
  include?: string | string[]
  exclude?: string | string[]
  ignored?: string | string[]
  persistent?: boolean
  ignoreInitial?: boolean
  followSymlinks?: boolean
  cwd?: string
  disableGlobbing?: boolean
  usePolling?: boolean
  interval?: number
  binaryInterval?: number
  alwaysStat?: boolean
  depth?: number
  awaitWriteFinish?: boolean | {
    stabilityThreshold?: number
    pollInterval?: number
  }
}

/**
 * 环境变量映射
 */
export type EnvironmentVariables = Record<string, string>

/**
 * 键值对映射
 */
export type KeyValueMap<T = any> = Record<string, T>

/**
 * 可选的键值对映射
 */
export type PartialKeyValueMap<T = any> = Partial<Record<string, T>>

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度必需类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * 函数类型 - 使用更具体的类型参数
 */
export type AnyFunction<TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown> = (...args: TArgs) => TReturn

/**
 * 异步函数类型
 */
export type AsyncFunction<T = unknown, TArgs extends readonly unknown[] = readonly unknown[]> = (...args: TArgs) => Promise<T>

/**
 * 构造函数类型
 */
export type Constructor<T = {}, TArgs extends readonly unknown[] = readonly unknown[]> = new (...args: TArgs) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = {}, TArgs extends readonly unknown[] = readonly unknown[]> = abstract new (...args: TArgs) => T

/**
 * 类型守卫函数
 */
export type TypeGuard<T> = (value: unknown) => value is T

/**
 * 谓词函数
 */
export type Predicate<T> = (value: T) => boolean

/**
 * 映射函数
 */
export type Mapper<T, U> = (value: T) => U

/**
 * 异步映射函数
 */
export type AsyncMapper<T, U> = (value: T) => Promise<U>

/**
 * 过滤函数
 */
export type Filter<T> = (value: T) => boolean

/**
 * 异步过滤函数
 */
export type AsyncFilter<T> = (value: T) => Promise<boolean>

/**
 * 归约函数
 */
export type Reducer<T, U> = (accumulator: U, current: T) => U

/**
 * 异步归约函数
 */
export type AsyncReducer<T, U> = (accumulator: U, current: T) => Promise<U>

/**
 * 比较函数
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * 相等比较函数
 */
export type EqualityComparator<T> = (a: T, b: T) => boolean
