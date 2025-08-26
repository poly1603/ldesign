import type { Ref } from 'vue'
import type { StoreDefinition, Store, StateTree } from 'pinia'

/**
 * 状态类型定义
 */
export interface StateDefinition {
  [key: string]: any
}

/**
 * Action 类型定义
 */
export interface ActionDefinition {
  [key: string]: (...args: any[]) => any
}

/**
 * Getter 类型定义
 */
export interface GetterDefinition {
  [key: string]: (state: any) => any
}

/**
 * 更严格的状态类型定义
 */
export type StrictStateDefinition<T = Record<string, any>> = {
  [K in keyof T]: T[K]
}

/**
 * 更严格的 Action 类型定义
 */
export type StrictActionDefinition<T = Record<string, Function>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never
}

/**
 * 更严格的 Getter 类型定义
 */
export type StrictGetterDefinition<T = Record<string, any>, S = any> = {
  [K in keyof T]: (state: S) => T[K]
}

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  maxSize?: number
  defaultTTL?: number
}

/**
 * Store 配置选项
 */
export interface StoreOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> {
  id: string
  state?: () => TState
  actions?: TActions
  getters?: TGetters
  persist?: boolean | PersistOptions
  cache?: CacheOptions
  devtools?: boolean
}

/**
 * 持久化配置选项
 */
export interface PersistOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
}

/**
 * 装饰器元数据
 */
export interface DecoratorMetadata {
  type: 'state' | 'action' | 'getter'
  key: string
  options?: any
}

/**
 * 状态变更回调类型
 */
export interface MutationCallback<TState = any> {
  (mutation: {
    type: string
    storeId: string
    payload?: any
    events?: any[]
  }, state: TState): void
}

/**
 * Action 上下文类型
 */
export interface ActionContext<TState extends StateTree = StateTree, TActions = any> {
  name: string
  store: Store<string, TState, any, TActions>
  args: any[]
  after: (callback: (result: any) => void) => void
  onError: (callback: (error: Error) => void) => void
}

/**
 * Store 类的基础接口
 */
export interface IBaseStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> {
  readonly $id: string
  readonly $state: TState
  readonly $actions: TActions
  readonly $getters: TGetters

  // 状态管理方法
  $reset(): void
  $patch(partialState: Partial<TState>): void
  $patch(mutator: (state: TState) => void): void

  // 订阅方法
  $subscribe(callback: MutationCallback<TState>, options?: { detached?: boolean }): () => void
  $onAction(callback: (context: ActionContext<TState, TActions>) => void): () => void

  // 生命周期方法
  $dispose(): void

  // 工具方法
  getStore(): Store<string, TState, TGetters, TActions> | undefined
  getStoreDefinition(): StoreDefinition<string, TState, TGetters, TActions> | undefined
}

/**
 * 向后兼容的 BaseStore 接口
 */
export interface BaseStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> extends IBaseStore<TState, TActions, TGetters> { }

/**
 * Hook 返回类型
 */
export interface UseStoreReturn<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> extends BaseStore<TState, TActions, TGetters> {
  // 响应式状态
  state: Ref<TState>
  // 计算属性
  getters: TGetters
  // 方法
  actions: TActions
}

/**
 * Provider 配置
 */
export interface ProviderOptions {
  stores?: Record<string, any>
  global?: boolean
}

/**
 * 类型工具
 */
export type InferState<T> = T extends StoreDefinition<infer S, any, any>
  ? S
  : never
export type InferActions<T> = T extends StoreDefinition<any, infer A, any>
  ? A
  : never
export type InferGetters<T> = T extends StoreDefinition<any, any, infer G>
  ? G
  : never

/**
 * 导出所有类型
 */
export * from './decorators'
export * from './hooks'
export * from './provider'
