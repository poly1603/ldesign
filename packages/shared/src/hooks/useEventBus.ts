/**
 * 事件总线 Hook
 * 
 * @description
 * 提供事件总线功能，支持组件间通信、全局事件管理等。
 * 自动处理组件卸载时的事件监听器清理。
 */

import { onUnmounted, getCurrentInstance } from 'vue'
import { eventBus, createEventBus, type EventListener, type EventListenerOptions } from '../utils/eventBus'

/**
 * 事件总线 Hook 配置
 */
export interface UseEventBusOptions {
  /** 是否使用全局事件总线 */
  global?: boolean
  /** 自定义事件总线实例 */
  bus?: any
}

/**
 * 事件总线 Hook 返回值
 */
export interface UseEventBusReturn {
  /** 监听事件 */
  on: <T = any>(event: string, listener: EventListener<T>, options?: EventListenerOptions) => () => void
  /** 监听事件（只执行一次） */
  once: <T = any>(event: string, listener: EventListener<T>) => () => void
  /** 取消监听事件 */
  off: (event: string, listenerOrId?: EventListener | string) => void
  /** 触发事件 */
  emit: <T = any>(event: string, data?: T) => void
  /** 异步触发事件 */
  emitAsync: <T = any>(event: string, data?: T) => Promise<void>
  /** 获取事件的监听器数量 */
  listenerCount: (event: string) => number
  /** 获取所有事件名称 */
  eventNames: () => string[]
  /** 清空所有事件监听器 */
  clear: () => void
  /** 清空指定事件的所有监听器 */
  clearEvent: (event: string) => void
  /** 检查是否有指定事件的监听器 */
  hasListeners: (event: string) => boolean
}

/**
 * 事件总线 Hook
 * 
 * @param options 配置选项
 * @returns 事件总线操作方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useEventBus } from '@ldesign/shared'
 * 
 * const { on, emit, off } = useEventBus()
 * 
 * // 监听事件
 * const unsubscribe = on('user-login', (user) => {
 *    * })
 * 
 * // 触发事件
 * const handleLogin = () => {
 *   emit('user-login', { id: 1, name: 'John' })
 * }
 * 
 * // 手动取消监听（通常不需要，组件卸载时会自动清理）
 * // unsubscribe()
 * </script>
 * ```
 */
export function useEventBus(options: UseEventBusOptions = {}): UseEventBusReturn {
  const { global = true, bus } = options
  
  // 选择事件总线实例
  const eventBusInstance = bus || (global ? eventBus : createEventBus())
  
  // 存储监听器取消函数
  const unsubscribers: (() => void)[] = []
  
  // 包装监听方法，自动收集取消函数
  const on = <T = any>(
    event: string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): (() => void) => {
    const unsubscribe = eventBusInstance.on(event, listener, options)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }
  
  const once = <T = any>(event: string, listener: EventListener<T>): (() => void) => {
    const unsubscribe = eventBusInstance.once(event, listener)
    unsubscribers.push(unsubscribe)
    return unsubscribe
  }
  
  // 组件卸载时自动清理所有监听器
  if (getCurrentInstance()) {
    onUnmounted(() => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
      unsubscribers.length = 0
    })
  }
  
  return {
    on,
    once,
    off: eventBusInstance.off.bind(eventBusInstance),
    emit: eventBusInstance.emit.bind(eventBusInstance),
    emitAsync: eventBusInstance.emitAsync.bind(eventBusInstance),
    listenerCount: eventBusInstance.listenerCount.bind(eventBusInstance),
    eventNames: eventBusInstance.eventNames.bind(eventBusInstance),
    clear: eventBusInstance.clear.bind(eventBusInstance),
    clearEvent: eventBusInstance.clearEvent.bind(eventBusInstance),
    hasListeners: eventBusInstance.hasListeners.bind(eventBusInstance),
  }
}

/**
 * 类型安全的事件总线 Hook
 * 
 * @param options 配置选项
 * @returns 类型安全的事件总线操作方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useTypedEventBus } from '@ldesign/shared'
 * 
 * interface EventMap {
 *   'user-login': { id: number; name: string }
 *   'user-logout': { id: number }
 *   'message': string
 * }
 * 
 * const { on, emit } = useTypedEventBus<EventMap>()
 * 
 * // 类型安全的事件监听
 * on('user-login', (user) => {
 *   // user 的类型自动推断为 { id: number; name: string }
 *    * })
 * 
 * // 类型安全的事件触发
 * emit('user-login', { id: 1, name: 'John' }) // ✅ 正确
 * // emit('user-login', { name: 'John' }) // ❌ 类型错误，缺少 id
 * </script>
 * ```
 */
export function useTypedEventBus<EventMap extends Record<string, any>>(
  options: UseEventBusOptions = {}
) {
  const eventBus = useEventBus(options)
  
  return {
    on: <K extends keyof EventMap>(
      event: K,
      listener: EventListener<EventMap[K]>,
      options?: EventListenerOptions
    ) => eventBus.on(event as string, listener, options),
    
    once: <K extends keyof EventMap>(
      event: K,
      listener: EventListener<EventMap[K]>
    ) => eventBus.once(event as string, listener),
    
    off: <K extends keyof EventMap>(
      event: K,
      listenerOrId?: EventListener<EventMap[K]> | string
    ) => eventBus.off(event as string, listenerOrId),
    
    emit: <K extends keyof EventMap>(event: K, data: EventMap[K]) =>
      eventBus.emit(event as string, data),
    
    emitAsync: <K extends keyof EventMap>(event: K, data: EventMap[K]) =>
      eventBus.emitAsync(event as string, data),
    
    listenerCount: <K extends keyof EventMap>(event: K) =>
      eventBus.listenerCount(event as string),
    
    eventNames: () => eventBus.eventNames() as (keyof EventMap)[],
    
    clear: eventBus.clear,
    
    clearEvent: <K extends keyof EventMap>(event: K) =>
      eventBus.clearEvent(event as string),
    
    hasListeners: <K extends keyof EventMap>(event: K) =>
      eventBus.hasListeners(event as string),
  }
}

/**
 * 全局事件总线 Hook
 * 
 * @description
 * 使用全局事件总线实例的便捷方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useGlobalEventBus } from '@ldesign/shared'
 * 
 * const { on, emit } = useGlobalEventBus()
 * 
 * // 监听全局事件
 * on('theme-change', (theme) => {
 *    * })
 * 
 * // 触发全局事件
 * const changeTheme = (theme) => {
 *   emit('theme-change', theme)
 * }
 * </script>
 * ```
 */
export function useGlobalEventBus(): UseEventBusReturn {
  return useEventBus({ global: true })
}

/**
 * 局部事件总线 Hook
 * 
 * @description
 * 创建独立的事件总线实例，不与全局事件总线共享
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useLocalEventBus } from '@ldesign/shared'
 * 
 * const { on, emit } = useLocalEventBus()
 * 
 * // 这些事件只在当前组件树中传播
 * on('local-event', (data) => {
 *    * })
 * 
 * emit('local-event', 'hello')
 * </script>
 * ```
 */
export function useLocalEventBus(): UseEventBusReturn {
  return useEventBus({ global: false })
}
