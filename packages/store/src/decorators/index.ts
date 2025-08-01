/**
 * 装饰器模块
 * 导出所有装饰器相关的功能
 */

// State 装饰器
export {
  State,
  ReactiveState,
  PersistentState,
  ReadonlyState,
} from './State'

// Action 装饰器
export {
  Action,
  AsyncAction,
  CachedAction,
  DebouncedAction,
  ThrottledAction,
} from './Action'

// Getter 装饰器
export {
  Getter,
  CachedGetter,
  DependentGetter,
  MemoizedGetter,
} from './Getter'

// 类型定义
export type {
  StateDecoratorOptions,
  ActionDecoratorOptions,
  GetterDecoratorOptions,
  DecoratorType,
  Constructor,
  DecoratorFactory,
} from '@/types/decorators'

// 常量
export { DECORATOR_METADATA_KEY } from '@/types/decorators'
