/**
 * 矩形相关的几何计算
 */

import { Position } from '../types/model';
import { BBox } from '../types/view';

export class Rectangle {
  /**
   * 判断点是否在矩形内
   */
  static containsPoint(rect: BBox, point: Position): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  /**
   * 判断两个矩形是否相交
   */
  static intersects(rect1: BBox, rect2: BBox): boolean {
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
  static intersection(rect1: BBox, rect2: BBox): BBox | null {
    if (!Rectangle.intersects(rect1, rect2)) {
      return null;
    }

    const x = Math.max(rect1.x, rect2.x);
    const y = Math.max(rect1.y, rect2.y);
    const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
    const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;

    return {
      x,
      y,
      width,
      height,
      centerX: x + width / 2,
      centerY: y + height / 2,
    };
  }

  /**
   * 计算两个矩形的并集边界
   */
  static union(rect1: BBox, rect2: BBox): BBox {
    const x = Math.min(rect1.x, rect2.x);
    const y = Math.min(rect1.y, rect2.y);
    const width = Math.max(rect1.x + rect1.width, rect2.x + rect2.width) - x;
    const height = Math.max(rect1.y + rect1.height, rect2.y + rect2.height) - y;

    return {
      x,
      y,
      width,
      height,
      centerX: x + width / 2,
      centerY: y + height / 2,
    };
  }

  /**
   * 扩展矩形
   */
  static expand(rect: BBox, padding: number): BBox {
    return {
      x: rect.x - padding,
      y: rect.y - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      centerX: rect.centerX,
      centerY: rect.centerY,
    };
  }

  /**
   * 获取矩形的边界点（上右下左的中点）
   */
  static getBorderPoints(rect: BBox): {
    top: Position;
    right: Position;
    bottom: Position;
    left: Position;
  } {
    return {
      top: { x: rect.centerX, y: rect.y },
      right: { x: rect.x + rect.width, y: rect.centerY },
      bottom: { x: rect.centerX, y: rect.y + rect.height },
      left: { x: rect.x, y: rect.centerY },
    };
  }

  /**
   * 获取矩形的四个角点
   */
  static getCorners(rect: BBox): {
    topLeft: Position;
    topRight: Position;
    bottomRight: Position;
    bottomLeft: Position;
  } {
    return {
      topLeft: { x: rect.x, y: rect.y },
      topRight: { x: rect.x + rect.width, y: rect.y },
      bottomRight: { x: rect.x + rect.width, y: rect.y + rect.height },
      bottomLeft: { x: rect.x, y: rect.y + rect.height },
    };
  }

  /**
   * 计算从矩形到点的最近边界点
   */
  static closestBorderPoint(rect: BBox, point: Position): Position {
    const { x, y, width, height } = rect;

    // 如果点在矩形内，找最近的边
    if (Rectangle.containsPoint(rect, point)) {
      const distToTop = point.y - y;
      const distToRight = (x + width) - point.x;
      const distToBottom = (y + height) - point.y;
      const distToLeft = point.x - x;

      const minDist = Math.min(distToTop, distToRight, distToBottom, distToLeft);

      if (minDist === distToTop) return { x: point.x, y: y };
      if (minDist === distToRight) return { x: x + width, y: point.y };
      if (minDist === distToBottom) return { x: point.x, y: y + height };
      return { x: x, y: point.y };
    }

    // 点在矩形外，找最近的边界点
    const clampedX = Math.max(x, Math.min(x + width, point.x));
    const clampedY = Math.max(y, Math.min(y + height, point.y));

    return { x: clampedX, y: clampedY };
  }
}


