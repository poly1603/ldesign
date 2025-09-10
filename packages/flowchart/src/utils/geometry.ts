/**
 * 几何计算工具函数
 * 提供各种几何计算和图形处理功能
 */

import type { Point, Rectangle, Size } from '@/types/index.js';

/**
 * 计算两点之间的距离
 * @param p1 第一个点
 * @param p2 第二个点
 * @returns 距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间的角度（弧度）
 * @param p1 起始点
 * @param p2 结束点
 * @returns 角度（弧度）
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 将弧度转换为角度
 * @param radians 弧度值
 * @returns 角度值
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 将角度转换为弧度
 * @param degrees 角度值
 * @returns 弧度值
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 计算点到直线的距离
 * @param point 点
 * @param lineStart 直线起点
 * @param lineEnd 直线终点
 * @returns 距离
 */
export function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  if (lenSq === 0) {
    return distance(point, lineStart);
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const closestPoint = {
    x: lineStart.x + param * C,
    y: lineStart.y + param * D
  };

  return distance(point, closestPoint);
}

/**
 * 检测点是否在矩形内
 * @param point 点
 * @param rect 矩形
 * @returns 是否在矩形内
 */
export function pointInRectangle(point: Point, rect: Rectangle): boolean {
  return point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height;
}

/**
 * 检测点是否在圆形内
 * @param point 点
 * @param center 圆心
 * @param radius 半径
 * @returns 是否在圆形内
 */
export function pointInCircle(point: Point, center: Point, radius: number): boolean {
  return distance(point, center) <= radius;
}

/**
 * 检测点是否在椭圆内
 * @param point 点
 * @param center 椭圆中心
 * @param radiusX X轴半径
 * @param radiusY Y轴半径
 * @returns 是否在椭圆内
 */
export function pointInEllipse(point: Point, center: Point, radiusX: number, radiusY: number): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
}

/**
 * 检测点是否在多边形内（射线法）
 * @param point 点
 * @param polygon 多边形顶点数组
 * @returns 是否在多边形内
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const yj = polygon[j]!.y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * 计算矩形的中心点
 * @param rect 矩形
 * @returns 中心点
 */
export function getRectangleCenter(rect: Rectangle): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * 计算两个矩形的交集
 * @param rect1 第一个矩形
 * @param rect2 第二个矩形
 * @returns 交集矩形，如果没有交集则返回null
 */
export function rectangleIntersection(rect1: Rectangle, rect2: Rectangle): Rectangle | null {
  const left = Math.max(rect1.x, rect2.x);
  const top = Math.max(rect1.y, rect2.y);
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

  if (left < right && top < bottom) {
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  }

  return null;
}

/**
 * 检测两个矩形是否相交
 * @param rect1 第一个矩形
 * @param rect2 第二个矩形
 * @returns 是否相交
 */
export function rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
  return rectangleIntersection(rect1, rect2) !== null;
}

/**
 * 计算贝塞尔曲线上的点
 * @param t 参数（0-1）
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @returns 曲线上的点
 */
export function cubicBezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
}

/**
 * 计算二次贝塞尔曲线上的点
 * @param t 参数（0-1）
 * @param p0 起点
 * @param p1 控制点
 * @param p2 终点
 * @returns 曲线上的点
 */
export function quadraticBezierPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;

  return {
    x: uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
    y: uu * p0.y + 2 * u * t * p1.y + tt * p2.y
  };
}

/**
 * 计算二次贝塞尔曲线上的点（别名）
 */
export const bezierPoint = quadraticBezierPoint;

/**
 * 计算两条线段的交点
 * @param line1 第一条线段
 * @param line2 第二条线段
 * @returns 交点，如果没有交点则返回null
 */
export function lineIntersection(
  line1: { start: Point; end: Point },
  line2: { start: Point; end: Point }
): Point | null {
  const { start: p1, end: p2 } = line1;
  const { start: p3, end: p4 } = line2;

  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  // 平行线
  if (Math.abs(denom) < 1e-10) {
    return null;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  // 检查交点是否在两条线段上
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
}

/**
 * 计算圆与圆的交点
 * @param center1 第一个圆的圆心
 * @param radius1 第一个圆的半径
 * @param center2 第二个圆的圆心
 * @param radius2 第二个圆的半径
 * @returns 交点数组，可能有0、1或2个交点
 */
export function circleIntersection(
  center1: Point,
  radius1: number,
  center2: Point,
  radius2: number
): Point[] {
  const d = distance(center1, center2);

  // 圆不相交
  if (d > radius1 + radius2 || d < Math.abs(radius1 - radius2) || d === 0) {
    return [];
  }

  // 一个交点（相切）
  if (d === radius1 + radius2 || d === Math.abs(radius1 - radius2)) {
    const t = radius1 / d;
    return [{
      x: center1.x + t * (center2.x - center1.x),
      y: center1.y + t * (center2.y - center1.y)
    }];
  }

  // 两个交点
  const a = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d);
  const h = Math.sqrt(radius1 * radius1 - a * a);

  const px = center1.x + a * (center2.x - center1.x) / d;
  const py = center1.y + a * (center2.y - center1.y) / d;

  return [
    {
      x: px + h * (center2.y - center1.y) / d,
      y: py - h * (center2.x - center1.x) / d
    },
    {
      x: px - h * (center2.y - center1.y) / d,
      y: py + h * (center2.x - center1.x) / d
    }
  ];
}

/**
 * 计算向量的长度
 * @param vector 向量
 * @returns 长度
 */
export function vectorLength(vector: Point): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

/**
 * 标准化向量
 * @param vector 向量
 * @returns 标准化后的向量
 */
export function normalizeVector(vector: Point): Point {
  const length = vectorLength(vector);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

/**
 * 计算两个向量的点积
 * @param v1 向量1
 * @param v2 向量2
 * @returns 点积
 */
export function dotProduct(v1: Point, v2: Point): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * 计算两个向量的叉积
 * @param v1 向量1
 * @param v2 向量2
 * @returns 叉积
 */
export function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * 旋转点
 * @param point 要旋转的点
 * @param center 旋转中心
 * @param angle 旋转角度（弧度）
 * @returns 旋转后的点
 */
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

/**
 * 限制点在矩形范围内
 * @param point 点
 * @param bounds 边界矩形
 * @returns 限制后的点
 */
export function clampPointToRectangle(point: Point, bounds: Rectangle): Point {
  return {
    x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
    y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
  };
}
