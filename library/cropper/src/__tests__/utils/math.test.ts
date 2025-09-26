/**
 * @ldesign/cropper 数学工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  degreesToRadians,
  radiansToDegrees,
  clamp,
  lerp,
  isNearlyEqual,
  roundToPrecision,
  distance,
  angle,
  midpoint,
  rotatePoint,
  scalePoint,
  isPointInRect,
  isRectIntersecting,
  rectIntersection,
  rectUnion,
  getRectCenter,
  createRectFromCenter,
  createIdentityMatrix,
  createTranslateMatrix,
  createScaleMatrix,
  createRotateMatrix,
  multiplyMatrix,
  transformPoint,
  invertMatrix
} from '../../utils/math';

describe('数学工具函数', () => {
  describe('基础数学函数', () => {
    it('应该正确转换角度到弧度', () => {
      expect(degreesToRadians(0)).toBe(0);
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(degreesToRadians(360)).toBeCloseTo(Math.PI * 2);
    });

    it('应该正确转换弧度到角度', () => {
      expect(radiansToDegrees(0)).toBe(0);
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
      expect(radiansToDegrees(Math.PI * 2)).toBeCloseTo(360);
    });

    it('应该正确限制数值范围', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('应该正确进行线性插值', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.3)).toBe(13);
    });

    it('应该正确检查数值是否接近', () => {
      expect(isNearlyEqual(1, 1)).toBe(true);
      expect(isNearlyEqual(1, 1.0000001)).toBe(true);
      expect(isNearlyEqual(1, 1.1)).toBe(false);
      expect(isNearlyEqual(1, 1.000002, 0.000001)).toBe(false);
    });

    it('应该正确四舍五入到指定精度', () => {
      expect(roundToPrecision(3.14159, 2)).toBe(3.14);
      expect(roundToPrecision(3.14159, 0)).toBe(3);
      expect(roundToPrecision(3.14159, 4)).toBe(3.1416);
    });
  });

  describe('点和向量计算', () => {
    it('应该正确计算两点距离', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
      expect(distance({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1);
    });

    it('应该正确计算两点角度', () => {
      expect(angle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
      expect(angle({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
      expect(angle({ x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
    });

    it('应该正确计算中点', () => {
      const mid = midpoint({ x: 0, y: 0 }, { x: 4, y: 6 });
      expect(mid.x).toBe(2);
      expect(mid.y).toBe(3);
    });

    it('应该正确旋转点', () => {
      const rotated = rotatePoint({ x: 1, y: 0 }, { x: 0, y: 0 }, Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0);
      expect(rotated.y).toBeCloseTo(1);
    });

    it('应该正确缩放点', () => {
      const scaled = scalePoint({ x: 2, y: 2 }, { x: 0, y: 0 }, 2);
      expect(scaled.x).toBe(4);
      expect(scaled.y).toBe(4);
    });
  });

  describe('矩形计算', () => {
    const rect = { x: 10, y: 10, width: 20, height: 20 };

    it('应该正确检查点是否在矩形内', () => {
      expect(isPointInRect({ x: 15, y: 15 }, rect)).toBe(true);
      expect(isPointInRect({ x: 5, y: 15 }, rect)).toBe(false);
      expect(isPointInRect({ x: 10, y: 10 }, rect)).toBe(true);
      expect(isPointInRect({ x: 30, y: 30 }, rect)).toBe(true);
      expect(isPointInRect({ x: 31, y: 31 }, rect)).toBe(false);
    });

    it('应该正确检查矩形相交', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      const rect3 = { x: 20, y: 20, width: 10, height: 10 };

      expect(isRectIntersecting(rect1, rect2)).toBe(true);
      expect(isRectIntersecting(rect1, rect3)).toBe(false);
    });

    it('应该正确计算矩形交集', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      const intersection = rectIntersection(rect1, rect2);

      expect(intersection).toEqual({ x: 5, y: 5, width: 5, height: 5 });
    });

    it('应该正确计算矩形并集', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      const union = rectUnion(rect1, rect2);

      expect(union).toEqual({ x: 0, y: 0, width: 15, height: 15 });
    });

    it('应该正确获取矩形中心点', () => {
      const center = getRectCenter(rect);
      expect(center.x).toBe(20);
      expect(center.y).toBe(20);
    });

    it('应该正确从中心点创建矩形', () => {
      const center = { x: 20, y: 20 };
      const size = { width: 20, height: 20 };
      const newRect = createRectFromCenter(center, size);

      expect(newRect).toEqual({ x: 10, y: 10, width: 20, height: 20 });
    });
  });

  describe('矩阵变换', () => {
    it('应该创建正确的单位矩阵', () => {
      const identity = createIdentityMatrix();
      expect(identity).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
    });

    it('应该创建正确的平移矩阵', () => {
      const translate = createTranslateMatrix(10, 20);
      expect(translate).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 10, f: 20 });
    });

    it('应该创建正确的缩放矩阵', () => {
      const scale = createScaleMatrix(2, 3);
      expect(scale).toEqual({ a: 2, b: 0, c: 0, d: 3, e: 0, f: 0 });
    });

    it('应该创建正确的旋转矩阵', () => {
      const rotate = createRotateMatrix(Math.PI / 2);
      expect(rotate.a).toBeCloseTo(0);
      expect(rotate.b).toBeCloseTo(1);
      expect(rotate.c).toBeCloseTo(-1);
      expect(rotate.d).toBeCloseTo(0);
    });

    it('应该正确进行矩阵乘法', () => {
      const m1 = createTranslateMatrix(10, 20);
      const m2 = createScaleMatrix(2, 2);
      const result = multiplyMatrix(m1, m2);

      expect(result.a).toBe(2);
      expect(result.d).toBe(2);
      expect(result.e).toBe(10);
      expect(result.f).toBe(20);
    });

    it('应该正确变换点', () => {
      const matrix = createTranslateMatrix(10, 20);
      const point = { x: 5, y: 5 };
      const transformed = transformPoint(point, matrix);

      expect(transformed.x).toBe(15);
      expect(transformed.y).toBe(25);
    });

    it('应该正确计算逆矩阵', () => {
      const matrix = createScaleMatrix(2, 3);
      const inverse = invertMatrix(matrix);

      expect(inverse).not.toBeNull();
      expect(inverse!.a).toBeCloseTo(0.5);
      expect(inverse!.d).toBeCloseTo(1 / 3);
    });

    it('应该对不可逆矩阵返回null', () => {
      const singular = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
      const inverse = invertMatrix(singular);
      expect(inverse).toBeNull();
    });
  });
});
