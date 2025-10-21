/**
 * 线段相关的几何计算
 */

import { Position } from '../types/model';
import { Point } from './Point';

export class Line {
  /**
   * 计算线段长度
   */
  static length(start: Position, end: Position): number {
    return Point.distance(start, end);
  }

  /**
   * 判断两条线段是否相交
   */
  static intersects(
    line1Start: Position,
    line1End: Position,
    line2Start: Position,
    line2End: Position
  ): boolean {
    const ccw = (a: Position, b: Position, c: Position) => {
      return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    };

    return (
      ccw(line1Start, line2Start, line2End) !== ccw(line1End, line2Start, line2End) &&
      ccw(line1Start, line1End, line2Start) !== ccw(line1Start, line1End, line2End)
    );
  }

  /**
   * 计算两条线段的交点
   */
  static intersection(
    line1Start: Position,
    line1End: Position,
    line2Start: Position,
    line2End: Position
  ): Position | null {
    const x1 = line1Start.x;
    const y1 = line1Start.y;
    const x2 = line1End.x;
    const y2 = line1End.y;
    const x3 = line2Start.x;
    const y3 = line2Start.y;
    const x4 = line2End.x;
    const y4 = line2End.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (Math.abs(denom) < 0.0001) {
      return null; // 平行或重合
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
      };
    }

    return null;
  }

  /**
   * 判断三点是否共线
   */
  static areCollinear(p1: Position, p2: Position, p3: Position, epsilon = 0.001): boolean {
    const area =
      Math.abs(
        p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)
      ) / 2;
    return area < epsilon;
  }

  /**
   * 判断线段是否水平
   */
  static isHorizontal(start: Position, end: Position, epsilon = 0.001): boolean {
    return Math.abs(start.y - end.y) < epsilon;
  }

  /**
   * 判断线段是否垂直
   */
  static isVertical(start: Position, end: Position, epsilon = 0.001): boolean {
    return Math.abs(start.x - end.x) < epsilon;
  }

  /**
   * 判断线段是否正交（水平或垂直）
   */
  static isOrthogonal(start: Position, end: Position, epsilon = 0.001): boolean {
    return Line.isHorizontal(start, end, epsilon) || Line.isVertical(start, end, epsilon);
  }

  /**
   * 计算线段的斜率
   */
  static slope(start: Position, end: Position): number {
    const dx = end.x - start.x;
    if (Math.abs(dx) < 0.0001) {
      return Infinity;
    }
    return (end.y - start.y) / dx;
  }

  /**
   * 计算点在线段上的投影点
   */
  static projectPoint(point: Position, lineStart: Position, lineEnd: Position): Position {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return { ...lineStart };
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
      )
    );

    return {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };
  }
}


