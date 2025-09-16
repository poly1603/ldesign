/**
 * 事件管理类
 * 提供事件监听、触发、优先级管理、性能监控等功能
 */

import type {
  EventListener,
  EventListenerConfig,
  EventData
} from '../types';

/**
 * 事件监听器信息接口
 */
interface ListenerInfo {
  /** 监听器函数 */
  listener: EventListener;
  
  /** 配置选项 */
  config: EventListenerConfig;
  
  /** 唯一ID */
  id: string;
  
  /** 添加时间 */
  addedAt: number;
  
  /** 调用次数 */
  callCount: number;
  
  /** 总执行时间 */
  totalExecutionTime: number;
}

/**
 * 事件统计信息接口
 */
interface EventStats {
  /** 事件名称 */
  eventName: string;
  
  /** 触发次数 */
  triggerCount: number;
  
  /** 监听器数量 */
  listenerCount: number;
  
  /** 总执行时间 */
  totalExecutionTime: number;
  
  /** 平均执行时间 */
  averageExecutionTime: number;
  
  /** 最后触发时间 */
  lastTriggeredAt: number;
}

/**
 * 事件管理器类
 */
export class EventManager {
  /** 事件监听器映射 */
  private listeners: Map<string, ListenerInfo[]> = new Map();
  
  /** 事件统计信息 */
  private stats: Map<string, EventStats> = new Map();
  
  /** 是否启用性能监控 */
  private performanceMonitoring: boolean = false;
  
  /** 最大监听器数量 */
  private maxListeners: number = 100;
  
  /** 监听器ID计数器 */
  private listenerIdCounter: number = 0;
  
  // ==================== 构造函数 ====================
  
  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: {
    performanceMonitoring?: boolean;
    maxListeners?: number;
  } = {}) {
    this.performanceMonitoring = options.performanceMonitoring ?? false;
    this.maxListeners = options.maxListeners ?? 100;
  }
  
  // ==================== 事件监听方法 ====================
  
  /**
   * 添加事件监听器
   * @param eventName 事件名称
   * @param listener 监听器函数
   * @param config 配置选项
   * @returns 监听器ID
   */
  on(
    eventName: string,
    listener: EventListener,
    config: EventListenerConfig = {}
  ): string {
    if (!eventName || typeof listener !== 'function') {
      throw new Error('事件名称和监听器函数都是必需的');
    }
    
    // 检查监听器数量限制
    const existingListeners = this.listeners.get(eventName) || [];
    if (existingListeners.length >= this.maxListeners) {
      console.warn(`事件 "${eventName}" 的监听器数量已达到最大限制 (${this.maxListeners})`);
    }
    
    // 创建监听器信息
    const listenerId = this.generateListenerId();
    const listenerInfo: ListenerInfo = {
      listener,
      config: { priority: 0, ...config },
      id: listenerId,
      addedAt: Date.now(),
      callCount: 0,
      totalExecutionTime: 0
    };
    
    // 添加到监听器列表
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    const listeners = this.listeners.get(eventName)!;
    listeners.push(listenerInfo);
    
    // 按优先级排序
    this.sortListenersByPriority(eventName);
    
    // 初始化统计信息
    if (!this.stats.has(eventName)) {
      this.stats.set(eventName, {
        eventName,
        triggerCount: 0,
        listenerCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastTriggeredAt: 0
      });
    }
    
    // 更新监听器数量
    const stats = this.stats.get(eventName)!;
    stats.listenerCount = listeners.length;
    
    return listenerId;
  }
  
  /**
   * 添加一次性事件监听器
   * @param eventName 事件名称
   * @param listener 监听器函数
   * @param config 配置选项
   * @returns 监听器ID
   */
  once(
    eventName: string,
    listener: EventListener,
    config: EventListenerConfig = {}
  ): string {
    return this.on(eventName, listener, { ...config, once: true });
  }
  
  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param listenerId 监听器ID或监听器函数
   * @returns 是否成功移除
   */
  off(eventName: string, listenerId?: string | EventListener): boolean {
    const listeners = this.listeners.get(eventName);
    if (!listeners) {
      return false;
    }
    
    let removed = false;
    
    if (!listenerId) {
      // 移除所有监听器
      this.listeners.delete(eventName);
      this.stats.delete(eventName);
      removed = true;
    } else if (typeof listenerId === 'string') {
      // 根据ID移除
      const index = listeners.findIndex(info => info.id === listenerId);
      if (index !== -1) {
        listeners.splice(index, 1);
        removed = true;
      }
    } else {
      // 根据函数引用移除
      const index = listeners.findIndex(info => info.listener === listenerId);
      if (index !== -1) {
        listeners.splice(index, 1);
        removed = true;
      }
    }
    
    // 更新统计信息
    if (removed) {
      const stats = this.stats.get(eventName);
      if (stats) {
        stats.listenerCount = listeners.length;
      }
      
      // 如果没有监听器了，清理统计信息
      if (listeners.length === 0) {
        this.listeners.delete(eventName);
        this.stats.delete(eventName);
      }
    }
    
    return removed;
  }
  
  // ==================== 事件触发方法 ====================
  
  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   * @returns 是否有监听器处理了事件
   */
  emit(eventName: string, data?: any): boolean {
    const listeners = this.listeners.get(eventName);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    // 创建事件数据
    const eventData: EventData = {
      type: eventName,
      data,
      timestamp: Date.now(),
      defaultPrevented: false
    };
    
    // 性能监控开始
    const startTime = this.performanceMonitoring ? performance.now() : 0;
    
    // 执行监听器
    const listenersToRemove: string[] = [];
    
    for (const listenerInfo of listeners) {
      try {
        // 监听器性能监控开始
        const listenerStartTime = this.performanceMonitoring ? performance.now() : 0;
        
        // 执行监听器
        listenerInfo.listener(eventData);
        
        // 监听器性能监控结束
        if (this.performanceMonitoring) {
          const listenerExecutionTime = performance.now() - listenerStartTime;
          listenerInfo.totalExecutionTime += listenerExecutionTime;
        }
        
        // 更新调用次数
        listenerInfo.callCount++;
        
        // 如果是一次性监听器，标记为待移除
        if (listenerInfo.config.once) {
          listenersToRemove.push(listenerInfo.id);
        }
        
      } catch (error) {
        console.error(`事件监听器执行错误 (${eventName}):`, error);
      }
    }
    
    // 移除一次性监听器
    listenersToRemove.forEach(id => {
      this.off(eventName, id);
    });
    
    // 性能监控结束
    if (this.performanceMonitoring) {
      const totalExecutionTime = performance.now() - startTime;
      this.updateEventStats(eventName, totalExecutionTime);
    }
    
    return true;
  }
  
  // ==================== 查询方法 ====================
  
  /**
   * 检查是否有指定事件的监听器
   * @param eventName 事件名称
   * @returns 是否有监听器
   */
  hasListeners(eventName: string): boolean {
    const listeners = this.listeners.get(eventName);
    return listeners ? listeners.length > 0 : false;
  }
  
  /**
   * 获取指定事件的监听器数量
   * @param eventName 事件名称
   * @returns 监听器数量
   */
  getListenerCount(eventName: string): number {
    const listeners = this.listeners.get(eventName);
    return listeners ? listeners.length : 0;
  }
  
  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }
  
  /**
   * 获取事件统计信息
   * @param eventName 事件名称
   * @returns 统计信息
   */
  getEventStats(eventName?: string): EventStats | EventStats[] {
    if (eventName) {
      return this.stats.get(eventName) || {
        eventName,
        triggerCount: 0,
        listenerCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastTriggeredAt: 0
      };
    }
    
    return Array.from(this.stats.values());
  }
  
  // ==================== 配置方法 ====================
  
  /**
   * 设置最大监听器数量
   * @param max 最大数量
   */
  setMaxListeners(max: number): void {
    this.maxListeners = Math.max(1, max);
  }
  
  /**
   * 启用或禁用性能监控
   * @param enabled 是否启用
   */
  setPerformanceMonitoring(enabled: boolean): void {
    this.performanceMonitoring = enabled;
  }
  
  /**
   * 清除所有监听器
   */
  removeAllListeners(): void {
    this.listeners.clear();
    this.stats.clear();
  }
  
  /**
   * 清除指定事件的所有监听器
   * @param eventName 事件名称
   */
  removeAllListenersForEvent(eventName: string): void {
    this.listeners.delete(eventName);
    this.stats.delete(eventName);
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 生成监听器ID
   * @returns 监听器ID
   */
  private generateListenerId(): string {
    return `listener_${++this.listenerIdCounter}_${Date.now()}`;
  }
  
  /**
   * 按优先级排序监听器
   * @param eventName 事件名称
   */
  private sortListenersByPriority(eventName: string): void {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.sort((a, b) => (b.config.priority || 0) - (a.config.priority || 0));
    }
  }
  
  /**
   * 更新事件统计信息
   * @param eventName 事件名称
   * @param executionTime 执行时间
   */
  private updateEventStats(eventName: string, executionTime: number): void {
    const stats = this.stats.get(eventName);
    if (stats) {
      stats.triggerCount++;
      stats.totalExecutionTime += executionTime;
      stats.averageExecutionTime = stats.totalExecutionTime / stats.triggerCount;
      stats.lastTriggeredAt = Date.now();
    }
  }
}
