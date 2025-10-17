/**
 * 事件监听器类型
 */
type EventListener = (...args: any[]) => void;

/**
 * 事件管理器
 * 用于管理流程图中的各种事件
 */
export class EventEmitter {
  private events: Map<string, EventListener[]>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 注册事件监听器
   */
  public on(event: string, listener: EventListener): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  /**
   * 注册一次性事件监听器
   */
  public once(event: string, listener: EventListener): void {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  /**
   * 移除事件监听器
   */
  public off(event: string, listener: EventListener): void {
    const listeners = this.events.get(event);
    if (!listeners) {
      return;
    }

    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * 触发事件
   */
  public emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (!listeners) {
      return;
    }

    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * 移除指定事件的所有监听器
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * 获取事件的监听器数量
   */
  public listenerCount(event: string): number {
    return this.events.get(event)?.length ?? 0;
  }

  /**
   * 获取所有事件名称
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}

/**
 * 流程图事件类型
 */
export enum FlowChartEvents {
  // 节点事件
  NODE_ADDED = 'node:added',
  NODE_REMOVED = 'node:removed',
  NODE_UPDATED = 'node:updated',
  NODE_CLICKED = 'node:clicked',
  NODE_DRAG_START = 'node:drag:start',
  NODE_DRAG = 'node:drag',
  NODE_DRAG_END = 'node:drag:end',

  // 边事件
  EDGE_ADDED = 'edge:added',
  EDGE_REMOVED = 'edge:removed',
  EDGE_UPDATED = 'edge:updated',
  EDGE_CLICKED = 'edge:clicked',

  // 流程图事件
  RENDER_START = 'render:start',
  RENDER_END = 'render:end',
  LAYOUT_START = 'layout:start',
  LAYOUT_END = 'layout:end',
  CLEAR = 'clear',

  // 视图事件
  ZOOM = 'zoom',
  PAN = 'pan',
  FIT_VIEW = 'fitView',

  // 验证事件
  VALIDATE_START = 'validate:start',
  VALIDATE_END = 'validate:end',
  VALIDATE_ERROR = 'validate:error'
}

