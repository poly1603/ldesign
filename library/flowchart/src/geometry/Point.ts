/**
 * 点相关的几何计算
 */

import { Position } from '../types/model';

export class Point {
  /**
   * 计算两点距离
   */
  static distance(p1: Position, p2: Position): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点的中点
   */
  static midpoint(p1: Position, p2: Position): Position {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  /**
   * 判断两点是否相等
   */
  static equals(p1: Position, p2: Position, epsilon = 0.001): boolean {
    return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
  }

  /**
   * 点沿向量移动
   */
  static translate(p: Position, dx: number, dy: number): Position {
    return {
      x: p.x + dx,
      y: p.y + dy,
    };
  }

  /**
   * 计算点到线段的最短距离
   */
  static distanceToSegment(point: Position, lineStart: Position, lineEnd: Position): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Point.distance(point, lineStart);
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
      )
    );

    const projection = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };

    return Point.distance(point, projection);
  }

  /**
   * 计算角度（弧度）
   */
  static angle(p1: Position, p2: Position): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * 旋转点
   */
  static rotate(p: Position, center: Position, angle: number): Position {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = p.x - center.x;
    const dy = p.y - center.y;

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  /**
   * 对齐到网格
   */
  static snapToGrid(p: Position, gridSize: number): Position {
    return {
      x: Math.round(p.x / gridSize) * gridSize,
      y: Math.round(p.y / gridSize) * gridSize,
    };
  }
}


