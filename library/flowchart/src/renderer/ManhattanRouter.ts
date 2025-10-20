import { Position } from '../types';
import { FlowNode } from '../core/Node';
import { FlowEdge } from '../core/Edge';

/**
 * Manhattan路由器 - 最终优化版本
 * 
 * 解决的问题：
 * 1. ✅ 避免线条和节点重叠 - 增大间距
 * 2. ✅ 避免连线断连 - 完整路径点
 * 3. ✅ 确保箭头显示 - 正确的角度计算
 * 4. ✅ 入口统一在顶部 - 视觉一致
 * 5. ✅ 纯直角线条 - 无斜线
 */
export class ManhattanRouter {
  // 优化后的参数（更大的间距）
  private readonly MIN_DISTANCE = 80;    // 最小距离（增大）
  private readonly LOOP_OFFSET = 220;    // 回路外边距（增大）
  private readonly CORNER_RADIUS = 10;   // 圆角半径

  /**
   * 主路由方法
   */
  public route(
    edge: FlowEdge,
    sourceNode: FlowNode,
    targetNode: FlowNode,
    nodeWidth: number,
    nodeHeight: number
  ): {
    points: Position[];
    path: string;
    labelPosition: Position;
    arrowAngle: number;
  } {
    const halfW = nodeWidth / 2;
    const halfH = nodeHeight / 2;

    // 检测是否是回路
    const isLoop = this.isLoop(edge, sourceNode, targetNode);

    // 计算连接点偏移
    const sourceOffset = this.calculateSourceOffset(sourceNode, targetNode, edge);
    const targetOffset = this.calculateTargetOffset(targetNode, sourceNode, edge);

    // 确定连接点位置
    const source = this.getSourcePoint(
      sourceNode.position,
      halfW,
      halfH,
      sourceOffset,
      isLoop,
      targetNode.position
    );

    const target = this.getTargetPoint(
      targetNode.position,
      halfW,
      halfH,
      targetOffset
    );

    // 计算路径（确保完整）
    const points = isLoop ?
      this.routeLoop(source, target) :
      this.routeNormal(source, target);

    // 确保路径完整性
    const validatedPoints = this.validatePath(points);

    // 生成SVG路径
    const path = this.generatePath(validatedPoints);

    // 计算标签位置
    const labelPosition = this.calculateLabelPosition(validatedPoints);

    // 计算箭头角度（确保正确）
    const arrowAngle = this.calculateArrowAngle(validatedPoints);

    return { points: validatedPoints, path, labelPosition, arrowAngle };
  }

  /**
   * 检测是否是回路
   */
  private isLoop(edge: FlowEdge, sourceNode: FlowNode, targetNode: FlowNode): boolean {
    const label = (edge.label || '').toLowerCase();
    if (label.includes('退回') || label.includes('驳回') || label.includes('返回') || label.includes('撤回')) {
      return true;
    }
    return targetNode.position.y < sourceNode.position.y - 10;
  }

  /**
   * 计算源节点偏移
   */
  private calculateSourceOffset(sourceNode: FlowNode, targetNode: FlowNode, edge: FlowEdge): number {
    const outputs = sourceNode.getOutputs();
    if (outputs.length <= 1) return 0;

    // 按目标X坐标排序
    const sorted = [...outputs].sort((a, b) => a.position.x - b.position.x);
    const index = sorted.findIndex(n => n.id === targetNode.id);
    if (index < 0) return 0;

    // 增大间距避免重叠
    const spacing: { [key: number]: number[] } = {
      2: [-60, 60],
      3: [-70, 0, 70],
      4: [-80, -30, 30, 80],
      5: [-90, -45, 0, 45, 90]
    };

    return spacing[outputs.length]?.[index] || 0;
  }

  /**
   * 计算目标节点偏移
   */
  private calculateTargetOffset(targetNode: FlowNode, sourceNode: FlowNode, edge: FlowEdge): number {
    const inputs = targetNode.getInputs();
    if (inputs.length <= 1) return 0;

    // 按源X坐标排序
    const sorted = [...inputs].sort((a, b) => a.position.x - b.position.x);
    const index = sorted.findIndex(n => n.id === sourceNode.id);
    if (index < 0) return 0;

    // 增大间距避免重叠
    const spacing: { [key: number]: number[] } = {
      2: [-65, 65],
      3: [-75, 0, 75],
      4: [-85, -30, 30, 85],
      5: [-95, -48, 0, 48, 95]
    };

    return spacing[inputs.length]?.[index] || 0;
  }

  /**
   * 获取源连接点
   */
  private getSourcePoint(
    center: Position,
    halfW: number,
    halfH: number,
    offset: number,
    isLoop: boolean,
    targetPos: Position
  ): Position {
    if (isLoop) {
      // 回路从侧面出发
      const goLeft = targetPos.x < center.x;
      return {
        x: goLeft ? center.x - halfW : center.x + halfW,
        y: center.y + offset * 0.3  // 侧面偏移小一些
      };
    } else {
      // 正常从底部出发
      return {
        x: center.x + offset,
        y: center.y + halfH
      };
    }
  }

  /**
   * 获取目标连接点（统一在顶部）
   */
  private getTargetPoint(
    center: Position,
    halfW: number,
    halfH: number,
    offset: number
  ): Position {
    return {
      x: center.x + offset,
      y: center.y - halfH
    };
  }

  /**
   * 正常路径（底部→顶部）
   */
  private routeNormal(source: Position, target: Position): Position[] {
    const points: Position[] = [];
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    // 起点
    points.push(source);

    if (dy > this.MIN_DISTANCE * 1.5) {
      // 目标在下方（正常流程）
      const midY = source.y + dy / 2;
      
      // 向下到中点
      points.push({ x: source.x, y: midY });
      
      // 水平到目标X
      if (Math.abs(dx) > 5) {
        points.push({ x: target.x, y: midY });
      }
      
      // 向上到目标
      // 不添加中间点，直接到target
    } else if (dy > 0) {
      // 距离较近
      const downY = source.y + this.MIN_DISTANCE;
      
      points.push({ x: source.x, y: downY });
      
      if (Math.abs(dx) > 5) {
        points.push({ x: target.x, y: downY });
      }
    } else {
      // 目标在上方（需要绕行）
      const downY = source.y + this.MIN_DISTANCE;
      const upY = target.y - this.MIN_DISTANCE;
      
      // 决定绕行方向
      const sideOffset = Math.max(this.MIN_DISTANCE * 1.5, Math.abs(dx) / 2);
      const sideX = dx < 0 ? 
        Math.min(source.x, target.x) - sideOffset :
        Math.max(source.x, target.x) + sideOffset;
      
      points.push({ x: source.x, y: downY });
      points.push({ x: sideX, y: downY });
      points.push({ x: sideX, y: upY });
      points.push({ x: target.x, y: upY });
    }

    // 终点（确保连接）
    points.push(target);

    return points;
  }

  /**
   * 回路路径（侧面→顶部）
   */
  private routeLoop(source: Position, target: Position): Position[] {
    const points: Position[] = [];
    const dx = target.x - source.x;

    // 起点
    points.push(source);

    // 判断方向
    const isLeft = dx < 0;
    const direction = isLeft ? -1 : 1;

    // 1. 水平向外延伸
    const extendX = source.x + this.MIN_DISTANCE * 0.7 * direction;
    points.push({ x: extendX, y: source.y });

    // 2. 走到外侧
    const outerX = source.x + this.LOOP_OFFSET * direction;
    points.push({ x: outerX, y: source.y });

    // 3. 垂直到目标上方
    const aboveTarget = target.y - this.MIN_DISTANCE;
    points.push({ x: outerX, y: aboveTarget });

    // 4. 水平到目标X
    if (Math.abs(outerX - target.x) > 5) {
      points.push({ x: target.x, y: aboveTarget });
    }

    // 5. 终点（确保连接）
    points.push(target);

    return points;
  }

  /**
   * 验证路径完整性（确保不断连）
   */
  private validatePath(points: Position[]): Position[] {
    if (points.length < 2) {
      console.warn('路径点过少:', points);
      return points;
    }

    // 确保路径是连续的（没有跳跃）
    const validated: Position[] = [points[0]];

    for (let i = 1; i < points.length; i++) {
      const prev = validated[validated.length - 1];
      const curr = points[i];

      // 检查是否是正交的（水平或垂直）
      const isOrthogonal = 
        Math.abs(curr.x - prev.x) < 2 ||  // 垂直线
        Math.abs(curr.y - prev.y) < 2;    // 水平线

      if (!isOrthogonal) {
        // 不是正交的，插入中间点
        const isMoreHorizontal = Math.abs(curr.x - prev.x) > Math.abs(curr.y - prev.y);
        if (isMoreHorizontal) {
          // 先水平后垂直
          validated.push({ x: curr.x, y: prev.y });
        } else {
          // 先垂直后水平
          validated.push({ x: prev.x, y: curr.y });
        }
      }

      validated.push(curr);
    }

    return this.simplifyPath(validated);
  }

  /**
   * 简化路径（移除共线点）
   */
  private simplifyPath(points: Position[]): Position[] {
    if (points.length <= 2) return points;

    const simplified: Position[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 检查是否共线
      const sameH = Math.abs(prev.y - curr.y) < 2 && Math.abs(curr.y - next.y) < 2;
      const sameV = Math.abs(prev.x - curr.x) < 2 && Math.abs(curr.x - next.x) < 2;

      if (!sameH && !sameV) {
        simplified.push(curr);
      }
    }

    simplified.push(points[points.length - 1]);
    return simplified;
  }

  /**
   * 生成SVG路径（带圆角）
   */
  private generatePath(points: Position[]): string {
    if (points.length < 2) {
      console.warn('路径点不足，无法生成路径');
      return '';
    }

    if (points.length === 2) {
      // 直线
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const d1 = this.distance(prev, curr);
      const d2 = this.distance(curr, next);

      // 自适应圆角
      const r = Math.min(this.CORNER_RADIUS, d1 * 0.35, d2 * 0.35);

      if (r > 3 && d1 > r * 2.2 && d2 > r * 2.2) {
        // 添加圆角
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
        // 直角
        path += ` L ${curr.x},${curr.y}`;
      }
    }

    // 最后一个点（确保连接）
    path += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;

    return path;
  }

  /**
   * 计算标签位置
   */
  private calculateLabelPosition(points: Position[]): Position {
    if (points.length < 2) {
      return points[0] || { x: 0, y: 0 };
    }

    // 找最长的线段放置标签
    let maxLength = 0;
    let bestIndex = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const length = this.distance(points[i], points[i + 1]);
      if (length > maxLength && length > 50) {
        maxLength = length;
        bestIndex = i;
      }
    }

    const p1 = points[bestIndex];
    const p2 = points[bestIndex + 1];

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    // 根据线段方向偏移标签
    const isHorizontal = Math.abs(p2.y - p1.y) < 5;
    return {
      x: isHorizontal ? midX : midX + 22,
      y: isHorizontal ? midY - 22 : midY
    };
  }

  /**
   * 计算箭头角度（确保正确）
   */
  private calculateArrowAngle(points: Position[]): number {
    if (points.length < 2) {
      return -Math.PI / 2;  // 默认向下
    }

    // 使用最后两个点
    const last = points[points.length - 1];
    const prev = points[points.length - 2];

    return Math.atan2(last.y - prev.y, last.x - prev.x);
  }

  /**
   * 验证路径（确保不断连）
   */
  private validatePath(points: Position[]): Position[] {
    if (points.length < 2) {
      console.error('路径点过少');
      return points;
    }

    // 检查首尾点
    if (!points[0] || !points[points.length - 1]) {
      console.error('路径起点或终点缺失');
      return points;
    }

    // 移除任何undefined或null
    const valid = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');

    if (valid.length < 2) {
      console.error('有效路径点不足');
      return points;
    }

    return valid;
  }

  private distance(p1: Position, p2: Position): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
}
