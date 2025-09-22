/**
 * 事件工具函数
 * 提供事件处理的辅助功能
 */

import type { EventUtils, CustomEvent as ICustomEvent } from '../types/events';

/**
 * 自定义事件类实现
 */
export class CustomEvent<T = any> implements ICustomEvent<T> {
  public readonly type: string;
  public readonly target: any;
  public readonly timestamp: number;
  public readonly data: T;
  
  private _defaultPrevented = false;
  private _propagationStopped = false;
  
  constructor(type: string, data: T, target?: any) {
    this.type = type;
    this.data = data;
    this.target = target;
    this.timestamp = Date.now();
  }
  
  preventDefault(): void {
    this._defaultPrevented = true;
  }
  
  stopPropagation(): void {
    this._propagationStopped = true;
  }
  
  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
  
  get propagationStopped(): boolean {
    return this._propagationStopped;
  }
}

/**
 * 事件工具函数实现
 */
export const eventUtils: EventUtils = {
  /**
   * 创建自定义事件
   */
  createEvent<T>(type: string, data: T, target?: any): CustomEvent<T> {
    return new CustomEvent(type, data, target);
  },

  /**
   * 事件防抖
   */
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * 事件节流
   */
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  },

  /**
   * 事件委托
   */
  delegate(
    container: HTMLElement,
    selector: string,
    event: string,
    handler: (event: Event) => void
  ): () => void {
    const delegateHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const matchedElement = target.closest(selector);
      
      if (matchedElement && container.contains(matchedElement)) {
        handler(event);
      }
    };

    container.addEventListener(event, delegateHandler);
    
    return () => {
      container.removeEventListener(event, delegateHandler);
    };
  },

  /**
   * 一次性事件监听
   */
  once(
    target: EventTarget,
    event: string,
    handler: (event: Event) => void
  ): () => void {
    const onceHandler = (event: Event) => {
      handler(event);
      target.removeEventListener(event, onceHandler);
    };

    target.addEventListener(event, onceHandler);
    
    return () => {
      target.removeEventListener(event, onceHandler);
    };
  }
};

/**
 * 事件总线类
 * 提供全局事件通信机制
 */
export class EventBus {
  private readonly events: Map<string, Set<Function>>;
  private readonly onceEvents: Map<string, Set<Function>>;

  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * 添加事件监听器
   */
  on(event: string, handler: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler: Function): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: string, handler: Function): void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }
    this.onceEvents.get(event)!.add(handler);
  }

  /**
   * 发射事件
   */
  emit(event: string, ...args: any[]): void {
    // 触发普通监听器
    const handlers = this.events.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }

    // 触发一次性监听器
    const onceHandlers = this.onceEvents.get(event);
    if (onceHandlers) {
      for (const handler of onceHandlers) {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in once event handler for ${event}:`, error);
        }
      }
      this.onceEvents.delete(event);
    }
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    const regularCount = this.events.get(event)?.size || 0;
    const onceCount = this.onceEvents.get(event)?.size || 0;
    return regularCount + onceCount;
  }
}

/**
 * 全局事件总线实例
 */
export const globalEventBus = new EventBus();

/**
 * 事件混入器
 * 为对象添加事件功能
 */
export function eventMixin<T extends object>(target: T): T & EventBus {
  const eventBus = new EventBus();
  
  return Object.assign(target, {
    on: eventBus.on.bind(eventBus),
    off: eventBus.off.bind(eventBus),
    once: eventBus.once.bind(eventBus),
    emit: eventBus.emit.bind(eventBus),
    clear: eventBus.clear.bind(eventBus),
    listenerCount: eventBus.listenerCount.bind(eventBus)
  });
}

/**
 * 事件装饰器
 * 为类方法添加事件监听功能
 */
export function eventListener(event: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // 如果对象有事件系统，自动监听事件
      if (this.on && typeof this.on === 'function') {
        this.on(event, originalMethod.bind(this));
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 事件发射器装饰器
 * 为类方法添加事件发射功能
 */
export function eventEmitter(event: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      // 如果对象有事件系统，自动发射事件
      if (this.emit && typeof this.emit === 'function') {
        this.emit(event, result, ...args);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * 键盘事件工具
 */
export const keyboardUtils = {
  /**
   * 检查是否按下了指定键
   */
  isKey(event: KeyboardEvent, key: string): boolean {
    return event.key === key || event.code === key;
  },

  /**
   * 检查是否按下了组合键
   */
  isCombo(event: KeyboardEvent, combo: string): boolean {
    const keys = combo.toLowerCase().split('+');
    const modifiers = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey
    };

    return keys.every(key => {
      if (key in modifiers) {
        return (modifiers as any)[key];
      }
      return event.key.toLowerCase() === key || event.code.toLowerCase() === key;
    });
  },

  /**
   * 创建键盘快捷键监听器
   */
  shortcut(combo: string, handler: (event: KeyboardEvent) => void): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      if (this.isCombo(event, combo)) {
        event.preventDefault();
        handler(event);
      }
    };
  }
};

/**
 * 鼠标事件工具
 */
export const mouseUtils = {
  /**
   * 获取鼠标相对于元素的位置
   */
  getRelativePosition(event: MouseEvent, element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  },

  /**
   * 获取鼠标相对于元素的百分比位置
   */
  getRelativePercentage(event: MouseEvent, element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
  },

  /**
   * 检查是否在元素内
   */
  isInside(event: MouseEvent, element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }
};

/**
 * 触摸事件工具
 */
export const touchUtils = {
  /**
   * 获取触摸点相对于元素的位置
   */
  getRelativePosition(touch: Touch, element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  },

  /**
   * 计算两个触摸点之间的距离
   */
  getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * 检测手势方向
   */
  getSwipeDirection(startTouch: Touch, endTouch: Touch): 'up' | 'down' | 'left' | 'right' | null {
    const dx = endTouch.clientX - startTouch.clientX;
    const dy = endTouch.clientY - startTouch.clientY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 30) {
      return null; // 移动距离太小
    }

    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }
};

// 导出所有工具
export { eventUtils as default };
