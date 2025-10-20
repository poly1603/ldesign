import { Position, NodeType } from '../types';
import { FlowNode } from '../core/Node';

/**
 * 方向枚举
 */
export enum Direction {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

/**
 * 连接点信息
 */
interface ConnectionPoint {
  position: Position;
  direction: Direction;
}

/**
 * 路由选项
 */
interface RouterOptions {
  padding?: number;        // 节点周围的间距
  cornerRadius?: number;   // 拐角半径
  minGap?: number;        // 最小间隙
  preferredDirection?: Direction; // 优先方向
  avoidOverlap?: boolean; // 避免重叠
}

/**
 * 智能路由器 - 参考 Draw.io 和 Lucidchart 的算法
 */
export class SmartRouter {
  private readonly DEFAULT_PADDING = 20;
  private readonly DEFAULT_CORNER_RADIUS = 12;
  private readonly DEFAULT_MIN_GAP = 30;
  private readonly DIAMOND_OFFSET_RATIO = 0.7; // 菱形连接点偏移比例

  /**
   * 计算两个节点之间的最优路径
   */
  public calculatePath(
    sourceNode: FlowNode,
    targetNode: FlowNode,
    nodeWidth: number,
    nodeHeight: number,
    options: RouterOptions = {}
  ): { path: string; labelPosition: Position; arrowAngle: number } {
    const padding = options.padding ?? this.DEFAULT_PADDING;
    const cornerRadius = options.cornerRadius ?? this.DEFAULT_CORNER_RADIUS;
    const minGap = options.minGap ?? this.DEFAULT_MIN_GAP;

    // 获取最佳连接点
    const { source, target, sourceDir, targetDir } = this.getBestConnectionPoints(
      sourceNode,
      targetNode,
      nodeWidth,
      nodeHeight,
      options.preferredDirection
    );

    // 计算路径点
    const waypoints = this.calculateWaypoints(
      source,
      target,
      sourceDir,
      targetDir,
      padding,
      minGap,
      options.avoidOverlap
    );

    // 创建平滑路径
    const path = this.createSmoothPath(waypoints, cornerRadius);
    
    // 计算标签位置
    const labelPosition = this.calculateLabelPosition(waypoints);
    
    // 计算箭头角度
    const arrowAngle = this.calculateArrowAngle(waypoints);

    return { path, labelPosition, arrowAngle };
  }

  /**
   * 获取最佳连接点
   */
  private getBestConnectionPoints(
    sourceNode: FlowNode,
    targetNode: FlowNode,
    width: number,
    height: number,
    preferredDirection?: Direction
  ): { source: Position; target: Position; sourceDir: Direction; targetDir: Direction } {
    const sourceCenter = sourceNode.position;
    const targetCenter = targetNode.position;
    
    // 计算相对位置
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    
    // 获取源节点的连接点
    const sourcePoint = this.getNodeConnectionPoint(
      sourceNode,
      width,
      height,
      dx,
      dy,
      preferredDirection,
      true
    );
    
    // 获取目标节点的连接点
    const targetPoint = this.getNodeConnectionPoint(
      targetNode,
      width,
      height,
      -dx,
      -dy,
      undefined,
      false
    );

    return {
      source: sourcePoint.position,
      target: targetPoint.position,
      sourceDir: sourcePoint.direction,
      targetDir: targetPoint.direction
    };
  }

  /**
   * 获取节点的连接点
   */
  private getNodeConnectionPoint(
    node: FlowNode,
    width: number,
    height: number,
    dx: number,
    dy: number,
    preferredDirection?: Direction,
    isSource: boolean
  ): ConnectionPoint {
    const center = node.position;
    const halfW = width / 2;
    const halfH = height / 2;

    // 菱形节点特殊处理
    if (node.type === NodeType.CONDITION) {
      return this.getDiamondConnectionPoint(center, halfW, halfH, dx, dy, preferredDirection);
    }

    // 优先使用指定方向
    if (preferredDirection) {
      return this.getConnectionPointByDirection(center, halfW, halfH, preferredDirection);
    }

    // 根据相对位置智能选择
    const angle = Math.atan2(dy, dx);
    const absAngle = Math.abs(angle);

    let direction: Direction;
    let position: Position;

    // 使用扇形区域判断最佳方向
    if (absAngle < Math.PI / 4) {
      // 右侧 (-45° ~ 45°)
      direction = isSource ? Direction.RIGHT : Direction.LEFT;
      position = { x: center.x + halfW, y: center.y };
    } else if (absAngle > 3 * Math.PI / 4) {
      // 左侧 (135° ~ -135°)
      direction = isSource ? Direction.LEFT : Direction.RIGHT;
      position = { x: center.x - halfW, y: center.y };
    } else if (angle > 0) {
      // 下方 (45° ~ 135°)
      direction = isSource ? Direction.BOTTOM : Direction.TOP;
      position = { x: center.x, y: center.y + halfH };
    } else {
      // 上方 (-45° ~ -135°)
      direction = isSource ? Direction.TOP : Direction.BOTTOM;
      position = { x: center.x, y: center.y - halfH };
    }

    return { position, direction };
  }

  /**
   * 获取菱形节点的连接点
   */
  private getDiamondConnectionPoint(
    center: Position,
    halfW: number,
    halfH: number,
    dx: number,
    dy: number,
    preferredDirection?: Direction
  ): ConnectionPoint {
    // 菱形的四个顶点
    const angle = Math.atan2(dy, dx);
    const absAngle = Math.abs(angle);

    let direction: Direction;
    let position: Position;

    // 使用略微偏移的连接点，避免线条完全贴合菱形边缘
    const offsetW = halfW * this.DIAMOND_OFFSET_RATIO;
    const offsetH = halfH * this.DIAMOND_OFFSET_RATIO;

    if (absAngle < Math.PI / 4) {
      // 右顶点
      direction = Direction.RIGHT;
      position = { x: center.x + offsetW, y: center.y };
    } else if (absAngle > 3 * Math.PI / 4) {
      // 左顶点
      direction = Direction.LEFT;
      position = { x: center.x - offsetW, y: center.y };
    } else if (angle > 0) {
      // 下顶点
      direction = Direction.BOTTOM;
      position = { x: center.x, y: center.y + offsetH };
    } else {
      // 上顶点
      direction = Direction.TOP;
      position = { x: center.x, y: center.y - offsetH };
    }

    return { position, direction };
  }

  /**
   * 根据方向获取连接点
   */
  private getConnectionPointByDirection(
    center: Position,
    halfW: number,
    halfH: number,
    direction: Direction
  ): ConnectionPoint {
    let position: Position;

    switch (direction) {
      case Direction.TOP:
        position = { x: center.x, y: center.y - halfH };
        break;
      case Direction.RIGHT:
        position = { x: center.x + halfW, y: center.y };
        break;
      case Direction.BOTTOM:
        position = { x: center.x, y: center.y + halfH };
        break;
      case Direction.LEFT:
        position = { x: center.x - halfW, y: center.y };
        break;
      default:
        position = center;
    }

    return { position, direction };
  }

  /**
   * 计算路径点（核心算法）
   */
  private calculateWaypoints(
    source: Position,
    target: Position,
    sourceDir: Direction,
    targetDir: Direction,
    padding: number,
    minGap: number,
    avoidOverlap: boolean = true
  ): Position[] {
    const points: Position[] = [source];
    
    // 简单情况：直接连接
    if (this.canDirectConnect(source, target, sourceDir, targetDir)) {
      points.push(target);
      return points;
    }

    // 计算延伸距离
    const extendDistance = Math.max(padding, minGap);
    
    // 从源点延伸
    const sourceExtended = this.extendPoint(source, sourceDir, extendDistance);
    
    // 从目标点延伸
    const targetExtended = this.extendPoint(target, targetDir, extendDistance);

    // 根据方向组合选择路由策略
    const routePoints = this.routeByDirections(
      source,
      target,
      sourceExtended,
      targetExtended,
      sourceDir,
      targetDir,
      padding,
      avoidOverlap
    );

    return routePoints;
  }

  /**
   * 判断是否可以直接连接
   */
  private canDirectConnect(
    source: Position,
    target: Position,
    sourceDir: Direction,
    targetDir: Direction
  ): boolean {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    // 同一水平线或垂直线，且方向相对
    if (sourceDir === Direction.RIGHT && targetDir === Direction.LEFT && dx > 0 && Math.abs(dy) < 5) {
      return true;
    }
    if (sourceDir === Direction.LEFT && targetDir === Direction.RIGHT && dx < 0 && Math.abs(dy) < 5) {
      return true;
    }
    if (sourceDir === Direction.BOTTOM && targetDir === Direction.TOP && dy > 0 && Math.abs(dx) < 5) {
      return true;
    }
    if (sourceDir === Direction.TOP && targetDir === Direction.BOTTOM && dy < 0 && Math.abs(dx) < 5) {
      return true;
    }
    
    return false;
  }

  /**
   * 延伸点
   */
  private extendPoint(point: Position, direction: Direction, distance: number): Position {
    switch (direction) {
      case Direction.TOP:
        return { x: point.x, y: point.y - distance };
      case Direction.RIGHT:
        return { x: point.x + distance, y: point.y };
      case Direction.BOTTOM:
        return { x: point.x, y: point.y + distance };
      case Direction.LEFT:
        return { x: point.x - distance, y: point.y };
      default:
        return point;
    }
  }

  /**
   * 根据方向组合进行路由
   */
  private routeByDirections(
    source: Position,
    target: Position,
    sourceExt: Position,
    targetExt: Position,
    sourceDir: Direction,
    targetDir: Direction,
    padding: number,
    avoidOverlap: boolean
  ): Position[] {
    const points: Position[] = [source];

    // 特殊情况处理
    if (this.isOppositeDirection(sourceDir, targetDir)) {
      // 相对方向
      if (this.needsDetour(source, target, sourceDir, targetDir)) {
        // 需要绕路
        return this.createDetourPath(source, target, sourceDir, targetDir, padding);
      } else {
        // 简单的Z字形或L字形
        points.push(sourceExt);
        if (Math.abs(sourceExt.x - targetExt.x) > 1 || Math.abs(sourceExt.y - targetExt.y) > 1) {
          // 添加中间点
          if (sourceDir === Direction.LEFT || sourceDir === Direction.RIGHT) {
            points.push({ x: sourceExt.x, y: targetExt.y });
          } else {
            points.push({ x: targetExt.x, y: sourceExt.y });
          }
        }
        points.push(targetExt);
      }
    } else if (this.isPerpendicularDirection(sourceDir, targetDir)) {
      // 垂直方向
      points.push(sourceExt);
      
      // 智能选择中间点
      const midPoint = this.calculateMidPoint(sourceExt, targetExt, sourceDir, targetDir, avoidOverlap);
      if (midPoint) {
        points.push(midPoint);
      }
      
      points.push(targetExt);
    } else {
      // 同向或其他情况
      points.push(sourceExt);
      
      // 创建优雅的绕行路径
      const detour = this.createElegantDetour(sourceExt, targetExt, sourceDir, targetDir, padding);
      points.push(...detour);
      
      points.push(targetExt);
    }

    points.push(target);
    
    // 优化路径点
    return this.optimizePath(points);
  }

  /**
   * 判断是否是相对方向
   */
  private isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
    return (
      (dir1 === Direction.LEFT && dir2 === Direction.RIGHT) ||
      (dir1 === Direction.RIGHT && dir2 === Direction.LEFT) ||
      (dir1 === Direction.TOP && dir2 === Direction.BOTTOM) ||
      (dir1 === Direction.BOTTOM && dir2 === Direction.TOP)
    );
  }

  /**
   * 判断是否是垂直方向
   */
  private isPerpendicularDirection(dir1: Direction, dir2: Direction): boolean {
    const horizontal = [Direction.LEFT, Direction.RIGHT];
    const vertical = [Direction.TOP, Direction.BOTTOM];
    
    return (
      (horizontal.includes(dir1) && vertical.includes(dir2)) ||
      (vertical.includes(dir1) && horizontal.includes(dir2))
    );
  }

  /**
   * 判断是否需要绕路
   */
  private needsDetour(
    source: Position,
    target: Position,
    sourceDir: Direction,
    targetDir: Direction
  ): boolean {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    // 反向连接时需要绕路
    if (sourceDir === Direction.RIGHT && dx < 0) return true;
    if (sourceDir === Direction.LEFT && dx > 0) return true;
    if (sourceDir === Direction.BOTTOM && dy < 0) return true;
    if (sourceDir === Direction.TOP && dy > 0) return true;
    
    return false;
  }

  /**
   * 创建绕路径
   */
  private createDetourPath(
    source: Position,
    target: Position,
    sourceDir: Direction,
    targetDir: Direction,
    padding: number
  ): Position[] {
    const points: Position[] = [source];
    const detourDistance = padding * 2;
    
    // 根据方向创建绕行路径
    if (sourceDir === Direction.RIGHT || sourceDir === Direction.LEFT) {
      // 水平方向出发
      const sourceX = sourceDir === Direction.RIGHT ? 
        source.x + detourDistance : source.x - detourDistance;
      const targetX = targetDir === Direction.RIGHT ? 
        target.x + detourDistance : target.x - detourDistance;
      
      const midY = (source.y + target.y) / 2;
      
      points.push({ x: sourceX, y: source.y });
      points.push({ x: sourceX, y: midY });
      points.push({ x: targetX, y: midY });
      points.push({ x: targetX, y: target.y });
    } else {
      // 垂直方向出发
      const sourceY = sourceDir === Direction.BOTTOM ? 
        source.y + detourDistance : source.y - detourDistance;
      const targetY = targetDir === Direction.BOTTOM ? 
        target.y + detourDistance : target.y - detourDistance;
      
      const midX = (source.x + target.x) / 2;
      
      points.push({ x: source.x, y: sourceY });
      points.push({ x: midX, y: sourceY });
      points.push({ x: midX, y: targetY });
      points.push({ x: target.x, y: targetY });
    }
    
    points.push(target);
    return points;
  }

  /**
   * 计算中间点
   */
  private calculateMidPoint(
    sourceExt: Position,
    targetExt: Position,
    sourceDir: Direction,
    targetDir: Direction,
    avoidOverlap: boolean
  ): Position | null {
    if (!avoidOverlap) {
      return null;
    }

    // 根据方向选择合适的中间点
    if ((sourceDir === Direction.LEFT || sourceDir === Direction.RIGHT) &&
        (targetDir === Direction.TOP || targetDir === Direction.BOTTOM)) {
      return { x: sourceExt.x, y: targetExt.y };
    } else if ((sourceDir === Direction.TOP || sourceDir === Direction.BOTTOM) &&
               (targetDir === Direction.LEFT || targetDir === Direction.RIGHT)) {
      return { x: targetExt.x, y: sourceExt.y };
    }

    return null;
  }

  /**
   * 创建优雅的绕行路径
   */
  private createElegantDetour(
    sourceExt: Position,
    targetExt: Position,
    sourceDir: Direction,
    targetDir: Direction,
    padding: number
  ): Position[] {
    const points: Position[] = [];
    const offset = padding * 1.5;
    
    // 计算偏移位置
    if (sourceDir === targetDir) {
      // 同向，需要绕行
      if (sourceDir === Direction.RIGHT || sourceDir === Direction.LEFT) {
        const x = sourceDir === Direction.RIGHT ? 
          Math.max(sourceExt.x, targetExt.x) + offset :
          Math.min(sourceExt.x, targetExt.x) - offset;
        points.push({ x, y: sourceExt.y });
        points.push({ x, y: targetExt.y });
      } else {
        const y = sourceDir === Direction.BOTTOM ? 
          Math.max(sourceExt.y, targetExt.y) + offset :
          Math.min(sourceExt.y, targetExt.y) - offset;
        points.push({ x: sourceExt.x, y });
        points.push({ x: targetExt.x, y });
      }
    }
    
    return points;
  }

  /**
   * 优化路径点，移除冗余点
   */
  private optimizePath(points: Position[]): Position[] {
    if (points.length <= 2) return points;
    
    const optimized: Position[] = [points[0]];
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // 检查是否共线
      if (!this.arePointsCollinear(prev, curr, next)) {
        optimized.push(curr);
      }
    }
    
    optimized.push(points[points.length - 1]);
    return optimized;
  }

  /**
   * 检查三点是否共线
   */
  private arePointsCollinear(p1: Position, p2: Position, p3: Position): boolean {
    const tolerance = 0.1;
    
    // 检查水平共线
    if (Math.abs(p1.y - p2.y) < tolerance && Math.abs(p2.y - p3.y) < tolerance) {
      return true;
    }
    
    // 检查垂直共线
    if (Math.abs(p1.x - p2.x) < tolerance && Math.abs(p2.x - p3.x) < tolerance) {
      return true;
    }
    
    return false;
  }

  /**
   * 创建平滑路径
   */
  private createSmoothPath(points: Position[], cornerRadius: number): string {
    if (points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // 计算圆角
      const corner = this.calculateCorner(prev, curr, next, cornerRadius);
      
      if (corner) {
        path += ` L ${corner.start.x},${corner.start.y}`;
        path += ` Q ${curr.x},${curr.y} ${corner.end.x},${corner.end.y}`;
      } else {
        path += ` L ${curr.x},${curr.y}`;
      }
    }
    
    path += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;
    
    return path;
  }

  /**
   * 计算圆角
   */
  private calculateCorner(
    prev: Position,
    curr: Position,
    next: Position,
    radius: number
  ): { start: Position; end: Position } | null {
    const d1 = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
    const d2 = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
    
    if (d1 < 0.1 || d2 < 0.1) return null;
    
    const r = Math.min(radius, d1 / 2, d2 / 2);
    
    if (r < 1) return null;
    
    const ratio1 = r / d1;
    const ratio2 = r / d2;
    
    return {
      start: {
        x: curr.x - (curr.x - prev.x) * ratio1,
        y: curr.y - (curr.y - prev.y) * ratio1
      },
      end: {
        x: curr.x + (next.x - curr.x) * ratio2,
        y: curr.y + (next.y - curr.y) * ratio2
      }
    };
  }

  /**
   * 计算标签位置
   */
  private calculateLabelPosition(points: Position[]): Position {
    if (points.length === 0) return { x: 0, y: 0 };
    
    // 使用路径的中点
    const totalLength = this.calculatePathLength(points);
    const halfLength = totalLength / 2;
    
    let currentLength = 0;
    for (let i = 1; i < points.length; i++) {
      const segmentLength = this.calculateDistance(points[i - 1], points[i]);
      
      if (currentLength + segmentLength >= halfLength) {
        const ratio = (halfLength - currentLength) / segmentLength;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * ratio,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * ratio
        };
      }
      
      currentLength += segmentLength;
    }
    
    // 默认返回中间点
    const midIndex = Math.floor(points.length / 2);
    return points[midIndex];
  }

  /**
   * 计算路径长度
   */
  private calculatePathLength(points: Position[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += this.calculateDistance(points[i - 1], points[i]);
    }
    return length;
  }

  /**
   * 计算两点距离
   */
  private calculateDistance(p1: Position, p2: Position): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  /**
   * 计算箭头角度
   */
  private calculateArrowAngle(points: Position[]): number {
    if (points.length < 2) return 0;
    
    const lastTwo = points.slice(-2);
    return Math.atan2(
      lastTwo[1].y - lastTwo[0].y,
      lastTwo[1].x - lastTwo[0].x
    );
  }
}