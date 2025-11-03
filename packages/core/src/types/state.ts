/**
 * 状态管理类型定义
 */

import type { Unsubscribe } from './base'

/**
 * 状态变化回调
 */
export type StateChangeCallback<T = any> = (
  newValue: T,
  oldValue: T | undefined,
  path: string
) => void

/**
 * 计算属性函数
 */
export type ComputedGetter<T = any> = (state: Record<string, any>) => T

/**
 * 计算属性配置
 */
export interface ComputedConfig<T = any> {
  /** 计算函数 */
  get: ComputedGetter<T>
  /** 依赖的状态路径列表 */
  deps: string[]
  /** 是否缓存计算结果 */
  cache?: boolean
}

/**
 * 状态管理器接口
 */
export interface StateManager {
  /** 设置状态 */
  set<T = any>(path: string, value: T): void

  /** 获取状态 */
  get<T = any>(path: string): T | undefined

  /** 检查状态是否存在 */
  has(path: string): boolean

  /** 删除状态 */
  delete(path: string): boolean

  /** 清空所有状态 */
  clear(): void

  /** 监听状态变化 */
  watch<T = any>(path: string, callback: StateChangeCallback<T>): Unsubscribe

  /** 取消监听状态变化 */
  unwatch(path: string, callback?: StateChangeCallback): void

  /** 批量更新 */
  batch(updater: () => void): void

  /** 获取所有状态 */
  getState(): Record<string, any>

  /** 获取状态快照 */
  snapshot(): Record<string, any>

  /** 恢复状态 */
  restore(snapshot: Record<string, any>): void

  /** 定义计算属性 */
  computed?<T = any>(path: string, config: ComputedConfig<T>): void

  /** 移除计算属性 */
  removeComputed?(path: string): void

  /** 获取所有计算属性 */
  getComputedPaths?(): string[]

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

