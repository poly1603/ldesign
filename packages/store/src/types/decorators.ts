/**
 * 装饰器相关类型定义
 */

/**
 * State 装饰器选项
 */
export interface StateDecoratorOptions {
  /** 默认值 */
  default?: any
  /** 是否深度响应式 */
  deep?: boolean
  /** 是否持久化 */
  persist?: boolean
}

/**
 * Action 装饰器选项
 */
export interface ActionDecoratorOptions {
  /** 是否异步 */
  async?: boolean
  /** 是否缓存结果 */
  cache?: boolean
  /** 缓存时间（毫秒） */
  cacheTime?: number
  /** 是否防抖 */
  debounce?: number
  /** 是否节流 */
  throttle?: number
}

/**
 * Getter 装饰器选项
 */
export interface GetterDecoratorOptions {
  /** 是否缓存 */
  cache?: boolean
  /** 依赖的状态字段 */
  deps?: string[]
}

/**
 * 装饰器元数据键
 */
export const DECORATOR_METADATA_KEY = Symbol('decorator:metadata')

/**
 * 装饰器类型
 */
export type DecoratorType = 'state' | 'action' | 'getter'

/**
 * 装饰器元数据
 */
export interface DecoratorMetadata {
  type: DecoratorType
  key: string
  options?:
    | StateDecoratorOptions
    | ActionDecoratorOptions
    | GetterDecoratorOptions
}

/**
 * 类构造函数类型
 */
export interface Constructor<T = {}> {
  new (...args: any[]): T
}

/**
 * 装饰器工厂类型
 */
export type DecoratorFactory<T = any> = (options?: T) => PropertyDecorator
