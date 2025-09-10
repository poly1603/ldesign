/**
 * 直线连接线
 * 最简单的连接线类型，直接连接两个点
 */

import type { StraightEdgeData, Point, EdgePath, Viewport } from '@/types/index.js';
import { EdgeType } from '@/types/index.js';
import { BaseEdge } from './BaseEdge.js';

/**
 * 直线连接线类
 */
export class StraightEdge extends BaseEdge {
  constructor(data: StraightEdgeData) {
    super(data);
  }

  /**
   * 计算直线路径
   */
  calculatePath(sourcePoint: Point, targetPoint: Point): EdgePath {
    const points = [
      { ...sourcePoint },
      { ...targetPoint }
    ];

    const length = Math.sqrt(
      Math.pow(targetPoint.x - sourcePoint.x, 2) +
      Math.pow(targetPoint.y - sourcePoint.y, 2)
    );

    const bounds = {
      x: Math.min(sourcePoint.x, targetPoint.x),
      y: Math.min(sourcePoint.y, targetPoint.y),
      width: Math.abs(targetPoint.x - sourcePoint.x),
      height: Math.abs(targetPoint.y - sourcePoint.y)
    };

    this.path = {
      points,
      length,
      bounds
    };

    // 清除边界框缓存
    this.cachedBounds = null;

    return this.path;
  }

  /**
   * 渲染连接线路径
   */
  protected override renderPath(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    if (!this.path || this.path.points.length < 2) {
      return;
    }

    const startPoint = this.path.points[0]!;
    const endPoint = this.path.points[1]!;

    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
  }

  /**
   * 获取路径上的点（优化版本）
   */
  override getPointAtPosition(position: number): Point | null {
    if (!this.path || this.path.points.length < 2) {
      return null;
    }

    position = Math.max(0, Math.min(1, position));

    const startPoint = this.path.points[0]!;
    const endPoint = this.path.points[1]!;

    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * position,
      y: startPoint.y + (endPoint.y - startPoint.y) * position
    };
  }

  /**
   * 获取路径上点的切线方向（优化版本）
   */
  override getTangentAtPosition(position: number): Point {
    if (!this.path || this.path.points.length < 2) {
      return { x: 1, y: 0 };
    }

    const startPoint = this.path.points[0]!;
    const endPoint = this.path.points[1]!;

    return this.calculateDirection(startPoint, endPoint);
  }

  /**
   * 点击测试（优化版本）
   */
  override hitTest(point: Point, tolerance: number = 5): boolean {
    if (!this.path || this.path.points.length < 2) {
      return false;
    }

    const startPoint = this.path.points[0]!;
    const endPoint = this.path.points[1]!;

    // 计算点到直线的距离
    const A = point.x - startPoint.x;
    const B = point.y - startPoint.y;
    const C = endPoint.x - startPoint.x;
    const D = endPoint.y - startPoint.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      // 起点和终点重合
      const distance = Math.sqrt(A * A + B * B);
      return distance <= tolerance;
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const closestPoint = {
      x: startPoint.x + param * C,
      y: startPoint.y + param * D
    };

    const distance = Math.sqrt(
      Math.pow(point.x - closestPoint.x, 2) +
      Math.pow(point.y - closestPoint.y, 2)
    );

    return distance <= tolerance;
  }

  /**
   * 获取最近的点（优化版本）
   */
  override getClosestPoint(point: Point): Point {
    if (!this.path || this.path.points.length < 2) {
      return point;
    }

    const startPoint = this.path.points[0]!;
    const endPoint = this.path.points[1]!;

    const A = point.x - startPoint.x;
    const B = point.y - startPoint.y;
    const C = endPoint.x - startPoint.x;
    const D = endPoint.y - startPoint.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return { ...startPoint };
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    return {
      x: startPoint.x + param * C,
      y: startPoint.y + param * D
    };
  }

  /**
   * 克隆连接线
   */
  override clone(): StraightEdge {
    const data: StraightEdgeData = {
      ...this.getData(),
      type: EdgeType.STRAIGHT,
      id: `${this.id}_copy_${Date.now()}`
    };

    return new StraightEdge(data);
  }
}
