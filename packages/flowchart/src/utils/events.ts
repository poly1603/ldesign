/**
 * 事件工具函数
 * 提供事件处理相关的工具函数和辅助方法
 */

import type { Point, EventEmitter, EventListener, EventType } from '@/types/index.js';

/**
 * 简单的事件发射器实现
 */
export class SimpleEventEmitter implements EventEmitter {
  private listeners: Map<string, EventListener[]> = new Map();

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on<T = any>(event: EventType | string, listener: EventListener<T>): void {
    const eventName = typeof event === 'string' ? event : event.toString();
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off<T = any>(event: EventType | string, listener: EventListener<T>): void {
    const eventName = typeof event === 'string' ? event : event.toString();
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<T = any>(event: EventType | string, data?: T): void {
    const eventName = typeof event === 'string' ? event : event.toString();
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件监听器执行错误 (${eventName}):`, error);
        }
      });
    }
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  once<T = any>(event: EventType | string, listener: EventListener<T>): void {
    const onceListener = (data: T) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  /**
   * 移除所有监听器
   * @param event 可选的事件名称，如果不提供则移除所有事件的监听器
   */
  removeAllListeners(event?: EventType | string): void {
    if (event) {
      const eventName = typeof event === 'string' ? event : event.toString();
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: EventType | string): number {
    const eventName = typeof event === 'string' ? event : event.toString();
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * 获取鼠标事件的坐标
 * @param event 鼠标事件
 * @returns 坐标点
 */
export function getMousePosition(event: MouseEvent): Point {
  return {
    x: event.clientX,
    y: event.clientY
  };
}

/**
 * 获取触摸事件的坐标
 * @param event 触摸事件
 * @param touchIndex 触摸点索引，默认为0
 * @returns 坐标点
 */
export function getTouchPosition(event: TouchEvent, touchIndex: number = 0): Point {
  const touch = event.touches[touchIndex] || event.changedTouches[touchIndex];
  if (!touch) {
    return { x: 0, y: 0 };
  }
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

/**
 * 检测是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检测是否支持触摸
 * @returns 是否支持触摸
 */
export function isTouchSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 阻止事件默认行为和冒泡
 * @param event 事件对象
 */
export function preventDefault(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * 阻止事件冒泡
 * @param event 事件对象
 */
export function stopPropagation(event: Event): void {
  event.stopPropagation();
}

/**
 * 键盘快捷键检测
 * @param event 键盘事件
 * @param key 按键
 * @param modifiers 修饰键
 * @returns 是否匹配
 */
export function isKeyboardShortcut(
  event: KeyboardEvent,
  key: string,
  modifiers: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  } = {}
): boolean {
  const keyMatch = event.key.toLowerCase() === key.toLowerCase() ||
    event.code.toLowerCase() === key.toLowerCase();

  const ctrlMatch = modifiers.ctrl ? event.ctrlKey : !event.ctrlKey;
  const altMatch = modifiers.alt ? event.altKey : !event.altKey;
  const shiftMatch = modifiers.shift ? event.shiftKey : !event.shiftKey;
  const metaMatch = modifiers.meta ? event.metaKey : !event.metaKey;

  return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
}

/**
 * 创建自定义事件
 * @param type 事件类型
 * @param detail 事件详情
 * @returns 自定义事件
 */
export function createCustomEvent<T = any>(type: string, detail?: T): CustomEvent<T> {
  return new CustomEvent(type, {
    detail,
    bubbles: true,
    cancelable: true
  });
}

/**
 * 添加事件监听器（支持选项）
 * @param element 元素
 * @param type 事件类型
 * @param listener 监听器
 * @param options 选项
 */
export function addEventListener(
  element: EventTarget,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions
): void {
  element.addEventListener(type, listener, options);
}

/**
 * 移除事件监听器
 * @param element 元素
 * @param type 事件类型
 * @param listener 监听器
 * @param options 选项
 */
export function removeEventListener(
  element: EventTarget,
  type: string,
  listener: EventListener,
  options?: EventListenerOptions
): void {
  element.removeEventListener(type, listener, options);
}

/**
 * 事件委托
 * @param container 容器元素
 * @param selector 选择器
 * @param eventType 事件类型
 * @param handler 处理函数
 */
export function delegate(
  container: Element,
  selector: string,
  eventType: string,
  handler: (event: Event, target: Element) => void
): void {
  container.addEventListener(eventType, (event) => {
    const target = event.target as Element;
    const delegateTarget = target.closest(selector);
    if (delegateTarget && container.contains(delegateTarget)) {
      handler(event, delegateTarget);
    }
  });
}

/**
 * 等待事件触发
 * @param emitter 事件发射器
 * @param event 事件名称
 * @param timeout 超时时间（毫秒）
 * @returns Promise
 */
export function waitForEvent<T = any>(
  emitter: EventEmitter,
  event: EventType | string,
  timeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    let timeoutId: number | undefined;

    const listener = (data: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      emitter.off(event, listener);
      resolve(data);
    };

    emitter.on(event, listener);

    if (timeout) {
      timeoutId = window.setTimeout(() => {
        emitter.off(event, listener);
        reject(new Error(`等待事件 ${event} 超时`));
      }, timeout);
    }
  });
}
