import { describe, it, expect } from 'vitest';
import {
  generateId,
  distance,
  midpoint,
  deepClone,
  merge,
  rectContainsPoint
} from '@/utils/helpers';

describe('helpers', () => {
  describe('generateId', () => {
    it('应该生成带前缀的唯一ID', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');

      expect(id1).toMatch(/^test_/);
      expect(id2).toMatch(/^test_/);
      expect(id1).not.toBe(id2);
    });

    it('应该使用默认前缀', () => {
      const id = generateId();
      expect(id).toMatch(/^id_/);
    });
  });

  describe('distance', () => {
    it('应该计算两点之间的距离', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };

      expect(distance(p1, p2)).toBe(5);
    });

    it('应该处理相同的点', () => {
      const p = { x: 5, y: 10 };
      expect(distance(p, p)).toBe(0);
    });
  });

  describe('midpoint', () => {
    it('应该计算两点的中点', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 10, y: 20 };

      const mid = midpoint(p1, p2);
      expect(mid.x).toBe(5);
      expect(mid.y).toBe(10);
    });
  });

  describe('deepClone', () => {
    it('应该深度克隆对象', () => {
      const obj = {
        a: 1,
        b: { c: 2 },
        d: [1, 2, { e: 3 }]
      };

      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
      expect(cloned.d).not.toBe(obj.d);
    });

    it('应该处理基本类型', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(42)).toBe(42);
      expect(deepClone('test')).toBe('test');
    });
  });

  describe('merge', () => {
    it('应该合并对象', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      const result = merge(target, source);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });
  });

  describe('rectContainsPoint', () => {
    it('应该判断点是否在矩形内', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 };

      expect(rectContainsPoint(rect, { x: 50, y: 50 })).toBe(true);
      expect(rectContainsPoint(rect, { x: 0, y: 0 })).toBe(true);
      expect(rectContainsPoint(rect, { x: 100, y: 100 })).toBe(true);
      expect(rectContainsPoint(rect, { x: 101, y: 50 })).toBe(false);
      expect(rectContainsPoint(rect, { x: 50, y: 101 })).toBe(false);
    });
  });
});

