/**
 * 框架适配器模块
 * 
 * 提供统一的框架集成抽象层
 * 
 * @module adapters
 */

// 框架适配器接口
export type {
  FrameworkInfo,
  LifecycleHookMap,
  Unsubscribe,
  ReactiveState,
  StateAdapter,
  EventHandler,
  EventAdapter,
  FrameworkAdapter,
  FrameworkAdapterFactory,
} from './framework-adapter'

export { FrameworkAdapterRegistry } from './framework-adapter'

// 响应式状态桥接器
export type { BridgeOptions } from './reactive-state-bridge'
export { ReactiveStateBridge, createReactiveStateBridge } from './reactive-state-bridge'

