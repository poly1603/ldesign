import { Position } from '../types';
import { ConnectionSide } from './ConnectionPointManager';

/**
 * 路由结果
 */
export interface RouteResult {
  points: Position[];           // 路径关键点
  path: string;                 // SVG路径字符串
  labelPosition: Position;      // 标签位置
  arrowAngle: number;          // 箭头角度
}

/**
 * 优化的边缘路由器
 * 参考 bpmn.js 和 draw.io 的路由算法
 * 目标：最少的折点，最优的路径
 * 
 * 遵循流程图最佳实践：
 * 1. 垂直流向优先 - 主流程从上到下
 * 2. 分支分散 - 条件分支左右均匀分布
 * 3. 回路外置 - 循环回路走外侧
 * 4. 正交优先 - 使用水平和垂直线
 * 5. 标签清晰 - 避免遮挡连线
 */
export class OptimizedEdgeRouter {
  private minDistance: number = 40;    // 最小距离（增大以提高清晰度）
  private gridSize: number = 10;       // 网格大小
  private loopOffset: number = 120;    // 回路偏移量（走外侧，增加到120避免重叠）
  private verticalPriority: boolean = true;  // 垂直流向优先
  private edgeSpacing: number = 20;    // 连线之间的间距
  private existingPaths: Map<string, Position[]> = new Map(); // 存储已有路径，用于避让

  constructor(config?: {
    minDistance?: number;
    gridSize?: number;
    loopOffset?: number;
    verticalPriority?: boolean;
    edgeSpacing?: number;
  }) {
    if (config?.minDistance) this.minDistance = config.minDistance;
    if (config?.gridSize) this.gridSize = config.gridSize;
    if (config?.loopOffset) this.loopOffset = config.loopOffset;
    if (config?.verticalPriority !== undefined) this.verticalPriority = config.verticalPriority;
    if (config?.edgeSpacing) this.edgeSpacing = config.edgeSpacing;
  }

  /**
   * 计算最优路径
   */
  public route(
    sourcePos: Position,
    targetPos: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide,
    edgeId?: string,
    sourceOffset?: number,
    targetOffset?: number
  ): RouteResult {
    // 检测是否是回路（向上或向左的连线）
    const isLoop = this.detectLoop(sourcePos, targetPos, sourceSide, targetSide);

    // 应用源和目标的偏移量（用于多条出线的分散）
    const adjustedSourcePos = this.applyOffset(sourcePos, sourceSide, sourceOffset || 0);
    const adjustedTargetPos = this.applyOffset(targetPos, targetSide, targetOffset || 0);

    // 根据连接边的组合选择路由策略
    let points = isLoop
      ? this.calculateLoopPath(adjustedSourcePos, adjustedTargetPos, sourceSide, targetSide, sourceOffset)
      : this.calculateOptimalPath(adjustedSourcePos, adjustedTargetPos, sourceSide, targetSide);

    // 检测与现有路径的冲突并调整
    points = this.avoidExistingPaths(points, sourceSide, targetSide);

    // 优化路径（移除不必要的点）
    const optimizedPoints = this.optimizePath(points);

    // 对齐到网格
    const alignedPoints = this.alignToGrid(optimizedPoints);

    // 存储路径用于后续避让
    if (edgeId) {
      this.existingPaths.set(edgeId, alignedPoints);
    }

    // 生成SVG路径
    const path = this.generatePath(alignedPoints);

    // 计算标签位置（智能避开连线）
    const labelPosition = this.calculateSmartLabelPosition(alignedPoints);

    // 计算箭头角度
    const arrowAngle = this.calculateArrowAngle(alignedPoints);

    return {
      points: alignedPoints,
      path,
      labelPosition,
      arrowAngle
    };
  }

  /**
   * 应用偏移量到位置
   */
  private applyOffset(pos: Position, side: ConnectionSide, offset: number): Position {
    if (Math.abs(offset) < 1) return pos;

    switch (side) {
      case ConnectionSide.TOP:
      case ConnectionSide.BOTTOM:
        // 垂直边，在X轴偏移
        return { x: pos.x + offset, y: pos.y };
      case ConnectionSide.LEFT:
      case ConnectionSide.RIGHT:
        // 水平边，在Y轴偏移
        return { x: pos.x, y: pos.y + offset };
      default:
        return pos;
    }
  }

  /**
   * 避让现有路径
   */
  private avoidExistingPaths(
    points: Position[],
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide
  ): Position[] {
    // 检查是否与现有路径重叠
    for (const [_, existingPath] of this.existingPaths) {
      if (this.pathsOverlap(points, existingPath)) {
        // 如果重叠，尝试调整中间段
        points = this.adjustPathToAvoid(points, existingPath, sourceSide, targetSide);
      }
    }
    return points;
  }

  /**
   * 检查两条路径是否重叠
   */
  private pathsOverlap(path1: Position[], path2: Position[]): boolean {
    const threshold = this.edgeSpacing;

    for (let i = 0; i < path1.length - 1; i++) {
      const segment1 = { start: path1[i], end: path1[i + 1] };

      for (let j = 0; j < path2.length - 1; j++) {
        const segment2 = { start: path2[j], end: path2[j + 1] };

        // 检查线段是否平行且接近
        if (this.segmentsParallel(segment1, segment2) &&
          this.segmentsClose(segment1, segment2, threshold)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查两个线段是否平行
   */
  private segmentsParallel(seg1: { start: Position; end: Position }, seg2: { start: Position; end: Position }): boolean {
    const isHorizontal1 = Math.abs(seg1.end.y - seg1.start.y) < 5;
    const isHorizontal2 = Math.abs(seg2.end.y - seg2.start.y) < 5;
    const isVertical1 = Math.abs(seg1.end.x - seg1.start.x) < 5;
    const isVertical2 = Math.abs(seg2.end.x - seg2.start.x) < 5;

    return (isHorizontal1 && isHorizontal2) || (isVertical1 && isVertical2);
  }

  /**
   * 检查两个线段是否接近
   */
  private segmentsClose(seg1: { start: Position; end: Position }, seg2: { start: Position; end: Position }, threshold: number): boolean {
    const isHorizontal = Math.abs(seg1.end.y - seg1.start.y) < 5;

    if (isHorizontal) {
      // 水平线段，检查Y坐标距离
      const distance = Math.abs(seg1.start.y - seg2.start.y);
      if (distance > threshold) return false;

      // 检查X坐标重叠
      const x1Min = Math.min(seg1.start.x, seg1.end.x);
      const x1Max = Math.max(seg1.start.x, seg1.end.x);
      const x2Min = Math.min(seg2.start.x, seg2.end.x);
      const x2Max = Math.max(seg2.start.x, seg2.end.x);

      return !(x1Max < x2Min || x2Max < x1Min);
    } else {
      // 垂直线段，检查X坐标距离
      const distance = Math.abs(seg1.start.x - seg2.start.x);
      if (distance > threshold) return false;

      // 检查Y坐标重叠
      const y1Min = Math.min(seg1.start.y, seg1.end.y);
      const y1Max = Math.max(seg1.start.y, seg1.end.y);
      const y2Min = Math.min(seg2.start.y, seg2.end.y);
      const y2Max = Math.max(seg2.start.y, seg2.end.y);

      return !(y1Max < y2Min || y2Max < y1Min);
    }
  }

  /**
   * 调整路径以避让
   */
  private adjustPathToAvoid(
    points: Position[],
    existingPath: Position[],
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide
  ): Position[] {
    // 简单策略：在中间段增加偏移
    if (points.length < 3) return points;

    const adjusted = [...points];
    const midIndex = Math.floor(points.length / 2);

    // 根据方向增加偏移
    if (this.isHorizontalSide(sourceSide)) {
      adjusted[midIndex] = {
        ...adjusted[midIndex],
        y: adjusted[midIndex].y + this.edgeSpacing
      };
    } else {
      adjusted[midIndex] = {
        ...adjusted[midIndex],
        x: adjusted[midIndex].x + this.edgeSpacing
      };
    }

    return adjusted;
  }

  /**
   * 检测是否是回路（向上或向左的回路连线）
   */
  private detectLoop(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide
  ): boolean {
    // 垂直流向：如果目标在源的下方或同一水平线，且是向上连接，则是回路
    if (this.verticalPriority) {
      return target.y <= source.y && sourceSide === ConnectionSide.BOTTOM;
    }

    // 水平流向：如果目标在源的左侧或同一垂直线，且是向左连接，则是回路
    return target.x <= source.x && sourceSide === ConnectionSide.RIGHT;
  }

  /**
   * 计算回路路径（走外侧）
   * 优化：支持偏移量，避免多条回路线重叠
   */
  private calculateLoopPath(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide,
    sourceOffset?: number
  ): Position[] {
    const points: Position[] = [source];
    // 根据偏移量动态调整回路走外侧的距离
    const baseOffset = this.loopOffset;
    const additionalOffset = Math.abs(sourceOffset || 0);
    const offset = baseOffset + additionalOffset * 0.5; // 有偏移时走更外侧

    // 垂直流向的回路（从下回到上）
    if (this.verticalPriority && sourceSide === ConnectionSide.BOTTOM) {
      // 向下延伸
      const downPoint = { x: source.x, y: source.y + this.minDistance };
      points.push(downPoint);

      // 向左侧或右侧外围移动（根据偏移方向选择）
      const direction = (sourceOffset && sourceOffset > 0) ? 1 : -1;
      const sidePoint = { x: source.x + direction * offset, y: downPoint.y };
      points.push(sidePoint);

      // 向上到目标水平线
      const upPoint = { x: sidePoint.x, y: target.y };
      points.push(upPoint);

      // 连接到目标
      if (targetSide === ConnectionSide.LEFT) {
        points.push({ x: target.x - this.minDistance, y: target.y });
      } else if (targetSide === ConnectionSide.RIGHT) {
        points.push({ x: target.x + this.minDistance, y: target.y });
      } else if (targetSide === ConnectionSide.TOP) {
        points.push({ x: target.x, y: target.y - this.minDistance });
      } else {
        // BOTTOM
        points.push({ x: target.x, y: target.y + this.minDistance });
      }
    }
    // 水平流向的回路（从右回到左）
    else if (!this.verticalPriority && sourceSide === ConnectionSide.RIGHT) {
      // 向右延伸
      const rightPoint = { x: source.x + this.minDistance, y: source.y };
      points.push(rightPoint);

      // 向上外围移动
      const upPoint = { x: rightPoint.x, y: source.y - offset };
      points.push(upPoint);

      // 向左到目标垂直线
      const leftPoint = { x: target.x, y: upPoint.y };
      points.push(leftPoint);

      // 连接到目标
      if (targetSide === ConnectionSide.TOP) {
        points.push({ x: target.x, y: target.y - this.minDistance });
      } else {
        points.push({ x: target.x - this.minDistance, y: target.y });
      }
    }
    // 其他回路情况（从顶部或左侧回路）
    else if (sourceSide === ConnectionSide.TOP && target.y > source.y) {
      // 从顶部向下回路（少见）
      const upPoint = { x: source.x, y: source.y - this.minDistance };
      points.push(upPoint);

      const sidePoint = { x: source.x - offset, y: upPoint.y };
      points.push(sidePoint);

      const downPoint = { x: sidePoint.x, y: target.y };
      points.push(downPoint);

      if (targetSide === ConnectionSide.TOP) {
        points.push({ x: target.x, y: target.y - this.minDistance });
      }
    }

    points.push(target);
    return points;
  }

  /**
   * 计算最优路径
   * 根据连接边的方向组合，选择最少折点的路径
   */
  private calculateOptimalPath(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide
  ): Position[] {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    // 情况1: 相对的两边（如 right -> left, bottom -> top）
    if (this.areOppositeSides(sourceSide, targetSide)) {
      return this.routeOppositeSides(source, target, sourceSide, targetSide, dx, dy);
    }

    // 情况2: 垂直的两边（如 right -> top, bottom -> left）
    if (this.arePerpendicularSides(sourceSide, targetSide)) {
      return this.routePerpendicularSides(source, target, sourceSide, targetSide);
    }

    // 情况3: 相同的两边（如 right -> right, bottom -> bottom）
    return this.routeSameSides(source, target, sourceSide, dx, dy);
  }

  /**
   * 处理相对边的路由（最常见的情况）
   */
  private routeOppositeSides(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide,
    dx: number,
    dy: number
  ): Position[] {
    // 检查是否可以直连（最少折点：0个）
    if (this.canDirectConnect(source, target, sourceSide, targetSide, dx, dy)) {
      return [source, target];
    }

    // 检查是否可以使用Z型路径（折点：1个）
    const zPath = this.tryZPath(source, target, sourceSide, targetSide, dx, dy);
    if (zPath) {
      return zPath;
    }

    // 使用U型路径（折点：3个）
    return this.createUPath(source, target, sourceSide, targetSide, dx, dy);
  }

  /**
   * 检查是否可以直连
   */
  private canDirectConnect(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide,
    dx: number,
    dy: number
  ): boolean {
    const threshold = 5;

    // 水平直连
    if ((sourceSide === ConnectionSide.RIGHT && targetSide === ConnectionSide.LEFT && dx > this.minDistance) ||
      (sourceSide === ConnectionSide.LEFT && targetSide === ConnectionSide.RIGHT && dx < -this.minDistance)) {
      return Math.abs(dy) < threshold;
    }

    // 垂直直连
    if ((sourceSide === ConnectionSide.BOTTOM && targetSide === ConnectionSide.TOP && dy > this.minDistance) ||
      (sourceSide === ConnectionSide.TOP && targetSide === ConnectionSide.BOTTOM && dy < -this.minDistance)) {
      return Math.abs(dx) < threshold;
    }

    return false;
  }

  /**
   * 尝试Z型路径（3个点，1个折点）
   */
  private tryZPath(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide,
    dx: number,
    dy: number
  ): Position[] | null {
    // 水平Z型
    if ((sourceSide === ConnectionSide.RIGHT && targetSide === ConnectionSide.LEFT) ||
      (sourceSide === ConnectionSide.LEFT && targetSide === ConnectionSide.RIGHT)) {
      if (dx > this.minDistance * 2 || dx < -this.minDistance * 2) {
        const midX = source.x + dx / 2;
        return [
          source,
          { x: midX, y: source.y },
          { x: midX, y: target.y },
          target
        ];
      }
    }

    // 垂直Z型
    if ((sourceSide === ConnectionSide.BOTTOM && targetSide === ConnectionSide.TOP) ||
      (sourceSide === ConnectionSide.TOP && targetSide === ConnectionSide.BOTTOM)) {
      if (dy > this.minDistance * 2 || dy < -this.minDistance * 2) {
        const midY = source.y + dy / 2;
        return [
          source,
          { x: source.x, y: midY },
          { x: target.x, y: midY },
          target
        ];
      }
    }

    return null;
  }

  /**
   * 创建U型路径（回折路径）
   */
  private createUPath(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide,
    dx: number,
    dy: number
  ): Position[] {
    const points: Position[] = [source];

    // 水平U型
    if ((sourceSide === ConnectionSide.RIGHT && targetSide === ConnectionSide.LEFT && dx < 0) ||
      (sourceSide === ConnectionSide.LEFT && targetSide === ConnectionSide.RIGHT && dx > 0)) {
      const offset = Math.max(this.minDistance * 2, Math.abs(dy) / 2 + this.minDistance);
      const direction = sourceSide === ConnectionSide.RIGHT ? 1 : -1;
      const sideX = source.x + this.minDistance * direction;
      const targetSideX = target.x - this.minDistance * direction;

      points.push({ x: sideX, y: source.y });
      points.push({ x: sideX, y: source.y + (dy > 0 ? offset : -offset) });
      points.push({ x: targetSideX, y: source.y + (dy > 0 ? offset : -offset) });
      points.push({ x: targetSideX, y: target.y });
    }
    // 垂直U型
    else if ((sourceSide === ConnectionSide.BOTTOM && targetSide === ConnectionSide.TOP && dy < 0) ||
      (sourceSide === ConnectionSide.TOP && targetSide === ConnectionSide.BOTTOM && dy > 0)) {
      const offset = Math.max(this.minDistance * 2, Math.abs(dx) / 2 + this.minDistance);
      const direction = sourceSide === ConnectionSide.BOTTOM ? 1 : -1;
      const sideY = source.y + this.minDistance * direction;
      const targetSideY = target.y - this.minDistance * direction;

      points.push({ x: source.x, y: sideY });
      points.push({ x: source.x + (dx > 0 ? offset : -offset), y: sideY });
      points.push({ x: source.x + (dx > 0 ? offset : -offset), y: targetSideY });
      points.push({ x: target.x, y: targetSideY });
    }

    points.push(target);
    return points;
  }

  /**
   * 处理垂直边的路由（L型路径）
   */
  private routePerpendicularSides(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide
  ): Position[] {
    const points: Position[] = [source];

    // 计算延伸距离
    const extendSource = this.minDistance;
    const extendTarget = this.minDistance;

    // 从源延伸
    const sourceExtended = this.extendPoint(source, sourceSide, extendSource);
    points.push(sourceExtended);

    // 到目标延伸点
    const targetExtended = this.extendPoint(target, targetSide, extendTarget);

    // 创建拐角点
    if (this.isHorizontalSide(sourceSide)) {
      // 水平 -> 垂直
      points.push({ x: sourceExtended.x, y: targetExtended.y });
    } else {
      // 垂直 -> 水平
      points.push({ x: targetExtended.x, y: sourceExtended.y });
    }

    points.push(targetExtended);
    points.push(target);

    return points;
  }

  /**
   * 处理相同边的路由
   */
  private routeSameSides(
    source: Position,
    target: Position,
    side: ConnectionSide,
    dx: number,
    dy: number
  ): Position[] {
    const points: Position[] = [source];
    const offset = this.minDistance * 2;

    if (this.isHorizontalSide(side)) {
      // 水平方向相同
      const direction = side === ConnectionSide.RIGHT ? 1 : -1;
      const maxX = Math.max(source.x, target.x) + offset * direction;

      points.push({ x: maxX, y: source.y });
      points.push({ x: maxX, y: target.y });
    } else {
      // 垂直方向相同
      const direction = side === ConnectionSide.BOTTOM ? 1 : -1;
      const maxY = Math.max(source.y, target.y) + offset * direction;

      points.push({ x: source.x, y: maxY });
      points.push({ x: target.x, y: maxY });
    }

    points.push(target);
    return points;
  }

  /**
   * 延伸点
   */
  private extendPoint(point: Position, side: ConnectionSide, distance: number): Position {
    switch (side) {
      case ConnectionSide.TOP:
        return { x: point.x, y: point.y - distance };
      case ConnectionSide.RIGHT:
        return { x: point.x + distance, y: point.y };
      case ConnectionSide.BOTTOM:
        return { x: point.x, y: point.y + distance };
      case ConnectionSide.LEFT:
        return { x: point.x - distance, y: point.y };
    }
  }

  /**
   * 优化路径（移除共线的点）
   */
  private optimizePath(points: Position[]): Position[] {
    if (points.length <= 2) return points;

    const optimized: Position[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 检查是否共线
      if (!this.areCollinear(prev, curr, next)) {
        optimized.push(curr);
      }
    }

    optimized.push(points[points.length - 1]);
    return optimized;
  }

  /**
   * 检查三点是否共线
   */
  private areCollinear(p1: Position, p2: Position, p3: Position): boolean {
    const threshold = 1;

    // 水平共线
    if (Math.abs(p1.y - p2.y) < threshold && Math.abs(p2.y - p3.y) < threshold) {
      return true;
    }

    // 垂直共线
    if (Math.abs(p1.x - p2.x) < threshold && Math.abs(p2.x - p3.x) < threshold) {
      return true;
    }

    return false;
  }

  /**
   * 对齐到网格
   */
  private alignToGrid(points: Position[]): Position[] {
    if (this.gridSize <= 1) return points;

    return points.map(p => ({
      x: Math.round(p.x / this.gridSize) * this.gridSize,
      y: Math.round(p.y / this.gridSize) * this.gridSize
    }));
  }

  /**
   * 生成SVG路径（直角路径，无圆角）
   */
  private generatePath(points: Position[]): string {
    if (points.length < 2) return '';

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }

    return path;
  }

  /**
   * 计算标签位置（路径中点）
   */
  private calculateLabelPosition(points: Position[]): Position {
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return points[0];

    // 计算路径总长度
    let totalLength = 0;
    const segments: number[] = [];

    for (let i = 1; i < points.length; i++) {
      const length = this.distance(points[i - 1], points[i]);
      segments.push(length);
      totalLength += length;
    }

    // 找到中点
    const halfLength = totalLength / 2;
    let currentLength = 0;

    for (let i = 0; i < segments.length; i++) {
      if (currentLength + segments[i] >= halfLength) {
        const ratio = (halfLength - currentLength) / segments[i];
        return {
          x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
          y: points[i].y + (points[i + 1].y - points[i].y) * ratio
        };
      }
      currentLength += segments[i];
    }

    return points[Math.floor(points.length / 2)];
  }

  /**
   * 智能计算标签位置（避开拐点，放在直线段中间）
   */
  private calculateSmartLabelPosition(points: Position[]): Position {
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return points[0];
    if (points.length === 2) {
      // 两个点，放中间
      return {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
    }

    // 找最长的线段放置标签
    let maxLength = 0;
    let maxSegmentIndex = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const length = this.distance(points[i], points[i + 1]);
      if (length > maxLength) {
        maxLength = length;
        maxSegmentIndex = i;
      }
    }

    // 在最长线段的中点放置标签
    const p1 = points[maxSegmentIndex];
    const p2 = points[maxSegmentIndex + 1];

    // 根据线段方向微调标签位置
    const isHorizontal = Math.abs(p2.y - p1.y) < 5;
    const labelOffset = 12;  // 标签偏移量

    const basePos = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    // 如果是水平线段，标签放在上方
    if (isHorizontal) {
      basePos.y -= labelOffset;
    }
    // 如果是垂直线段，标签放在右侧
    else {
      basePos.x += labelOffset;
    }

    return basePos;
  }

  /**
   * 计算箭头角度
   */
  private calculateArrowAngle(points: Position[]): number {
    if (points.length < 2) return 0;

    const last = points[points.length - 1];
    const prev = points[points.length - 2];

    return Math.atan2(last.y - prev.y, last.x - prev.x);
  }

  /**
   * 计算两点距离
   */
  private distance(p1: Position, p2: Position): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  /**
   * 判断两边是否相对
   */
  private areOppositeSides(side1: ConnectionSide, side2: ConnectionSide): boolean {
    return (
      (side1 === ConnectionSide.LEFT && side2 === ConnectionSide.RIGHT) ||
      (side1 === ConnectionSide.RIGHT && side2 === ConnectionSide.LEFT) ||
      (side1 === ConnectionSide.TOP && side2 === ConnectionSide.BOTTOM) ||
      (side1 === ConnectionSide.BOTTOM && side2 === ConnectionSide.TOP)
    );
  }

  /**
   * 判断两边是否垂直
   */
  private arePerpendicularSides(side1: ConnectionSide, side2: ConnectionSide): boolean {
    return (
      (this.isHorizontalSide(side1) && !this.isHorizontalSide(side2)) ||
      (!this.isHorizontalSide(side1) && this.isHorizontalSide(side2))
    );
  }

  /**
   * 判断是否是水平边
   */
  private isHorizontalSide(side: ConnectionSide): boolean {
    return side === ConnectionSide.LEFT || side === ConnectionSide.RIGHT;
  }

  /**
   * 清空路径缓存
   */
  public clear(): void {
    this.existingPaths.clear();
  }

  /**
   * 移除特定边的路径
   */
  public removePath(edgeId: string): void {
    this.existingPaths.delete(edgeId);
  }
}

