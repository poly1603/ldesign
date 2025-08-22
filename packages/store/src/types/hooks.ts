import type { Ref, ComputedRef } from 'vue'
import type { Store } from 'pinia'

/**
 * Hook 配置选项
 */
export interface UseStoreOptions {
  /** 是否立即初始化 */
  immediate?: boolean
  /** 是否深度监听 */
  deep?: boolean
  /** 是否在组件卸载时自动清理 */
  autoCleanup?: boolean
}

/**
 * Store Hook 返回类型
 */
export interface StoreHookReturn<T extends Store = Store> {
  /** Store 实例 */
  store: T
  /** 响应式状态 */
  state: Ref<T['$state']>
  /** 重置状态 */
  reset: () => void
  /** 更新状态 */
  patch: (partialState: Partial<T['$state']>) => void
  /** 订阅状态变化 */
  subscribe: (
    callback: (mutation: any, state: T['$state']) => void
  ) => () => void
  /** 订阅 Action */
  onAction: (callback: (context: any) => void) => () => void
}

/**
 * 状态 Hook 返回类型
 */
export interface StateHookReturn<T = any> {
  /** 响应式值 */
  value: Ref<T>
  /** 设置值 */
  setValue: (newValue: T | ((oldValue: T) => T)) => void
  /** 重置为默认值 */
  reset: () => void
}

/**
 * Action Hook 返回类型
 */
export interface ActionHookReturn<
  T extends (...args: any[]) => any = (...args: any[]) => any
> {
  /** 执行 Action */
  execute: T
  /** 是否正在执行 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 执行结果 */
  data: Ref<ReturnType<T> | null>
  /** 重置状态 */
  reset: () => void
}

/**
 * Getter Hook 返回类型
 */
export interface GetterHookReturn<T = any> {
  /** 计算属性值 */
  value: ComputedRef<T>
  /** 是否正在计算 */
  computing: Ref<boolean>
  /** 刷新计算 */
  refresh: () => void
}

/**
 * 批量操作 Hook 返回类型
 */
export interface BatchHookReturn {
  /** 开始批量操作 */
  startBatch: () => void
  /** 结束批量操作 */
  endBatch: () => void
  /** 是否在批量操作中 */
  isBatching: Ref<boolean>
}

/**
 * 持久化 Hook 返回类型
 */
export interface PersistHookReturn {
  /** 保存到存储 */
  save: () => void
  /** 从存储加载 */
  load: () => void
  /** 清除存储 */
  clear: () => void
  /** 是否已持久化 */
  isPersisted: Ref<boolean>
}
