/**
 * @ldesign/cropper 数学计算工具函数
 * 
 * 提供几何计算、矩阵变换、角度转换等数学工具函数
 */

import type { Point, Size, Rect, Matrix, BoundingBox } from '../types';

// ============================================================================
// 基础数学函数
// ============================================================================

/**
 * 将角度转换为弧度
 * @param degrees 角度值
 * @returns 弧度值
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 将弧度转换为角度
 * @param radians 弧度值
 * @returns 角度值
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * 限制数值在指定范围内
 * @param value 要限制的值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param t 插值参数 (0-1)
 * @returns 插值结果
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 检查数值是否接近
 * @param a 第一个数值
 * @param b 第二个数值
 * @param epsilon 误差范围
 * @returns 是否接近
 */
export function isNearlyEqual(a: number, b: number, epsilon: number = 1e-6): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * 将数值四舍五入到指定精度
 * @param value 要四舍五入的值
 * @param precision 精度（小数位数）
 * @returns 四舍五入后的值
 */
export function roundToPrecision(value: number, precision: number = 0): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

// ============================================================================
// 点和向量计算
// ============================================================================

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
 * @param p1 第一个点
 * @param p2 第二个点
 * @returns 角度（弧度）
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 计算点的中点
 * @param p1 第一个点
 * @param p2 第二个点
 * @returns 中点
 */
export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
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
 * 缩放点
 * @param point 要缩放的点
 * @param center 缩放中心
 * @param scale 缩放比例
 * @returns 缩放后的点
 */
export function scalePoint(point: Point, center: Point, scale: number): Point {
  return {
    x: center.x + (point.x - center.x) * scale,
    y: center.y + (point.y - center.y) * scale
  };
}

/**
 * 平移点
 * @param point 要平移的点
 * @param offset 平移偏移量
 * @returns 平移后的点
 */
export function translatePoint(point: Point, offset: Point): Point {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y
  };
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
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

/**
 * 计算向量的点积
 * @param v1 第一个向量
 * @param v2 第二个向量
 * @returns 点积
 */
export function dotProduct(v1: Point, v2: Point): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * 计算向量的叉积
 * @param v1 第一个向量
 * @param v2 第二个向量
 * @returns 叉积
 */
export function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v1.y * v2.x;
}

// ============================================================================
// 矩形计算
// ============================================================================

/**
 * 获取矩形的中心点
 * @param rect 矩形
 * @returns 中心点
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * 获取矩形的四个角点
 * @param rect 矩形
 * @returns 四个角点数组 [左上, 右上, 右下, 左下]
 */
export function getRectCorners(rect: Rect): Point[] {
  return [
    { x: rect.x, y: rect.y }, // 左上
    { x: rect.x + rect.width, y: rect.y }, // 右上
    { x: rect.x + rect.width, y: rect.y + rect.height }, // 右下
    { x: rect.x, y: rect.y + rect.height } // 左下
  ];
}

/**
 * 检查点是否在矩形内
 * @param point 点
 * @param rect 矩形
 * @returns 是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height;
}

/**
 * 检查两个矩形是否相交
 * @param rect1 第一个矩形
 * @param rect2 第二个矩形
 * @returns 是否相交
 */
export function isRectIntersecting(rect1: Rect, rect2: Rect): boolean {
  return rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y;
}

/**
 * 计算两个矩形的交集
 * @param rect1 第一个矩形
 * @param rect2 第二个矩形
 * @returns 交集矩形，如果不相交则返回null
 */
export function rectIntersection(rect1: Rect, rect2: Rect): Rect | null {
  const left = Math.max(rect1.x, rect2.x);
  const top = Math.max(rect1.y, rect2.y);
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

  if (left >= right || top >= bottom) {
    return null;
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}

/**
 * 计算两个矩形的并集
 * @param rect1 第一个矩形
 * @param rect2 第二个矩形
 * @returns 并集矩形
 */
export function rectUnion(rect1: Rect, rect2: Rect): Rect {
  const left = Math.min(rect1.x, rect2.x);
  const top = Math.min(rect1.y, rect2.y);
  const right = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
  const bottom = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}

/**
 * 从中心点和尺寸创建矩形
 * @param center 中心点
 * @param size 尺寸
 * @returns 矩形
 */
export function createRectFromCenter(center: Point, size: Size): Rect {
  return {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
    width: size.width,
    height: size.height
  };
}

/**
 * 缩放矩形
 * @param rect 矩形
 * @param scale 缩放比例
 * @param center 缩放中心（可选，默认为矩形中心）
 * @returns 缩放后的矩形
 */
export function scaleRect(rect: Rect, scale: number, center?: Point): Rect {
  const rectCenter = center || getRectCenter(rect);
  const newWidth = rect.width * scale;
  const newHeight = rect.height * scale;

  return {
    x: rectCenter.x - newWidth / 2,
    y: rectCenter.y - newHeight / 2,
    width: newWidth,
    height: newHeight
  };
}

// ============================================================================
// 矩阵变换
// ============================================================================

/**
 * 创建单位矩阵
 * @returns 单位矩阵
 */
export function createIdentityMatrix(): Matrix {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

/**
 * 创建平移矩阵
 * @param x X轴平移量
 * @param y Y轴平移量
 * @returns 平移矩阵
 */
export function createTranslateMatrix(x: number, y: number): Matrix {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
}

/**
 * 创建缩放矩阵
 * @param scaleX X轴缩放比例
 * @param scaleY Y轴缩放比例
 * @returns 缩放矩阵
 */
export function createScaleMatrix(scaleX: number, scaleY: number = scaleX): Matrix {
  return { a: scaleX, b: 0, c: 0, d: scaleY, e: 0, f: 0 };
}

/**
 * 创建旋转矩阵
 * @param angle 旋转角度（弧度）
 * @returns 旋转矩阵
 */
export function createRotateMatrix(angle: number): Matrix {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
}

/**
 * 矩阵乘法
 * @param m1 第一个矩阵
 * @param m2 第二个矩阵
 * @returns 乘积矩阵
 */
export function multiplyMatrix(m1: Matrix, m2: Matrix): Matrix {
  return {
    a: m1.a * m2.a + m1.b * m2.c,
    b: m1.a * m2.b + m1.b * m2.d,
    c: m1.c * m2.a + m1.d * m2.c,
    d: m1.c * m2.b + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f
  };
}

/**
 * 使用矩阵变换点
 * @param point 点
 * @param matrix 变换矩阵
 * @returns 变换后的点
 */
export function transformPoint(point: Point, matrix: Matrix): Point {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  };
}

/**
 * 计算矩阵的逆矩阵
 * @param matrix 原矩阵
 * @returns 逆矩阵，如果不可逆则返回null
 */
export function invertMatrix(matrix: Matrix): Matrix | null {
  const det = matrix.a * matrix.d - matrix.b * matrix.c;
  if (Math.abs(det) < 1e-10) {
    return null; // 矩阵不可逆
  }

  const invDet = 1 / det;
  return {
    a: matrix.d * invDet,
    b: -matrix.b * invDet,
    c: -matrix.c * invDet,
    d: matrix.a * invDet,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) * invDet,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) * invDet
  };
}

// ============================================================================
// 边界框计算
// ============================================================================

/**
 * 从矩形创建边界框
 * @param rect 矩形
 * @returns 边界框
 */
export function createBoundingBoxFromRect(rect: Rect): BoundingBox {
  return {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}

/**
 * 从边界框创建矩形
 * @param bbox 边界框
 * @returns 矩形
 */
export function createRectFromBoundingBox(bbox: BoundingBox): Rect {
  return {
    x: bbox.left,
    y: bbox.top,
    width: bbox.right - bbox.left,
    height: bbox.bottom - bbox.top
  };
}

/**
 * 扩展边界框
 * @param bbox 边界框
 * @param padding 扩展量
 * @returns 扩展后的边界框
 */
export function expandBoundingBox(bbox: BoundingBox, padding: number): BoundingBox {
  return {
    left: bbox.left - padding,
    top: bbox.top - padding,
    right: bbox.right + padding,
    bottom: bbox.bottom + padding
  };
}

/**
 * 计算多个点的边界框
 * @param points 点数组
 * @returns 边界框
 */
export function getBoundingBoxFromPoints(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { left: 0, top: 0, right: 0, bottom: 0 };
  }

  let left = points[0].x;
  let top = points[0].y;
  let right = points[0].x;
  let bottom = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    left = Math.min(left, point.x);
    top = Math.min(top, point.y);
    right = Math.max(right, point.x);
    bottom = Math.max(bottom, point.y);
  }

  return { left, top, right, bottom };
}
