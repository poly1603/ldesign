/**
 * 折线路由器 - 简单的折线连接
 */

import { BaseRouter, RouterConfig } from './BaseRouter';
import { Position } from '../types/model';
import { BBox } from '../types/view';

export class PolylineRouter extends BaseRouter {
  constructor(config?: RouterConfig) {
    super(config);
  }

  /**
   * 计算折线路径 - 简单的两段折线
   */
  route(
    source: Position,
    target: Position,
    sourceBBox?: BBox,
    targetBBox?: BBox
  ): Position[] {
    const start = this.snapToGrid(source);
    const end = this.snapToGrid(target);

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 如果在同一直线上，直接连接
    if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
      return [start, end];
    }

    // 两段折线：优先使用水平-垂直或垂直-水平
    const midPoint = {
      x: start.x + dx * 0.5,
      y: start.y,
    };

    return this.optimizePath([start, midPoint, { x: midPoint.x, y: end.y }, end]);
  }
}


