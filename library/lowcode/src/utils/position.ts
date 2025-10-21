/**
 * 位置计算工具
 */

import type { Point, Rect } from '../types';

/**
 * 计算两点之间的距离
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * 计算两个矩形是否相交
 */
export function isRectIntersect(rect1: Rect, rect2: Rect): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * 计算两个矩形的交集
 */
export function getRectIntersection(rect1: Rect, rect2: Rect): Rect | null {
  const x = Math.max(rect1.x, rect2.x);
  const y = Math.max(rect1.y, rect2.y);
  const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
  const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

/**
 * 计算矩形的中心点
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * 将点限制在矩形内
 */
export function clampPointToRect(point: Point, rect: Rect): Point {
  return {
    x: Math.max(rect.x, Math.min(point.x, rect.x + rect.width)),
    y: Math.max(rect.y, Math.min(point.y, rect.y + rect.height))
  };
}

/**
 * 对齐到网格
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * 对齐点到网格
 */
export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize)
  };
}

/**
 * 对齐矩形到网格
 */
export function snapRectToGrid(rect: Rect, gridSize: number): Rect {
  return {
    x: snapToGrid(rect.x, gridSize),
    y: snapToGrid(rect.y, gridSize),
    width: snapToGrid(rect.width, gridSize),
    height: snapToGrid(rect.height, gridSize)
  };
}

/**
 * 限制值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 计算矩形的并集
 */
export function getRectUnion(rect1: Rect, rect2: Rect): Rect {
  const x = Math.min(rect1.x, rect2.x);
  const y = Math.min(rect1.y, rect2.y);
  const width = Math.max(rect1.x + rect1.width, rect2.x + rect2.width) - x;
  const height = Math.max(rect1.y + rect1.height, rect2.y + rect2.height) - y;

  return { x, y, width, height };
}

/**
 * 扩展矩形
 */
export function expandRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2
  };
}

/**
 * 判断矩形是否包含点
 */
export function rectContainsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * 判断矩形是否完全包含另一个矩形
 */
export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}



