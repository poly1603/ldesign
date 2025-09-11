/**
 * SimpleEventEmitter 边界行为测试
 */

import { describe, it, expect } from 'vitest';
import { SimpleEventEmitter } from '@/utils/events.js';

describe('SimpleEventEmitter', () => {
  it('on/emit/off 应按预期工作', () => {
    const bus = new SimpleEventEmitter();
    const calls: any[] = [];
    const fn = (v: any) => calls.push(v);
    bus.on('evt', fn);
    bus.emit('evt', 1);
    bus.emit('evt', 2);
    expect(calls).toEqual([1, 2]);

    bus.off('evt', fn);
    bus.emit('evt', 3);
    expect(calls).toEqual([1, 2]); // 不再触发
  });

  it('once 只触发一次', () => {
    const bus = new SimpleEventEmitter();
    let n = 0;
    bus.once('evt', () => n++);
    bus.emit('evt');
    bus.emit('evt');
    expect(n).toBe(1);
  });

  it('removeAllListeners 可清空指定或全部事件', () => {
    const bus = new SimpleEventEmitter();
    const fn = () => {};
    bus.on('a', fn);
    bus.on('b', fn);
    expect(bus.listenerCount('a')).toBe(1);
    expect(bus.listenerCount('b')).toBe(1);

    bus.removeAllListeners('a');
    expect(bus.listenerCount('a')).toBe(0);
    expect(bus.listenerCount('b')).toBe(1);

    bus.removeAllListeners();
    expect(bus.listenerCount('b')).toBe(0);
    expect(bus.eventNames().length).toBe(0);
  });
});

