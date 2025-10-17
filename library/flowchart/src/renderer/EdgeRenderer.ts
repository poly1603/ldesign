import { FlowEdge } from '../core/Edge';
import { FlowNode } from '../core/Node';
import { Position, EdgeStyle, EdgeType, EdgeAnimationType } from '../types';
import { DEFAULT_CONFIG } from '../utils/constants';

/**
 * 连线渲染器 - 参考主流流程图库的实现
 * 使用固定的连接点和Manhattan路由算法
 */
export class EdgeRenderer {
  private edgeElements: Map<string, SVGGElement> = new Map();

  /**
   * 设置节点（预留接口）
   */
  public setNodes(_nodes: Map<string, FlowNode>): void {
    // 预留用于未来的智能路由
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

    // 节点尺寸
    const nodeWidth = DEFAULT_CONFIG.NODE_WIDTH;
    const nodeHeight = DEFAULT_CONFIG.NODE_HEIGHT;

    // 获取节点中心
    const sourceCenter = edge.source.position;
    const targetCenter = edge.target.position;

    // 获取连接点（固定在上下左右中点）
    const { sourcePort, targetPort } = this.getConnectionPorts(
      sourceCenter,
      targetCenter,
      nodeWidth,
      nodeHeight
    );

    // 获取连线类型
    const edgeType = style.type || EdgeType.POLYLINE;

    // 计算路径
    const pathData = this.calculatePath(sourcePort, targetPort, edgeType, style);
    
    // 创建路径
    const path = this.createPath(pathData.path, style);
    group.appendChild(path);

    // 添加箭头
    const arrow = this.createArrow(targetPort, pathData.arrowAngle || 0, style);
    group.appendChild(arrow);

    // 添加标签
    if (edge.label) {
      const label = this.createLabel(edge.label, pathData.labelPosition, style);
      group.appendChild(label);
    }

    // 添加动画
    if (style.animated) {
      this.addAnimation(path, style);
    }

    // 点击事件
    if (onClick) {
      group.style.cursor = 'pointer';
      group.addEventListener('click', () => onClick(edge));
    }

    // 悬停效果
    group.addEventListener('mouseenter', () => {
      path.setAttribute('stroke-width', String((style.strokeWidth || 2) + 1));
      path.setAttribute('stroke', this.getLighterColor(style.strokeColor || '#666'));
    });
    group.addEventListener('mouseleave', () => {
      path.setAttribute('stroke-width', String(style.strokeWidth || 2));
      path.setAttribute('stroke', style.strokeColor || '#666');
    });

    container.appendChild(group);
    this.edgeElements.set(edge.id, group);

    return group;
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

    // 判断起点和终点的相对位置
    const isVertical = Math.abs(dy) > Math.abs(dx);

    if (isVertical) {
      // 垂直主导
      if (dy > 0) {
        // 向下：最简单的情况
        if (Math.abs(dx) < 10) {
          // 几乎垂直对齐
          points = [source, target];
          arrowAngle = Math.PI / 2;
        } else {
          // 有水平偏移，使用Z字形
          const midY = source.y + dy / 2;
          points = [
            source,
            { x: source.x, y: midY },
            { x: target.x, y: midY },
            target
          ];
          arrowAngle = Math.PI / 2;
        }
      } else {
        // 向上：需要绕过
        const gap = 30;
        const sideGap = Math.max(50, Math.abs(dx) / 2 + 30);
        const direction = dx >= 0 ? 1 : -1;
        
        points = [
          source,
          { x: source.x, y: source.y - gap },
          { x: source.x + direction * sideGap, y: source.y - gap },
          { x: source.x + direction * sideGap, y: target.y + gap },
          { x: target.x, y: target.y + gap },
          target
        ];
        arrowAngle = -Math.PI / 2;
      }
    } else {
      // 水平主导
      if (dx > 0) {
        // 向右
        if (Math.abs(dy) < 10) {
          // 几乎水平对齐
          points = [source, target];
          arrowAngle = 0;
        } else {
          // 有垂直偏移
          const midX = source.x + dx / 2;
          points = [
            source,
            { x: midX, y: source.y },
            { x: midX, y: target.y },
            target
          ];
          arrowAngle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      } else {
        // 向左：需要绕过
        const gap = 30;
        const sideGap = Math.max(50, Math.abs(dy) / 2 + 30);
        
        points = [
          source,
          { x: source.x - gap, y: source.y },
          { x: source.x - gap, y: source.y + sideGap },
          { x: target.x + gap, y: source.y + sideGap },
          { x: target.x + gap, y: target.y },
          target
        ];
        arrowAngle = Math.PI;
      }
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

    if (style.strokeDasharray) {
      path.setAttribute('stroke-dasharray', style.strokeDasharray);
    }

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

    return arrow;
  }

  /**
   * 创建标签
   */
  private createLabel(text: string, position: Position, style: EdgeStyle): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 背景矩形
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('fill', '#fff');
    bg.setAttribute('stroke', '#e0e0e0');
    bg.setAttribute('stroke-width', '1');
    bg.setAttribute('rx', '4');

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
  }
}
