import { Position, NodeType } from '../types';
import { FlowNode } from '../core/Node';
import { FlowEdge } from '../core/Edge';

/**
 * 连接点方向
 */
export enum ConnectionSide {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

/**
 * 连接点信息
 */
export interface ConnectionPoint {
  id: string;                    // 连接点ID
  nodeId: string;                // 所属节点ID
  side: ConnectionSide;          // 所在边
  position: Position;            // 绝对位置
  offset: number;                // 在该边上的偏移量 (0-1)
  occupied: boolean;             // 是否已被占用
  edgeId?: string;               // 占用该点的边ID
  priority: number;              // 优先级（用于排序）
}

/**
 * 节点形状接口
 */
interface NodeShape {
  getConnectionPoints(node: FlowNode, width: number, height: number): ConnectionPoint[];
  getConnectionPoint(node: FlowNode, width: number, height: number, side: ConnectionSide, offset?: number): Position;
}

/**
 * 矩形节点形状
 */
class RectangleShape implements NodeShape {
  getConnectionPoints(node: FlowNode, width: number, height: number): ConnectionPoint[] {
    const { x, y } = node.position;
    const halfW = width / 2;
    const halfH = height / 2;

    return [
      // 顶部中心
      {
        id: `${node.id}-top-0.5`,
        nodeId: node.id,
        side: ConnectionSide.TOP,
        position: { x, y: y - halfH },
        offset: 0.5,
        occupied: false,
        priority: 1
      },
      // 右侧中心
      {
        id: `${node.id}-right-0.5`,
        nodeId: node.id,
        side: ConnectionSide.RIGHT,
        position: { x: x + halfW, y },
        offset: 0.5,
        occupied: false,
        priority: 1
      },
      // 底部中心
      {
        id: `${node.id}-bottom-0.5`,
        nodeId: node.id,
        side: ConnectionSide.BOTTOM,
        position: { x, y: y + halfH },
        offset: 0.5,
        occupied: false,
        priority: 1
      },
      // 左侧中心
      {
        id: `${node.id}-left-0.5`,
        nodeId: node.id,
        side: ConnectionSide.LEFT,
        position: { x: x - halfW, y },
        offset: 0.5,
        occupied: false,
        priority: 1
      }
    ];
  }

  getConnectionPoint(node: FlowNode, width: number, height: number, side: ConnectionSide, offset: number = 0.5): Position {
    const { x, y } = node.position;
    const halfW = width / 2;
    const halfH = height / 2;

    switch (side) {
      case ConnectionSide.TOP:
        return { x: x + (offset - 0.5) * width, y: y - halfH };
      case ConnectionSide.RIGHT:
        return { x: x + halfW, y: y + (offset - 0.5) * height };
      case ConnectionSide.BOTTOM:
        return { x: x + (offset - 0.5) * width, y: y + halfH };
      case ConnectionSide.LEFT:
        return { x: x - halfW, y: y + (offset - 0.5) * height };
    }
  }
}

/**
 * 菱形节点形状（每个角一个连接点）
 */
class DiamondShape implements NodeShape {
  getConnectionPoints(node: FlowNode, width: number, height: number): ConnectionPoint[] {
    const { x, y } = node.position;
    const halfW = width / 2;
    const halfH = height / 2;

    // 菱形只有4个顶点作为连接点
    return [
      // 顶部顶点
      {
        id: `${node.id}-top-0.5`,
        nodeId: node.id,
        side: ConnectionSide.TOP,
        position: { x, y: y - halfH },
        offset: 0.5,
        occupied: false,
        priority: 1
      },
      // 右侧顶点
      {
        id: `${node.id}-right-0.5`,
        nodeId: node.id,
        side: ConnectionSide.RIGHT,
        position: { x: x + halfW, y },
        offset: 0.5,
        occupied: false,
        priority: 1
      },
      // 底部顶点
      {
        id: `${node.id}-bottom-0.5`,
        nodeId: node.id,
        side: ConnectionSide.BOTTOM,
        position: { x, y: y + halfH },
        offset: 0.5,
        occupied: false,
        priority: 1
      },
      // 左侧顶点
      {
        id: `${node.id}-left-0.5`,
        nodeId: node.id,
        side: ConnectionSide.LEFT,
        position: { x: x - halfW, y },
        offset: 0.5,
        occupied: false,
        priority: 1
      }
    ];
  }

  getConnectionPoint(node: FlowNode, width: number, height: number, side: ConnectionSide, offset: number = 0.5): Position {
    const { x, y } = node.position;
    const halfW = width / 2;
    const halfH = height / 2;

    // 菱形忽略offset，总是返回顶点位置
    switch (side) {
      case ConnectionSide.TOP:
        return { x, y: y - halfH };
      case ConnectionSide.RIGHT:
        return { x: x + halfW, y };
      case ConnectionSide.BOTTOM:
        return { x, y: y + halfH };
      case ConnectionSide.LEFT:
        return { x: x - halfW, y };
    }
  }
}

/**
 * 圆形节点形状
 */
class CircleShape implements NodeShape {
  getConnectionPoints(node: FlowNode, width: number, height: number): ConnectionPoint[] {
    const { x, y } = node.position;
    const radius = Math.min(width, height) / 2;

    // 圆形提供8个均匀分布的连接点
    const points: ConnectionPoint[] = [];
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];

    angles.forEach((angle, index) => {
      const rad = (angle * Math.PI) / 180;
      const px = x + radius * Math.cos(rad);
      const py = y + radius * Math.sin(rad);

      let side: ConnectionSide;
      if (angle >= 315 || angle < 45) side = ConnectionSide.RIGHT;
      else if (angle >= 45 && angle < 135) side = ConnectionSide.BOTTOM;
      else if (angle >= 135 && angle < 225) side = ConnectionSide.LEFT;
      else side = ConnectionSide.TOP;

      points.push({
        id: `${node.id}-${side}-${angle}`,
        nodeId: node.id,
        side,
        position: { x: px, y: py },
        offset: angle / 360,
        occupied: false,
        priority: index % 2 === 0 ? 1 : 2  // 主方向优先级更高
      });
    });

    return points;
  }

  getConnectionPoint(node: FlowNode, width: number, height: number, side: ConnectionSide, offset: number = 0.5): Position {
    const { x, y } = node.position;
    const radius = Math.min(width, height) / 2;

    // 根据side计算角度
    let baseAngle: number;
    switch (side) {
      case ConnectionSide.TOP:
        baseAngle = 270;
        break;
      case ConnectionSide.RIGHT:
        baseAngle = 0;
        break;
      case ConnectionSide.BOTTOM:
        baseAngle = 90;
        break;
      case ConnectionSide.LEFT:
        baseAngle = 180;
        break;
    }

    const rad = (baseAngle * Math.PI) / 180;
    return {
      x: x + radius * Math.cos(rad),
      y: y + radius * Math.sin(rad)
    };
  }
}

/**
 * 连接点管理器
 * 负责管理所有节点的连接点，确保连线从节点边框中间开始/结束
 * 参考 bpmn.js 的连接点管理系统
 */
export class ConnectionPointManager {
  private shapes: Map<NodeType, NodeShape> = new Map();
  private connectionPoints: Map<string, ConnectionPoint[]> = new Map();
  private edgeConnections: Map<string, { source: ConnectionPoint; target: ConnectionPoint }> = new Map();

  constructor() {
    // 注册不同的节点形状
    this.shapes.set(NodeType.START, new CircleShape());
    this.shapes.set(NodeType.END, new CircleShape());
    this.shapes.set(NodeType.CONDITION, new DiamondShape());
    this.shapes.set(NodeType.APPROVAL, new RectangleShape());
    this.shapes.set(NodeType.PROCESS, new RectangleShape());
    this.shapes.set(NodeType.PARALLEL, new DiamondShape());
    this.shapes.set(NodeType.MERGE, new DiamondShape());
  }

  /**
   * 更新节点的连接点
   */
  public updateNodeConnectionPoints(node: FlowNode, width: number, height: number): void {
    const shape = this.shapes.get(node.type) || new RectangleShape();
    const points = shape.getConnectionPoints(node, width, height);
    this.connectionPoints.set(node.id, points);
  }

  /**
   * 为边分配最佳连接点
   */
  public allocateConnectionPoints(
    edge: FlowEdge,
    sourceNode: FlowNode,
    targetNode: FlowNode,
    width: number,
    height: number
  ): { source: Position; target: Position; sourceSide: ConnectionSide; targetSide: ConnectionSide; sourceOffset: number; targetOffset: number } {
    // 确保节点的连接点已初始化
    if (!this.connectionPoints.has(sourceNode.id)) {
      this.updateNodeConnectionPoints(sourceNode, width, height);
    }
    if (!this.connectionPoints.has(targetNode.id)) {
      this.updateNodeConnectionPoints(targetNode, width, height);
    }

    // 计算最佳连接方向
    const { sourceSide, targetSide } = this.calculateBestSides(sourceNode, targetNode);

    // 获取连接点位置
    const sourceShape = this.shapes.get(sourceNode.type) || new RectangleShape();
    const targetShape = this.shapes.get(targetNode.type) || new RectangleShape();

    const sourcePos = sourceShape.getConnectionPoint(sourceNode, width, height, sourceSide);
    const targetPos = targetShape.getConnectionPoint(targetNode, width, height, targetSide);

    // 如果是菱形节点，标记该连接点为已占用
    if (this.isDiamond(sourceNode.type) || this.isDiamond(targetNode.type)) {
      this.markConnectionPointOccupied(sourceNode.id, sourceSide, edge.id);
      this.markConnectionPointOccupied(targetNode.id, targetSide, edge.id);
    }

    // 记录边的连接信息
    this.edgeConnections.set(edge.id, {
      source: {
        id: `${sourceNode.id}-${sourceSide}`,
        nodeId: sourceNode.id,
        side: sourceSide,
        position: sourcePos,
        offset: 0.5,
        occupied: true,
        edgeId: edge.id,
        priority: 1
      },
      target: {
        id: `${targetNode.id}-${targetSide}`,
        nodeId: targetNode.id,
        side: targetSide,
        position: targetPos,
        offset: 0.5,
        occupied: true,
        edgeId: edge.id,
        priority: 1
      }
    });

    return {
      source: sourcePos,
      target: targetPos,
      sourceSide,
      targetSide,
      sourceOffset: 0,  // 简化：暂时不使用
      targetOffset: 0   // 简化：暂时不使用
    };
  }

  /**
   * 计算最佳连接边
   */
  private calculateBestSides(
    sourceNode: FlowNode,
    targetNode: FlowNode
  ): { sourceSide: ConnectionSide; targetSide: ConnectionSide } {
    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;

    // 计算角度
    const angle = Math.atan2(dy, dx);
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let sourceSide: ConnectionSide;
    let targetSide: ConnectionSide;

    // 根据相对位置选择连接边
    if (absDy > absDx) {
      // 垂直方向为主
      if (dy > 0) {
        sourceSide = ConnectionSide.BOTTOM;
        targetSide = ConnectionSide.TOP;
      } else {
        sourceSide = ConnectionSide.TOP;
        targetSide = ConnectionSide.BOTTOM;
      }
    } else {
      // 水平方向为主
      if (dx > 0) {
        sourceSide = ConnectionSide.RIGHT;
        targetSide = ConnectionSide.LEFT;
      } else {
        sourceSide = ConnectionSide.LEFT;
        targetSide = ConnectionSide.RIGHT;
      }
    }

    // 检查菱形节点的连接点占用情况
    if (this.isDiamond(sourceNode.type)) {
      const available = this.getAvailableConnectionPoint(sourceNode.id, sourceSide);
      if (!available) {
        // 如果该边被占用，尝试其他边
        sourceSide = this.findAlternativeSide(sourceNode.id, sourceSide, angle);
      }
    }

    if (this.isDiamond(targetNode.type)) {
      const available = this.getAvailableConnectionPoint(targetNode.id, targetSide);
      if (!available) {
        targetSide = this.findAlternativeSide(targetNode.id, targetSide, angle + Math.PI);
      }
    }

    return { sourceSide, targetSide };
  }

  /**
   * 标记连接点为已占用
   */
  private markConnectionPointOccupied(nodeId: string, side: ConnectionSide, edgeId: string): void {
    const points = this.connectionPoints.get(nodeId);
    if (points) {
      const point = points.find(p => p.side === side && !p.occupied);
      if (point) {
        point.occupied = true;
        point.edgeId = edgeId;
      }
    }
  }

  /**
   * 获取可用的连接点
   */
  private getAvailableConnectionPoint(nodeId: string, side: ConnectionSide): ConnectionPoint | undefined {
    const points = this.connectionPoints.get(nodeId);
    if (!points) return undefined;

    return points.find(p => p.side === side && !p.occupied);
  }

  /**
   * 查找替代的连接边
   */
  private findAlternativeSide(nodeId: string, preferredSide: ConnectionSide, angle: number): ConnectionSide {
    const points = this.connectionPoints.get(nodeId);
    if (!points) return preferredSide;

    // 按优先级排序可用连接点
    const availablePoints = points
      .filter(p => !p.occupied)
      .sort((a, b) => a.priority - b.priority);

    if (availablePoints.length > 0) {
      return availablePoints[0].side;
    }

    // 如果所有点都被占用，返回最接近的边
    const sides = [ConnectionSide.TOP, ConnectionSide.RIGHT, ConnectionSide.BOTTOM, ConnectionSide.LEFT];
    const normalizedAngle = ((angle + 2 * Math.PI) % (2 * Math.PI));
    const sideIndex = Math.round((normalizedAngle / (Math.PI / 2))) % 4;

    return sides[sideIndex];
  }

  /**
   * 判断是否是菱形节点
   */
  private isDiamond(type: NodeType): boolean {
    return type === NodeType.CONDITION ||
      type === NodeType.PARALLEL ||
      type === NodeType.MERGE;
  }

  /**
   * 释放边的连接点
   */
  public releaseEdgeConnectionPoints(edgeId: string): void {
    const connection = this.edgeConnections.get(edgeId);
    if (connection) {
      // 释放源连接点
      this.releaseConnectionPoint(connection.source.nodeId, connection.source.side, edgeId);
      // 释放目标连接点
      this.releaseConnectionPoint(connection.target.nodeId, connection.target.side, edgeId);
      // 删除边连接记录
      this.edgeConnections.delete(edgeId);
    }
  }

  /**
   * 释放连接点
   */
  private releaseConnectionPoint(nodeId: string, side: ConnectionSide, edgeId: string): void {
    const points = this.connectionPoints.get(nodeId);
    if (points) {
      const point = points.find(p => p.side === side && p.edgeId === edgeId);
      if (point) {
        point.occupied = false;
        point.edgeId = undefined;
      }
    }
  }

  /**
   * 获取边的连接信息
   */
  public getEdgeConnection(edgeId: string): { source: ConnectionPoint; target: ConnectionPoint } | undefined {
    return this.edgeConnections.get(edgeId);
  }

  /**
   * 清空所有连接点
   */
  public clear(): void {
    this.connectionPoints.clear();
    this.edgeConnections.clear();
  }

  /**
   * 获取节点的所有连接点
   */
  public getNodeConnectionPoints(nodeId: string): ConnectionPoint[] {
    return this.connectionPoints.get(nodeId) || [];
  }

  /**
   * 注册自定义节点形状
   */
  public registerShape(nodeType: NodeType, shape: NodeShape): void {
    this.shapes.set(nodeType, shape);
  }
}









