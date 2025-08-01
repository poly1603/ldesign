import type { Ref } from 'vue'
import type { StoreDefinition } from 'pinia'

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
 * Store 配置选项
 */
export interface StoreOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
> {
  id: string
  state?: () => TState
  actions?: TActions
  getters?: TGetters
  persist?: boolean | PersistOptions
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
 * Store 类的基础接口
 */
export interface BaseStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
> {
  readonly $id: string
  readonly $state: TState
  readonly $actions: TActions
  readonly $getters: TGetters
  $reset(): void
  $patch(partialState: Partial<TState>): void
  $subscribe(callback: (mutation: any, state: TState) => void): () => void
  $onAction(callback: (context: any) => void): () => void
}

/**
 * Hook 返回类型
 */
export interface UseStoreReturn<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
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
export type InferState<T> = T extends StoreDefinition<infer S, any, any> ? S : never
export type InferActions<T> = T extends StoreDefinition<any, infer A, any> ? A : never
export type InferGetters<T> = T extends StoreDefinition<any, any, infer G> ? G : never

/**
 * 导出所有类型
 */
export * from './decorators'
export * from './hooks'
export * from './provider'
