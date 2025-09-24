/**
 * 几何工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  distance,
  angle,
  pointInRectangle,
  pointInCircle,
  lineIntersection,
  bezierPoint,
  cubicBezierPoint,
  pointToLineDistance
} from '@/utils/geometry.js';
import type { Point } from '@/types/index.js';

describe('几何工具函数', () => {
  describe('distance', () => {
    it('应该正确计算两点间距离', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };
      
      expect(distance(p1, p2)).toBe(5);
    });

    it('应该处理相同点的情况', () => {
      const p1: Point = { x: 1, y: 1 };
      const p2: Point = { x: 1, y: 1 };
      
      expect(distance(p1, p2)).toBe(0);
    });

    it('应该处理负坐标', () => {
      const p1: Point = { x: -1, y: -1 };
      const p2: Point = { x: 2, y: 3 };
      
      expect(distance(p1, p2)).toBe(5);
    });
  });

  describe('angle', () => {
    it('应该正确计算角度', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 1, y: 0 };
      
      expect(angle(p1, p2)).toBe(0);
    });

    it('应该正确计算90度角', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 0, y: 1 };
      
      expect(angle(p1, p2)).toBeCloseTo(Math.PI / 2);
    });

    it('应该正确计算180度角', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: -1, y: 0 };
      
      expect(angle(p1, p2)).toBeCloseTo(Math.PI);
    });
  });

  describe('pointInRectangle', () => {
    it('应该正确判断点在矩形内', () => {
      const point: Point = { x: 5, y: 5 };
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(pointInRectangle(point, rect)).toBe(true);
    });

    it('应该正确判断点在矩形外', () => {
      const point: Point = { x: 15, y: 5 };
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(pointInRectangle(point, rect)).toBe(false);
    });

    it('应该正确处理边界情况', () => {
      const point: Point = { x: 10, y: 10 };
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      
      expect(pointInRectangle(point, rect)).toBe(true);
    });
  });

  describe('pointInCircle', () => {
    it('应该正确判断点在圆内', () => {
      const point: Point = { x: 3, y: 4 };
      const center: Point = { x: 0, y: 0 };
      const radius = 10;
      
      expect(pointInCircle(point, center, radius)).toBe(true);
    });

    it('应该正确判断点在圆外', () => {
      const point: Point = { x: 10, y: 10 };
      const center: Point = { x: 0, y: 0 };
      const radius = 5;
      
      expect(pointInCircle(point, center, radius)).toBe(false);
    });

    it('应该正确处理边界情况', () => {
      const point: Point = { x: 5, y: 0 };
      const center: Point = { x: 0, y: 0 };
      const radius = 5;
      
      expect(pointInCircle(point, center, radius)).toBe(true);
    });
  });

  describe('lineIntersection', () => {
    it('应该正确计算相交线段的交点', () => {
      const line1 = {
        start: { x: 0, y: 0 },
        end: { x: 10, y: 10 }
      };
      const line2 = {
        start: { x: 0, y: 10 },
        end: { x: 10, y: 0 }
      };
      
      const intersection = lineIntersection(line1, line2);
      expect(intersection).not.toBeNull();
      expect(intersection!.x).toBeCloseTo(5);
      expect(intersection!.y).toBeCloseTo(5);
    });

    it('应该正确处理平行线', () => {
      const line1 = {
        start: { x: 0, y: 0 },
        end: { x: 10, y: 0 }
      };
      const line2 = {
        start: { x: 0, y: 5 },
        end: { x: 10, y: 5 }
      };
      
      const intersection = lineIntersection(line1, line2);
      expect(intersection).toBeNull();
    });

    it('应该正确处理不相交的线段', () => {
      const line1 = {
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
      };
      const line2 = {
        start: { x: 2, y: 2 },
        end: { x: 3, y: 3 }
      };
      
      const intersection = lineIntersection(line1, line2);
      expect(intersection).toBeNull();
    });
  });

  describe('bezierPoint', () => {
    it('应该正确计算二次贝塞尔曲线上的点', () => {
      const p0: Point = { x: 0, y: 0 };
      const p1: Point = { x: 5, y: 10 };
      const p2: Point = { x: 10, y: 0 };
      
      // t = 0 应该返回起点
      const start = bezierPoint(0, p0, p1, p2);
      expect(start.x).toBeCloseTo(0);
      expect(start.y).toBeCloseTo(0);
      
      // t = 1 应该返回终点
      const end = bezierPoint(1, p0, p1, p2);
      expect(end.x).toBeCloseTo(10);
      expect(end.y).toBeCloseTo(0);
      
      // t = 0.5 应该返回中点
      const mid = bezierPoint(0.5, p0, p1, p2);
      expect(mid.x).toBeCloseTo(5);
      expect(mid.y).toBeCloseTo(5);
    });
  });

  describe('cubicBezierPoint', () => {
    it('应该正确计算三次贝塞尔曲线上的点', () => {
      const p0: Point = { x: 0, y: 0 };
      const p1: Point = { x: 0, y: 10 };
      const p2: Point = { x: 10, y: 10 };
      const p3: Point = { x: 10, y: 0 };
      
      // t = 0 应该返回起点
      const start = cubicBezierPoint(0, p0, p1, p2, p3);
      expect(start.x).toBeCloseTo(0);
      expect(start.y).toBeCloseTo(0);
      
      // t = 1 应该返回终点
      const end = cubicBezierPoint(1, p0, p1, p2, p3);
      expect(end.x).toBeCloseTo(10);
      expect(end.y).toBeCloseTo(0);
    });
  });

  describe('pointToLineDistance', () => {
    it('应该正确计算点到线段的距离', () => {
      const point: Point = { x: 5, y: 5 };
      const lineStart: Point = { x: 0, y: 0 };
      const lineEnd: Point = { x: 10, y: 0 };
      
      const dist = pointToLineDistance(point, lineStart, lineEnd);
      expect(dist).toBeCloseTo(5);
    });

    it('应该正确处理点在线段上的情况', () => {
      const point: Point = { x: 5, y: 0 };
      const lineStart: Point = { x: 0, y: 0 };
      const lineEnd: Point = { x: 10, y: 0 };
      
      const dist = pointToLineDistance(point, lineStart, lineEnd);
      expect(dist).toBeCloseTo(0);
    });

    it('应该正确处理点在线段延长线上的情况', () => {
      const point: Point = { x: 15, y: 0 };
      const lineStart: Point = { x: 0, y: 0 };
      const lineEnd: Point = { x: 10, y: 0 };
      
      const dist = pointToLineDistance(point, lineStart, lineEnd);
      expect(dist).toBeCloseTo(5);
    });
  });
});
