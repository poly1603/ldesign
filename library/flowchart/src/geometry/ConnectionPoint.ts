/**
 * 连接点计算 - 计算节点之间的最佳连接点
 */

import { Position } from '../types/model';
import { BBox } from '../types/view';
import { Rectangle } from './Rectangle';

export enum ConnectionSide {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export class ConnectionPoint {
  /**
   * 计算两个节点之间的连接点
   */
  static calculate(
    sourceBBox: BBox,
    targetBBox: BBox
  ): {
    source: Position;
    target: Position;
    sourceSide: ConnectionSide;
    targetSide: ConnectionSide;
  } {
    // 计算节点中心
    const sourceCenter = { x: sourceBBox.centerX, y: sourceBBox.centerY };
    const targetCenter = { x: targetBBox.centerX, y: targetBBox.centerY };

    // 计算方向
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // 确定连接的边
    let sourceSide: ConnectionSide;
    let targetSide: ConnectionSide;

    if (absDy > absDx) {
      // 垂直方向为主
      sourceSide = dy > 0 ? ConnectionSide.BOTTOM : ConnectionSide.TOP;
      targetSide = dy > 0 ? ConnectionSide.TOP : ConnectionSide.BOTTOM;
    } else {
      // 水平方向为主
      sourceSide = dx > 0 ? ConnectionSide.RIGHT : ConnectionSide.LEFT;
      targetSide = dx > 0 ? ConnectionSide.LEFT : ConnectionSide.RIGHT;
    }

    // 获取连接点
    const source = this.getPointOnSide(sourceBBox, sourceSide);
    const target = this.getPointOnSide(targetBBox, targetSide);

    return { source, target, sourceSide, targetSide };
  }

  /**
   * 获取矩形指定边的中点
   */
  static getPointOnSide(bbox: BBox, side: ConnectionSide): Position {
    const { x, y, width, height, centerX, centerY } = bbox;

    switch (side) {
      case ConnectionSide.TOP:
        return { x: centerX, y };
      case ConnectionSide.RIGHT:
        return { x: x + width, y: centerY };
      case ConnectionSide.BOTTOM:
        return { x: centerX, y: y + height };
      case ConnectionSide.LEFT:
        return { x, y: centerY };
    }
  }

  /**
   * 获取矩形所有边的中点
   */
  static getAllSidePoints(bbox: BBox): Record<ConnectionSide, Position> {
    return {
      [ConnectionSide.TOP]: this.getPointOnSide(bbox, ConnectionSide.TOP),
      [ConnectionSide.RIGHT]: this.getPointOnSide(bbox, ConnectionSide.RIGHT),
      [ConnectionSide.BOTTOM]: this.getPointOnSide(bbox, ConnectionSide.BOTTOM),
      [ConnectionSide.LEFT]: this.getPointOnSide(bbox, ConnectionSide.LEFT),
    };
  }

  /**
   * 计算菱形节点的连接点（顶点）
   */
  static getDiamondPoints(bbox: BBox): Record<ConnectionSide, Position> {
    const { x, y, width, height, centerX, centerY } = bbox;

    return {
      [ConnectionSide.TOP]: { x: centerX, y },
      [ConnectionSide.RIGHT]: { x: x + width, y: centerY },
      [ConnectionSide.BOTTOM]: { x: centerX, y: y + height },
      [ConnectionSide.LEFT]: { x, y: centerY },
    };
  }

  /**
   * 根据目标位置选择最佳连接边
   */
  static getBestSide(bbox: BBox, target: Position): ConnectionSide {
    const { centerX, centerY } = bbox;
    const dx = target.x - centerX;
    const dy = target.y - centerY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDy > absDx) {
      return dy > 0 ? ConnectionSide.BOTTOM : ConnectionSide.TOP;
    } else {
      return dx > 0 ? ConnectionSide.RIGHT : ConnectionSide.LEFT;
    }
  }
}


