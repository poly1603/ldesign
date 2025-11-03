/**
 * 基础类型定义
 */

/**
 * 基础管理器接口
 */
export interface BaseManager {
  /** 管理器名称 */
  readonly name: string
  /** 管理器版本 */
  readonly version: string
  /** 初始化管理器 */
  init?(): Promise<void> | void
  /** 销毁管理器 */
  destroy?(): Promise<void> | void
}

/**
 * 基础插件接口
 */
export interface BasePlugin {
  /** 插件名称 */
  readonly name: string
  /** 插件版本 */
  readonly version?: string
  /** 插件依赖 */
  readonly dependencies?: readonly string[]
}

/**
 * 配置对象
 */
export type Config = Record<string, unknown>

/**
 * 键值对
 */
export type KeyValuePair<T = unknown> = Record<string, T>

/**
 * 可选的
 */
export type Optional<T> = T | undefined

/**
 * 可为空的
 */
export type Nullable<T> = T | null

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度部分
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 函数类型
 */
export type AnyFunction = (...args: any[]) => any

/**
 * 异步函数类型
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

/**
 * 回调函数类型
 */
export type Callback<T = void> = (data: T) => void

/**
 * 错误回调函数类型
 */
export type ErrorCallback = (error: Error) => void

/**
 * 取消订阅函数
 */
export type Unsubscribe = () => void

/**
 * 清理函数
 */
export type CleanupFunction = () => void | Promise<void>

