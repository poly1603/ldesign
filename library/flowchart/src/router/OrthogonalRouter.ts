/**
 * 正交路由器 - 只使用水平和垂直线段（类似Manhattan路由）
 * 
 * 这是默认推荐的路由算法，适用于大多数流程图场景
 */

import { BaseRouter, RouterConfig } from './BaseRouter';
import { Position } from '../types/model';
import { BBox } from '../types/view';

export class OrthogonalRouter extends BaseRouter {
  constructor(config?: RouterConfig) {
    super(config);
  }

  /**
   * 计算正交路径
   */
  route(
    source: Position,
    target: Position,
    sourceBBox?: BBox,
    targetBBox?: BBox
  ): Position[] {
    // 对齐到网格
    const start = this.snapToGrid(source);
    const end = this.snapToGrid(target);

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 情况1：直线连接（同一水平或垂直线上）
    if (Math.abs(dx) < 1) {
      return [start, end];
    }
    if (Math.abs(dy) < 1) {
      return [start, end];
    }

    // 情况2：尝试简单的Z型路径（一个转折点）
    const canUseZPath = this.canConnectWithZPath(start, end, sourceBBox, targetBBox);
    if (canUseZPath) {
      const midPoint = this.calculateZPathMidPoint(start, end);
      return this.optimizePath([start, midPoint, end]);
    }

    // 情况3：使用U型路径（三个转折点）
    return this.calculateUPath(start, end, sourceBBox, targetBBox);
  }

  /**
   * 判断是否可以使用Z型路径
   */
  private canConnectWithZPath(
    start: Position,
    end: Position,
    sourceBBox?: BBox,
    targetBBox?: BBox
  ): boolean {
    // 如果没有提供节点边界框，总是可以使用Z型
    if (!sourceBBox || !targetBBox) {
      return true;
    }

    // 检查是否会穿过节点
    const mid = this.calculateZPathMidPoint(start, end);

    // 检查中间段是否与节点相交
    const intersectsSource = this.lineIntersectsBox(start, mid, sourceBBox);
    const intersectsTarget = this.lineIntersectsBox(mid, end, targetBBox);

    return !intersectsSource && !intersectsTarget;
  }

  /**
   * 计算Z型路径的中间点
   */
  private calculateZPathMidPoint(start: Position, end: Position): Position {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 默认在中间位置转折
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平为主
      return {
        x: start.x + dx / 2,
        y: start.y,
      };
    } else {
      // 垂直为主
      return {
        x: start.x,
        y: start.y + dy / 2,
      };
    }
  }

  /**
   * 计算U型路径
   */
  private calculateUPath(
    start: Position,
    end: Position,
    sourceBBox?: BBox,
    targetBBox?: BBox
  ): Position[] {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const { padding } = this.config;

    // 根据方向决定路径
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平为主的U型
      const midX = start.x + dx / 2;
      return this.optimizePath([
        start,
        { x: midX, y: start.y },
        { x: midX, y: end.y },
        end,
      ]);
    } else {
      // 垂直为主的U型
      const midY = start.y + dy / 2;
      return this.optimizePath([
        start,
        { x: start.x, y: midY },
        { x: end.x, y: midY },
        end,
      ]);
    }
  }

  /**
   * 检查线段是否与矩形相交
   */
  private lineIntersectsBox(start: Position, end: Position, bbox: BBox): boolean {
    // 简单的边界框检查
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return !(
      maxX < bbox.x ||
      minX > bbox.x + bbox.width ||
      maxY < bbox.y ||
      minY > bbox.y + bbox.height
    );
  }
}


