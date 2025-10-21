/**
 * 路由基类 - 所有路由算法的基类
 */

import { Position } from '../types/model';
import { BBox } from '../types/view';

export interface RouterConfig {
  /** 网格大小（用于对齐） */
  gridSize?: number;
  /** 路径padding */
  padding?: number;
  /** 是否避障 */
  avoidObstacles?: boolean;
}

export abstract class BaseRouter {
  protected config: Required<RouterConfig>;

  constructor(config: RouterConfig = {}) {
    this.config = {
      gridSize: config.gridSize || 10,
      padding: config.padding || 20,
      avoidObstacles: config.avoidObstacles !== false,
    };
  }

  /**
   * 计算路径 - 子类必须实现
   */
  abstract route(
    source: Position,
    target: Position,
    sourceBBox?: BBox,
    targetBBox?: BBox,
    obstacles?: BBox[]
  ): Position[];

  /**
   * 对齐到网格
   */
  protected snapToGrid(point: Position): Position {
    const { gridSize } = this.config;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }

  /**
   * 优化路径 - 移除共线的点
   */
  protected optimizePath(points: Position[]): Position[] {
    if (points.length <= 2) return points;

    const result: Position[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = result[result.length - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 检查是否共线
      if (!this.areCollinear(prev, curr, next)) {
        result.push(curr);
      }
    }

    result.push(points[points.length - 1]);
    return result;
  }

  /**
   * 判断三点是否共线
   */
  protected areCollinear(p1: Position, p2: Position, p3: Position): boolean {
    const epsilon = 0.001;
    const area =
      Math.abs(
        p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)
      ) / 2;
    return area < epsilon;
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): RouterConfig {
    return { ...this.config };
  }
}


