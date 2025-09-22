/**
 * EventManager 事件管理器测试
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EventManager } from '../../src/core/EventManager';

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  describe('基础事件功能', () => {
    test('应该能够添加事件监听器', () => {
      const callback = vi.fn();
      eventManager.on('play', callback);
      
      eventManager.emit('play', { type: 'play' });
      
      expect(callback).toHaveBeenCalled();
    });

    test('应该能够移除事件监听器', () => {
      const callback = vi.fn();
      eventManager.on('play', callback);
      eventManager.off('play', callback);
      
      eventManager.emit('play', { type: 'play' });
      
      expect(callback).not.toHaveBeenCalled();
    });

    test('应该能够添加一次性事件监听器', () => {
      const callback = vi.fn();
      eventManager.once('play', callback);
      
      eventManager.emit('play', { type: 'play' });
      eventManager.emit('play', { type: 'play' });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('应该能够获取监听器数量', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventManager.on('play', callback1);
      eventManager.on('play', callback2);
      
      expect(eventManager.listenerCount('play')).toBe(2);
    });

    test('应该能够获取所有监听器', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventManager.on('play', callback1);
      eventManager.on('play', callback2);
      
      const listeners = eventManager.listeners('play');
      expect(listeners).toHaveLength(2);
      expect(listeners).toContain(callback1);
      expect(listeners).toContain(callback2);
    });

    test('应该能够移除所有监听器', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventManager.on('play', callback1);
      eventManager.on('pause', callback2);
      
      eventManager.removeAllListeners('play');
      
      expect(eventManager.listenerCount('play')).toBe(0);
      expect(eventManager.listenerCount('pause')).toBe(1);
    });

    test('应该能够清除所有事件', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      eventManager.on('play', callback1);
      eventManager.on('pause', callback2);
      
      eventManager.clear();
      
      expect(eventManager.listenerCount('play')).toBe(0);
      expect(eventManager.listenerCount('pause')).toBe(0);
    });
  });

  describe('高级功能', () => {
    test('应该能够设置事件过滤器', () => {
      const callback = vi.fn();
      const filter = vi.fn().mockReturnValue(false);
      
      eventManager.setFilter(filter);
      eventManager.on('play', callback);
      eventManager.emit('play', { type: 'play' });
      
      expect(filter).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    test('应该能够设置事件转换器', () => {
      const callback = vi.fn();
      const transformer = vi.fn().mockReturnValue({ type: 'transformed' });
      
      eventManager.setTransformer(transformer);
      eventManager.on('play', callback);
      eventManager.emit('play', { type: 'play' });
      
      expect(transformer).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ type: 'transformed' });
    });

    test('应该能够获取事件统计', () => {
      const callback = vi.fn();
      eventManager.on('play', callback);
      eventManager.emit('play', { type: 'play' });
      
      const stats = eventManager.getStats();
      expect(stats.totalEvents).toBe(1);
      expect(stats.eventCounts.play).toBe(1);
    });
  });
});
