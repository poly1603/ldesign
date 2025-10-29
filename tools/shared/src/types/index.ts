/**
 * 共享类型定义统一导出
 */

export * from './tool'
export * from './project'
export * from './api'
export * from './workflow'
export * from './plugin'

/**
 * 通用类型
 */
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 键值对
 */
export interface KeyValue<K = string, V = any> {
  key: K
  value: V
}

/**
 * ID 类型
 */
export type ID = string | number

/**
 * 时间戳
 */
export type Timestamp = number

/**
 * 回调函数
 */
export type Callback<T = void> = (error?: Error, result?: T) => void

/**
 * 异步回调函数
 */
export type AsyncCallback<T = void> = (error?: Error, result?: T) => Promise<void>

/**
 * 构造函数类型
 */
export type Constructor<T = any> = new (...args: any[]) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T


