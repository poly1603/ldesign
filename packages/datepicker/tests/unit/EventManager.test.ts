/**
 * EventManager 事件管理器测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventManager } from '../../src/core/EventManager';

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  describe('基础事件功能', () => {
    it('应该能够添加和触发事件监听器', () => {
      const mockCallback = vi.fn();
      
      eventManager.on('test-event', mockCallback);
      eventManager.emit('test-event', 'test-data');
      
      expect(mockCallback).toHaveBeenCalledWith('test-data');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('应该能够添加多个监听器', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      eventManager.on('test-event', mockCallback1);
      eventManager.on('test-event', mockCallback2);
      eventManager.emit('test-event', 'test-data');
      
      expect(mockCallback1).toHaveBeenCalledWith('test-data');
      expect(mockCallback2).toHaveBeenCalledWith('test-data');
    });

    it('应该能够移除指定的监听器', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      eventManager.on('test-event', mockCallback1);
      eventManager.on('test-event', mockCallback2);
      eventManager.off('test-event', mockCallback1);
      eventManager.emit('test-event', 'test-data');
      
      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalledWith('test-data');
    });

    it('应该能够移除所有监听器', () => {
      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();
      
      eventManager.on('test-event', mockCallback1);
      eventManager.on('test-event', mockCallback2);
      eventManager.off('test-event');
      eventManager.emit('test-event', 'test-data');
      
      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });
  });

  describe('一次性监听器', () => {
    it('应该只执行一次', () => {
      const mockCallback = vi.fn();
      
      eventManager.once('test-event', mockCallback);
      eventManager.emit('test-event', 'data1');
      eventManager.emit('test-event', 'data2');
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('data1');
    });

    it('应该在执行后自动移除', () => {
      const mockCallback = vi.fn();
      
      eventManager.once('test-event', mockCallback);
      expect(eventManager.getListenerCount('test-event')).toBe(1);
      
      eventManager.emit('test-event', 'data');
      expect(eventManager.getListenerCount('test-event')).toBe(0);
    });
  });

  describe('优先级功能', () => {
    it('应该按优先级顺序执行监听器', () => {
      const executionOrder: number[] = [];
      
      eventManager.on('test-event', () => executionOrder.push(1), { priority: 1 });
      eventManager.on('test-event', () => executionOrder.push(3), { priority: 3 });
      eventManager.on('test-event', () => executionOrder.push(2), { priority: 2 });
      
      eventManager.emit('test-event');
      
      expect(executionOrder).toEqual([3, 2, 1]); // 高优先级先执行
    });
  });

  describe('监听器管理', () => {
    it('应该正确返回监听器数量', () => {
      expect(eventManager.getListenerCount('test-event')).toBe(0);
      
      eventManager.on('test-event', () => {});
      expect(eventManager.getListenerCount('test-event')).toBe(1);
      
      eventManager.on('test-event', () => {});
      expect(eventManager.getListenerCount('test-event')).toBe(2);
    });

    it('应该正确检查是否有监听器', () => {
      expect(eventManager.hasListeners('test-event')).toBe(false);
      
      eventManager.on('test-event', () => {});
      expect(eventManager.hasListeners('test-event')).toBe(true);
      
      eventManager.off('test-event');
      expect(eventManager.hasListeners('test-event')).toBe(false);
    });

    it('应该返回所有事件名称', () => {
      eventManager.on('event1', () => {});
      eventManager.on('event2', () => {});
      
      const eventNames = eventManager.getEventNames();
      expect(eventNames).toContain('event1');
      expect(eventNames).toContain('event2');
      expect(eventNames).toHaveLength(2);
    });

    it('应该返回总监听器数量', () => {
      eventManager.on('event1', () => {});
      eventManager.on('event1', () => {});
      eventManager.on('event2', () => {});
      
      expect(eventManager.getTotalListenerCount()).toBe(3);
    });
  });

  describe('错误处理', () => {
    it('应该捕获监听器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();
      
      eventManager.on('test-event', errorCallback);
      eventManager.on('test-event', normalCallback);
      
      eventManager.emit('test-event');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled(); // 其他监听器应该继续执行
      
      consoleSpy.mockRestore();
    });
  });

  describe('监听器限制', () => {
    it('应该限制最大监听器数量', () => {
      const limitedEventManager = new EventManager({ maxListeners: 2 });
      
      limitedEventManager.on('test-event', () => {});
      limitedEventManager.on('test-event', () => {});
      
      expect(() => {
        limitedEventManager.on('test-event', () => {});
      }).toThrow();
    });
  });

  describe('清理功能', () => {
    it('应该能够清除所有监听器', () => {
      eventManager.on('event1', () => {});
      eventManager.on('event2', () => {});
      
      expect(eventManager.getTotalListenerCount()).toBe(2);
      
      eventManager.clear();
      
      expect(eventManager.getTotalListenerCount()).toBe(0);
      expect(eventManager.getEventNames()).toHaveLength(0);
    });

    it('应该能够销毁事件管理器', () => {
      eventManager.on('test-event', () => {});
      
      eventManager.destroy();
      
      expect(eventManager.getTotalListenerCount()).toBe(0);
    });
  });

  describe('性能统计', () => {
    it('应该在启用性能监控时收集统计信息', () => {
      const performanceEventManager = new EventManager({ performance: true });
      
      performanceEventManager.on('test-event', () => {});
      performanceEventManager.emit('test-event');
      performanceEventManager.emit('test-event');
      
      const stats = performanceEventManager.getPerformanceStats();
      expect(stats['test-event']).toBeDefined();
      expect(stats['test-event'].count).toBe(2);
      expect(stats['test-event'].totalTime).toBeGreaterThanOrEqual(0);
      expect(stats['test-event'].averageTime).toBeGreaterThanOrEqual(0);
    });

    it('应该能够重置性能统计', () => {
      const performanceEventManager = new EventManager({ performance: true });
      
      performanceEventManager.on('test-event', () => {});
      performanceEventManager.emit('test-event');
      
      let stats = performanceEventManager.getPerformanceStats();
      expect(Object.keys(stats)).toHaveLength(1);
      
      performanceEventManager.resetPerformanceStats();
      
      stats = performanceEventManager.getPerformanceStats();
      expect(Object.keys(stats)).toHaveLength(0);
    });
  });

  describe('调试模式', () => {
    it('应该在调试模式下输出日志', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const debugEventManager = new EventManager({ debug: true });
      
      debugEventManager.on('test-event', () => {});
      debugEventManager.emit('test-event');
      debugEventManager.off('test-event');
      debugEventManager.clear();
      
      expect(consoleSpy).toHaveBeenCalledTimes(4); // on, emit, off, clear 各一次
      
      consoleSpy.mockRestore();
    });
  });
});
