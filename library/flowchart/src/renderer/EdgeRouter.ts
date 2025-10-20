import { FlowNode } from '../core/Node';
import { Position, Size } from '../types';

/**
 * 连线路由器
 * 负责计算避开节点的智能路径
 */
export class EdgeRouter {
  private nodes: Map<string, FlowNode>;
  private nodeSize: Size;
  private nodePadding: number = 20; // 节点周围的安全距离

  constructor(nodes: Map<string, FlowNode>, nodeSize: Size) {
    this.nodes = nodes;
    this.nodeSize = nodeSize;
  }

  /**
   * 计算智能路径（避开节点）
   */
  public calculateRoute(
    source: FlowNode,
    target: FlowNode,
    sourcePoint: Position,
    targetPoint: Position
  ): Position[] {
    // 如果是直上直下或直左直右，且中间没有障碍，使用简单路径
    const simpleRoute = this.trySimpleRoute(sourcePoint, targetPoint, source.id, target.id);
    if (simpleRoute) {
      return simpleRoute;
    }

    // 使用 A* 算法计算避开节点的路径
    return this.aStarRoute(sourcePoint, targetPoint, source.id, target.id);
  }

  /**
   * 尝试简单路径
   */
  private trySimpleRoute(
    source: Position,
    target: Position,
    sourceId: string,
    targetId: string
  ): Position[] | null {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    // 垂直方向的简单路径
    if (Math.abs(dx) < 10) {
      // 检查路径上是否有障碍
      if (!this.hasObstacle(source, target, sourceId, targetId)) {
        return [source, target];
      }
    }

    // 标准 Z 字形路径
    const midY = source.y + dy / 2;
    const waypoints = [
      source,
      { x: source.x, y: midY },
      { x: target.x, y: midY },
      target
    ];

    // 检查这条路径是否与节点相交
    if (!this.pathIntersectsNodes(waypoints, sourceId, targetId)) {
      return waypoints;
    }

    return null;
  }

  /**
   * A* 路径规划（简化版）
   */
  private aStarRoute(
    source: Position,
    target: Position,
    sourceId: string,
    targetId: string
  ): Position[] {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    // 计算中间路由点
    const offset = 30;
    const sideOffset = Math.max(60, Math.abs(dx) / 3);

    let waypoints: Position[];

    if (dy > 60) {
      // 向下：标准路径
      const midY = source.y + dy / 2;
      waypoints = [
        source,
        { x: source.x, y: source.y + offset },
        { x: source.x, y: midY },
        { x: target.x, y: midY },
        { x: target.x, y: target.y - offset },
        target
      ];
    } else if (dy < -60) {
      // 向上：绕过
      waypoints = [
        source,
        { x: source.x, y: source.y + offset },
        { x: source.x + (dx >= 0 ? sideOffset : -sideOffset), y: source.y + offset },
        { x: source.x + (dx >= 0 ? sideOffset : -sideOffset), y: target.y - offset },
        { x: target.x, y: target.y - offset },
        target
      ];
    } else {
      // 水平
      waypoints = [
        source,
        { x: source.x, y: source.y + offset },
        { x: target.x, y: target.y - offset },
        target
      ];
    }

    // 优化路径，移除不必要的点
    return this.optimizeRoute(waypoints);
  }

  /**
   * 检查路径是否与节点相交
   */
  private pathIntersectsNodes(
    waypoints: Position[],
    sourceId: string,
    targetId: string
  ): boolean {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      for (const [nodeId, node] of this.nodes) {
        if (nodeId === sourceId || nodeId === targetId) {
          continue;
        }

        if (this.lineIntersectsNode(p1, p2, node)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查线段是否与节点相交
   */
  private lineIntersectsNode(p1: Position, p2: Position, node: FlowNode): boolean {
    const nodeRect = {
      x: node.position.x - this.nodeSize.width / 2 - this.nodePadding,
      y: node.position.y - this.nodeSize.height / 2 - this.nodePadding,
      width: this.nodeSize.width + this.nodePadding * 2,
      height: this.nodeSize.height + this.nodePadding * 2
    };

    return this.lineIntersectsRect(p1, p2, nodeRect);
  }

  /**
   * 检查线段是否与矩形相交
   */
  private lineIntersectsRect(
    p1: Position,
    p2: Position,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    // 检查端点是否在矩形内
    if (this.pointInRect(p1, rect) || this.pointInRect(p2, rect)) {
      return true;
    }

    // 检查线段是否与矩形的四条边相交
    const edges = [
      { p1: { x: rect.x, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y } }, // 上
      { p1: { x: rect.x + rect.width, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y + rect.height } }, // 右
      { p1: { x: rect.x, y: rect.y + rect.height }, p2: { x: rect.x + rect.width, y: rect.y + rect.height } }, // 下
      { p1: { x: rect.x, y: rect.y }, p2: { x: rect.x, y: rect.y + rect.height } } // 左
    ];

    return edges.some(edge => this.lineSegmentsIntersect(p1, p2, edge.p1, edge.p2));
  }

  /**
   * 检查点是否在矩形内
   */
  private pointInRect(
    point: Position,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  /**
   * 检查两条线段是否相交
   */
  private lineSegmentsIntersect(p1: Position, p2: Position, p3: Position, p4: Position): boolean {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    
    if (Math.abs(denom) < 0.001) {
      return false; // 平行
    }

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  /**
   * 检查是否有障碍
   */
  private hasObstacle(
    p1: Position,
    p2: Position,
    sourceId: string,
    targetId: string
  ): boolean {
    for (const [nodeId, node] of this.nodes) {
      if (nodeId === sourceId || nodeId === targetId) {
        continue;
      }

      if (this.lineIntersectsNode(p1, p2, node)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 优化路径，移除冗余点
   */
  private optimizeRoute(waypoints: Position[]): Position[] {
    if (waypoints.length <= 2) {
      return waypoints;
    }

    const optimized: Position[] = [waypoints[0]];

    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      // 检查三点是否共线
      const isCollinear = Math.abs(
        (curr.y - prev.y) * (next.x - curr.x) - (curr.x - prev.x) * (next.y - curr.y)
      ) < 0.1;

      if (!isCollinear) {
        optimized.push(curr);
      }
    }

    optimized.push(waypoints[waypoints.length - 1]);
    return optimized;
  }

  /**
   * 更新节点列表
   */
  public updateNodes(nodes: Map<string, FlowNode>): void {
    this.nodes = nodes;
  }
}










