/**
 * 模板事件总线系统
 * 
 * 提供模板间的通信机制
 */

import type { InjectionKey } from 'vue'
import { inject, onUnmounted, provide, ref } from 'vue'

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (payload: T) => void | Promise<void>

/**
 * 事件订阅选项
 */
export interface EventSubscribeOptions {
  once?: boolean      // 只监听一次
  priority?: number    // 优先级（数字越大优先级越高）
  filter?: (payload: any) => boolean  // 过滤器
}

/**
 * 事件订阅者
 */
interface EventSubscriber {
  handler: EventHandler
  options: EventSubscribeOptions
  id: string
}

/**
 * 事件总线接口
 */
export interface TemplateEventBus {
  emit: <T = any>(event: string, payload?: T) => Promise<void>
  on: <T = any>(event: string, handler: EventHandler<T>, options?: EventSubscribeOptions) => () => void
  off: (event: string, handler?: EventHandler) => void
  once: <T = any>(event: string, handler: EventHandler<T>) => () => void
  clear: (event?: string) => void
  hasListeners: (event: string) => boolean
  getEvents: () => string[]
}

/**
 * 全局事件总线
 */
class GlobalEventBus implements TemplateEventBus {
  private events = new Map<string, EventSubscriber[]>()
  private eventHistory = new Map<string, any[]>()
  private maxHistorySize = 100
  private idCounter = 0
  // 使用 WeakMap 存储组件相关的订阅，组件销毁时自动清理
  private componentSubscriptions = new WeakMap<object, Set<string>>()
  
  /**
   * 发送事件
   */
  async emit<T = any>(event: string, payload?: T): Promise<void> {
    // 记录历史
    this.recordHistory(event, payload)
    
    // 获取订阅者
    const subscribers = this.events.get(event)
    if (!subscribers || subscribers.length === 0) return
    
    // 按优先级排序
    const sortedSubscribers = [...subscribers].sort(
      (a, b) => (b.options.priority || 0) - (a.options.priority || 0)
    )
    
    // 需要移除的一次性订阅者
    const toRemove: string[] = []
    
    // 执行处理器
    for (const subscriber of sortedSubscribers) {
      // 应用过滤器
      if (subscriber.options.filter && !subscriber.options.filter(payload)) {
        continue
      }
      
      try {
        await subscriber.handler(payload)
      } catch (error) {
        console.error(`Event handler error for "${event}":`, error)
      }
      
      // 标记一次性订阅者
      if (subscriber.options.once) {
        toRemove.push(subscriber.id)
      }
    }
    
    // 移除一次性订阅者
    if (toRemove.length > 0) {
      const remaining = subscribers.filter(s => !toRemove.includes(s.id))
      if (remaining.length > 0) {
        this.events.set(event, remaining)
      } else {
        this.events.delete(event)
      }
    }
  }
  
  /**
   * 监听事件
   */
  on<T = any>(
    event: string,
    handler: EventHandler<T>,
    options: EventSubscribeOptions = {}
  ): () => void {
    const subscribers = this.events.get(event) || []
    const id = `sub_${++this.idCounter}`
    
    const subscriber: EventSubscriber = {
      handler,
      options,
      id
    }
    
    subscribers.push(subscriber)
    this.events.set(event, subscribers)
    
    // 返回取消订阅函数
    return () => {
      this.off(event, handler)
    }
  }
  
  /**
   * 取消监听
   */
  off(event: string, handler?: EventHandler): void {
    const subscribers = this.events.get(event)
    if (!subscribers) return
    
    if (!handler) {
      // 移除所有监听器
      this.events.delete(event)
    } else {
      // 移除特定监听器
      const remaining = subscribers.filter(s => s.handler !== handler)
      if (remaining.length > 0) {
        this.events.set(event, remaining)
      } else {
        this.events.delete(event)
      }
    }
  }
  
  /**
   * 监听一次
   */
  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    return this.on(event, handler, { once: true })
  }
  
  /**
   * 清空事件
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event)
      this.eventHistory.delete(event)
    } else {
      this.events.clear()
      this.eventHistory.clear()
    }
  }
  
  /**
   * 检查是否有监听器
   */
  hasListeners(event: string): boolean {
    const subscribers = this.events.get(event)
    return !!subscribers && subscribers.length > 0
  }
  
  /**
   * 获取所有事件名
   */
  getEvents(): string[] {
    return Array.from(this.events.keys())
  }
  
  /**
   * 记录事件历史
   */
  private recordHistory(event: string, payload: any): void {
    let history = this.eventHistory.get(event)
    if (!history) {
      history = []
      this.eventHistory.set(event, history)
    }
    
    // 使用环形缓冲区优化内存
    if (history.length >= this.maxHistorySize) {
      // 直接覆盖最老的记录，避免频繁的数组操作
      const index = history.length % this.maxHistorySize
      history[index] = {
        payload,
        timestamp: Date.now()
      }
    } else {
      history.push({
        payload,
        timestamp: Date.now()
      })
    }
  }
  
  /**
   * 获取事件历史
   */
  getHistory(event: string): any[] {
    return this.eventHistory.get(event) || []
  }
}

// 全局事件总线实例
const globalBus = new GlobalEventBus()

/**
 * 事件总线注入键
 */
const EventBusKey: InjectionKey<TemplateEventBus> = Symbol('TemplateEventBus')

/**
 * 使用模板事件总线
 */
export function useTemplateEventBus(isolated: boolean = false): TemplateEventBus {
  // 尝试从上下文注入
  const injectedBus = inject<TemplateEventBus | null>(EventBusKey, null)
  
  if (!isolated && injectedBus) {
    return injectedBus
  }
  
  if (!isolated) {
    // 使用全局总线
    return globalBus
  }
  
  // 创建隔离的总线
  const localBus = new GlobalEventBus()
  
  // 组件卸载时清理
  onUnmounted(() => {
    localBus.clear()
    // 清理 WeakMap 引用
    if ('componentSubscriptions' in localBus) {
      (localBus as any).componentSubscriptions = new WeakMap()
    }
  })
  
  return localBus
}

/**
 * 提供事件总线
 */
export function provideTemplateEventBus(): TemplateEventBus {
  const bus = new GlobalEventBus()
  provide(EventBusKey, bus)
  return bus
}

/**
 * 预定义的事件类型
 */
export const TEMPLATE_EVENTS = {
  // 模板生命周期
  TEMPLATE_LOAD: 'template:load',
  TEMPLATE_LOADED: 'template:loaded',
  TEMPLATE_ERROR: 'template:error',
  TEMPLATE_UNLOAD: 'template:unload',
  
  // 模板切换
  TEMPLATE_CHANGE: 'template:change',
  TEMPLATE_SWITCH: 'template:switch',
  
  // 设备变化
  DEVICE_CHANGE: 'device:change',
  
  // 主题变化
  THEME_CHANGE: 'theme:change',
  
  // 表单事件
  FORM_SUBMIT: 'form:submit',
  FORM_RESET: 'form:reset',
  FORM_VALIDATE: 'form:validate',
  FORM_SAVE: 'form:save',
  
  // 导航事件
  NAVIGATE_TO: 'navigate:to',
  NAVIGATE_BACK: 'navigate:back',
  NAVIGATE_FORWARD: 'navigate:forward',
  
  // 用户操作
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_ACTION: 'user:action',
  
  // 数据变化
  DATA_UPDATE: 'data:update',
  DATA_DELETE: 'data:delete',
  DATA_CREATE: 'data:create'
} as const

/**
 * 事件类型
 */
export type TemplateEventType = typeof TEMPLATE_EVENTS[keyof typeof TEMPLATE_EVENTS]

/**
 * 使用特定事件
 */
export function useTemplateEvent<T = any>(
  event: string | TemplateEventType,
  handler?: EventHandler<T>,
  options?: EventSubscribeOptions
) {
  const bus = useTemplateEventBus()
  const unsubscribe = ref<(() => void) | null>(null)
  
  // 自动订阅
  if (handler) {
    unsubscribe.value = bus.on(event, handler, options)
  }
  
  // 组件卸载时取消订阅
  onUnmounted(() => {
    unsubscribe.value?.()
  })
  
  return {
    emit: (payload?: T) => bus.emit(event, payload),
    on: (h: EventHandler<T>, opts?: EventSubscribeOptions) => {
      return bus.on(event, h, opts)
    },
    once: (h: EventHandler<T>) => bus.once(event, h),
    off: (h?: EventHandler) => bus.off(event, h),
    hasListeners: () => bus.hasListeners(event)
  }
}

/**
 * 批量事件处理
 */
export function useTemplateEvents(
  events: Record<string, EventHandler>
) {
  const bus = useTemplateEventBus()
  const unsubscribers: (() => void)[] = []
  
  // 批量订阅
  Object.entries(events).forEach(([event, handler]) => {
    const unsub = bus.on(event, handler)
    unsubscribers.push(unsub)
  })
  
  // 组件卸载时批量取消订阅
  onUnmounted(() => {
    unsubscribers.forEach(unsub => unsub())
  })
  
  return bus
}

/**
 * 事件中间件
 */
export type EventMiddleware = (
  event: string,
  payload: any,
  next: () => Promise<void>
) => void | Promise<void>

/**
 * 带中间件的事件总线
 */
export class MiddlewareEventBus extends GlobalEventBus {
  private middlewares: EventMiddleware[] = []
  
  /**
   * 添加中间件
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware)
  }
  
  /**
   * 发送事件（通过中间件）
   */
  async emit<T = any>(event: string, payload?: T): Promise<void> {
    let index = 0
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++]
        await middleware(event, payload, next)
      } else {
        await super.emit(event, payload)
      }
    }
    
    await next()
  }
}

/**
 * 创建带中间件的事件总线
 */
export function createMiddlewareEventBus(): MiddlewareEventBus {
  return new MiddlewareEventBus()
}

// 导出全局事件总线实例
export const templateEventBus = globalBus