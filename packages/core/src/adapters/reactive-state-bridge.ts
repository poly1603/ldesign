/**
 * 响应式状态桥接器
 * 
 * 连接引擎状态管理器和框架响应式系统,实现双向数据绑定
 * 
 * @module adapters/reactive-state-bridge
 */

import type { StateManager } from '../types/state'
import type { StateAdapter, ReactiveState, Unsubscribe } from './framework-adapter'

/**
 * 桥接配置选项
 */
export interface BridgeOptions {
  /** 是否启用深度监听 */
  deep?: boolean
  /** 是否立即执行回调 */
  immediate?: boolean
  /** 防抖延迟(毫秒) */
  debounce?: number
  /** 是否启用调试日志 */
  debug?: boolean
}

/**
 * 响应式状态桥接器
 * 
 * 实现引擎状态管理器和框架响应式系统之间的双向绑定
 * 
 * @example
 * ```typescript
 * const bridge = new ReactiveStateBridge(
 *   engine.state,
 *   adapter.createStateAdapter()
 * )
 * 
 * // 创建双向绑定的响应式状态
 * const count = bridge.createBoundState('user.count', 0)
 * 
 * // 修改响应式状态 -> 自动同步到引擎状态
 * count.value++
 * 
 * // 修改引擎状态 -> 自动同步到响应式状态
 * engine.state.set('user.count', 10)
 * console.log(count.value) // 10
 * ```
 */
export class ReactiveStateBridge {
  private bindings = new Map<string, {
    reactiveState: ReactiveState<any>
    unwatchEngine: Unsubscribe
    unwatchReactive: Unsubscribe
  }>()

  private debounceTimers = new Map<string, number>()

  constructor(
    private stateManager: StateManager,
    private adapter: StateAdapter,
    private options: BridgeOptions = {}
  ) {}

  /**
   * 创建双向绑定的响应式状态
   * 
   * @param path - 状态路径
   * @param defaultValue - 默认值
   * @param options - 桥接选项
   * @returns 响应式状态对象
   * 
   * @example
   * ```typescript
   * const user = bridge.createBoundState('user', { name: 'John', age: 30 })
   * 
   * // 修改响应式状态
   * user.value.name = 'Jane'
   * 
   * // 自动同步到引擎状态
   * console.log(engine.state.get('user.name')) // 'Jane'
   * ```
   */
  createBoundState<T>(
    path: string,
    defaultValue?: T,
    options?: BridgeOptions
  ): ReactiveState<T> {
    // 如果已存在绑定,返回现有的
    if (this.bindings.has(path)) {
      return this.bindings.get(path)!.reactiveState
    }

    const mergedOptions = { ...this.options, ...options }

    // 从状态管理器获取初始值
    const initialValue = this.stateManager.get<T>(path) ?? defaultValue

    // 创建框架特定的响应式状态
    const reactiveState = this.adapter.createReactiveState<T>(initialValue as T)

    // 监听引擎状态变化 -> 更新响应式状态
    const unwatchEngine = this.stateManager.watch<T>(path, (newValue, oldValue) => {
      if (mergedOptions.debug) {
        console.log(`[Bridge] Engine state changed: ${path}`, { newValue, oldValue })
      }

      // 避免循环更新
      if (newValue !== reactiveState.value) {
        reactiveState.value = newValue
      }
    })

    // 监听响应式状态变化 -> 更新引擎状态
    const unwatchReactive = this.adapter.watch(
      () => reactiveState.value,
      (newValue, oldValue) => {
        if (mergedOptions.debug) {
          console.log(`[Bridge] Reactive state changed: ${path}`, { newValue, oldValue })
        }

        // 防抖处理
        if (mergedOptions.debounce) {
          this.debouncedUpdate(path, newValue, mergedOptions.debounce)
        } else {
          this.updateEngineState(path, newValue)
        }
      }
    )

    // 保存绑定信息
    this.bindings.set(path, {
      reactiveState,
      unwatchEngine,
      unwatchReactive
    })

    return reactiveState
  }

  /**
   * 创建计算属性(如果框架支持)
   * 
   * @param getter - 计算函数
   * @returns 计算属性
   * 
   * @example
   * ```typescript
   * const fullName = bridge.createComputed(() => {
   *   const user = engine.state.get('user')
   *   return `${user.firstName} ${user.lastName}`
   * })
   * ```
   */
  createComputed<T>(getter: () => T): ReactiveState<T> | undefined {
    if (!this.adapter.computed) {
      console.warn('[Bridge] Framework does not support computed properties')
      return undefined
    }

    return this.adapter.computed(getter)
  }

  /**
   * 批量更新状态
   * 
   * @param updater - 更新函数
   * 
   * @example
   * ```typescript
   * bridge.batch(() => {
   *   user.value.name = 'Jane'
   *   user.value.age = 25
   * }) // 只触发一次更新
   * ```
   */
  batch(updater: () => void): void {
    this.adapter.batch(updater)
  }

  /**
   * 解除绑定
   * 
   * @param path - 状态路径
   */
  unbind(path: string): void {
    const binding = this.bindings.get(path)
    if (binding) {
      binding.unwatchEngine()
      binding.unwatchReactive()
      this.bindings.delete(path)

      // 清理防抖定时器
      const timer = this.debounceTimers.get(path)
      if (timer) {
        clearTimeout(timer)
        this.debounceTimers.delete(path)
      }
    }
  }

  /**
   * 解除所有绑定
   */
  unbindAll(): void {
    this.bindings.forEach((_, path) => this.unbind(path))
  }

  /**
   * 获取所有绑定的路径
   * 
   * @returns 路径列表
   */
  getBoundPaths(): string[] {
    return Array.from(this.bindings.keys())
  }

  /**
   * 检查路径是否已绑定
   * 
   * @param path - 状态路径
   * @returns 是否已绑定
   */
  isBound(path: string): boolean {
    return this.bindings.has(path)
  }

  /**
   * 更新引擎状态
   * 
   * @param path - 状态路径
   * @param value - 新值
   */
  private updateEngineState(path: string, value: any): void {
    // 避免循环更新
    const currentValue = this.stateManager.get(path)
    if (currentValue !== value) {
      this.stateManager.set(path, value)
    }
  }

  /**
   * 防抖更新
   * 
   * @param path - 状态路径
   * @param value - 新值
   * @param delay - 延迟时间
   */
  private debouncedUpdate(path: string, value: any, delay: number): void {
    // 清除之前的定时器
    const existingTimer = this.debounceTimers.get(path)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.updateEngineState(path, value)
      this.debounceTimers.delete(path)
    }, delay) as unknown as number

    this.debounceTimers.set(path, timer)
  }

  /**
   * 销毁桥接器
   */
  destroy(): void {
    this.unbindAll()
    this.debounceTimers.clear()
  }
}

/**
 * 创建响应式状态桥接器
 * 
 * @param stateManager - 状态管理器
 * @param adapter - 状态适配器
 * @param options - 桥接选项
 * @returns 桥接器实例
 */
export function createReactiveStateBridge(
  stateManager: StateManager,
  adapter: StateAdapter,
  options?: BridgeOptions
): ReactiveStateBridge {
  return new ReactiveStateBridge(stateManager, adapter, options)
}

