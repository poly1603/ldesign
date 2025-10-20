import { Position, NodeType } from '../types';

/**
 * 连接方向枚举
 */
export enum PortDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

/**
 * 连接点信息
 */
interface Port {
  position: Position;
  direction: PortDirection;
}

/**
 * 节点信息接口
 */
interface NodeInfo {
  id: string;
  type: string | NodeType;
  position: Position;
  width: number;
  height: number;
}

/**
 * 路由配置
 */
interface RouterConfig {
  padding?: number;          // 节点周围最小间距
  cornerRadius?: number;     // 拐角圆角半径
  smartRouting?: boolean;    // 启用智能路由
  avoidNodes?: boolean;      // 避让其他节点
  gridSize?: number;         // 网格大小（用于对齐）
  preferredSourcePort?: PortDirection; // 优先的源端口方向
  preferredTargetPort?: PortDirection; // 优先的目标端口方向
  offset?: number;           // 平行线条的偏移量
  symmetricOffset?: number;  // 对称分布的偏移量
  sourcePortOffset?: number; // 源端口的偏移量
  targetPortOffset?: number; // 目标端口的偏移量
}

/**
 * 路径结果
 */
interface PathResult {
  path: string;              // SVG路径字符串
  points: Position[];        // 路径关键点
  labelPosition: Position;   // 标签位置
  arrowAngle: number;       // 箭头角度
}

/**
 * 智能边缘路由器
 * 基于业界最佳实践实现的连线路由算法
 */
export class SmartEdgeRouter {
  private config: Required<RouterConfig>;
  
  constructor(config: RouterConfig = {}) {
    this.config = {
      padding: config.padding ?? 20,
      cornerRadius: config.cornerRadius ?? 0,  // 设置为0，使用纯直角
      smartRouting: config.smartRouting ?? true,
      avoidNodes: config.avoidNodes ?? true,
      gridSize: config.gridSize ?? 10,
      preferredSourcePort: config.preferredSourcePort as PortDirection | undefined,
      preferredTargetPort: config.preferredTargetPort as PortDirection | undefined,
      offset: config.offset ?? 0,
      symmetricOffset: config.symmetricOffset ?? 0,
      sourcePortOffset: config.sourcePortOffset ?? 0,
      targetPortOffset: config.targetPortOffset ?? 0
    } as Required<RouterConfig>;
  }

  /**
   * 计算两个节点之间的最优路径
   */
  public route(source: NodeInfo, target: NodeInfo, allNodes?: NodeInfo[], options?: RouterConfig): PathResult {
    // 合并配置选项
    const config = { ...this.config, ...options };
    
    // 获取最佳连接端口
    let sourcePort = this.getBestPort(source, target, true, config.preferredSourcePort);
    let targetPort = this.getBestPort(target, source, false, config.preferredTargetPort);
    
    // 应用端口偏移
    if (config.sourcePortOffset && config.sourcePortOffset !== 0) {
      sourcePort = this.applyPortOffset(sourcePort, config.sourcePortOffset);
    }
    if (config.targetPortOffset && config.targetPortOffset !== 0) {
      targetPort = this.applyPortOffset(targetPort, config.targetPortOffset);
    }
    
    // 计算路径点
    let points: Position[];
    
    if (config.smartRouting) {
      points = this.calculateSmartPath(sourcePort, targetPort, source, target, allNodes, config.offset, config.symmetricOffset);
    } else {
      points = this.calculateSimplePath(sourcePort, targetPort);
    }
    
    // 优化路径点
    points = this.optimizePoints(points);
    
    // 生成SVG路径
    const path = this.generateSVGPath(points, this.config.cornerRadius);
    
    // 计算标签位置
    const labelPosition = this.calculateLabelPosition(points);
    
    // 计算箭头角度
    const arrowAngle = this.calculateArrowAngle(points);
    
    return {
      path,
      points,
      labelPosition,
      arrowAngle
    };
  }

  /**
   * 获取节点的最佳连接端口
   */
  private getBestPort(node: NodeInfo, otherNode: NodeInfo, isSource: boolean, preferredDirection?: PortDirection): Port {
    const dx = otherNode.position.x - node.position.x;
    const dy = otherNode.position.y - node.position.y;
    
    // 特殊处理菱形节点
    if (this.isDiamond(node.type)) {
      return this.getDiamondPort(node, dx, dy, isSource, preferredDirection);
    }
    
    // 如果有优先方向，使用优先方向
    if (preferredDirection) {
      const halfWidth = node.width / 2;
      const halfHeight = node.height / 2;
      return this.getPortByDirection(node.position, halfWidth, halfHeight, preferredDirection);
    }
    
    // 计算最佳方向
    const angle = Math.atan2(dy, dx);
    const absAngle = Math.abs(angle);
    
    let direction: PortDirection;
    let position: Position;
    
    const halfWidth = node.width / 2;
    const halfHeight = node.height / 2;
    
    // 根据角度选择最佳端口
    if (absAngle <= Math.PI / 4) {
      // 右侧
      direction = isSource ? PortDirection.RIGHT : PortDirection.LEFT;
      position = {
        x: node.position.x + halfWidth,
        y: node.position.y
      };
    } else if (absAngle >= 3 * Math.PI / 4) {
      // 左侧
      direction = isSource ? PortDirection.LEFT : PortDirection.RIGHT;
      position = {
        x: node.position.x - halfWidth,
        y: node.position.y
      };
    } else if (angle > 0) {
      // 底部
      direction = isSource ? PortDirection.BOTTOM : PortDirection.TOP;
      position = {
        x: node.position.x,
        y: node.position.y + halfHeight
      };
    } else {
      // 顶部
      direction = isSource ? PortDirection.TOP : PortDirection.BOTTOM;
      position = {
        x: node.position.x,
        y: node.position.y - halfHeight
      };
    }
    
    return { position, direction };
  }

  /**
   * 获取菱形节点的连接端口
   */
  private getDiamondPort(node: NodeInfo, dx: number, dy: number, isSource: boolean, preferredDirection?: PortDirection): Port {
    const angle = Math.atan2(dy, dx);
    const halfWidth = node.width / 2;
    const halfHeight = node.height / 2;
    
    // 如果有优先方向，使用优先方向
    if (preferredDirection) {
      return this.getPortByDirection(node.position, halfWidth, halfHeight, preferredDirection);
    }
    
    let direction: PortDirection;
    let position: Position;
    
    // 菱形四个顶点 - 根据角度选择
    if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
      direction = PortDirection.RIGHT;
      position = { x: node.position.x + halfWidth, y: node.position.y };
    } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
      direction = PortDirection.BOTTOM;
      position = { x: node.position.x, y: node.position.y + halfHeight };
    } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
      direction = PortDirection.TOP;
      position = { x: node.position.x, y: node.position.y - halfHeight };
    } else {
      direction = PortDirection.LEFT;
      position = { x: node.position.x - halfWidth, y: node.position.y };
    }
    
    return { position, direction };
  }

  /**
   * 计算智能路径
   */
  private calculateSmartPath(
    sourcePort: Port,
    targetPort: Port,
    source: NodeInfo,
    target: NodeInfo,
    allNodes?: NodeInfo[],
    offset?: number,
    symmetricOffset?: number
  ): Position[] {
    const points: Position[] = [sourcePort.position];
    const padding = this.config.padding;
    
    // 判断是否可以直连
    if (this.canDirectConnect(sourcePort, targetPort)) {
      points.push(targetPort.position);
      return points;
    }
    
    // 需要转折的情况
    const extendDistance = padding + (offset || 0);
    const sourceOut = this.extendPortWithOffset(sourcePort, extendDistance, symmetricOffset);
    const targetIn = this.extendPort(targetPort, extendDistance);
    
    // 根据端口方向组合选择路由策略
    if (this.areOpposite(sourcePort.direction, targetPort.direction)) {
      // 相对方向
      if (this.needsDetour(sourcePort, targetPort)) {
        // 需要绕行
        const detourPoints = this.createDetour(sourcePort, targetPort, sourceOut, targetIn, padding, offset);
        points.push(...detourPoints);
      } else {
        // Z字形或L字形
        points.push(sourceOut);
        const middle = this.createMiddlePoint(sourceOut, targetIn, sourcePort.direction, targetPort.direction);
        if (middle) points.push(middle);
        points.push(targetIn);
      }
    } else if (this.arePerpendicular(sourcePort.direction, targetPort.direction)) {
      // 垂直方向
      points.push(sourceOut);
      points.push(this.createCorner(sourceOut, targetIn, sourcePort.direction, targetPort.direction));
      points.push(targetIn);
    } else {
      // 同向，需要绕行
      const bypass = this.createBypass(sourceOut, targetIn, sourcePort.direction, padding * 2);
      points.push(...bypass);
    }
    
    points.push(targetPort.position);
    return points;
  }

  /**
   * 计算简单路径（L形或Z形）
   */
  private calculateSimplePath(sourcePort: Port, targetPort: Port): Position[] {
    const points: Position[] = [sourcePort.position];
    
    // 水平优先还是垂直优先
    const dx = Math.abs(targetPort.position.x - sourcePort.position.x);
    const dy = Math.abs(targetPort.position.y - sourcePort.position.y);
    
    if (dx > dy) {
      // 水平优先
      if (sourcePort.position.x !== targetPort.position.x) {
        points.push({
          x: targetPort.position.x,
          y: sourcePort.position.y
        });
      }
    } else {
      // 垂直优先
      if (sourcePort.position.y !== targetPort.position.y) {
        points.push({
          x: sourcePort.position.x,
          y: targetPort.position.y
        });
      }
    }
    
    points.push(targetPort.position);
    return points;
  }

  /**
   * 判断是否可以直连
   */
  private canDirectConnect(sourcePort: Port, targetPort: Port): boolean {
    const dx = targetPort.position.x - sourcePort.position.x;
    const dy = targetPort.position.y - sourcePort.position.y;
    const threshold = 5;
    
    // 水平对齐且方向相对
    if (Math.abs(dy) < threshold &&
        ((sourcePort.direction === PortDirection.RIGHT && targetPort.direction === PortDirection.LEFT && dx > 0) ||
         (sourcePort.direction === PortDirection.LEFT && targetPort.direction === PortDirection.RIGHT && dx < 0))) {
      return true;
    }
    
    // 垂直对齐且方向相对
    if (Math.abs(dx) < threshold &&
        ((sourcePort.direction === PortDirection.BOTTOM && targetPort.direction === PortDirection.TOP && dy > 0) ||
         (sourcePort.direction === PortDirection.TOP && targetPort.direction === PortDirection.BOTTOM && dy < 0))) {
      return true;
    }
    
    return false;
  }

  /**
   * 延伸端口
   */
  private extendPort(port: Port, distance: number): Position {
    switch (port.direction) {
      case PortDirection.TOP:
        return { x: port.position.x, y: port.position.y - distance };
      case PortDirection.RIGHT:
        return { x: port.position.x + distance, y: port.position.y };
      case PortDirection.BOTTOM:
        return { x: port.position.x, y: port.position.y + distance };
      case PortDirection.LEFT:
        return { x: port.position.x - distance, y: port.position.y };
    }
  }
  
  /**
   * 延伸端口并应用对称偏移
   */
  private extendPortWithOffset(port: Port, distance: number, symmetricOffset?: number): Position {
    const basePosition = this.extendPort(port, distance);
    
    if (!symmetricOffset || symmetricOffset === 0) {
      return basePosition;
    }
    
    // 根据端口方向应用对称偏移
    switch (port.direction) {
      case PortDirection.TOP:
      case PortDirection.BOTTOM:
        // 垂直方向出发，在X轴上偏移
        return { x: basePosition.x + symmetricOffset, y: basePosition.y };
      case PortDirection.LEFT:
      case PortDirection.RIGHT:
        // 水平方向出发，在Y轴上偏移
        return { x: basePosition.x, y: basePosition.y + symmetricOffset };
      default:
        return basePosition;
    }
  }

  /**
   * 判断是否需要绕行
   */
  private needsDetour(sourcePort: Port, targetPort: Port): boolean {
    const dx = targetPort.position.x - sourcePort.position.x;
    const dy = targetPort.position.y - sourcePort.position.y;
    
    return (sourcePort.direction === PortDirection.RIGHT && dx < 0) ||
           (sourcePort.direction === PortDirection.LEFT && dx > 0) ||
           (sourcePort.direction === PortDirection.BOTTOM && dy < 0) ||
           (sourcePort.direction === PortDirection.TOP && dy > 0);
  }

  /**
   * 创建绕行路径
   */
  private createDetour(
    sourcePort: Port,
    targetPort: Port,
    sourceOut: Position,
    targetIn: Position,
    padding: number,
    offset?: number
  ): Position[] {
    const points: Position[] = [];
    const detourOffset = padding * 2 + (offset || 0);
    
    if (sourcePort.direction === PortDirection.LEFT || sourcePort.direction === PortDirection.RIGHT) {
      // 水平方向出发
      const midY = (sourcePort.position.y + targetPort.position.y) / 2 + (offset || 0);
      points.push(sourceOut);
      points.push({ x: sourceOut.x, y: midY });
      points.push({ x: targetIn.x, y: midY });
      points.push(targetIn);
    } else {
      // 垂直方向出发
      const midX = (sourcePort.position.x + targetPort.position.x) / 2 + (offset || 0);
      points.push(sourceOut);
      points.push({ x: midX, y: sourceOut.y });
      points.push({ x: midX, y: targetIn.y });
      points.push(targetIn);
    }
    
    return points;
  }

  /**
   * 创建中间点
   */
  private createMiddlePoint(
    sourceOut: Position,
    targetIn: Position,
    sourceDir: PortDirection,
    targetDir: PortDirection
  ): Position | null {
    if ((sourceDir === PortDirection.LEFT || sourceDir === PortDirection.RIGHT) &&
        (targetDir === PortDirection.LEFT || targetDir === PortDirection.RIGHT)) {
      // 都是水平方向
      return { x: sourceOut.x, y: targetIn.y };
    } else if ((sourceDir === PortDirection.TOP || sourceDir === PortDirection.BOTTOM) &&
               (targetDir === PortDirection.TOP || targetDir === PortDirection.BOTTOM)) {
      // 都是垂直方向
      return { x: targetIn.x, y: sourceOut.y };
    }
    
    return null;
  }

  /**
   * 创建拐角点
   */
  private createCorner(
    sourceOut: Position,
    targetIn: Position,
    sourceDir: PortDirection,
    targetDir: PortDirection
  ): Position {
    if (sourceDir === PortDirection.LEFT || sourceDir === PortDirection.RIGHT) {
      // 水平出发，垂直到达
      return { x: sourceOut.x, y: targetIn.y };
    } else {
      // 垂直出发，水平到达
      return { x: targetIn.x, y: sourceOut.y };
    }
  }

  /**
   * 创建绕过路径
   */
  private createBypass(
    sourceOut: Position,
    targetIn: Position,
    direction: PortDirection,
    offset: number
  ): Position[] {
    const points: Position[] = [sourceOut];
    
    if (direction === PortDirection.LEFT || direction === PortDirection.RIGHT) {
      const x = direction === PortDirection.RIGHT ?
        Math.max(sourceOut.x, targetIn.x) + offset :
        Math.min(sourceOut.x, targetIn.x) - offset;
      points.push({ x, y: sourceOut.y });
      points.push({ x, y: targetIn.y });
    } else {
      const y = direction === PortDirection.BOTTOM ?
        Math.max(sourceOut.y, targetIn.y) + offset :
        Math.min(sourceOut.y, targetIn.y) - offset;
      points.push({ x: sourceOut.x, y });
      points.push({ x: targetIn.x, y });
    }
    
    points.push(targetIn);
    return points;
  }

  /**
   * 判断方向是否相对
   */
  private areOpposite(dir1: PortDirection, dir2: PortDirection): boolean {
    return (dir1 === PortDirection.LEFT && dir2 === PortDirection.RIGHT) ||
           (dir1 === PortDirection.RIGHT && dir2 === PortDirection.LEFT) ||
           (dir1 === PortDirection.TOP && dir2 === PortDirection.BOTTOM) ||
           (dir1 === PortDirection.BOTTOM && dir2 === PortDirection.TOP);
  }

  /**
   * 判断方向是否垂直
   */
  private arePerpendicular(dir1: PortDirection, dir2: PortDirection): boolean {
    const horizontal = [PortDirection.LEFT, PortDirection.RIGHT];
    const vertical = [PortDirection.TOP, PortDirection.BOTTOM];
    
    return (horizontal.includes(dir1) && vertical.includes(dir2)) ||
           (vertical.includes(dir1) && horizontal.includes(dir2));
  }

  /**
   * 优化路径点（移除共线点）
   */
  private optimizePoints(points: Position[]): Position[] {
    if (points.length <= 2) return points;
    
    const optimized: Position[] = [points[0]];
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // 检查是否共线
      const sameLine = (Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1) ||
                      (Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1);
      
      if (!sameLine) {
        // 确保为正交路径，修正小偏差
        const correctedCurr = { ...curr };
        
        // 如果是水平线，保持Y坐标一致
        if (Math.abs(prev.y - curr.y) < 5 && Math.abs(prev.x - curr.x) > 5) {
          correctedCurr.y = prev.y;
        }
        // 如果是垂直线，保持X坐标一致
        if (Math.abs(prev.x - curr.x) < 5 && Math.abs(prev.y - curr.y) > 5) {
          correctedCurr.x = prev.x;
        }
        
        optimized.push(correctedCurr);
      }
    }
    
    optimized.push(points[points.length - 1]);
    
    // 对齐到网格
    if (this.config.gridSize > 1) {
      return optimized.map(p => ({
        x: Math.round(p.x / this.config.gridSize) * this.config.gridSize,
        y: Math.round(p.y / this.config.gridSize) * this.config.gridSize
      }));
    }
    
    return optimized;
  }

  /**
   * 生成SVG路径
   */
  private generateSVGPath(points: Position[], radius: number): string {
    if (points.length < 2) return '';
    
    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;
    
    // 如果radius为0或很小，使用纯直角
    if (radius <= 0.5) {
      // 纯直角路径
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x},${points[i].y}`;
      }
    } else {
      // 添加圆角
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        const d1 = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
        const d2 = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
        
        const r = Math.min(radius, d1 / 2, d2 / 2);
        
        if (r > 2) {
          // 计算圆角控制点
          const ratio1 = r / d1;
          const ratio2 = r / d2;
          
          const p1 = {
            x: curr.x - (curr.x - prev.x) * ratio1,
            y: curr.y - (curr.y - prev.y) * ratio1
          };
          
          const p2 = {
            x: curr.x + (next.x - curr.x) * ratio2,
            y: curr.y + (next.y - curr.y) * ratio2
          };
          
          path += ` L ${p1.x},${p1.y} Q ${curr.x},${curr.y} ${p2.x},${p2.y}`;
        } else {
          path += ` L ${curr.x},${curr.y}`;
        }
      }
      
      path += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;
    }
    
    return path;
  }

  /**
   * 计算标签位置
   */
  private calculateLabelPosition(points: Position[]): Position {
    if (points.length === 0) return { x: 0, y: 0 };
    
    if (points.length === 2) {
      return {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
    }
    
    // 计算路径总长度
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
      totalLength += Math.sqrt(
        (points[i].x - points[i - 1].x) ** 2 +
        (points[i].y - points[i - 1].y) ** 2
      );
    }
    
    // 找到中点位置
    const halfLength = totalLength / 2;
    let currentLength = 0;
    
    for (let i = 1; i < points.length; i++) {
      const segmentLength = Math.sqrt(
        (points[i].x - points[i - 1].x) ** 2 +
        (points[i].y - points[i - 1].y) ** 2
      );
      
      if (currentLength + segmentLength >= halfLength) {
        const ratio = (halfLength - currentLength) / segmentLength;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * ratio,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * ratio
        };
      }
      
      currentLength += segmentLength;
    }
    
    return points[Math.floor(points.length / 2)];
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
   * 应用端口偏移
   */
  private applyPortOffset(port: Port, offset: number): Port {
    let newPosition: Position;
    
    // 根据端口方向应用偏移
    switch (port.direction) {
      case PortDirection.TOP:
      case PortDirection.BOTTOM:
        // 垂直端口，在X轴上偏移
        newPosition = { x: port.position.x + offset, y: port.position.y };
        break;
      case PortDirection.LEFT:
      case PortDirection.RIGHT:
        // 水平端口，在Y轴上偏移
        newPosition = { x: port.position.x, y: port.position.y + offset };
        break;
      default:
        newPosition = port.position;
    }
    
    return {
      position: newPosition,
      direction: port.direction
    };
  }
  
  /**
   * 根据方向获取端口位置
   */
  private getPortByDirection(center: Position, halfWidth: number, halfHeight: number, direction: PortDirection): Port {
    let position: Position;
    
    switch (direction) {
      case PortDirection.TOP:
        position = { x: center.x, y: center.y - halfHeight };
        break;
      case PortDirection.RIGHT:
        position = { x: center.x + halfWidth, y: center.y };
        break;
      case PortDirection.BOTTOM:
        position = { x: center.x, y: center.y + halfHeight };
        break;
      case PortDirection.LEFT:
        position = { x: center.x - halfWidth, y: center.y };
        break;
      default:
        position = center;
    }
    
    return { position, direction };
  }
  
  /**
   * 判断是否是菱形节点
   */
  private isDiamond(type: string | NodeType): boolean {
    return type === NodeType.CONDITION || type === 'condition' || type === 'diamond';
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...config };
  }
}