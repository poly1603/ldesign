/**
 * 事件系统实现
 * 
 * @description
 * 提供事件发布订阅机制，支持表单和字段的事件通信
 */

import type { EventBus, EventListener } from '@/types/core';

/**
 * 事件总线实现
 */
export class EventBusImpl implements EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * 监听事件
   * @param event 事件名
   * @param listener 事件监听器
   */
  on<T>(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
  }

  /**
   * 取消监听
   * @param event 事件名
   * @param listener 事件监听器
   */
  off<T>(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件名
   * @param data 事件数据
   */
  emit<T>(event: string, data: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // 创建监听器副本，避免在执行过程中修改原集合
      const listenersArray = Array.from(eventListeners);
      listenersArray.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * 一次性监听
   * @param event 事件名
   * @param listener 事件监听器
   */
  once<T>(event: string, listener: EventListener<T>): void {
    const onceListener = (data: T) => {
      this.off(event, onceListener);
      listener(data);
    };
    this.on(event, onceListener);
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * 获取所有事件名
   * @returns 事件名数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 移除所有监听器
   * @param event 事件名，不指定则移除所有事件的监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 设置最大监听器数量
   * @param n 最大数量
   */
  setMaxListeners(n: number): void {
    // 简单实现，实际可以添加监听器数量限制
    console.warn(`setMaxListeners(${n}) is not implemented`);
  }

  /**
   * 获取最大监听器数量
   * @returns 最大数量
   */
  getMaxListeners(): number {
    return Infinity; // 默认无限制
  }

  /**
   * 销毁事件总线
   */
  destroy(): void {
    this.removeAllListeners();
  }
}

/**
 * 创建事件总线实例
 * @returns 事件总线实例
 */
export function createEventBus(): EventBus {
  return new EventBusImpl();
}

/**
 * 事件名称常量
 */
export const EVENT_NAMES = {
  // 表单事件
  FORM_CHANGE: 'form:change',
  FORM_SUBMIT: 'form:submit',
  FORM_RESET: 'form:reset',
  FORM_VALIDATE: 'form:validate',
  FORM_DESTROY: 'form:destroy',
  
  // 字段事件
  FIELD_CHANGE: 'field:change',
  FIELD_VALIDATE: 'field:validate',
  FIELD_FOCUS: 'field:focus',
  FIELD_BLUR: 'field:blur',
  FIELD_TOUCH: 'field:touch',
  FIELD_REGISTER: 'field:register',
  FIELD_UNREGISTER: 'field:unregister',
  FIELD_DESTROY: 'field:destroy',
  
  // 状态事件
  STATE_CHANGE: 'state:change',
  
  // 验证事件
  VALIDATION_START: 'validation:start',
  VALIDATION_END: 'validation:end',
  VALIDATION_ERROR: 'validation:error'
} as const;

/**
 * 事件类型定义
 */
export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

/**
 * 事件数据类型映射
 */
export interface EventDataMap {
  [EVENT_NAMES.FORM_CHANGE]: import('@/types/core').FormChangeEvent;
  [EVENT_NAMES.FORM_SUBMIT]: import('@/types/core').FormSubmitEvent;
  [EVENT_NAMES.FORM_RESET]: import('@/types/core').FormChangeEvent;
  [EVENT_NAMES.FORM_VALIDATE]: Record<string, import('@/types/core').ValidationResult>;
  [EVENT_NAMES.FORM_DESTROY]: { formId: string };
  
  [EVENT_NAMES.FIELD_CHANGE]: import('@/types/core').FieldChangeEvent;
  [EVENT_NAMES.FIELD_VALIDATE]: import('@/types/core').ValidationResult;
  [EVENT_NAMES.FIELD_FOCUS]: { fieldName: string };
  [EVENT_NAMES.FIELD_BLUR]: { fieldName: string };
  [EVENT_NAMES.FIELD_TOUCH]: { fieldName: string };
  [EVENT_NAMES.FIELD_REGISTER]: { fieldName: string };
  [EVENT_NAMES.FIELD_UNREGISTER]: { fieldName: string };
  [EVENT_NAMES.FIELD_DESTROY]: { fieldName: string };
  
  [EVENT_NAMES.STATE_CHANGE]: { 
    target: 'form' | 'field';
    id: string;
    state: string;
    action: 'add' | 'remove';
  };
  
  [EVENT_NAMES.VALIDATION_START]: { 
    target: 'form' | 'field';
    id: string;
  };
  [EVENT_NAMES.VALIDATION_END]: { 
    target: 'form' | 'field';
    id: string;
    result: import('@/types/core').ValidationResult | Record<string, import('@/types/core').ValidationResult>;
  };
  [EVENT_NAMES.VALIDATION_ERROR]: { 
    target: 'form' | 'field';
    id: string;
    error: Error;
  };
}

/**
 * 类型安全的事件监听器
 */
export type TypedEventListener<K extends EventName> = EventListener<EventDataMap[K]>;

/**
 * 类型安全的事件总线接口
 */
export interface TypedEventBus extends EventBus {
  on<K extends EventName>(event: K, listener: TypedEventListener<K>): void;
  off<K extends EventName>(event: K, listener: TypedEventListener<K>): void;
  emit<K extends EventName>(event: K, data: EventDataMap[K]): void;
  once<K extends EventName>(event: K, listener: TypedEventListener<K>): void;
}

/**
 * 创建类型安全的事件总线
 * @returns 类型安全的事件总线实例
 */
export function createTypedEventBus(): TypedEventBus {
  return createEventBus() as TypedEventBus;
}
