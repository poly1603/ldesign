/**
 * 贝塞尔曲线路由器 - 平滑的曲线连接
 */

import { BaseRouter, RouterConfig } from './BaseRouter';
import { Position } from '../types/model';
import { BBox } from '../types/view';

export class BezierRouter extends BaseRouter {
  constructor(config?: RouterConfig) {
    super(config);
  }

  /**
   * 计算贝塞尔曲线路径
   * 注意：返回的是控制点，实际绘制时需要使用SVG的贝塞尔曲线命令
   */
  route(
    source: Position,
    target: Position,
    sourceBBox?: BBox,
    targetBBox?: BBox
  ): Position[] {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    // 计算控制点偏移量
    const offsetX = Math.abs(dx) * 0.5;
    const offsetY = Math.abs(dy) * 0.5;

    // 第一个控制点：从起点沿出发方向偏移
    const cp1: Position = {
      x: source.x + (dx > 0 ? offsetX : -offsetX),
      y: source.y,
    };

    // 第二个控制点：从终点沿到达方向偏移
    const cp2: Position = {
      x: target.x - (dx > 0 ? offsetX : -offsetX),
      y: target.y,
    };

    // 返回起点、两个控制点和终点
    return [source, cp1, cp2, target];
  }

  /**
   * 生成SVG路径字符串
   */
  toSVGPath(points: Position[]): string {
    if (points.length !== 4) {
      throw new Error('Bezier curve requires exactly 4 points');
    }

    const [start, cp1, cp2, end] = points;
    return `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
  }
}


