import { FlowEdge } from '../core/Edge';
import { FlowNode } from '../core/Node';
import { Position, EdgeStyle, EdgeType, EdgeAnimationType, NodeType } from '../types';
import { DEFAULT_CONFIG } from '../utils/constants';
import { ManhattanRouter } from './ManhattanRouter';
import { EdgeInteraction } from './EdgeInteraction';

/**
 * 连线渲染器 - 参考主流流程图库的实现
 * 使用固定的连接点和Manhattan路由算法
 */
export class EdgeRenderer {
  private edgeElements: Map<string, SVGGElement> = new Map();
  private manhattanRouter: ManhattanRouter = new ManhattanRouter();
  
  private edgeInteraction: EdgeInteraction | null = null;
  private interactionEnabled: boolean = false;
  private svgElement: SVGSVGElement | null = null;

  // 连线类型颜色配置
  private edgeColors = {
    default: '#666',       // 默认颜色
    success: '#4caf50',    // 成功/通过
    error: '#f44336',      // 错误/拒绝
    warning: '#ff9800',    // 警告/待审核
    info: '#2196f3',       // 信息
    loop: '#9c27b0'        // 回路/退回
  };
  /**
   * 设置节点（预留接口）
   */
  public setNodes(nodes: Map<string, FlowNode>): void {
    // 简化：不需要预处理
  }

  /**
   * 设置SVG元素（用于交互功能）
   */
  public setSVGElement(svg: SVGSVGElement): void {
    this.svgElement = svg;
  }

  /**
   * 启用交互功能
   */
  public enableInteraction(enabled: boolean = true): void {
    this.interactionEnabled = enabled;

    if (enabled && !this.edgeInteraction) {
      this.edgeInteraction = new EdgeInteraction({
        onWaypointDrag: (edgeId, waypointIndex, position) => {
          this.handleWaypointDrag(edgeId, waypointIndex, position);
        },
        onAnchorDrag: (edgeId, isSource, position) => {
          this.handleAnchorDrag(edgeId, isSource, position);
        },
        onWaypointAdd: (edgeId, position, index) => {
          this.handleWaypointAdd(edgeId, position, index);
        },
        onWaypointDelete: (edgeId, index) => {
          this.handleWaypointDelete(edgeId, index);
        }
      });
    }
  }

  /**
   * 处理折点拖拽
   */
  private handleWaypointDrag(edgeId: string, waypointIndex: number, position: Position): void {
    // 实现折点拖拽逻辑
    // 需要重新渲染该连线
    console.log('Waypoint dragged:', edgeId, waypointIndex, position);
  }

  /**
   * 处理锚点拖拽
   */
  private handleAnchorDrag(edgeId: string, isSource: boolean, position: Position): void {
    // 实现锚点拖拽逻辑
    // 可能需要改变连接到的节点
    console.log('Anchor dragged:', edgeId, isSource, position);
  }

  /**
   * 处理添加折点
   */
  private handleWaypointAdd(edgeId: string, position: Position, index: number): void {
    console.log('Waypoint added:', edgeId, position, index);
  }

  /**
   * 处理删除折点
   */
  private handleWaypointDelete(edgeId: string, index: number): void {
    console.log('Waypoint deleted:', edgeId, index);
  }

  /**
   * 智能判断连线类型并返回颜色
   */
  private getEdgeColor(edge: FlowEdge): string {
    // 如果已经有自定义颜色，使用自定义颜色
    if (edge.style?.strokeColor) {
      return edge.style.strokeColor;
    }

    // 根据标签判断类型
    const label = (edge.label || '').toLowerCase();

    // 回路类型（退回、返回、撤回等）
    if (label.includes('退回') || label.includes('返回') || label.includes('撤回') || label.includes('驳回')) {
      return this.edgeColors.loop;
    }

    // 成功类型（通过、同意、批准等）
    if (label.includes('通过') || label.includes('同意') || label.includes('批准') || label.includes('是')) {
      return this.edgeColors.success;
    }

    // 失败类型（拒绝、不通过、否等）
    if (label.includes('拒绝') || label.includes('不通过') || label.includes('否') || label.includes('不批准')) {
      return this.edgeColors.error;
    }

    // 待审核类型
    if (label.includes('待审核') || label.includes('审核中') || label.includes('处理中')) {
      return this.edgeColors.warning;
    }

    // 检测是否是回路（从下往上或从右往左）
    const dy = edge.target.position.y - edge.source.position.y;
    const dx = edge.target.position.x - edge.source.position.x;

    if (dy < -10) {  // 向上的连线很可能是回路
      return this.edgeColors.loop;
    }

    // 默认颜色
    return this.edgeColors.default;
  }

  /**
   * 设置连线颜色主题
   */
  public setEdgeColorTheme(theme: {
    default?: string;
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    loop?: string;
  }): void {
    this.edgeColors = { ...this.edgeColors, ...theme };
  }


  /**
   * 渲染连线
   */
  public renderEdge(
    edge: FlowEdge,
    container: SVGGElement,
    style: EdgeStyle,
    onClick?: (edge: FlowEdge) => void
  ): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'flow-edge');
    group.setAttribute('data-edge-id', edge.id);
    group.style.cursor = 'pointer';

    // 获取节点尺寸
    const nodeWidth = DEFAULT_CONFIG.NODE_WIDTH;
    const nodeHeight = DEFAULT_CONFIG.NODE_HEIGHT;

    // 获取连线类型
    const edgeType = style.type || EdgeType.POLYLINE;

    // 使用简单正交路由器（纯直角）
    let pathData: { path: string; labelPosition: Position; arrowAngle?: number; points?: Position[] };

    if (edgeType === EdgeType.POLYLINE || edgeType === EdgeType.ORTHOGONAL) {
      // 使用Manhattan路由器
      const result = this.manhattanRouter.route(
        edge,
        edge.source,
        edge.target,
        nodeWidth,
        nodeHeight
      );

      // 智能判断连线颜色
      if (!style.strokeColor) {
        style.strokeColor = this.getEdgeColor(edge);
      }

      pathData = {
        path: result.path,
        labelPosition: result.labelPosition,
        arrowAngle: result.arrowAngle,
        points: result.points
      };
    } else {
      // 其他类型保留原逻辑
      const sourceCenter = edge.source.position;
      const targetCenter = edge.target.position;

      const { sourcePort, targetPort } = this.getSmartConnectionPorts(
        edge.source,
        edge.target,
        nodeWidth,
        nodeHeight
      );

      pathData = this.calculatePath(sourcePort, targetPort, edgeType, style);
    }

    // 创建主路径
    const path = this.createPath(pathData.path, style);
    path.setAttribute('class', 'edge-path');
    group.appendChild(path);

    // 创建悬停效果的路径（更粗的透明线条）
    const hoverPath = this.createHoverPath(pathData.path, style);
    group.appendChild(hoverPath);

    // 添加箭头 - 使用路径的最后一个点作为箭头位置
    const arrowPosition = this.getArrowPosition(pathData.path);
    const arrow = this.createArrow(arrowPosition, pathData.arrowAngle || 0, style);
    arrow.setAttribute('class', 'edge-arrow');
    group.appendChild(arrow);

    // 添加标签
    if (edge.label) {
      const label = this.createLabel(edge.label, pathData.labelPosition, style);
      label.setAttribute('class', 'edge-label');
      // 设置标签的pointer-events为none，让鼠标事件穿透到线条
      label.style.pointerEvents = 'none';
      group.appendChild(label);
    }

    // 创建流动动画路径
    const flowPath = this.createFlowAnimationPath(pathData.path, style);
    if (flowPath) {
      group.appendChild(flowPath);
    }

    // 点击事件
    if (onClick) {
      group.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick(edge);
      });
    }

    // 悬停效果
    let isHovered = false;

    const handleMouseEnter = () => {
      if (isHovered) return;
      isHovered = true;

      // 增强线条
      path.style.strokeWidth = String((style.strokeWidth || 2) + 1);
      path.style.stroke = this.getHighlightColor(style.strokeColor || '#666');
      path.style.filter = 'drop-shadow(0 0 3px ' + (style.strokeColor || '#666') + ')';

      // 增强箭头
      arrow.style.fill = this.getHighlightColor(style.strokeColor || '#666');
      arrow.style.filter = 'drop-shadow(0 0 3px ' + (style.strokeColor || '#666') + ')';

      // 显示流动动画
      if (flowPath) {
        flowPath.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      if (!isHovered) return;
      isHovered = false;

      // 恢复线条
      path.style.strokeWidth = String(style.strokeWidth || 2);
      path.style.stroke = style.strokeColor || '#666';
      path.style.filter = '';

      // 恢复箭头
      arrow.style.fill = style.strokeColor || '#666';
      arrow.style.filter = '';

      // 隐藏流动动画
      if (flowPath) {
        flowPath.style.opacity = '0';
      }
    };

    group.addEventListener('mouseenter', handleMouseEnter);
    group.addEventListener('mouseleave', handleMouseLeave);

    container.appendChild(group);
    this.edgeElements.set(edge.id, group);

    // 如果启用了交互功能，添加交互元素
    if (this.interactionEnabled && this.edgeInteraction && this.svgElement && pathData.points) {
      this.edgeInteraction.createInteractionElements(
        edge.id,
        pathData.points,
        group,
        this.svgElement
      );
    }

    return group;
  }

  /**
   * 智能获取连接端口 - 根据节点类型选择最佳连接点
   */
  private getSmartConnectionPorts(
    sourceNode: FlowNode,
    targetNode: FlowNode,
    width: number,
    height: number
  ): { sourcePort: Position; targetPort: Position } {
    const source = sourceNode.position;
    const target = targetNode.position;

    // 检查是否是条件节点（菱形）
    const isSourceDiamond = sourceNode.type === NodeType.CONDITION;
    const isTargetDiamond = targetNode.type === NodeType.CONDITION;

    if (isSourceDiamond || isTargetDiamond) {
      return this.getDiamondConnectionPorts(
        source,
        target,
        width,
        height,
        isSourceDiamond,
        isTargetDiamond
      );
    }

    // 普通节点使用原有逻辑
    return this.getConnectionPorts(source, target, width, height);
  }

  /**
   * 菱形节点的连接端口计算
   * 菱形的四个顶点作为连接点
   */
  private getDiamondConnectionPorts(
    source: Position,
    target: Position,
    width: number,
    height: number,
    isSourceDiamond: boolean,
    isTargetDiamond: boolean
  ): { sourcePort: Position; targetPort: Position } {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const halfW = width / 2;
    const halfH = height / 2;

    let sourcePort: Position;
    let targetPort: Position;

    // 计算源节点的连接点
    if (isSourceDiamond) {
      // 菱形节点 - 使用四个顶点
      const angle = Math.atan2(dy, dx);

      // 根据角度决定使用哪个顶点
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        // 右顶点
        sourcePort = { x: source.x + halfW, y: source.y };
      } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
        // 下顶点
        sourcePort = { x: source.x, y: source.y + halfH };
      } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
        // 上顶点
        sourcePort = { x: source.x, y: source.y - halfH };
      } else {
        // 左顶点
        sourcePort = { x: source.x - halfW, y: source.y };
      }
    } else {
      // 普通节点 - 使用边的中点
      if (Math.abs(dy) > Math.abs(dx)) {
        sourcePort = dy > 0
          ? { x: source.x, y: source.y + halfH }
          : { x: source.x, y: source.y - halfH };
      } else {
        sourcePort = dx > 0
          ? { x: source.x + halfW, y: source.y }
          : { x: source.x - halfW, y: source.y };
      }
    }

    // 计算目标节点的连接点
    if (isTargetDiamond) {
      // 菱形节点 - 使用四个顶点
      const angle = Math.atan2(-dy, -dx); // 反向角度

      // 根据角度决定使用哪个顶点
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        // 右顶点
        targetPort = { x: target.x + halfW, y: target.y };
      } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
        // 下顶点
        targetPort = { x: target.x, y: target.y + halfH };
      } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
        // 上顶点
        targetPort = { x: target.x, y: target.y - halfH };
      } else {
        // 左顶点
        targetPort = { x: target.x - halfW, y: target.y };
      }
    } else {
      // 普通节点 - 使用边的中点
      if (Math.abs(dy) > Math.abs(dx)) {
        targetPort = dy > 0
          ? { x: target.x, y: target.y - halfH }
          : { x: target.x, y: target.y + halfH };
      } else {
        targetPort = dx > 0
          ? { x: target.x - halfW, y: target.y }
          : { x: target.x + halfW, y: target.y };
      }
    }

    return { sourcePort, targetPort };
  }

  /**
   * 获取连接端口（参考 ReactFlow 的做法）
   * 固定在节点的上下左右四个中点
   */
  private getConnectionPorts(
    source: Position,
    target: Position,
    width: number,
    height: number
  ): { sourcePort: Position; targetPort: Position } {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    const halfW = width / 2;
    const halfH = height / 2;

    let sourcePort: Position;
    let targetPort: Position;

    // 根据相对位置选择最佳连接点
    if (Math.abs(dy) > Math.abs(dx)) {
      // 垂直方向主导
      if (dy > 0) {
        // 向下：source底部 → target顶部
        sourcePort = { x: source.x, y: source.y + halfH };
        targetPort = { x: target.x, y: target.y - halfH };
      } else {
        // 向上：source顶部 → target底部
        sourcePort = { x: source.x, y: source.y - halfH };
        targetPort = { x: target.x, y: target.y + halfH };
      }
    } else {
      // 水平方向主导
      if (dx > 0) {
        // 向右：source右侧 → target左侧
        sourcePort = { x: source.x + halfW, y: source.y };
        targetPort = { x: target.x - halfW, y: target.y };
      } else {
        // 向左：source左侧 → target右侧
        sourcePort = { x: source.x - halfW, y: source.y };
        targetPort = { x: target.x + halfW, y: target.y };
      }
    }

    return { sourcePort, targetPort };
  }

  /**
   * 计算路径
   */
  private calculatePath(
    source: Position,
    target: Position,
    type: EdgeType,
    style: EdgeStyle
  ): { path: string; labelPosition: Position; arrowAngle?: number } {
    switch (type) {
      case EdgeType.STRAIGHT:
        return this.straightPath(source, target);
      case EdgeType.BEZIER:
        return this.bezierPath(source, target);
      case EdgeType.SMOOTH:
        return this.smoothPath(source, target);
      case EdgeType.POLYLINE:
        return this.manhattanPath(source, target, style);
      case EdgeType.STEP:
        return this.stepPath(source, target);
      case EdgeType.ORTHOGONAL:
        return this.manhattanPath(source, target, style);
      default:
        return this.manhattanPath(source, target, style);
    }
  }

  /**
   * 直线
   */
  private straightPath(source: Position, target: Position): { path: string; labelPosition: Position; arrowAngle: number } {
    const angle = Math.atan2(target.y - source.y, target.x - source.x);

    return {
      path: `M ${source.x},${source.y} L ${target.x},${target.y}`,
      labelPosition: {
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2
      },
      arrowAngle: angle
    };
  }

  /**
   * 贝塞尔曲线
   */
  private bezierPath(source: Position, target: Position): { path: string; labelPosition: Position; arrowAngle: number } {
    const dy = target.y - source.y;
    const offset = Math.abs(dy) * 0.5;

    const cx1 = source.x;
    const cy1 = source.y + offset;
    const cx2 = target.x;
    const cy2 = target.y - offset;

    const angle = Math.atan2(target.y - cy2, target.x - cx2);

    return {
      path: `M ${source.x},${source.y} C ${cx1},${cy1} ${cx2},${cy2} ${target.x},${target.y}`,
      labelPosition: {
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2
      },
      arrowAngle: angle
    };
  }

  /**
   * 平滑曲线
   */
  private smoothPath(source: Position, target: Position): { path: string; labelPosition: Position; arrowAngle: number } {
    const dx = target.x - source.x;
    const offset = Math.abs(dx) * 0.5;

    const cx1 = source.x + offset;
    const cy1 = source.y;
    const cx2 = target.x - offset;
    const cy2 = target.y;

    const angle = Math.atan2(target.y - cy2, target.x - cx2);

    return {
      path: `M ${source.x},${source.y} C ${cx1},${cy1} ${cx2},${cy2} ${target.x},${target.y}`,
      labelPosition: {
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2
      },
      arrowAngle: angle
    };
  }

  /**
   * Manhattan 路由（参考 draw.io 和 ReactFlow）
   * 只使用垂直和水平线段
   */
  private manhattanPath(source: Position, target: Position, style: EdgeStyle): { path: string; labelPosition: Position; arrowAngle: number } {
    const radius = style.radius || 10;
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    let points: Position[];
    let arrowAngle: number;

    // 最小间距，防止线条重叠
    const minGap = 40;
    const offset = style.offset || 30;

    // 判断连接方向
    const isSourceVertical = Math.abs(source.y - target.y) > 1; // 源节点是否在垂直方向
    const isSourceHorizontal = Math.abs(source.x - target.x) > 1; // 源节点是否在水平方向

    // 智能路由策略
    if (Math.abs(dy) < 5 && Math.abs(dx) > minGap * 2) {
      // 水平对齐
      if (dx > 0) {
        // 向右直连
        points = [source, target];
        arrowAngle = 0;
      } else {
        // 向左，需要绕过
        const bypass = Math.max(minGap, Math.abs(dy) + offset);
        points = [
          source,
          { x: source.x + minGap, y: source.y },
          { x: source.x + minGap, y: source.y - bypass },
          { x: target.x - minGap, y: source.y - bypass },
          { x: target.x - minGap, y: target.y },
          target
        ];
        arrowAngle = Math.PI;
      }
    } else if (Math.abs(dx) < 5 && Math.abs(dy) > minGap * 2) {
      // 垂直对齐
      if (dy > 0) {
        // 向下直连
        points = [source, target];
        arrowAngle = Math.PI / 2;
      } else {
        // 向上，需要绕过
        const bypass = Math.max(minGap, Math.abs(dx) + offset);
        points = [
          source,
          { x: source.x, y: source.y + minGap },
          { x: source.x - bypass, y: source.y + minGap },
          { x: source.x - bypass, y: target.y - minGap },
          { x: target.x, y: target.y - minGap },
          target
        ];
        arrowAngle = -Math.PI / 2;
      }
    } else {
      // 需要折线连接
      const isVerticalConnection = Math.abs(dy) > Math.abs(dx);

      if (isVerticalConnection) {
        // 垂直方向优先
        if (dy > 0) {
          // 向下连接
          if (dx > 0) {
            // 右下方向
            const midY = source.y + Math.abs(dy) / 2;
            points = [
              source,
              { x: source.x, y: midY },
              { x: target.x, y: midY },
              target
            ];
          } else {
            // 左下方向
            const midY = source.y + Math.abs(dy) / 2;
            points = [
              source,
              { x: source.x, y: midY },
              { x: target.x, y: midY },
              target
            ];
          }
          arrowAngle = Math.PI / 2;
        } else {
          // 向上连接，需要绕过
          const sideOffset = Math.max(minGap * 1.5, Math.abs(dx) / 2 + offset);
          if (dx > 0) {
            // 右上方向
            points = [
              source,
              { x: source.x, y: source.y + minGap },
              { x: source.x + sideOffset, y: source.y + minGap },
              { x: source.x + sideOffset, y: target.y - minGap },
              { x: target.x, y: target.y - minGap },
              target
            ];
          } else {
            // 左上方向
            points = [
              source,
              { x: source.x, y: source.y + minGap },
              { x: source.x - sideOffset, y: source.y + minGap },
              { x: source.x - sideOffset, y: target.y - minGap },
              { x: target.x, y: target.y - minGap },
              target
            ];
          }
          arrowAngle = -Math.PI / 2;
        }
      } else {
        // 水平方向优先
        if (dx > 0) {
          // 向右连接
          if (dy > 0) {
            // 右下方向
            const midX = source.x + Math.abs(dx) / 2;
            points = [
              source,
              { x: midX, y: source.y },
              { x: midX, y: target.y },
              target
            ];
            arrowAngle = 0;
          } else {
            // 右上方向
            const midX = source.x + Math.abs(dx) / 2;
            points = [
              source,
              { x: midX, y: source.y },
              { x: midX, y: target.y },
              target
            ];
            arrowAngle = 0;
          }
        } else {
          // 向左连接，需要绕过
          const sideOffset = Math.max(minGap * 1.5, Math.abs(dy) / 2 + offset);
          if (dy > 0) {
            // 左下方向
            points = [
              source,
              { x: source.x + minGap, y: source.y },
              { x: source.x + minGap, y: source.y + sideOffset },
              { x: target.x - minGap, y: source.y + sideOffset },
              { x: target.x - minGap, y: target.y },
              target
            ];
          } else {
            // 左上方向
            points = [
              source,
              { x: source.x + minGap, y: source.y },
              { x: source.x + minGap, y: source.y - sideOffset },
              { x: target.x - minGap, y: source.y - sideOffset },
              { x: target.x - minGap, y: target.y },
              target
            ];
          }
          arrowAngle = Math.PI;
        }
      }
    }

    // 优化路径点，移除重复或共线的点
    points = this.optimizePathPoints(points);

    // 计算最终箭头角度
    if (points.length >= 2) {
      const lastTwo = points.slice(-2);
      arrowAngle = Math.atan2(
        lastTwo[1].y - lastTwo[0].y,
        lastTwo[1].x - lastTwo[0].x
      );
    }

    // 生成圆角路径
    const path = this.createSmoothPath(points, radius);

    return {
      path,
      labelPosition: this.calculateLabelPosition(points),
      arrowAngle
    };
  }

  /**
   * 优化路径点，移除重复或共线的点
   */
  private optimizePathPoints(points: Position[]): Position[] {
    if (points.length <= 2) return points;

    const optimized: Position[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 检查是否共线
      const isHorizontallyAligned =
        Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1;
      const isVerticallyAligned =
        Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1;

      // 如果不共线或是拐点，保留该点
      if (!isHorizontallyAligned && !isVerticallyAligned) {
        optimized.push(curr);
      }
    }

    optimized.push(points[points.length - 1]);
    return optimized;
  }

  /**
   * 阶梯线
   */
  private stepPath(source: Position, target: Position): { path: string; labelPosition: Position; arrowAngle: number } {
    const midX = (source.x + target.x) / 2;
    const angle = target.x > source.x ? 0 : Math.PI;

    return {
      path: `M ${source.x},${source.y} L ${midX},${source.y} L ${midX},${target.y} L ${target.x},${target.y}`,
      labelPosition: { x: midX, y: (source.y + target.y) / 2 },
      arrowAngle: angle
    };
  }

  /**
   * 创建平滑路径（带圆角）
   */
  private createSmoothPath(points: Position[], radius: number): string {
    if (points.length < 2) {
      return '';
    }

    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 计算距离
      const d1 = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
      const d2 = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);

      if (d1 < 0.1 || d2 < 0.1) {
        // 点重合，跳过
        continue;
      }

      const r = Math.min(radius, d1 / 2, d2 / 2);

      if (r > 0.5) {
        // 计算圆角点
        const ratio1 = r / d1;
        const ratio2 = r / d2;

        const x1 = curr.x - (curr.x - prev.x) * ratio1;
        const y1 = curr.y - (curr.y - prev.y) * ratio1;
        const x2 = curr.x + (next.x - curr.x) * ratio2;
        const y2 = curr.y + (next.y - curr.y) * ratio2;

        path += ` L ${x1},${y1} Q ${curr.x},${curr.y} ${x2},${y2}`;
      } else {
        path += ` L ${curr.x},${curr.y}`;
      }
    }

    path += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;
    return path;
  }

  /**
   * 计算标签位置（路径的中心点）
   */
  private calculateLabelPosition(points: Position[]): Position {
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }

    // 使用路径中间的点
    const midIndex = Math.floor(points.length / 2);
    const p1 = points[midIndex - 1] || points[0];
    const p2 = points[midIndex] || points[points.length - 1];

    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }

  /**
   * 创建路径元素
   */
  private createPath(pathData: string, style: EdgeStyle): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', style.strokeColor || '#666');
    path.setAttribute('stroke-width', String(style.strokeWidth || 2));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.style.transition = 'all 0.3s ease';

    if (style.strokeDasharray) {
      path.setAttribute('stroke-dasharray', style.strokeDasharray);
    }

    return path;
  }

  /**
   * 创建Hover路径（用于增大点击区域）
   */
  private createHoverPath(pathData: string, style: EdgeStyle): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'transparent');
    path.setAttribute('stroke-width', String((style.strokeWidth || 2) + 10)); // 更粗的透明线条
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.style.cursor = 'pointer';
    return path;
  }

  /**
   * 创建流动动画路径
   */
  private createFlowAnimationPath(pathData: string, style: EdgeStyle): SVGPathElement | null {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.getHighlightColor(style.strokeColor || '#666'));
    path.setAttribute('stroke-width', String((style.strokeWidth || 2) * 0.5));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-dasharray', '10, 20');
    path.style.opacity = '0';
    path.style.transition = 'opacity 0.3s ease';
    path.style.pointerEvents = 'none';

    // 添加流动动画
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'stroke-dashoffset');
    animate.setAttribute('from', '0');
    animate.setAttribute('to', '-30');
    animate.setAttribute('dur', '1s');
    animate.setAttribute('repeatCount', 'indefinite');
    path.appendChild(animate);

    return path;
  }

  /**
   * 创建箭头 - 使用固定角度
   */
  private createArrow(position: Position, angle: number, style: EdgeStyle): SVGPolygonElement {
    const size = style.arrowSize || 10;

    // 标准三角形箭头
    const points = [
      position,
      {
        x: position.x - size * Math.cos(angle - Math.PI / 6),
        y: position.y - size * Math.sin(angle - Math.PI / 6)
      },
      {
        x: position.x - size * Math.cos(angle + Math.PI / 6),
        y: position.y - size * Math.sin(angle + Math.PI / 6)
      }
    ];

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
    arrow.setAttribute('fill', style.strokeColor || '#666');
    arrow.style.transition = 'all 0.3s ease';

    return arrow;
  }

  /**
   * 创建标签
   */
  private createLabel(text: string, position: Position, style: EdgeStyle): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.transition = 'transform 0.3s ease';

    // 背景矩形
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('fill', '#fff');
    bg.setAttribute('stroke', '#e0e0e0');
    bg.setAttribute('stroke-width', '1');
    bg.setAttribute('rx', '4');
    bg.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))';

    // 文本
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', String(position.x));
    textEl.setAttribute('y', String(position.y));
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('dominant-baseline', 'middle');
    textEl.setAttribute('fill', '#333');
    textEl.setAttribute('font-size', '12');
    textEl.setAttribute('font-weight', '500');
    textEl.textContent = text;

    group.appendChild(bg);
    group.appendChild(textEl);

    // 设置背景大小
    setTimeout(() => {
      const bbox = textEl.getBBox();
      const padding = 6;
      bg.setAttribute('x', String(bbox.x - padding));
      bg.setAttribute('y', String(bbox.y - padding));
      bg.setAttribute('width', String(bbox.width + padding * 2));
      bg.setAttribute('height', String(bbox.height + padding * 2));
    }, 0);

    return group;
  }

  /**
   * 从路径字符串中获取箭头位置
   */
  private getArrowPosition(pathStr: string): Position {
    // 解析SVG路径获取最后一个点
    const matches = pathStr.match(/([\d.-]+),([\d.-]+)(?!.*[\d.-]+,[\d.-]+)/);
    if (matches) {
      return {
        x: parseFloat(matches[1]),
        y: parseFloat(matches[2])
      };
    }
    // 默认返回原点
    return { x: 0, y: 0 };
  }

  /**
   * 获取更亮的颜色（用于悬停）
   */
  private getLighterColor(color: string): string {
    // 简单实现：如果是十六进制颜色，增加亮度
    if (color.startsWith('#')) {
      return color + '40'; // 添加透明度
    }
    return color;
  }

  /**
   * 获取高亮颜色（用于强调）
   */
  private getHighlightColor(color: string): string {
    if (color.startsWith('#')) {
      // 将颜色变亮
      const hex = color.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // 增加亮度
      const newR = Math.min(255, r + 30);
      const newG = Math.min(255, g + 30);
      const newB = Math.min(255, b + 30);

      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  /**
   * 添加动画
   */
  private addAnimation(path: SVGPathElement, style: EdgeStyle): void {
    const animationType = style.animationType || EdgeAnimationType.FLOW;
    const duration = style.animationDuration || 2;

    switch (animationType) {
      case EdgeAnimationType.FLOW:
        path.setAttribute('stroke-dasharray', '5 5');
        this.addDashAnimation(path, duration, '10');
        break;
      case EdgeAnimationType.DASH:
        path.setAttribute('stroke-dasharray', '10 5');
        this.addDashAnimation(path, duration, '15');
        break;
      case EdgeAnimationType.PULSE:
        this.addPulseAnimation(path, duration, style.strokeWidth || 2);
        break;
      case EdgeAnimationType.GLOW:
        this.addGlowAnimation(path, duration);
        break;
    }
  }

  private addDashAnimation(path: SVGPathElement, duration: number, offset: string): void {
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'stroke-dashoffset');
    animate.setAttribute('from', '0');
    animate.setAttribute('to', offset);
    animate.setAttribute('dur', `${duration}s`);
    animate.setAttribute('repeatCount', 'indefinite');
    path.appendChild(animate);
  }

  private addPulseAnimation(path: SVGPathElement, duration: number, baseWidth: number): void {
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'stroke-width');
    animate.setAttribute('values', `${baseWidth};${baseWidth + 2};${baseWidth}`);
    animate.setAttribute('dur', `${duration}s`);
    animate.setAttribute('repeatCount', 'indefinite');
    path.appendChild(animate);
  }

  private addGlowAnimation(path: SVGPathElement, duration: number): void {
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'stroke-opacity');
    animate.setAttribute('values', '1;0.5;1');
    animate.setAttribute('dur', `${duration}s`);
    animate.setAttribute('repeatCount', 'indefinite');
    path.appendChild(animate);
  }

  /**
   * 清空
   */
  public clear(): void {
    this.edgeElements.clear();
    if (this.edgeInteraction) {
      this.edgeInteraction.clear();
    }
  }

  public getEdgeElement(edgeId: string): SVGGElement | undefined {
    return this.edgeElements.get(edgeId);
  }

  public removeEdge(edgeId: string): void {
    const element = this.edgeElements.get(edgeId);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    this.edgeElements.delete(edgeId);

    // 清理交互元素
    if (this.edgeInteraction) {
      this.edgeInteraction.clearEdgeInteraction(edgeId);
    }
  }
}
